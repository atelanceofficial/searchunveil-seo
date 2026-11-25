# AI visibility check

Does an AI answer cite your site, name your brand, or leave you out? This check asks AI answer engines the questions your customers ask, then reads every answer for your site and your competitors'.

The engine's part is built and tested in `packages/core/src/visibility`. Nothing asks real AI engines yet: no answer provider and no screen are built. This page describes how the check works and the rules it keeps. [ADR 0009](adr/0009-ai-visibility-check.md) records the decision.

## What the person gives

| Input | Example | Notes |
| :--- | :--- | :--- |
| Their site | `ornekspor.com` | Written any way: `https://www.ornekspor.com/` is the same site. |
| Their brand name | Örnek Spor | Optional. Answers sometimes name a brand without linking to it. Other spellings can be added as aliases. |
| Questions | "en iyi koşu ayakkabısı" | 1 to 50, as people would ask them. Repeated questions are dropped. |
| Competitors | `rakip.com.tr`, Rakip | Optional, up to 5. They cost nothing: no call is made for them. |
| AI engines | Perplexity, Google AI Overviews | Chosen from what the provider offers, each with its price. |
| Repeats | 3 | 1 to 5 times per question and engine. AI answers vary, so repeats turn results into rates. |
| Country and language | `TR`, `tr` | Answers, Google's especially, change with both. Ask as the site's audience would. |

## What it costs, and when the person agrees

SearchUnveil is planned as a monthly subscription whose first 14 days are free (`PRICING` in `packages/core/src/pricing.ts`). Asking AI engines is the only step that costs money beyond that, and neither the subscription nor the free trial covers it: whoever provides the tools bills each call. The person agrees to that cost before anything is asked.

```text
calls          = questions × engines × repeats
estimated cost = sum over engines of (price per call × calls made with that engine)
```

For example, 10 questions × 3 engines × 3 repeats = 90 calls. At 0.0052 USD a call, that is about 0.468 USD.

1. **Before:** `estimateCost` gives the calls and the cost for each engine. `costNotice` turns the estimate into the notice, sentence by sentence, so no screen or assistant can leave one out. `runVisibilityCheck` validates the plan, works out the estimate and passes it to the `confirm` callback. It asks nothing until `confirm` returns `true`. Any other answer, including a truthy one, declines.
2. **Prices not stated:** an engine may have no stated price. The estimate then says how many calls it leaves out (`unpricedCalls`), and the default engine choice never includes such an engine.
3. **Failed calls:** each provider says whether it bills failed calls (`chargesFailedCalls`), and the notice says which.
4. **After:** `actualCost` works out what was billed from the calls actually made, and `actualCostNotice` says it. It uses the cost a provider reports for a call when there is one, and the stated price otherwise. Failed calls that were not billed are counted, and so are calls cut off when the person stopped the check, because a provider may still bill those.
5. **When a free trial starts:** `trialNotice` warns that the trial covers the SearchUnveil subscription only, and that the paid tools are billed during the trial too. "Free" must never read as "everything is free".
6. **Paying less:** fewer questions, fewer engines or fewer repeats. `engineOptions` lists every model the provider offers, grouped by AI product, with what it would cost for this plan, so that a choice of model shows its price. The cheapest priced model of each AI product is chosen by default; dearer models are optional. The dearest model is not the truest measure, since what matters is the answer people actually get.
7. **AI products a provider cannot ask:** `unavailableProducts` names the well-known AI products (ChatGPT, Claude, Gemini, Google AI Overviews and others) that the provider offers no tool for, and `unavailableNotice` tells the person plainly that they cannot be checked there.

The notices are written in all seven languages. In English, the notice before a check reads:

> This check uses paid tools on {provider}. Estimated cost: 90 calls, about $0.468. This fee is not included in your SearchUnveil subscription or 14-day free trial and is charged to your {provider} balance. Failed calls are not charged. Do you want to continue?

In Turkish:

> Bu kontrol, {provider} üzerindeki ücretli araçları kullanır. Tahmini maliyet: 90 çağrı, yaklaşık $0,468. Bu ücret SearchUnveil aboneliğinize ve 14 günlük ücretsiz deneme sürenize dahil değildir ve {provider} bakiyenizden kesilir. Başarısız çağrılar ücretlendirilmez. Devam etmek istiyor musunuz?

The provider's name is inserted as written, so the sentences never add a suffix to it. When people use their own accounts with AI services, the billing sentence says the fee is charged to their own account instead.

## How answers are read

Each answer has text and a list of sources. For each brand, an answer is one of:

| Result | Meaning |
| :--- | :--- |
| **Cited** | The site is among the answer's sources, at a given place (1 is the first source). |
| **Named, no link** | The text names the brand or writes its address, but the site is not a source. |
| **Not there** | Neither. |
| **No answer** | Every call for this question and engine failed. |

Matching rules (`match.ts`):

- **Sites:** compared by host without `www.`. Subdomains belong to the site (`shop.example.com` is example.com) and paths are ignored. Look-alikes do not match: `notexample.com` is not example.com. International addresses match in either form: `örnek.com` is `xn--rnek-4qa.com`.
- **Names:** whole words, ignoring case, accents and the Turkish dotted and dotless i, so "ÖRNEK SPOR", "Ornek Spor" and "örnek spor" are one name. A name written together ("OrnekSpor") or split at its capitals matches too. "Örnek" is not found in "Örnekler". In scripts written without spaces, such as Chinese, a name is found anywhere in the text.
- **Addresses written in the text** count as naming the brand, e-mail addresses included.

## The report

`visibilityReport` turns a finished check into:

- a **question × engine table** for each brand, with how many answers cited it, named it or left it out, and its best and average place among the sources;
- **totals** for each brand, and totals by engine and by question, such as "You appear in 4 of 6 answers; Rakip appears in 5";
- the **sites cited instead**: the sites other than the brands that the answers cite most, counted once per answer;
- **calls**: planned, made, answered, failed and cut off, with the reasons for failure.

Every report is marked **approximate**. Answers fetched by a program can differ from what people see in the apps, and they change from day to day. A rate describes only these questions, engines and repeats. It is never a market-wide visibility score.

Commentary, such as why a competitor appears and what to add, is not part of the engine. Where the check runs inside an AI assistant, the assistant can write it from the report at no extra cost.

## Saving checks and following them over time

A check is kept as a **record**, a versioned JSON format (`searchunveil.ai-visibility`, version 1). It holds the plan, the engines with the prices stated at the time, and every answer as it came. Reports, costs and trends are always worked out from the record and never stored in its place, so improved matching can read old checks again. `parseVisibilityRecord` reads a saved record back. It refuses a file whose plan is damaged, and leaves out damaged or repeated answers, saying which.

`visibilityTrend` follows each brand from check to check, such as week by week. It compares checks only on what they share: the questions every check asked, and the AI products (engine families) every check asked them of. Checks for another site, country or language than the latest one are left out and counted.

## Who asks the questions

Asking is the one part that changes from one platform to another, so it is a separate, swappable part: an `AnswerProvider`.

```ts
interface AnswerProvider {
  id: string;
  label: string; // who bills the calls, as people know it
  currency: string; // ISO 4217, such as USD
  engines: AnswerEngine[]; // what it can ask, each with a family, an optional model and a price
  chargesFailedCalls: boolean;
  ask(request: AnswerRequest, signal: AbortSignal): Promise<Answer>;
}
```

A provider could use a tool marketplace's paid tools, signed in with the marketplace's own login, or a person's own accounts with AI services. Everything else is the same everywhere: matching, cost, reports, records and trends.

The runner treats every provider as untrusted:

- A rejection becomes a failed answer.
- A malformed answer becomes a failed answer.
- Text is cut to 100,000 characters and sources to 100 entries.
- Calls run a few at a time (2 by default, at most 8). Every question is asked once before any is repeated.
- Failed calls are recorded and never retried by the runner, since retrying costs money and only the provider knows how it bills.
- Stopping lets no new call start and keeps every answer received so far.

## Where it runs

The check runs inside an AI assistant, through the [SearchUnveil skill](../apps/skill/skill/SKILL.md). The assistant is the provider: it asks the AI engines with the paid tools connected to it, such as a marketplace's tools, and the skill's command line does everything else.

1. `visibility estimate` prints the AI engines and models with their prices, the AI products that cannot be checked with these tools, and the full cost notice.
2. After the person agrees, `visibility calls --agreed` lists the calls, one JSON line each. The assistant makes each call and writes the answer to the same line.
3. `visibility report` checks the answers against the plan, reports who is cited or named, says what the check cost and saves the record. `visibility trend` compares saved records.

The skill never calls a paid tool itself, and its instructions forbid any call before the person agrees. [ADR 0010](adr/0010-skill-package.md) records the design.

## What it does not do yet

- **The marketplace's tools are not confirmed.** Which AI engines and models can be asked, at what price, for which country and language, is known only once the marketplace confirms its tools.
- **The web app has no screen for it.** The static and server builds keep their privacy promises: the static build sends nothing anywhere, and the server only downloads pages people ask it to review.

---

**SearchUnveil · An Atelance project**  
Return to the [architecture](ARCHITECTURE.md) or the [project overview](../README.md).
