# 0001. Process data on the person's device

**Status:** Proposed · **Date:** 2026-11-23

## Context

The technical direction left open where uploaded data is processed and whether any data is stored. Search Console exports describe a business's search performance; they can be sensitive. A server would mean handling, securing and eventually deleting other people's data, and it would add accounts, retention rules and attack surface before the product has proven its value.

## Decision

- All analysis runs in the browser. Files are read in memory and never uploaded.
- The production build carries a Content Security Policy with `connect-src 'none'`, so the page cannot open network connections after it loads. This turns a privacy promise into a property anyone can verify.
- The only stored data is the AI mention log and two preferences (language and theme), kept in the browser's local storage, with one control to delete everything.
- Page reviews work on HTML the person pastes or chooses. Fetching pages is left for later: it needs a server with the request-forgery protections listed in the technical direction.

## Consequences

- No accounts, no backend and no data retention to manage; the app is a set of static files that can be hosted anywhere.
- Large analyses are bounded by the device; explicit input limits keep them predictable.
- Mention logs do not sync between devices. People keep copies with the JSON and CSV exports.
- A live Search Console connection, page fetching and shared reports would each need a new decision.

---

Return to the [decision records](README.md).
