# Hellhound Terminal — offline hardening pass

Goal: make the tool credible as a fully offline, self-contained lab/portfolio artifact. No behavior change to the rubric itself.

## 1. Strip platform residue

- Delete `src/lib/lovable-error-reporting.ts` and remove its import and the `reportLovableError(...)` call from the root error boundary (the boundary itself stays, it just logs locally).
- Replace root metadata: title, description, author, og tags and twitter tags become Hellhound Terminal copy. No third-party handle.
- Confirm no remaining references to the platform anywhere in `src/`.

## 2. Static export (no server entry)

- Enable prerendering of `/` and disable SSR-on-request so `npm run build` emits a static `index.html` plus assets that any local HTTP server (or a static host) can serve.
- Remove `src/server.ts` and its two helper modules (`src/lib/error-capture.ts`, `src/lib/error-page.ts`) once nothing references them; drop the `nitro` dev dependency.
- Verify the built output boots with a plain static file server and that the analysis flow works with the network tab empty.

## 3. Project hygiene

- Rename the package to `hellhound-terminal`, set a version and description, clean unused scripts.
- New `README.md` covering: what the tool does, the offline guarantee (no network, no storage, no telemetry), how to run and build, input formats (paste with `---`, `.txt`/`.csv`/`.json`/`.eml`, header sniffing), the three modes, the scoring rubric with its dimensions and composite weights, and a **Threat model / limitations** section (keyword+regex matching, no semantic understanding, no negation handling, heuristic pretext/stage inference, English-centric lexicons).
- Add an MIT `LICENSE`.
- Add `SECURITY.md`: no data leaves the browser, how to report issues, explicit statement that the tool is for authorized security-awareness work only.

## 4. Unit tests for the scoring math

- Add Vitest (dev dependency + `test` script) with a node environment.
- Cover in `src/lib/hellhound-scoring.test.js`:
  - dimension density scores — known input yields expected sub-scores; empty and whitespace-only input does not divide by zero.
  - composite weighting — weights sum to 1 and the composite matches a hand-computed value.
  - CSV parsing — delimiter sniffing (`,` `;` tab `|`), quoted fields containing delimiters and newlines, CRLF, chunk boundaries splitting a quoted field, header-less files picking the prose column.
  - corpus aggregation — mean/median/σ, outlier selection, repeated-phrase detection, mix percentages.
  - N-way campaign comparison — pairwise gaps and shared pretexts with 1, 2 and 3+ campaigns.
- Determinism check: the same corpus scored twice returns identical numbers.

## 5. Feature-vector export

- Extend the existing JSON export so each message carries its raw feature counts (lexicon hits per dimension, token/sentence counts, readability inputs, personalization matches, CTA and friction counts) next to the normalized scores, plus a top-level `rubricVersion` and the weight table — so a defender can re-derive or re-implement the scores.
- Same additions in the corpus and campaign exports.

## Technical notes

- `vite.config.ts`: add the prerender/static configuration; remove the custom server entry wiring.
- `src/lib/hellhound-scoring.js` stays plain JS with JSDoc (typed-module conversion and the UI split are out of scope for this pass).
- No new runtime dependencies; Vitest is dev-only.

## Not in this pass

Splitting `HellhoundTerminal.jsx` into mode components, converting scoring to TypeScript, externalizing the base64 logo, and auditing dynamic Tailwind class construction — deferred to the refactor pass.
