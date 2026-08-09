# Security policy

## Intended use

Hellhound Terminal is a defensive analysis tool for **authorized** security-awareness
work: reviewing phishing-simulation corpora you own, red-team retrospectives run under
a signed rules-of-engagement, and training material. Do not use it to refine live
social-engineering attacks against people who have not consented.

## Data handling

- All parsing and scoring happens in the browser. There is no backend, no API call,
  and no telemetry.
- Nothing is written to `localStorage`, `sessionStorage`, cookies, or IndexedDB.
  Reloading the page destroys every loaded corpus.
- Files you drop are read through the browser `File`/stream APIs and are never
  uploaded. The only way data leaves the page is a download you trigger yourself.
- Corpora may contain real names, addresses, and credentials-adjacent text. Treat the
  JSON exports as sensitive and store them accordingly.

## Reporting a vulnerability

Open a private issue (or email the maintainer listed in `package.json`) with a
description, affected version, and reproduction steps. Please do not open a public
issue for anything that could expose user data.
