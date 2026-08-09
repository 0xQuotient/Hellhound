/* ============================================================
   HELLHOUND — DETERMINISTIC RUBRIC SCORING ENGINE

   Pure functions only. No network, no model calls, no storage.
   The same text always produces the same numbers, and every score
   traces back to a counted feature of the text itself.
   ============================================================ */

/* ------------------------------------------------------------
   LEXICONS & CONSTANTS
   ------------------------------------------------------------ */

export const LEXICONS = {
  urgency: [
    "immediately",
    "urgent",
    "urgently",
    "right away",
    "act now",
    "without delay",
    "expire",
    "expires",
    "expiring",
    "expired",
    "deadline",
    "final notice",
    "last chance",
    "time-sensitive",
    "time sensitive",
    "hurry",
    "asap",
    "24 hours",
    "48 hours",
    "today only",
    "before end of day",
    "eod",
    "promptly",
  ],
  scarcity: [
    "limited",
    "only a few",
    "exclusive",
    "while supplies last",
    "one-time",
    "won't last",
    "running out",
    "last remaining",
    "spots left",
    "few remaining",
    "limited slots",
    "first come",
  ],
  authority: [
    "ceo",
    "cfo",
    "director",
    "official",
    "legal department",
    "compliance",
    "required by law",
    "mandatory",
    "verified",
    "certified",
    "irs",
    "law enforcement",
    "security team",
    "it department",
    "it support",
    "helpdesk",
    "help desk",
    "executive",
    "management",
    "policy requires",
    "audit",
    "administrator",
  ],
  fear: [
    "suspend",
    "suspended",
    "suspension",
    "terminate",
    "terminated",
    "termination",
    "penalty",
    "fine",
    "locked",
    "lockout",
    "compromised",
    "unauthorized",
    "breach",
    "failure to comply",
    "account closure",
    "legal action",
    "disabled",
    "revoked",
    "at risk",
    "violation",
    "fraud",
  ],
};

export const LEXICON_LABELS = {
  urgency: "Urgency",
  scarcity: "Scarcity",
  authority: "Authority",
  fear: "Fear / threat",
};

export const CIALDINI_KEYS = [
  "reciprocity",
  "commitment_consistency",
  "social_proof",
  "authority",
  "liking",
  "scarcity",
  "unity",
];
export const CIALDINI_LABELS = {
  reciprocity: "Reciprocity",
  commitment_consistency: "Commitment",
  social_proof: "Social proof",
  authority: "Authority",
  liking: "Liking / similarity",
  scarcity: "Scarcity",
  unity: "Unity",
};

const CIALDINI_TERMS = {
  reciprocity: [
    "complimentary",
    "free of charge",
    "on the house",
    "gift",
    "bonus",
    "as a courtesy",
    "we have already",
    "i went ahead",
    "no cost",
    "refund",
    "credit to your",
    "discount",
    "reward",
    "favor",
    "i helped",
    "happy to help",
  ],
  commitment_consistency: [
    "as agreed",
    "as we discussed",
    "per our conversation",
    "you requested",
    "your request",
    "following up",
    "you signed up",
    "you confirmed",
    "as promised",
    "to complete your",
    "finish setting up",
    "you started",
    "pending your",
    "continue where you left",
  ],
  social_proof: [
    "everyone",
    "all employees",
    "your colleagues",
    "most users",
    "others have",
    "the rest of the team",
    "thousands of",
    "majority",
    "company-wide",
    "company wide",
    "department has already",
    "others in your",
    "popular",
    "trusted by",
  ],
  authority: [
    "ceo",
    "cfo",
    "coo",
    "director",
    "vice president",
    "official",
    "legal department",
    "compliance",
    "required by law",
    "mandatory",
    "policy",
    "irs",
    "law enforcement",
    "security team",
    "it department",
    "it support",
    "administrator",
    "audit",
    "regulation",
    "on behalf of",
    "authorized",
  ],
  liking: [
    "hope you are well",
    "hope this finds you",
    "great work",
    "i enjoyed",
    "nice to",
    "thanks so much",
    "appreciate",
    "my friend",
    "looking forward",
    "congratulations",
    "well done",
    "as always",
    "good to hear",
  ],
  scarcity: [
    "limited",
    "only a few",
    "exclusive",
    "while supplies last",
    "one-time",
    "last chance",
    "running out",
    "expires",
    "expiring",
    "deadline",
    "final notice",
    "spots left",
    "today only",
    "before it",
  ],
  unity: [
    "we",
    "our team",
    "here at",
    "as a family",
    "one of us",
    "fellow",
    "together",
    "our company",
    "our department",
    "us at",
    "part of the team",
    "our shared",
  ],
};

const BENEFIT_TERMS = [
  "reward",
  "bonus",
  "gift",
  "discount",
  "refund",
  "win",
  "winner",
  "prize",
  "upgrade",
  "free",
  "offer",
  "benefit",
  "raise",
  "promotion",
  "approved",
  "congratulations",
  "payout",
  "cash back",
];

const CTA_VERBS = [
  "click",
  "log in",
  "login",
  "sign in",
  "verify",
  "confirm",
  "update",
  "download",
  "open the attachment",
  "open attachment",
  "reply",
  "call",
  "wire",
  "transfer",
  "send",
  "pay",
  "purchase",
  "enter your",
  "submit",
  "reset",
  "authorize",
  "approve",
  "review and",
  "complete the form",
  "scan",
  "install",
  "enable",
];

const VERIFY_FRICTION_TERMS = [
  "do not reply",
  "do not contact",
  "confidential",
  "keep this between",
  "i am in a meeting",
  "unavailable by phone",
  "cannot talk",
  "no phone",
  "discretion",
  "do not discuss",
  "only respond to this",
];

export const PRETEXT_CATEGORIES = [
  "IT Support",
  "HR",
  "Finance",
  "Executive",
  "Vendor",
  "Personal Emergency",
  "Delivery",
  "Other",
];

const PRETEXT_TERMS = {
  "IT Support": [
    "password",
    "mfa",
    "multi-factor",
    "two-factor",
    "vpn",
    "mailbox",
    "inbox quota",
    "it support",
    "helpdesk",
    "help desk",
    "reset your",
    "account access",
    "software update",
    "security update",
    "login attempt",
    "sso",
    "antivirus",
    "system maintenance",
  ],
  HR: [
    "payroll",
    "benefits",
    "open enrollment",
    "handbook",
    "performance review",
    "onboarding",
    "timesheet",
    "pto",
    "holiday schedule",
    "hr department",
    "employee survey",
    "policy acknowledgment",
    "w-2",
    "w2",
  ],
  Finance: [
    "invoice",
    "payment",
    "wire",
    "bank",
    "account details",
    "remittance",
    "purchase order",
    "accounts payable",
    "overdue",
    "billing",
    "tax",
    "irs",
    "statement",
    "transaction",
    "refund",
  ],
  Executive: [
    "ceo",
    "cfo",
    "coo",
    "chief",
    "board",
    "executive",
    "urgent request from",
    "discreet",
    "president",
    "managing director",
  ],
  Vendor: [
    "contract",
    "supplier",
    "vendor",
    "renewal",
    "subscription",
    "license",
    "quote",
    "proposal",
    "service agreement",
    "partner",
    "procurement",
  ],
  "Personal Emergency": [
    "hospital",
    "accident",
    "emergency",
    "family",
    "stranded",
    "urgent help",
    "medical",
    "funeral",
    "in trouble",
    "need your help right",
  ],
  Delivery: [
    "package",
    "parcel",
    "shipment",
    "delivery",
    "tracking",
    "courier",
    "customs",
    "dispatch",
    "ups",
    "fedex",
    "dhl",
    "undeliverable",
    "redelivery",
  ],
};

export const ATTACK_STAGES = ["Research", "Hook", "Trust", "Exploit", "Exit"];

export const TLX_DIMS = [
  { key: "mental_demand", label: "Mental demand" },
  { key: "temporal_demand", label: "Temporal demand" },
  { key: "effort_to_verify", label: "Effort to verify" },
  { key: "frustration_induced", label: "Frustration" },
];

export const CHANNELS = ["Email", "SMS", "Voice", "Chat", "Other"];
export const OUTCOMES = ["Unknown", "No Reaction", "Clicked", "Reported", "Credentials Entered"];

/* Bump when any lexicon, weight or formula changes — scores are only
   comparable within one rubric version. Stamped into every export. */
export const RUBRIC_VERSION = "1.0.0";

/* Composite index weights — published so the score is auditable. */
export const COMPOSITE_WEIGHTS = [
  { key: "pressure", label: "Emotional pressure", weight: 0.26 },
  { key: "cialdini", label: "Persuasion principles", weight: 0.24 },
  { key: "personalization", label: "Personalization", weight: 0.18 },
  { key: "cta", label: "Action demand", weight: 0.16 },
  { key: "friction", label: "Verification friction", weight: 0.16 },
];


/* ------------------------------------------------------------
   SMALL MATH / TEXT HELPERS
   ------------------------------------------------------------ */

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n) => Math.round(n);

export function mean(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function stdev(nums) {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  return Math.sqrt(mean(nums.map((n) => (n - m) ** 2)));
}

function countMatches(lowerText, terms) {
  const hits = [];
  terms.forEach((term) => {
    let idx = lowerText.indexOf(term);
    let count = 0;
    while (idx !== -1 && count < 20) {
      count++;
      idx = lowerText.indexOf(term, idx + term.length);
    }
    if (count > 0) hits.push({ term, count });
  });
  return hits;
}

function totalHits(hits) {
  return hits.reduce((s, h) => s + h.count, 0);
}

/* Density-to-score curve: hits per 100 words -> 0-100, saturating.
   A single hit in a short message never scores 0; saturation at ~4/100w. */
function densityScore(hits, wordCount, gain = 26) {
  const n = totalHits(hits);
  if (!n) return 0;
  const per100 = (n / Math.max(wordCount, 1)) * 100;
  return clamp(round(14 + per100 * gain));
}

export function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

export function computeReadability(text) {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const words = text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  const sentenceCount = Math.max(sentences.length, 1);
  const wordCount = Math.max(words.length, 1);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount;
  const fleschEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    fleschEase: clamp(round(fleschEase)),
    fkGrade: Math.max(0, Math.round(fkGrade * 10) / 10),
  };
}

export function estimatePassiveVoice(text) {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!sentences.length) return 0;
  const pattern = /\b(am|is|are|was|were|be|been|being)\b\s+\w+(ed|en)\b/i;
  const hits = sentences.filter((s) => pattern.test(s)).length;
  return round((hits / sentences.length) * 100);
}

export function scanLexicon(text, wordCount) {
  const lower = text.toLowerCase();
  const out = {};
  Object.entries(LEXICONS).forEach(([category, terms]) => {
    const matched = countMatches(lower, terms);
    const n = totalHits(matched);
    out[category] = {
      hits: matched.map((h) => h.term),
      count: n,
      density: wordCount ? Math.round((n / wordCount) * 1000 * 10) / 10 : 0,
    };
  });
  return out;
}

export function riskTier(score) {
  if (score < 35) return { label: "Low", color: "emerald" };
  if (score < 70) return { label: "Moderate", color: "amber" };
  return { label: "High", color: "red" };
}

/* ------------------------------------------------------------
   RUBRIC COMPONENTS
   ------------------------------------------------------------ */

function scoreCialdini(text, wordCount) {
  const lower = text.toLowerCase();
  const out = {};
  CIALDINI_KEYS.forEach((key) => {
    const matched = countMatches(lower, CIALDINI_TERMS[key]);
    // "unity" relies on very common pronouns, so it gets a lower gain.
    const gain = key === "unity" ? 9 : 26;
    out[key] = {
      score: densityScore(matched, wordCount, gain),
      evidence: matched
        .slice(0, 3)
        .map((h) => h.term)
        .join(", "),
      matches: totalHits(matched),
    };
  });
  return out;
}

function segmentIntensity(segment) {
  const lower = segment.toLowerCase();
  const words = segment.split(/\s+/).filter(Boolean).length || 1;
  const scores = {
    urgency: densityScore(countMatches(lower, LEXICONS.urgency), words),
    fear: densityScore(countMatches(lower, LEXICONS.fear), words),
    scarcity: densityScore(countMatches(lower, LEXICONS.scarcity), words),
    authority: densityScore(countMatches(lower, LEXICONS.authority), words),
    reward: densityScore(countMatches(lower, BENEFIT_TERMS), words),
  };
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const intensity = clamp(round(mean(Object.values(scores)) * 1.6));
  return { emotion: top[1] > 0 ? top[0] : "neutral", intensity };
}

function scoreEmotionalPressure(text, wordCount, lexicon) {
  const lower = text.toLowerCase();
  const urgency = densityScore(countMatches(lower, LEXICONS.urgency), wordCount);
  const scarcity = densityScore(countMatches(lower, LEXICONS.scarcity), wordCount);
  const fear = densityScore(countMatches(lower, LEXICONS.fear), wordCount);
  const benefitHits = totalHits(countMatches(lower, BENEFIT_TERMS));
  const threatHits = lexicon.fear.count + lexicon.urgency.count;
  const threatBenefit =
    threatHits + benefitHits === 0 ? 50 : round((threatHits / (threatHits + benefitHits)) * 100);

  const words = text.split(/\s+/).filter(Boolean);
  const third = Math.max(1, Math.ceil(words.length / 3));
  const segments = [
    words.slice(0, third).join(" "),
    words.slice(third, third * 2).join(" "),
    words.slice(third * 2).join(" "),
  ];
  const stages = ["opening", "middle", "close"];
  const trajectory = segments.map((seg, i) => ({
    stage: stages[i],
    ...segmentIntensity(seg || ""),
  }));

  const urgencyScarcity = clamp(round(urgency * 0.65 + scarcity * 0.35));
  const overallPull = clamp(
    round(urgencyScarcity * 0.45 + fear * 0.35 + Math.abs(threatBenefit - 50) * 0.4),
  );

  return {
    overall_pull: overallPull,
    urgency_scarcity: urgencyScarcity,
    threat_benefit_ratio: threatBenefit,
    trajectory,
  };
}

function scorePersonalization(text, wordCount) {
  const patterns = {
    emails: /[\w.+-]+@[\w-]+\.[\w.]+/g,
    money: /(?:[$€£]\s?\d[\d,.]*|\b\d[\d,.]*\s?(?:usd|eur|gbp|dollars)\b)/gi,
    dates:
      /\b(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2})\b/gi,
    ids: /\b(?:[A-Z]{2,}-?\d{3,}|#\d{3,}|\d{6,})\b/g,
    times: /\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/gi,
    phones: /\b(?:\+?\d[\d\s().-]{7,}\d)\b/g,
  };
  const counts = {};
  let dataPoints = 0;
  Object.entries(patterns).forEach(([k, re]) => {
    const n = (text.match(re) || []).length;
    counts[k] = n;
    dataPoints += n;
  });

  // Proper nouns that are not sentence-initial: names, companies, products.
  const properNouns = (text.match(/(?:[^.!?]\s)([A-Z][a-z]{2,})/g) || []).length;
  const secondPerson = (text.match(/\b(you|your|you're|yours)\b/gi) || []).length;
  const roleTerms = totalHits(
    countMatches(text.toLowerCase(), [
      "your team",
      "your department",
      "your manager",
      "your account",
      "your role",
      "your recent",
      "your last",
      "your colleague",
      "your device",
      "your login",
    ]),
  );

  const dataDensity = clamp(
    round(((dataPoints + properNouns * 0.5) / Math.max(wordCount, 1)) * 100 * 18),
  );
  const secondPersonDensity = clamp(round((secondPerson / Math.max(wordCount, 1)) * 100 * 14));
  const roleFit = clamp(round(secondPersonDensity * 0.55 + roleTerms * 16));

  let source = "public";
  if (dataDensity >= 55 || counts.ids > 0 || roleTerms >= 2) source = "private";
  else if (dataDensity >= 25 || counts.emails > 0 || counts.money > 0) source = "mixed";

  return {
    data_point_density: dataDensity,
    source_likelihood: source,
    role_context_fit: roleFit,
    counts: { ...counts, properNouns, secondPerson, roleTerms },
  };
}

function scoreLinguistic(text, readability) {
  const lower = text.toLowerCase();
  const sentences = text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const spread = lengths.length > 1 ? stdev(lengths) / Math.max(mean(lengths), 1) : 0;
  const registerConsistency = clamp(round(100 - spread * 95));

  const ctaHits = countMatches(lower, CTA_VERBS);
  const links = (text.match(/https?:\/\/\S+|\bwww\.\S+/gi) || []).length;
  const numberedSteps = (text.match(/^\s*(?:\d+[.)]|[-*•])\s+/gm) || []).length;
  const ctaSteps = Math.max(totalHits(ctaHits) + links, numberedSteps);
  const ctaClarity = clamp(
    round(
      (ctaHits.length ? 45 : 0) +
        (links ? 25 : 0) +
        (numberedSteps ? 20 : 0) +
        Math.min(totalHits(ctaHits), 4) * 7,
    ),
  );

  const shoutedWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  const repeatedPunct = (text.match(/[!?]{2,}/g) || []).length;
  const spacingErrors = (text.match(/\s{3,}|\s+[,.]/g) || []).length;
  const surfaceQuality = clamp(
    round(
      100 -
        shoutedWords * 6 -
        repeatedPunct * 10 -
        spacingErrors * 5 -
        (readability.fkGrade > 16 ? 10 : 0),
    ),
  );

  return {
    register_consistency: registerConsistency,
    cta_clarity: ctaClarity,
    cta_steps: ctaSteps,
    surface_quality: surfaceQuality,
    links,
  };
}

function scoreCognitiveLoad(readability, pressure, linguistic, text) {
  const lower = text.toLowerCase();
  const friction = totalHits(countMatches(lower, VERIFY_FRICTION_TERMS));
  const mental = clamp(round(readability.fkGrade * 5 + readability.avgWordsPerSentence * 1.2));
  const temporal = pressure.urgency_scarcity;
  const effort = clamp(round(linguistic.links * 18 + friction * 22 + linguistic.cta_steps * 6));
  const frustration = clamp(
    round(
      pressure.threat_benefit_ratio * 0.4 +
        linguistic.cta_steps * 7 +
        (100 - linguistic.surface_quality) * 0.35,
    ),
  );
  return {
    mental_demand: mental,
    temporal_demand: temporal,
    effort_to_verify: effort,
    frustration_induced: frustration,
    verification_friction: clamp(round(effort * 0.7 + friction * 15)),
  };
}

function scorePretext(text) {
  const lower = text.toLowerCase();
  let best = { category: "Other", score: 0 };
  const table = [];
  Object.entries(PRETEXT_TERMS).forEach(([category, terms]) => {
    const matched = countMatches(lower, terms);
    const score = totalHits(matched);
    table.push({ category, score });
    if (score > best.score) best = { category, score };
  });
  return { category: best.category, strength: best.score, table };
}

function pickStage(pressure, personalization, linguistic, cialdini) {
  const trust =
    (cialdini.liking.score + cialdini.unity.score + cialdini.commitment_consistency.score) / 3;
  if (linguistic.cta_clarity >= 55 && pressure.urgency_scarcity >= 40) return "Exploit";
  if (linguistic.cta_clarity >= 55) return "Hook";
  if (trust >= 30 && linguistic.cta_clarity < 45) return "Trust";
  if (personalization.data_point_density >= 45 && linguistic.cta_clarity < 30) return "Research";
  if (pressure.overall_pull < 20 && linguistic.cta_clarity < 25) return "Exit";
  return "Hook";
}

/* ------------------------------------------------------------
   MAIN SCORER
   ------------------------------------------------------------ */

export function analyzeText(rawText, meta = {}) {
  const text = String(rawText || "").trim();
  const readability = computeReadability(text);
  const wordCount = readability.wordCount;
  const passive = estimatePassiveVoice(text);
  const lexicon = scanLexicon(text, wordCount);

  const cialdini = scoreCialdini(text, wordCount);
  const emotional = scoreEmotionalPressure(text, wordCount, lexicon);
  const personalization = scorePersonalization(text, wordCount);
  const linguistic = scoreLinguistic(text, readability);
  const cognitive = scoreCognitiveLoad(readability, emotional, linguistic, text);
  const pretext = scorePretext(text);

  const cialdiniTop = Object.values(cialdini)
    .map((c) => c.score)
    .sort((a, b) => b - a);
  const components = {
    pressure: clamp(round(emotional.overall_pull * 0.6 + emotional.urgency_scarcity * 0.4)),
    cialdini: clamp(round(mean(cialdiniTop.slice(0, 3)))),
    personalization: clamp(
      round(personalization.data_point_density * 0.55 + personalization.role_context_fit * 0.45),
    ),
    cta: linguistic.cta_clarity,
    friction: cognitive.verification_friction,
  };
  const compositeIndex = clamp(
    round(COMPOSITE_WEIGHTS.reduce((sum, w) => sum + components[w.key] * w.weight, 0)),
  );

  const stage = pickStage(emotional, personalization, linguistic, cialdini);
  const topPrinciple = Object.entries(cialdini).sort((a, b) => b[1].score - a[1].score)[0];
  const topComponent = COMPOSITE_WEIGHTS.map((w) => ({ ...w, value: components[w.key] })).sort(
    (a, b) => b.value - a.value,
  )[0];

  const summary =
    `Rubric score ${compositeIndex}/100 (${riskTier(compositeIndex).label}); the largest contributor is ` +
    `${topComponent.label.toLowerCase()} at ${topComponent.value}. ` +
    `Strongest persuasion principle is ${CIALDINI_LABELS[topPrinciple[0]].toLowerCase()} (${topPrinciple[1].score})` +
    `${topPrinciple[1].evidence ? `, matched on "${topPrinciple[1].evidence}"` : ""}. ` +
    `Framing is ${emotional.threat_benefit_ratio >= 50 ? "threat-weighted" : "benefit-weighted"} at ` +
    `${emotional.threat_benefit_ratio}/100, with ${linguistic.cta_steps} requested action${linguistic.cta_steps === 1 ? "" : "s"} ` +
    `and a grade-${readability.fkGrade} reading level.`;

  const semantic = {
    composite_index: compositeIndex,
    components,
    pretext: {
      category: pretext.category,
      specificity: clamp(round(personalization.data_point_density * 0.5 + pretext.strength * 12)),
    },
    cialdini,
    emotional_pressure: emotional,
    personalization,
    linguistic,
    cognitive_load: cognitive,
    attack_cycle_stage: stage,
    attack_cycle_rationale:
      `Stage inferred from action demand ${linguistic.cta_clarity}, urgency ${emotional.urgency_scarcity}, ` +
      `rapport ${round((cialdini.liking.score + cialdini.unity.score) / 2)} and personalization ${personalization.data_point_density}.`,
    analyst_summary: summary,
  };

  /* Raw, pre-normalization counts. Exported alongside the scores so a
     defender can re-derive the composite or build their own detections
     on the underlying features. */
  const features = {
    rubricVersion: RUBRIC_VERSION,
    wordCount: readability.wordCount,
    sentenceCount: readability.sentenceCount,
    avgWordsPerSentence: readability.avgWordsPerSentence,
    fleschEase: readability.fleschEase,
    fkGrade: readability.fkGrade,
    passiveVoicePct: passive,
    ctaSteps: linguistic.cta_steps,
    lexicon: Object.fromEntries(
      Object.entries(lexicon).map(([k, v]) => [
        k,
        { count: v.count, density: v.density, hits: v.hits },
      ]),
    ),
    cialdiniScores: Object.fromEntries(Object.entries(cialdini).map(([k, v]) => [k, v.score])),
    components,
  };

  return {
    timestamp: new Date().toISOString(),
    rubricVersion: RUBRIC_VERSION,
    readability,
    passive,
    lexicon,
    features,
    semantic,
    meta: {
      label: meta.label || "",
      channel: meta.channel || "Email",
      outcome: meta.outcome || "Unknown",
    },
    text,
    excerpt: text.slice(0, 120),
  };
}


/* Flatten a full analysis into a compact row used by tables and rollups.
   The full analysis object is intentionally NOT retained: on a 50k-message
   corpus that alone is hundreds of megabytes. Only the excerpt, a capped
   copy of the source text (for export / phrase detection) and the numeric
   scores survive. */
const SOURCE_TEXT_CAP = 8000;

export function toEntry(analysis, index = 0) {
  const s = analysis.semantic;
  return {
    id: `${index}-${analysis.excerpt.slice(0, 12)}-${s.composite_index}`,
    timestamp: analysis.timestamp,
    label: analysis.meta.label,
    channel: analysis.meta.channel,
    outcome: analysis.meta.outcome,
    excerpt: analysis.excerpt,
    sourceText: analysis.text.slice(0, SOURCE_TEXT_CAP),

    compositeIndex: s.composite_index,
    stage: s.attack_cycle_stage,
    pretextCategory: s.pretext.category,
    specificity: s.pretext.specificity,
    pressure: s.emotional_pressure.overall_pull,
    urgency: s.emotional_pressure.urgency_scarcity,
    threatFraming: s.emotional_pressure.threat_benefit_ratio,
    personalization: s.personalization.data_point_density,
    roleFit: s.personalization.role_context_fit,
    authority: s.cialdini.authority.score,
    ctaClarity: s.linguistic.cta_clarity,
    ctaSteps: s.linguistic.cta_steps,
    registerConsistency: s.linguistic.register_consistency,
    surfaceQuality: s.linguistic.surface_quality,
    verificationFriction: s.cognitive_load.verification_friction,
    readingGrade: analysis.readability.fkGrade,
    wordCount: analysis.readability.wordCount,
    lexicon: Object.fromEntries(Object.entries(analysis.lexicon).map(([k, v]) => [k, v.hits])),
    /* Numeric feature vector (no hit strings — those live in `lexicon` above)
       so exports carry the raw counts behind every normalized score. */
    features: {
      wordCount: analysis.features.wordCount,
      sentenceCount: analysis.features.sentenceCount,
      avgWordsPerSentence: analysis.features.avgWordsPerSentence,
      fleschEase: analysis.features.fleschEase,
      fkGrade: analysis.features.fkGrade,
      passiveVoicePct: analysis.features.passiveVoicePct,
      ctaSteps: analysis.features.ctaSteps,
      lexiconCounts: Object.fromEntries(
        Object.entries(analysis.features.lexicon).map(([k, v]) => [k, v.count]),
      ),
      lexiconDensities: Object.fromEntries(
        Object.entries(analysis.features.lexicon).map(([k, v]) => [k, v.density]),
      ),
      cialdiniScores: analysis.features.cialdiniScores,
      components: analysis.features.components,
    },
  };

}

/* Dimensions used for corpus aggregation and campaign comparison. */
export const DIMENSIONS = [
  { key: "compositeIndex", label: "Composite index" },
  { key: "pressure", label: "Emotional pressure" },
  { key: "urgency", label: "Urgency / scarcity" },
  { key: "threatFraming", label: "Threat framing" },
  { key: "personalization", label: "Personalization" },
  { key: "authority", label: "Authority" },
  { key: "ctaClarity", label: "Action demand" },
  { key: "verificationFriction", label: "Verification friction" },
  { key: "registerConsistency", label: "Register consistency" },
  { key: "surfaceQuality", label: "Surface quality" },
  { key: "readingGrade", label: "Reading grade" },
];

/* ------------------------------------------------------------
   BATCH INPUT PARSING
   ------------------------------------------------------------ */

export const BATCH_DELIMITER = /^\s*---+\s*$/m;

export function splitBatchText(text) {
  return String(text || "")
    .split(/^\s*---+\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/* ---- Streaming CSV ----------------------------------------------------
   A resumable, chunk-safe CSV parser. Feed it arbitrary slices of a file
   (quoted fields may span chunk boundaries) and it emits complete rows. */
function createCsvParser(delimiter = ",") {
  let field = "";
  let row = [];
  let inQuotes = false;
  let pendingQuote = false; // saw a '"' inside quotes at the very end of a chunk

  function pushRows(chunk, out) {
    for (let i = 0; i < chunk.length; i++) {
      const ch = chunk[i];
      if (pendingQuote) {
        pendingQuote = false;
        if (ch === '"') {
          field += '"';
          continue;
        }
        inQuotes = false;
        // fall through and process ch as an unquoted character
      }
      if (inQuotes) {
        if (ch === '"') {
          if (i === chunk.length - 1) {
            pendingQuote = true;
          } else if (chunk[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else field += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === delimiter) {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        if (row.some((c) => c.trim().length)) out.push(row);
        row = [];
        field = "";
      } else if (ch !== "\r") field += ch;
    }
  }

  return {
    push(chunk) {
      const out = [];
      pushRows(chunk, out);
      return out;
    },
    flush() {
      const out = [];
      if (pendingQuote) {
        pendingQuote = false;
        inQuotes = false;
      }
      if (field.length || row.length) {
        row.push(field);
        if (row.some((c) => c.trim().length)) out.push(row);
        row = [];
        field = "";
      }
      return out;
    },
  };
}

/* Guesses the column separator from a sample of the file. Handles the
   common exports: comma, semicolon (EU Excel), tab, pipe. */
function sniffDelimiter(sample) {
  const lines = sample.split("\n").slice(0, 20).join("\n");
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const d of candidates) {
    let count = 0;
    let inQuotes = false;
    for (const ch of lines) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes && ch === d) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return bestCount > 0 ? best : ",";
}

function parseCsv(content, delimiter) {
  const p = createCsvParser(delimiter || sniffDelimiter(content.slice(0, 8192)));
  return [...p.push(content), ...p.flush()];
}

const TEXT_HEADERS = ["text", "body", "message", "content", "email", "email_body", "sample"];
const norm = (h) =>
  h
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

function csvHeaderMap(headerRow) {
  const header = headerRow.map(norm);
  const looks = (h, words) => words.some((w) => h === w || h.includes(w));
  return {
    textIdx: (() => {
      const exact = header.findIndex((h) => TEXT_HEADERS.includes(h));
      if (exact !== -1) return exact;
      return header.findIndex((h) => looks(h, ["body", "text", "message", "content"]));
    })(),
    channelIdx: header.findIndex((h) => looks(h, ["channel", "medium", "vector"])),
    outcomeIdx: header.findIndex((h) => looks(h, ["outcome", "result", "disposition"])),
    labelIdx: header.findIndex((h) => looks(h, ["label", "subject", "id", "name"])),
  };
}

function cell(row, idx) {
  return idx > -1 ? (row[idx] || "").trim() : undefined;
}

function csvRowToMessage(row, map) {
  const idx = map.textIdx;
  const text = idx > -1 ? (row[idx] || "").trim() : row.join(" ").trim();
  if (!text) return null;
  return {
    text,
    channel: cell(row, map.channelIdx),
    outcome: cell(row, map.outcomeIdx),
    label: cell(row, map.labelIdx),
  };
}

/* A CSV row stream that figures out, from the first rows it sees, whether
   there is a header and which column holds the message body. Without this
   a file whose body column is named e.g. "email_body" collapsed into one
   giant blob or one message per joined row. */
const SNIFF_ROWS = 25;

function createCsvMessageStream() {
  let map = null;
  let decided = false;
  let buffer = [];

  function decide() {
    decided = true;
    const rows = buffer;
    if (!rows.length) return [];

    const headerMap = csvHeaderMap(rows[0]);
    if (headerMap.textIdx !== -1) {
      map = headerMap;
      return rows.slice(1);
    }

    // No recognizable header: pick the column that actually carries prose.
    const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
    if (width <= 1) {
      map = { textIdx: 0, channelIdx: -1, outcomeIdx: -1, labelIdx: -1 };
      return rows;
    }
    const avg = new Array(width).fill(0);
    for (const r of rows) for (let c = 0; c < width; c++) avg[c] += (r[c] || "").trim().length;
    let bestCol = 0;
    for (let c = 1; c < width; c++) if (avg[c] > avg[bestCol]) bestCol = c;

    // Treat row 0 as a header when it is short/label-like while later rows
    // carry long text in the same column.
    const firstLen = (rows[0][bestCol] || "").trim().length;
    const restMax = rows
      .slice(1)
      .reduce((m, r) => Math.max(m, (r[bestCol] || "").trim().length), 0);
    const headerish = rows.length > 1 && firstLen <= 40 && restMax > Math.max(60, firstLen * 2);

    map = headerish
      ? { ...headerMap, textIdx: bestCol }
      : { textIdx: bestCol, channelIdx: -1, outcomeIdx: -1, labelIdx: -1 };
    return headerish ? rows.slice(1) : rows;
  }

  function emit(rows) {
    const out = [];
    for (const r of rows) {
      const m = csvRowToMessage(r, map);
      if (m) out.push(m);
    }
    return out;
  }

  return {
    feed(rows) {
      if (decided) return emit(rows);
      buffer = buffer.concat(rows);
      if (buffer.length < SNIFF_ROWS) return [];
      const usable = decide();
      buffer = [];
      return emit(usable);
    },
    flush() {
      if (decided) return [];
      const usable = decide();
      buffer = [];
      return emit(usable);
    },
  };
}

function messagesFromCsv(content) {
  const rows = parseCsv(content);
  const s = createCsvMessageStream();
  return [...s.feed(rows), ...s.flush()];
}

function messagesFromJson(content) {
  const parsed = JSON.parse(content);
  const pick = (o) => ({
    text: String(o.text || o.body || o.message || o.content || "").trim(),
    channel: o.channel,
    outcome: o.outcome,
    label: o.label || o.id || o.subject,
  });
  if (Array.isArray(parsed)) {
    return parsed
      .map((o) => (typeof o === "string" ? { text: o.trim() } : pick(o)))
      .filter((m) => m.text);
  }
  // A campaign bundle exported by this tool.
  if (Array.isArray(parsed.messages)) return parsed.messages.map(pick).filter((m) => m.text);
  if (Array.isArray(parsed.entries)) {
    return parsed.entries
      .map((e) => ({
        text: e.text || e.excerpt || "",
        channel: e.channel,
        outcome: e.outcome,
        label: e.label,
      }))
      .filter((m) => m.text);
  }
  const single = pick(parsed);
  return single.text ? [single] : [];
}

/* True when a sample looks like delimited rows rather than prose: the
   first handful of lines all carry the same separator count. */
function looksTabular(sample) {
  const lines = sample.split("\n").slice(0, 6).filter(Boolean);
  if (lines.length < 2) return false;
  const d = sniffDelimiter(lines.join("\n"));
  const counts = lines.map((l) => l.split(d).length);
  return counts[0] > 1 && counts.every((c) => c === counts[0]);
}

const yieldToUi = () => new Promise((r) => setTimeout(r, 0));

/* Streams a file and calls onMessage for every parsed message, never
   holding more than one chunk of raw text at a time. */
async function streamFileMessages(file, onMessage, { signal } = {}) {
  const name = file.name.toLowerCase();
  const isJson = name.endsWith(".json");
  let isCsv = /\.(csv|tsv|psv)$/.test(name);
  let delimiter = name.endsWith(".tsv") ? "\t" : name.endsWith(".psv") ? "|" : null;
  let count = 0;

  // JSON must be parsed whole; small files are cheaper read whole too.
  if (isJson || (!isCsv && file.size < 4 * 1024 * 1024) || !file.stream) {
    const content = await file.text();
    // A tabular file without a .csv extension is still tabular: sniff it.
    if (!isJson && !isCsv && looksTabular(content)) isCsv = true;
    const parsed = isJson
      ? messagesFromJson(content)
      : isCsv
        ? messagesFromCsv(content)
        : splitBatchText(content).map((t) => ({ text: t }));
    for (const m of parsed) {
      await onMessage({ label: file.name, ...m });
      count++;
    }
    return count;
  }

  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8");
  let csv = null;
  let csvStream = null;
  let textTail = "";
  let sinceYield = 0;

  const handleRows = async (rows) => {
    for (const m of csvStream.feed(rows)) {
      await onMessage({ label: file.name, ...m });
      count++;
    }
  };

  let first = true;

  for (;;) {
    if (signal?.aborted) break;
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (first) {
      first = false;
      // Sniff on real content: extensionless/mislabelled tabular files are common.
      if (!isCsv && looksTabular(chunk)) isCsv = true;
      if (isCsv) {
        csv = createCsvParser(delimiter || sniffDelimiter(chunk.slice(0, 8192)));
        csvStream = createCsvMessageStream();
      }
    }
    if (csv) await handleRows(csv.push(chunk));
    else {
      textTail += chunk;
      const parts = textTail.split(/^\s*---+\s*$/m);
      textTail = parts.pop() ?? "";
      for (const part of parts) {
        const t = part.trim();
        if (t) {
          await onMessage({ label: file.name, text: t });
          count++;
        }
      }
    }
    sinceYield += chunk.length;
    if (sinceYield > 1_000_000) {
      sinceYield = 0;
      await yieldToUi();
    }
  }

  if (csv) {
    await handleRows(csv.flush());
    for (const m of csvStream.flush()) {
      await onMessage({ label: file.name, ...m });
      count++;
    }
  } else {
    const t = textTail.trim();
    if (t) {
      await onMessage({ label: file.name, text: t });
      count++;
    }
  }

  return count;
}

/* Reads dropped files into normalized { text, channel, outcome, label }
   messages. Kept for small/simple use; large ingests should use
   ingestFiles, which scores as it streams. */
export async function messagesFromFiles(fileList) {
  const files = Array.from(fileList);
  const messages = [];
  const failed = [];
  for (const file of files) {
    try {
      let got = 0;
      await streamFileMessages(file, (m) => {
        messages.push(m);
        got++;
      });
      if (!got) failed.push(file.name);
    } catch {
      failed.push(file.name);
    }
  }
  return { messages, failed };
}

function scoreMessage(m, i) {
  return toEntry(
    analyzeText(m.text, {
      label: m.label || `msg-${i + 1}`,
      channel: CHANNELS.includes(m.channel) ? m.channel : m.channel ? "Other" : "Email",
      outcome: OUTCOMES.includes(m.outcome) ? m.outcome : "Unknown",
    }),
    i,
  );
}

/* Synchronous scoring — fine for a handful of messages. */
export function analyzeCorpus(messages) {
  return messages.filter((m) => m.text && m.text.trim().length).map(scoreMessage);
}

/* Batched scoring that yields to the browser between batches so the UI
   keeps painting. There is no cap on message count. */
export async function analyzeCorpusAsync(messages, { onProgress, signal, batchSize = 200 } = {}) {
  const usable = messages.filter((m) => m.text && m.text.trim().length);
  const entries = [];
  for (let i = 0; i < usable.length; i++) {
    if (signal?.aborted) break;
    entries.push(scoreMessage(usable[i], i));
    if ((i + 1) % batchSize === 0) {
      onProgress?.({ done: i + 1, total: usable.length });
      await yieldToUi();
    }
  }
  onProgress?.({ done: entries.length, total: usable.length });
  return entries;
}

/* Streams files straight into scored entries: raw text is discarded as
   soon as a message is scored, so a very large CSV never lands in memory
   as one string. There is no cap on message count. */
export async function ingestFiles(fileList, { onProgress, signal } = {}) {
  const files = Array.from(fileList);
  const entries = [];
  const failed = [];
  let index = 0;
  let sinceYield = 0;

  for (const file of files) {
    if (signal?.aborted) break;
    try {
      let got = 0;
      await streamFileMessages(
        file,
        async (m) => {
          if (signal?.aborted) return;
          got++;
          if (!m.text || !m.text.trim()) return;
          entries.push(scoreMessage(m, index++));
          if (++sinceYield >= 200) {
            sinceYield = 0;
            onProgress?.({ done: entries.length, file: file.name });
            await yieldToUi();
          }
        },
        { signal },
      );
      if (!got) failed.push(file.name);
      onProgress?.({ done: entries.length, file: file.name });
      await yieldToUi();
    } catch {
      failed.push(file.name);
    }
  }
  return { entries, failed };
}

/* ------------------------------------------------------------
   CORPUS AGGREGATION
   ------------------------------------------------------------ */

function tally(items, keyFn) {
  const map = {};
  items.forEach((i) => {
    const k = keyFn(i) || "Unknown";
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .map(([key, count]) => ({ key, count, pct: Math.round((count / items.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}

const PHRASE_WORD_CAP = 120; // words inspected per message
const PHRASE_MAP_CAP = 120_000; // distinct phrases tracked at once
const PHRASE_SAMPLE_CAP = 5000; // messages sampled for phrase detection

function shingles(text, n = 5) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, PHRASE_WORD_CAP);
  const out = new Set();
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(" "));
  return out;
}

function repeatedPhrases(entries, limit = 6) {
  const counts = new Map();
  // Cap the work: on very large corpora an evenly spaced sample gives the
  // same recurring-template signal without exploding memory.
  const step = Math.max(1, Math.ceil(entries.length / PHRASE_SAMPLE_CAP));
  for (let i = 0; i < entries.length; i += step) {
    // Count a phrase once per message, so repetition means "across messages".
    shingles(textOf(entries[i])).forEach((s) => {
      if (!counts.has(s) && counts.size >= PHRASE_MAP_CAP) return;
      counts.set(s, (counts.get(s) || 0) + 1);
    });
  }
  return [...counts.entries()]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phrase, count]) => ({ phrase, count }));
}

function textOf(entry) {
  return entry.sourceText || entry.excerpt || "";
}

export function aggregateCorpus(entries) {
  if (!entries.length) return null;
  const stats = {};
  DIMENSIONS.forEach((d) => {
    // Built with a loop, not spread: Math.min(...values) blows the call
    // stack past ~100k messages.
    const values = new Array(entries.length);
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < entries.length; i++) {
      const v = entries[i][d.key] || 0;
      values[i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    stats[d.key] = {
      label: d.label,
      mean: Math.round(mean(values) * 10) / 10,
      median: Math.round(median(values) * 10) / 10,
      min,
      max,
      stdev: Math.round(stdev(values) * 10) / 10,
    };
  });

  const lexiconTally = {};
  entries.forEach((e) => {
    Object.values(e.lexicon).forEach((hits) => {
      hits.forEach((h) => {
        lexiconTally[h] = (lexiconTally[h] || 0) + 1;
      });
    });
  });
  const topTriggers = Object.entries(lexiconTally)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const pickBy = (key, dir) =>
    entries.reduce((best, e) => (dir * (e[key] - best[key]) > 0 ? e : best), entries[0]);

  const buckets = [0, 0, 0, 0, 0];
  entries.forEach((e) => {
    buckets[Math.min(4, Math.floor(e.compositeIndex / 20))] += 1;
  });

  const findings = [];
  const idx = stats.compositeIndex;
  findings.push(
    `${entries.length} messages scored; composite index averages ${idx.mean} (median ${idx.median}, range ${idx.min}-${idx.max}).`,
  );
  if (idx.stdev < 8)
    findings.push(
      `Very low spread (σ ${idx.stdev}) — the corpus is highly formulaic, consistent with a single template.`,
    );
  else if (idx.stdev > 22)
    findings.push(
      `Wide spread (σ ${idx.stdev}) — the corpus mixes materially different construction styles.`,
    );

  DIMENSIONS.filter((d) => d.key !== "compositeIndex" && d.key !== "readingGrade").forEach((d) => {
    const s = stats[d.key];
    if (s.mean >= 65)
      findings.push(`${d.label} is consistently high across the corpus (mean ${s.mean}).`);
    if (s.stdev <= 4 && s.mean > 10)
      findings.push(`${d.label} barely varies (σ ${s.stdev}) — likely fixed by a shared template.`);
  });

  const pretextMix = tally(entries, (e) => e.pretextCategory);
  if (pretextMix.length && pretextMix[0].pct >= 50) {
    findings.push(
      `${pretextMix[0].pct}% of messages use the same pretext family: ${pretextMix[0].key}.`,
    );
  }

  const phrases = repeatedPhrases(entries);
  if (phrases.length) {
    findings.push(
      `Recurring phrasing detected: "${phrases[0].phrase}" appears in ${phrases[0].count} messages.`,
    );
  }

  // Outcome correlation, only when outcomes were supplied.
  const withOutcome = entries.filter((e) => e.outcome && e.outcome !== "Unknown");
  const isSuccess = (e) => e.outcome === "Clicked" || e.outcome === "Credentials Entered";
  const succeeded = withOutcome.filter(isSuccess);
  let outcomeSignal = null;
  if (succeeded.length >= 2 && withOutcome.length - succeeded.length >= 2) {
    const others = withOutcome.filter((e) => !isSuccess(e));
    outcomeSignal = DIMENSIONS.map((d) => ({
      label: d.label,
      delta:
        Math.round(
          (mean(succeeded.map((e) => e[d.key])) - mean(others.map((e) => e[d.key]))) * 10,
        ) / 10,
    }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 4);
    findings.push(
      `Among ${withOutcome.length} messages with recorded outcomes, ${outcomeSignal[0].label.toLowerCase()} differs most between successful and unsuccessful attempts (${outcomeSignal[0].delta > 0 ? "+" : ""}${outcomeSignal[0].delta}).`,
    );
  }

  return {
    count: entries.length,
    stats,
    buckets,
    pretextMix,
    channelMix: tally(entries, (e) => e.channel),
    stageMix: tally(entries, (e) => e.stage),
    outcomeMix: tally(entries, (e) => e.outcome),
    topTriggers,
    phrases,
    outcomeSignal,
    findings,
    outliers: {
      highest: pickBy("compositeIndex", 1),
      lowest: pickBy("compositeIndex", -1),
      mostPersonalized: pickBy("personalization", 1),
      mostUrgent: pickBy("urgency", 1),
    },
  };
}

/* ------------------------------------------------------------
   CAMPAIGN COMPARISON
   ------------------------------------------------------------ */

export function buildCampaign(name, entries) {
  return {
    name: name || "Untitled campaign",
    entries,
    summary: aggregateCorpus(entries),
  };
}

export const CAMPAIGN_COLORS = [
  "#fb7185",
  "#38bdf8",
  "#facc15",
  "#4ade80",
  "#c084fc",
  "#fb923c",
  "#2dd4bf",
  "#f472b6",
];

/* Compares any number of scored campaigns (2 or more). */
export function compareCampaigns(campaignList) {
  const campaigns = (campaignList || []).filter((c) => c?.summary && c.entries?.length);
  if (campaigns.length < 2) return null;

  const names = campaigns.map((c) => c.name);
  const rows = DIMENSIONS.map((d) => {
    const values = campaigns.map((c) => c.summary.stats[d.key].mean);
    let minI = 0;
    let maxI = 0;
    values.forEach((v, i) => {
      if (v < values[minI]) minI = i;
      if (v > values[maxI]) maxI = i;
    });
    return {
      key: d.key,
      label: d.label,
      values,
      minIndex: minI,
      maxIndex: maxI,
      spread: Math.round((values[maxI] - values[minI]) * 10) / 10,
    };
  });

  const radar = DIMENSIONS.filter((d) => d.key !== "readingGrade").map((d) => {
    const point = { dimension: d.label };
    campaigns.forEach((c, i) => {
      point[`c${i}`] = c.summary.stats[d.key].mean;
    });
    return point;
  });

  const series = campaigns.map((c, i) => ({
    key: `c${i}`,
    name: c.name,
    color: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length],
  }));

  const findings = [];
  const ciRow = rows.find((r) => r.key === "compositeIndex");
  findings.push(
    `${campaigns.length} campaigns compared across ${campaigns.reduce((n, c) => n + c.entries.length, 0)} messages. ` +
      (ciRow.spread < 2
        ? "All of them score within noise of each other on the composite index."
        : `${names[ciRow.maxIndex]} runs highest (${ciRow.values[ciRow.maxIndex]}) and ${names[ciRow.minIndex]} lowest (${ciRow.values[ciRow.minIndex]}), a ${ciRow.spread}-point gap.`),
  );

  [...rows]
    .filter((r) => r.key !== "compositeIndex")
    .sort((a, b) => b.spread - a.spread)
    .slice(0, 3)
    .forEach((r) => {
      if (r.spread >= 3) {
        findings.push(
          `${r.label} separates the set most (spread ${r.spread}): ${names[r.maxIndex]} at ${r.values[r.maxIndex]} vs ${names[r.minIndex]} at ${r.values[r.minIndex]}.`,
        );
      }
    });

  const mixLine = (c) =>
    c.summary.channelMix.map((m) => `${m.count} ${m.key.toLowerCase()}`).join(" + ");
  findings.push(`Channel mix — ${campaigns.map((c) => `${c.name}: ${mixLine(c)}`).join("; ")}.`);

  const sigmas = campaigns.map((c) => c.summary.stats.compositeIndex.stdev);
  const mostUniform = sigmas.indexOf(Math.min(...sigmas));
  const leastUniform = sigmas.indexOf(Math.max(...sigmas));
  findings.push(
    `${names[mostUniform]} is the most uniform campaign (σ ${sigmas[mostUniform]}); ${names[leastUniform]} the most varied (σ ${sigmas[leastUniform]}).`,
  );

  const shared = campaigns
    .map((c) => new Set(c.summary.pretextMix.map((p) => p.key)))
    .reduce(
      (acc, set) => acc.filter((k) => set.has(k)),
      [...campaigns[0].summary.pretextMix.map((p) => p.key)],
    );
  findings.push(
    shared.length
      ? `Pretext families present in every campaign: ${shared.join(", ")}.`
      : "No pretext family appears in every campaign.",
  );

  // Largest pairwise gap on the composite index.
  let gap = { a: 0, b: 1, value: 0 };
  for (let i = 0; i < campaigns.length; i++) {
    for (let j = i + 1; j < campaigns.length; j++) {
      const v = Math.abs(ciRow.values[i] - ciRow.values[j]);
      if (v > gap.value) gap = { a: i, b: j, value: Math.round(v * 10) / 10 };
    }
  }
  if (gap.value >= 3) {
    findings.push(
      `Largest pairwise difference: ${names[gap.a]} vs ${names[gap.b]} at ${gap.value} composite index points.`,
    );
  }

  return { campaigns, names, rows, radar, series, findings };
}
