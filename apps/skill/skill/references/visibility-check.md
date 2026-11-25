# AI visibility check: files and an example

The check uses three files in the person's working folder. Write them as JSON, in UTF-8.

## plan.json: what to ask

```json
{
  "brand": { "site": "ornekspor.com", "name": "Örnek Spor", "aliases": ["OrnekSpor"] },
  "competitors": [{ "site": "rakip.com.tr", "name": "Rakip" }],
  "questions": ["en iyi koşu ayakkabısı", "yeni başlayanlar için koşu ayakkabısı"],
  "repeats": 3,
  "country": "TR",
  "language": "tr"
}
```

- `brand.site`: the site, written any way (`https://www.ornekspor.com/` works). Subdomains count as the site.
- `brand.name`: the name answers may use without a link. `aliases` are other spellings (up to 5). Case, accents and Turkish dotted and dotless i are ignored, and "OrnekSpor" matches "Ornek Spor".
- `competitors`: up to 5, each with a site and a name. They add no calls.
- `questions`: 1 to 50, as people ask them, up to 300 characters each.
- `repeats`: 1 to 5; 3 when left out.
- `country`: a two-letter region code, such as `TR`. `language`: a language code, such as `tr`.
- `engines`: the ids from `provider.json` to ask. Leave it out to use the cheapest priced model of each AI product. Add dearer models only when the person asks for them.

## provider.json: the tools you can call

Write what your tools say about themselves. Never guess a price: write `null` when a tool states none. An engine without a stated price is never chosen by default, and the notice says its calls are not in the estimate.

```json
{
  "id": "agensi",
  "label": "Agensi",
  "currency": "USD",
  "chargesFailedCalls": false,
  "billing": "balance",
  "engines": [
    { "id": "perplexity", "label": "Perplexity", "family": "perplexity", "model": "sonar", "pricePerCall": 0.005 },
    { "id": "ai-mode", "label": "Google AI Mode", "family": "google-ai-mode", "pricePerCall": 0.0052 }
  ]
}
```

- `label`: who bills the calls, as the person knows it. It appears in the notice.
- `chargesFailedCalls`: whether failed calls are billed. Write `false` only when the provider says failed calls are free.
- `billing`: `balance` when calls are paid from a balance with the provider; `account` when they are billed to the person's own account with an AI service.
- `family`: the AI product: `chatgpt`, `claude`, `copilot`, `gemini`, `google-ai-mode`, `google-ai-overviews` or `perplexity`. Checks are compared over time by family.

## answers.jsonl: one line per call

`visibility calls ... --agreed` prints the calls, one JSON line each:

```jsonl
{"question":0,"ask":"en iyi koşu ayakkabısı","engine":"perplexity","tool":"Perplexity · sonar","attempt":1,"country":"TR","language":"tr"}
```

Make that call, then add the answer's fields to the same line and append it to `answers.jsonl`:

```jsonl
{"question":0,"engine":"perplexity","attempt":1,"ok":true,"text":"…the answer as the tool returned it…","sources":["https://www.example.com/shoes","https://www.ornekspor.com/kosu"],"cost":0.005}
```

- `text`: the answer's whole text, as returned.
- `sources`: the addresses the answer cites, in the order it gives them. Keep entries that are not addresses in their place, as `""`.
- `cost`: what the tool reports this call cost, when it reports it.

When a call brings no answer, write `"ok": false` and a `failure`: `unavailable`, `rate-limited`, `refused`, `no-balance`, `timeout` or `error`. Keep `question`, `engine` and `attempt` as listed. A line that does not fit the plan is reported and left out.

## Saved checks

`--save checks` writes the check to `checks/<date>-<site>.json`. Keep these files: `visibility trend checks/*.json` compares them over time, on the questions and AI products they share. Checks for another site, country or language are left out of the comparison.
