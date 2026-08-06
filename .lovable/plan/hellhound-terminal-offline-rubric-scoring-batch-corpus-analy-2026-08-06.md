# Hellhound Terminal — offline rubric scoring, batch corpus analysis, campaign A/B

## What changes

### 1. No more Anthropic API call
The current `runSemanticAnalysis` posts to `api.anthropic.com` from the browser, which only works inside Claude Artifacts (no key, CORS blocked anywhere else). It gets deleted entirely. Every number the terminal shows will be computed locally in the browser, so the exported code runs anywhere with no key, no network, no backend.

### 2. Deterministic rubric scoring
A scoring engine replaces the model's judgement. Same text in, same scores out, every time. Rubric components, all derived from the text itself:

- Cialdini principles (authority, scarcity, urgency, social proof, reciprocity, commitment, liking, unity): weighted keyword/pattern hits per 100 words, normalized to 0-100 with a documented cap. Evidence strings become the actual matched phrases instead of an LLM paraphrase.
- Emotional pressure: urgency and threat markers vs. benefit markers, computed per third of the text so the existing opening/middle/close trajectory chart still fills in.
- Personalization: counts of name/role/company/date/amount/ID-like tokens and second-person address density.
- Linguistic: existing readability, passive voice, CTA detection (imperatives, links, "click/verify/confirm"), register consistency via sentence-length and formality variance.
- Cognitive load: derived from grade level, step count in the CTA, verification difficulty markers (links vs. phone vs. attachment), and time pressure.
- Pretext category: highest-scoring keyword bucket among the existing categories (IT Support, HR, Finance, Executive, Vendor, Personal Emergency, Delivery, Other).
- Attack-cycle stage: rule table over the above signals.
- Composite index: fixed weighted sum of the sub-scores; the weights are shown in the UI so the score is auditable.
- `analyst_summary` becomes a templated sentence built from the top three contributing signals — no generated prose.

### 3. Meta-analysis over many messages
The single-message box stays, but the primary mode becomes corpus analysis:

- Batch input: paste many messages separated by a delimiter (`---` on its own line), or drop in `.txt`/`.csv`/`.json`/`.eml` files (multi-select, one message per file, or a JSON array). Each message can carry optional channel/outcome metadata from CSV/JSON columns.
- Every message is scored by the same rubric, then aggregated: distribution of composite index, mean/median/spread per rubric dimension, pretext mix, channel mix, most common lexicon triggers, and outliers (highest/lowest pressure, most/least personalized).
- Cross-message pattern findings: templated, rule-derived statements such as recurring phrasing clusters (shingle overlap between messages), dimensions with unusually low variance (formulaic campaign), and dimensions correlating with the `outcome` field when outcomes are supplied.
- Results render as a corpus dashboard reusing the existing Card/Gauge/MeterBar/Radar components plus a per-message sortable table.

### 4. Campaign vs. campaign comparison
The bottom section is rebuilt from a message log into an A/B comparator:

- Two campaign slots (A and B). Each accepts its own batch drop/paste plus a campaign name, and shows message count and channel breakdown (e.g. 50 emails + 5 voice calls).
- Comparison view: side-by-side aggregate scores, a paired radar overlaying A and B, per-dimension deltas with direction, channel-mix comparison, and templated findings ("Campaign B runs 22 points higher on urgency across 100 messages").
- Each campaign is exported/imported as a JSON bundle via the existing download/dropzone pattern, so a user analyzes, downloads, and later reloads the file to compare.

### 5. Storage
Nothing persists. No localStorage, no sessionStorage, no cookies, no server, no database. State lives in React memory only and dies on reload; download/upload is the only continuity mechanism. This is stated in the UI.

## Kept as-is
Visual style, colors, watermark cards, gauge, radar, meter bars, stepper, section labels, clock/header, drop zones, and the download/import flow. The layout gains a mode switch (Single / Corpus / Compare) rather than a redesign.

## Technical notes
- All work stays in `src/components/HellhoundTerminal.jsx` plus a new `src/lib/hellhound-scoring.js` (pure functions: rubric weights, lexicons, scoring, aggregation, comparison) so the rubric is testable and readable.
- No new dependencies; `recharts` and `lucide-react` are already in use.
- Tailwind dynamic-color safelist in `src/styles.css` extended if new color keys appear.
- The full updated code will be returned in chat after implementation.
