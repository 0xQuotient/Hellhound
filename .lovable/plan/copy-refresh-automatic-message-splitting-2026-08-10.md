# Copy refresh + automatic message splitting

## 1. Wording

Replace rubric/telemetry language with plain "Cognitive Meta-Analysis" framing:

- Header tagline: `Deterministic cognitive telemetry · offline rubric` -> `Cognitive Meta-Analysis`
- Corpus section subtitle -> `Drop in your corpus and press Analyze.`
- Single sample subtitle -> `Paste one message and press Analyze.`
- "Rubric breakdown" panel heading -> `Breakdown`
- Campaign radar subtitle -> `Mean score per campaign on each dimension`
- Textarea placeholders lose the "separated by a line containing only ---" instruction; they become simple examples ("Paste your messages here...").

No mention of rubric anywhere in visible UI. Internal export field `rubricVersion` stays (it stamps exports for reproducibility) unless you want it renamed too.

## 2. Automatic message boundary detection

Today pasted/plain-text input only splits on a line of `---`. Change to a heuristic splitter so the user does nothing:

Split points, applied in priority order:

1. Explicit separators: a line of only `---`, `===`, `***`, `___`, or `=== message N ===`.
2. Email-ish starts: a blank line followed by a header line such as `From:`, `To:`, `Subject:`, `Date:`, `Sent:`, or `Return-Path:` (start of a new message when a previous body already exists).
3. Numbered/labelled starts: lines like `Message 3`, `Email 12:`, `[3]`, `#4`, `Call 2 -`, `SMS 5:`.
4. Sign-off boundary: a closing line (`Thanks,` / `Regards,` / `Best,` / `Sincerely,` / `Cheers,` / `Thank you,` + optional name line) followed by a blank line and new prose that isn't a continuation.
5. Timestamp-style separators (`On Mon, Jan 3 ... wrote:`) treated as a boundary only when at line start after a blank line.

Guards so we don't shred one email into pieces:

- A candidate chunk shorter than ~40 characters is merged back into the previous chunk.
- Sign-off splitting only fires when the resulting chunk is a plausible message (has >= 15 words) and the text contains more than one sign-off.
- If heuristics yield exactly one chunk, the input is treated as a single message (current behaviour).
- Explicit `---` separators, when present anywhere, win outright and heuristics are skipped, so existing corpora behave identically.

CSV/JSON/EML ingest is unchanged — those already have real record boundaries.

## Technical notes

- New `splitMessagesAuto(text)` in `src/lib/hellhound-scoring.js`, replacing `splitBatchText` at its call sites (paste path in the terminal, and the plain-text branch of `streamFileMessages`).
- The streaming path keeps a tail buffer; the auto-splitter is applied to the buffered tail and the final chunk is held back until the next chunk arrives (or EOF), so boundaries spanning chunk edges survive.
- Add unit tests in `src/lib/hellhound-scoring.test.js` covering: `---` still works, `Subject:` blocks split, sign-off splitting, one email stays one message, short fragments merge.
