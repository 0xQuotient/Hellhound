# Hellhound Terminal

An offline console for **meta-analysis of social-engineering text**. Drop in a corpus of
phishing simulations, SMS pretexts, or call scripts and get deterministic, rubric-based
scores plus cross-message and cross-campaign patterns.

No model, no API key, no network call, no storage. Every number is produced by a
published rubric that you can read in `src/lib/hellhound-scoring.js` and re-implement.

## Offline guarantee

- Zero network: no `fetch`, `XMLHttpRequest`, or WebSocket in the scoring or UI path.
- Zero persistence: no `localStorage`, `sessionStorage`, cookies, or IndexedDB. A reload
  wipes everything; downloads are the only way to keep results.
- Zero telemetry: no analytics, no error reporting, no third-party scripts.
- Files are read with the browser `File`/stream APIs and never leave the tab.

Verify it yourself: build, serve the static output, open DevTools → Network, and analyze
a corpus. The request list stays empty after the initial asset load.

## Running it

```sh
npm install
npm run dev      # http://localhost:8080
npm run build    # static output
npm test         # unit tests for the scoring math
```

The build prerenders `/` to static HTML, so the output can be served from any plain
HTTP server in an air-gapped lab:

```sh
npx serve dist/client   # or: python3 -m http.server -d dist/client
```

## Modes

| Mode | Purpose |
| --- | --- |
| **Corpus** (default) | Score hundreds or thousands of messages at once; distributions, per-dimension mean/median/σ, pretext and channel mix, repeated phrasing, outcome correlation, outliers, sortable paginated table. |
| **Campaigns** | Compare any number of campaigns side by side: paired radar, comparison matrix, pairwise gaps, shared pretexts, channel mix. |
| **Single sample** | Full breakdown of one message. |

## Input formats

- **Paste**: multiple messages separated by a line containing `---`.
- **Files**: `.txt`, `.csv`/`.tsv`, `.json`, `.eml`. Multiple files can be queued; they
  are only parsed when you press **Analyze**.
- **CSV**: delimiter is sniffed (`,` `;` tab `|`). Headers are fuzzy-matched
  (`email_body`, `body`, `content`, `message`, `text`, `subject`, `channel`, `outcome`,
  `label`…). Header-less files fall back to the column with the longest average prose.
  Extensionless or mislabelled tabular files are content-sniffed.
- Large files stream in chunks and score in batches, so a multi-hundred-megabyte CSV
  will not freeze the tab. Raw text is dropped after scoring; an 8 KB excerpt is kept
  per message for export and phrase detection.

## The rubric

Every message is reduced to feature counts, then to normalized 0–100 dimensions:

- **Emotional pressure** — urgency/scarcity, threat vs. benefit framing, overall pull.
- **Persuasion principles** (Cialdini) — authority, scarcity, liking, reciprocity,
  social proof, commitment/consistency, unity. Each is a weighted lexicon density with
  an evidence string.
- **Personalization** — data-point density (names, roles, orgs, dates, amounts, IDs
  matched by regex) and role-context fit.
- **Linguistic quality** — action-demand clarity, number of requested steps, register
  consistency, surface quality (typos, spacing, punctuation anomalies).
- **Cognitive load** — reading grade, passive voice, and verification friction (how hard
  the message makes it to check the claim out-of-band).
- **Pretext category** and **attack-cycle stage** — heuristic classification from the
  above.

The composite index is a fixed weighted sum, published in `COMPOSITE_WEIGHTS`:

| Component | Weight |
| --- | --- |
| Emotional pressure | 0.26 |
| Persuasion principles (mean of top 3) | 0.24 |
| Personalization | 0.18 |
| Action demand | 0.16 |
| Verification friction | 0.16 |

Tiers: `< 35` Low, `35–69` Moderate, `>= 70` High.

Scoring is fully deterministic: the same input always yields the same numbers, and the
rubric version (`RUBRIC_VERSION`) is stamped into every export alongside the weight
table and the raw feature vector per message, so a defender can re-derive the scores or
build detections on the underlying counts.

## Threat model / limitations

Read this before quoting a number in a report.

- **Keyword and regex matching only.** There is no semantic understanding, no embedding,
  no model. A message that conveys urgency without urgency vocabulary scores low.
- **No negation or context handling.** "This is *not* urgent" and "do *not* click" still
  register the underlying terms.
- **Substring matching** produces false positives on common words; gain factors dampen
  but do not eliminate this.
- **Pretext and attack-stage inference are heuristics**, not classifications with a
  measured error rate. Treat them as sorting hints.
- **English-centric lexicons.** Other languages will under-score badly.
- **Readability is Flesch/Flesch–Kincaid**, which assumes ordinary prose; boilerplate,
  headers, and URLs distort it.
- **Client-side only, no ground truth.** The composite index measures rubric-visible
  manipulation surface, not real-world efficacy. Outcome correlation is descriptive,
  and with small corpora it is noise.
- Scores are comparable **within one rubric version**, not across versions.

## Layout

```text
src/lib/hellhound-scoring.js       rubric, CSV streaming, aggregation, comparison
src/lib/hellhound-scoring.test.js  unit tests for the pure math
src/components/HellhoundTerminal.jsx  the console UI
src/routes/                        route definitions
```

## License

MIT — see `LICENSE`. Security and acceptable-use notes are in `SECURITY.md`.
