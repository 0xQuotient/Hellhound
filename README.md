# Hellhound

An offline console for **meta-analysis of social-engineering text**. Drop in a corpus of
phishing simulations, SMS pretexts, or call scripts and get deterministic, rubric-based
scores plus cross-message and cross-campaign patterns.

No model, no API key, no network call, no storage. Every number is produced by a
published rubric in `src/lib/hellhound-scoring.js`, readable and re-implementable line
by line.

## Offline guarantee

- Zero network: no `fetch`, `XMLHttpRequest`, or WebSocket in the scoring or UI path.
- Zero persistence: no `localStorage`, `sessionStorage`, cookies, or IndexedDB. A reload
  wipes everything; downloads are the only way to keep results.
- Zero telemetry: no analytics, no error reporting, no third-party scripts.
- Files are read with the browser `File`/stream APIs and never leave the tab.

Verify it yourself: build, serve the output, open DevTools → Network, and analyze
a corpus. The request list stays empty after the initial asset load.

## Installing

One command downloads and sets everything up, including Node.js if it isn't already
installed:

```sh
curl -fsSL https://raw.githubusercontent.com/0xQuotient/Hellhound/main/install.sh | bash
```

This detects your package manager (`dnf`, `apt`, or `pacman`), installs Node if needed,
clones the repo into `~/Hellhound`, installs dependencies, and links a `hellhound`
command. To read the script before running it:

```sh
curl -fsSL https://raw.githubusercontent.com/0xQuotient/Hellhound/main/install.sh -o install.sh
cat install.sh   # read it
bash install.sh
```

Then, from anywhere:

```sh
hellhound
```

Setup: one command. Launch: one command.

## Running it from source

```sh
npm install
npm run dev       # web dev server, http://localhost:5173
npm run app       # Electron desktop window (dev server + Electron together)
npm run build     # client bundle in dist/client, server shell in dist/server
npm test          # unit tests for the scoring math
```

All analysis code ships in the client bundle, so the contents of `dist/client` can be
served from any plain HTTP server in an air-gapped lab (point its 404/fallback at
`index.html`):

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

- **Paste**: multiple messages are detected automatically (header lines, numbered
  labels, sign-offs, or explicit `---` separator lines).
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

Lexicon and Cialdini terms are matched as whole words, not raw substrings, and a hit is
discounted when a negator ("not," "never," "no," "n't," "without") appears in the ~4
words immediately before it, so "this is not urgent" doesn't score as urgency the way
"this is urgent" does. This is a fixed-window heuristic, not clause parsing, so negation
further back in a sentence can still slip through — see Limitations below.

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

- **Keyword and regex matching, not semantic understanding.** There is no model, no
  embedding. A message that conveys urgency without urgency vocabulary scores low.
- **Negation handling is a fixed 4-word window**, not clause parsing. Direct negation
  right before a term is caught ("not urgent"); negation from earlier in the sentence,
  across a comma, or implied rather than stated is not.
- **Word-boundary matching** reduces false positives from a term appearing inside a
  larger word, but a term used in an unrelated sense within its own word boundaries
  ("policy" in a sentence with nothing to do with authority) will still match.
- **The composite weights and density curves are hand-authored, not statistically fit.**
  Every constant lives in `COMPOSITE_WEIGHTS` and the per-dimension scoring functions,
  not derived from a labeled dataset or validated against outcome data. The composite
  index is a structured, reproducible comparison metric, not a calibrated probability.
- **Pretext and attack-stage inference are heuristics**, not classifications with a
  measured error rate. Treat them as sorting hints.
- **English-centric lexicons.** Other languages will under-score badly — a good place
  for someone to extend this.
- **Readability is Flesch/Flesch–Kincaid**, which assumes ordinary prose; boilerplate,
  headers, and URLs distort it.
- **Client-side only, no ground truth.** The composite index measures rubric-visible
  manipulation surface, not real-world efficacy. Hellhound doesn't know whether any
  message it scores actually succeeded; any outcome labels come entirely from what you
  enter, and with small corpora that correlation is noise.
- Scores are comparable **within one rubric version**, not across versions.

## Layout

```text
src/lib/hellhound-scoring.js       rubric, CSV streaming, aggregation, comparison
src/lib/hellhound-scoring.test.js  unit tests for the pure math
src/components/HellhoundTerminal.jsx  the console UI
src/routes/                        route definitions
electron/main.cjs                  desktop window entry point
bin/hellhound                      terminal launcher
install.sh                         self-bootstrapping installer
```

## Contributing

Fork it, change a weight, add a lexicon category, extend it to another language, or
build on top of the scoring engine. Open a PR or fork and go your own direction.

## License

MIT — see `LICENSE`. Security and acceptable-use notes are in `SECURITY.md`.
