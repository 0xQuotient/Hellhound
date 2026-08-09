import { describe, it, expect } from "vitest";

import {
  RUBRIC_VERSION,
  COMPOSITE_WEIGHTS,
  DIMENSIONS,
  mean,
  median,
  stdev,
  computeReadability,
  scanLexicon,
  riskTier,
  analyzeText,
  toEntry,
  splitBatchText,
  analyzeCorpus,
  aggregateCorpus,
  buildCampaign,
  compareCampaigns,
  ingestFiles,
} from "./hellhound-scoring.js";

const PHISH = `Urgent: your account will be suspended within 24 hours.

Hi Dana, as head of payroll you must verify your credentials immediately using the
secure link below. This request comes directly from the CFO and cannot be discussed
with the helpdesk. Failure to act today will result in permanent loss of access.

Click here to confirm your identity now.`;

const BENIGN = `Hi Sam, the quarterly notes are attached. Take a look whenever you have
time this week and let me know if anything looks off. No rush at all. Thanks.`;

function csvFile(name, body) {
  return new File([body], name, { type: "text/csv" });
}

describe("math helpers", () => {
  it("handles empty input without dividing by zero", () => {
    expect(mean([])).toBe(0);
    expect(median([])).toBe(0);
    expect(stdev([])).toBe(0);
  });

  it("computes mean, median and stdev", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(Math.round(stdev([2, 4, 4, 4, 5, 5, 7, 9]) * 100) / 100).toBe(2);
  });
});

describe("readability", () => {
  it("never divides by zero on empty or whitespace text", () => {
    for (const t of ["", "   ", "\n\t"]) {
      const r = computeReadability(t);
      expect(Number.isFinite(r.fkGrade)).toBe(true);
      expect(Number.isFinite(r.fleschEase)).toBe(true);
      expect(r.wordCount).toBeGreaterThanOrEqual(1);
      expect(r.sentenceCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("counts words and sentences", () => {
    const r = computeReadability("One two three. Four five six!");
    expect(r.wordCount).toBe(6);
    expect(r.sentenceCount).toBe(2);
    expect(r.avgWordsPerSentence).toBe(3);
  });
});

describe("lexicon scan", () => {
  it("records hits and a per-1000-word density", () => {
    const words = computeReadability(PHISH).wordCount;
    const lex = scanLexicon(PHISH, words);
    const urgency = Object.values(lex).find((v) => v.hits.includes("immediately"));
    expect(urgency).toBeTruthy();
    expect(urgency.count).toBeGreaterThan(0);
    expect(urgency.density).toBeCloseTo(Math.round((urgency.count / words) * 1000 * 10) / 10, 5);
  });

  it("returns zero counts for empty text", () => {
    const lex = scanLexicon("", 1);
    Object.values(lex).forEach((v) => {
      expect(v.count).toBe(0);
      expect(v.density).toBe(0);
    });
  });
});

describe("composite scoring", () => {
  it("publishes weights that sum to 1", () => {
    const total = COMPOSITE_WEIGHTS.reduce((s, w) => s + w.weight, 0);
    expect(Math.round(total * 1000) / 1000).toBe(1);
  });

  it("matches the hand-computed weighted sum of its components", () => {
    const a = analyzeText(PHISH);
    const expected = Math.round(
      COMPOSITE_WEIGHTS.reduce((s, w) => s + a.semantic.components[w.key] * w.weight, 0),
    );
    expect(a.semantic.composite_index).toBe(expected);
  });

  it("scores a pressure-heavy message above a benign one", () => {
    expect(analyzeText(PHISH).semantic.composite_index).toBeGreaterThan(
      analyzeText(BENIGN).semantic.composite_index,
    );
  });

  it("does not crash on empty input and stays in range", () => {
    const a = analyzeText("");
    expect(a.semantic.composite_index).toBeGreaterThanOrEqual(0);
    expect(a.semantic.composite_index).toBeLessThanOrEqual(100);
  });

  it("assigns risk tiers at the documented thresholds", () => {
    expect(riskTier(34).label).toBe("Low");
    expect(riskTier(35).label).toBe("Moderate");
    expect(riskTier(69).label).toBe("Moderate");
    expect(riskTier(70).label).toBe("High");
  });

  it("is deterministic — same text, same numbers", () => {
    const a = analyzeText(PHISH);
    const b = analyzeText(PHISH);
    expect(b.semantic).toEqual(a.semantic);
    expect(b.features).toEqual(a.features);
  });
});

describe("feature vector export", () => {
  it("stamps the rubric version and exposes raw counts", () => {
    const a = analyzeText(PHISH);
    expect(a.rubricVersion).toBe(RUBRIC_VERSION);
    expect(a.features.wordCount).toBe(a.readability.wordCount);
    expect(a.features.sentenceCount).toBe(a.readability.sentenceCount);
    expect(a.features.passiveVoicePct).toBe(a.passive);
    expect(a.features.components).toEqual(a.semantic.components);
    expect(Object.keys(a.features.lexicon).length).toBeGreaterThan(0);
  });

  it("carries a numeric feature vector onto every corpus entry", () => {
    const e = toEntry(analyzeText(PHISH), 0);
    expect(e.features.lexiconCounts).toBeTruthy();
    expect(e.features.lexiconDensities).toBeTruthy();
    expect(e.features.cialdiniScores.authority).toBe(e.authority);
    // Recompute the composite from the exported components + published weights.
    const recomputed = Math.round(
      COMPOSITE_WEIGHTS.reduce((s, w) => s + e.features.components[w.key] * w.weight, 0),
    );
    expect(recomputed).toBe(e.compositeIndex);
  });
});

describe("batch text splitting", () => {
  it("splits on --- separator lines and drops blanks", () => {
    expect(splitBatchText(`one\n---\ntwo\n-----\n\nthree\n---\n   `)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("returns a single chunk when there is no separator", () => {
    expect(splitBatchText("just one message")).toEqual(["just one message"]);
  });
});

describe("CSV ingest", () => {
  const rows = (delim, header = true) => {
    const lines = [];
    if (header) lines.push(["subject", "email_body", "channel", "outcome"].join(delim));
    for (let i = 0; i < 5; i++) {
      lines.push(
        [
          `"Subject ${i}"`,
          `"Urgent action required now, message number ${i}"`,
          "Email",
          "Clicked",
        ].join(delim),
      );
    }
    return lines.join("\n");
  };

  it.each([
    [",", "comma"],
    [";", "semicolon"],
    ["\t", "tab"],
    ["|", "pipe"],
  ])("sniffs the %s delimiter", async (delim) => {
    const { entries } = await ingestFiles([csvFile("c.csv", rows(delim))]);
    expect(entries).toHaveLength(5);
    expect(entries[0].channel).toBe("Email");
    expect(entries[0].outcome).toBe("Clicked");
  });

  it("does not collapse a CSV into one message", async () => {
    const { entries } = await ingestFiles([csvFile("c.csv", rows(","))]);
    expect(entries.length).toBe(5);
  });

  it("handles quoted fields containing delimiters, quotes and newlines", async () => {
    const body = [
      "subject,body",
      '"Re: invoice, urgent","Line one, with a comma\nLine two ""quoted"" here, verify now"',
    ].join("\n");
    const { entries } = await ingestFiles([csvFile("q.csv", body)]);
    expect(entries).toHaveLength(1);
    expect(entries[0].sourceText).toContain("Line two");
    expect(entries[0].sourceText).toContain('"quoted"');
  });

  it("handles CRLF line endings", async () => {
    const { entries } = await ingestFiles([csvFile("crlf.csv", rows(",").replace(/\n/g, "\r\n"))]);
    expect(entries).toHaveLength(5);
    expect(entries[0].sourceText).not.toContain("\r");
  });

  it("survives chunk boundaries splitting a quoted field", async () => {
    // 5 MB of rows forces the stream reader to hand over many partial chunks.
    const many = ["subject,body"];
    for (let i = 0; i < 8000; i++) {
      many.push(`"Subject ${i}","Verify your account immediately, item ${i}, act now please"`);
    }
    const { entries } = await ingestFiles([csvFile("big.csv", many.join("\n"))]);
    expect(entries).toHaveLength(8000);
  });

  it("picks the prose column in a header-less file", async () => {
    const lines = [];
    for (let i = 0; i < 4; i++) {
      lines.push(
        `${i},2026-01-0${i + 1},"Please verify your account credentials immediately or access will be suspended today"`,
      );
    }
    const { entries } = await ingestFiles([csvFile("noheader.csv", lines.join("\n"))]);
    expect(entries).toHaveLength(4);
    entries.forEach((e) => expect(e.sourceText).toContain("verify your account"));
  });

  it("content-sniffs a tabular file with a misleading extension", async () => {
    const f = new File([rows(",")], "corpus.txt", { type: "text/plain" });
    const { entries } = await ingestFiles([f]);
    expect(entries).toHaveLength(5);
  });
});

describe("corpus aggregation", () => {
  const corpus = analyzeCorpus([
    { text: PHISH, channel: "Email", outcome: "Clicked" },
    { text: BENIGN, channel: "Email", outcome: "No Reaction" },
    { text: `${PHISH}\nOne more line about wire transfer approval.`, channel: "SMS" },
    { text: BENIGN.replace("Sam", "Alex"), channel: "Voice", outcome: "Reported" },
  ]);

  it("returns null for an empty corpus", () => {
    expect(aggregateCorpus([])).toBeNull();
  });

  it("computes per-dimension mean, median, range and sigma", () => {
    const agg = aggregateCorpus(corpus);
    DIMENSIONS.forEach((d) => {
      const s = agg.stats[d.key];
      const values = corpus.map((e) => e[d.key] || 0);
      expect(s.mean).toBe(Math.round(mean(values) * 10) / 10);
      expect(s.median).toBe(Math.round(median(values) * 10) / 10);
      expect(s.min).toBe(Math.min(...values));
      expect(s.max).toBe(Math.max(...values));
      expect(s.stdev).toBe(Math.round(stdev(values) * 10) / 10);
    });
  });

  it("reports mixes as percentages that add up", () => {
    const agg = aggregateCorpus(corpus);
    const sum = agg.channelMix.reduce((s, m) => s + m.count, 0);
    expect(sum).toBe(corpus.length);
    expect(agg.channelMix.reduce((s, m) => s + m.pct, 0)).toBeGreaterThan(95);
    expect(agg.pretextMix.reduce((s, m) => s + m.count, 0)).toBe(corpus.length);
  });

  it("picks outliers from the scored set", () => {
    const agg = aggregateCorpus(corpus);
    const scores = corpus.map((e) => e.compositeIndex);
    expect(agg.outliers.highest.compositeIndex).toBe(Math.max(...scores));
    expect(agg.outliers.lowest.compositeIndex).toBe(Math.min(...scores));
  });

  it("detects phrasing repeated across messages", () => {
    const agg = aggregateCorpus(corpus);
    expect(agg.phrases.length).toBeGreaterThan(0);
    agg.phrases.forEach((p) => expect(p.count).toBeGreaterThan(1));
  });

  it("is deterministic across repeated runs", () => {
    const again = analyzeCorpus([
      { text: PHISH, channel: "Email", outcome: "Clicked" },
      { text: BENIGN, channel: "Email", outcome: "No Reaction" },
      { text: `${PHISH}\nOne more line about wire transfer approval.`, channel: "SMS" },
      { text: BENIGN.replace("Sam", "Alex"), channel: "Voice", outcome: "Reported" },
    ]);
    expect(again.map((e) => e.compositeIndex)).toEqual(corpus.map((e) => e.compositeIndex));
    expect(aggregateCorpus(again).stats).toEqual(aggregateCorpus(corpus).stats);
  });
});

describe("N-way campaign comparison", () => {
  const mk = (name, texts, channel) =>
    buildCampaign(name, analyzeCorpus(texts.map((t) => ({ text: t, channel }))));

  const a = mk("Alpha", [PHISH, `${PHISH} Wire the funds today.`], "Email");
  const b = mk("Bravo", [BENIGN, `${BENIGN} Thanks again.`], "Voice");
  const c = mk("Charlie", [PHISH, BENIGN, `${PHISH} Verify now.`], "SMS");

  it("returns null with fewer than two usable campaigns", () => {
    expect(compareCampaigns([])).toBeNull();
    expect(compareCampaigns([a])).toBeNull();
    expect(compareCampaigns([a, buildCampaign("Empty", [])])).toBeNull();
  });

  it("compares two campaigns and flags the extremes", () => {
    const cmp = compareCampaigns([a, b]);
    expect(cmp.names).toEqual(["Alpha", "Bravo"]);
    const ci = cmp.rows.find((r) => r.key === "compositeIndex");
    expect(ci.maxIndex).toBe(0);
    expect(ci.minIndex).toBe(1);
    expect(ci.spread).toBeGreaterThan(0);
  });

  it("scales to three or more campaigns", () => {
    const cmp = compareCampaigns([a, b, c]);
    expect(cmp.campaigns).toHaveLength(3);
    expect(cmp.series.map((s) => s.key)).toEqual(["c0", "c1", "c2"]);
    cmp.rows.forEach((r) => expect(r.values).toHaveLength(3));
    cmp.radar.forEach((p) => {
      expect(p).toHaveProperty("c0");
      expect(p).toHaveProperty("c2");
    });
    expect(cmp.findings.join(" ")).toContain("3 campaigns compared");
  });

  it("reports the largest pairwise composite gap", () => {
    const cmp = compareCampaigns([a, b, c]);
    const ci = cmp.rows.find((r) => r.key === "compositeIndex");
    let largest = 0;
    for (let i = 0; i < ci.values.length; i++) {
      for (let j = i + 1; j < ci.values.length; j++) {
        largest = Math.max(largest, Math.abs(ci.values[i] - ci.values[j]));
      }
    }
    expect(Math.round(largest * 10) / 10).toBe(ci.spread);
  });

  it("names pretext families shared by every campaign", () => {
    const cmp = compareCampaigns([a, c]);
    const shared = cmp.findings.find((f) => f.includes("pretext family") || f.includes("Pretext"));
    expect(shared).toBeTruthy();
  });
});
