# 0005. An optional server for reviews by address and the AI analysis

**Status:** Proposed · **Date:** 2026-11-24 · **Amends:** [0001](0001-local-first-processing.md)

## Context

People want to type a site's address, such as `example.com`, instead of finding and pasting its HTML, and they want a deeper, plain-language reading of a review than fixed rules can give. Neither can happen inside the static app:

- Browsers don't let one site read another site's pages, so an address can only be fetched by a server.
- A language model needs an API key, which must never reach a browser.

[ADR 0001](0001-local-first-processing.md) keeps every analysis on the person's device and makes that verifiable with `connect-src 'none'`. That guarantee is worth keeping for everyone who doesn't need these two features.

## Decision

- Add `apps/server`, a small Node.js server with no framework. It serves the web app and offers two endpoints: `POST /api/page` downloads one public page and its robots.txt, and `POST /api/analyze` asks Claude Fable 5.2 (`claude-fable-5-2`) for an analysis of a review.
- Build the web app three ways. The static and standalone builds keep `connect-src 'none'` and never call a server. The server build (`--mode server`) allows `connect-src 'self'`: its own server and nothing else.
- Reviews still run in the browser. The server only downloads; the engine reviews the HTML and the server's answer on the person's device.
- Fetching is guarded against server-side request forgery: only `http` and `https` on the standard ports; every address a name resolves to must be public (no loopback, private, link-local, carrier-grade NAT, documentation, multicast or reserved ranges, including IPv4 inside IPv6); the checked address is pinned for the connection, so DNS can't switch it afterwards; redirects are followed by hand, at most five, each checked again; a deadline, a size limit after decompression, and HTML only.
- The AI analysis is opt-in per review. The panel says beforehand what will be sent: the findings, the page facts and the start of the page's visible text, never files. The server builds the instructions itself from the reader's language; the browser sends only evidence, which must be the JSON a review produces. Answers come back as JSON in a fixed schema and are checked again in the browser. Requests opt in to Anthropic's server-side fallback, so a declined request can be finished by Anthropic's recommended fallback model; the panel then names the model that wrote it.
- Inside a claude.ai viewer, the static build can ask Claude through the viewer's `sample` capability instead, on the viewer's own account and with their consent. It asks for the same model with the same evidence.
- The API is only for the app's own pages: JSON only, the `Origin` must match, and per-visitor and daily limits keep one visitor from spending the key's budget.

## Consequences

- Hosting the server version means running Node.js and, for the AI analysis, paying for API use. The static version stays a set of files that can be hosted anywhere.
- Privacy statements depend on the build. The interface states what applies: nothing leaves the device (static), pages are fetched and analyzed only on request (server), or only the AI analysis sends data (inside Claude).
- The server keeps nothing: no logs of addresses, pages or analyses beyond what the hosting platform records.
- Pages that need JavaScript to show their content are reviewed as their HTML arrives, as before; the review says so.
- An independent security review of the server is needed before it is offered to the public.

---

Return to the [decision records](README.md).
