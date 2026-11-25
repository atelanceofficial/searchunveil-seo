---
name: searchunveil
description: Explains how a website gets found. Reviews a web page the way search engines read it and writes a ranked plan of fixes, reads Google Search Console exports (CSV or ZIP), and checks whether AI answers such as ChatGPT, Perplexity or Google AI Overviews cite the site or name its brand, next to its competitors. Use when someone asks why a page is not found or ranked, what to fix on a page for SEO, what their Search Console data means, or whether AI assistants mention or cite their site. The AI visibility check uses paid tools and runs only after the person agrees to its estimated cost.
summary: SEO page reviews, Search Console analysis and an AI visibility check, run on your computer. The AI visibility check uses Agensi's paid tools, billed to your Agensi balance in addition to the subscription and the free trial.
version: 0.1.0
tags:
  - seo
  - ai-visibility
  - search-console
  - website-audit
keywords:
  - SEO audit
  - AI visibility
  - AI search
  - Google Search Console
  - ChatGPT citations
  - Perplexity
  - Google AI Overviews
use_cases:
  - Find out why a page is not indexed or ranked, and what to fix first
  - Understand a Google Search Console export in plain language
  - Check whether AI answers cite or name your site, next to your competitors, week by week
compatibility: Requires Node.js 20 or later. The AI visibility check also needs paid answer tools connected to the assistant.
---

# SearchUnveil

SearchUnveil explains how a website gets found: by search engines, in Google Search Console data, and in AI answers. Its rules run on the person's computer, in `scripts/searchunveil.mjs`. Files stay on the computer. A page given by its address is downloaded from its own site, with the site's robots.txt, and nothing else is sent anywhere.

## Pricing and paid tools

SearchUnveil is a monthly subscription, and the first 14 days are free. In addition to the subscription and the free trial, the AI visibility check uses Agensi's paid tools, and their fees are charged to your Agensi balance. Page reviews and Search Console analysis use no paid tools.

Abonelik ücretine ve ücretsiz deneme süresine ek olarak, yapay zekâ görünürlüğü kontrolü Agensi'nin ücretli araçlarını kullanır ve bu araçların ücreti Agensi bakiyenizden kesilir. Sayfa incelemesi ve Search Console analizi ücretli araç kullanmaz.

If the person is on the free trial, show the trial warning before their first AI visibility check:

```sh
node scripts/searchunveil.mjs notice trial --provider Agensi --lang <code>
```

## How to run it

```sh
node scripts/searchunveil.mjs <command> --lang <code>
```

`scripts/searchunveil.mjs` is in this skill's folder: run it by its path from where you are. Always pass the person's language: `en`, `tr`, `de`, `es`, `fr`, `zh-CN` or `ar`. Every command prints Markdown. Show it as it is, or summarize it faithfully. Never add a finding, a number or a source that the output does not contain. `node scripts/searchunveil.mjs --help` lists every command.

## Review a page

```sh
node scripts/searchunveil.mjs review https://example.com/page --lang tr
node scripts/searchunveil.mjs review saved-page.html --url https://example.com/page --lang tr
```

The review gives a ranked plan of fixes, title and description ideas written from the page's own words, then every finding with its evidence and sources. Lead with the plan. The review sees the HTML as served: it cannot run the page's JavaScript, and it says so. Only public addresses can be fetched. For a page on a local development server, save its HTML and review the file.

## Read a Search Console export

```sh
node scripts/searchunveil.mjs search-console export.zip --lang tr
node scripts/searchunveil.mjs search-console Queries.csv Pages.csv Dates.csv --lang tr
```

Search Console's own export works as downloaded: the ZIP, or its CSV files. Lead with the headline, then the findings, then the notes about the data.

## Check AI visibility (paid)

This check asks AI engines through paid tools, so follow these steps in order, every time. [references/visibility-check.md](references/visibility-check.md) gives the file formats and an example.

1. **Ask** for the person's site and brand name, other spellings of the name, the questions their customers ask (1 to 50), competitors (optional, up to 5; they cost nothing extra), and the country and language to ask in. Suggest asking each question 3 times, since AI answers vary; fewer repeats cost less.
2. **Describe your tools** in `provider.json`: which answer tools you can call, which AI product each stands for, its model and its price per call, as the tools state them. If a price is not stated, write `null`; never guess one.
3. **Price the check:** `visibility estimate --plan plan.json --provider provider.json`. Show the person the list of AI engines and models with their prices, and the notice in the quote block, word for word. If an AI product they want, such as ChatGPT or Claude, cannot be checked with your tools, the output says so: tell them plainly.
4. **Wait for a clear yes.** Without it, call no paid tool. If they want it cheaper, offer fewer questions, fewer AI engines or fewer repeats, update `plan.json` and price it again.
5. **Ask the AI engines:** `visibility calls --plan plan.json --provider provider.json --agreed` prints one JSON line per call. For each line, call the tool for that engine with the question, country and language. Add the answer to the line: `ok`, the answer `text` and its `sources` in order, and `cost` when the tool reports it; or `ok: false` with a `failure` reason. Append each line to `answers.jsonl`. Do not retry failed calls without asking: a retry may cost money.
6. **Report:** `visibility report --plan plan.json --provider provider.json --answers answers.jsonl --save checks`. Show the report and what the check cost. Results are approximate: answers asked by a program can differ from what people see in the apps.
7. **Comment:** then add your own reading of the answers, at no extra cost: why competitors appear, which sources the engines trust, and what content could earn a citation. Keep it apart from the report and base it only on the answers.
8. **Follow it over time:** `visibility trend checks/*.json` compares saved checks, week by week, on the questions and AI products they share.

## Rules

- Never call a paid tool before the person agrees to the estimated cost, and never call more than the calls listed after they agreed.
- Never invent an answer, a citation, a price or a result. A call that fails is recorded as failed.
- Say when results are approximate or incomplete, as the output does.
