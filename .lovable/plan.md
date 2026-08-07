# System-wide polish: docs cleanup, huge-file ingest, corpus-first, N-way campaigns

## 1. Remove README/doc files that mention AI or the platform

Delete `README.md`, `src/routes/README.md`, and `AGENTS.md`. All three are boilerplate docs referencing Lovable/AI tooling and none are imported by the app, so removal has no runtime effect. Also delete the archived plan file under `.lovable/plan/` that describes the old AI-based approach.

## 2. Make large-file ingest actually work

Current ingest reads every dropped file fully into one string, walks the CSV character by character on the main thread, scores every message synchronously, and then renders every row at once. With a few thousand rows the tab freezes or dies. Changes:

- Rewrite the CSV reader to stream the file in chunks (`file.stream()` with a text decoder, falling back to `file.text()` for small files), holding parser state across chunk boundaries so quoted fields spanning chunks still parse.
- Score in batches with a yield between batches, so the UI stays responsive and can show progress ("scored 4,200 / 18,000").
- Show a progress bar and a cancel button during ingest.
- Stop retaining full message bodies for every entry — keep the excerpt plus the scores, so memory stays flat on very large corpora. Full text is only held while a message is being scored.
- Per-message table renders a paginated slice (e.g. 100 rows per page) instead of every row; sorting still runs over the full set.
- JSON files use the same batched scoring path; array parsing itself stays as-is.
- No hard cap on message count.

## 3. Corpus analysis becomes the primary tab

Reorder the mode switch to: **Corpus** (default, opens on load) → **Campaigns** → **Single sample**. Default state changes from `single` to `corpus`. Copy on the corpus panel is reworded as the primary entry point; the single-sample panel is positioned as a spot check. No visual restyling beyond the reorder.

## 4. Unlimited campaigns, not just A vs B

Replace the fixed A/B pair with a dynamic list of campaign slots:

- Start with two slots; "Add campaign" appends more, each with its own name, paste box, dropzone, score/clear/download controls. Slots are removable.
- Comparison rebuilds for N campaigns: a per-dimension table with one column per campaign, min/max highlighting and spread; a radar overlaying all campaigns (distinct series colors from the existing palette); a channel-mix comparison across all; and templated findings rewritten for N — highest/lowest per dimension, most uniform campaign, shared pretext families across all, and the largest pairwise gap.
- Downloads stay per-campaign JSON bundles; dropping a bundle back into any slot restores it. Still nothing persisted anywhere.

## Technical notes

- `src/lib/hellhound-scoring.js`: new streaming CSV parser and async batched `analyzeCorpus` with a progress callback and abort signal; `compareCampaigns(a, b)` becomes `compareCampaigns(campaigns[])` returning per-dimension rows, radar series and findings for any count ≥ 2.
- `src/components/HellhoundTerminal.jsx`: mode order/default, campaign state moves from `campaignA`/`campaignB` to an array with stable ids, `CampaignPanel` gains remove, comparison section and `CorpusTable` gain pagination/progress. Existing visual components (Card, Gauge, MeterBar, Radar, StatChip, dropzones) are reused unchanged.
- No new dependencies.
