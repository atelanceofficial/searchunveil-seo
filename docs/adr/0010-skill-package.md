# 0010. A skill package for AI assistants

**Status:** Proposed · **Date:** 2026-11-25 · **Extends:** [0009](0009-ai-visibility-check.md)

## Context

SearchUnveil is to be sold on a skill marketplace as a skill: instructions and files that people install into AI assistants such as Claude Code or Cursor, not as a web app. The assistant reads `SKILL.md`, runs what it says, and talks with the person.

The marketplace accepts text files only: at most 5 MB zipped, 200 files besides `SKILL.md`, and 6 million characters. Buyers' computers cannot be assumed to have anything installed beyond Node.js.

The page review needs an HTML parser that follows the HTML standard: a stray tag in the `<head>` ends it early, and the review reports what that pushes out. The engine's tests use jsdom, which is several megabytes with its dependencies.

The AI visibility check asks AI engines through paid tools. In an assistant, those tools are the assistant's own, such as the marketplace's MCP tools, signed in with the person's account.

## Decision

- **One command line, bundled.** `apps/skill` holds `SKILL.md`, a reference and a command line. Vite bundles the command line with the engine, the interface words and parse5 into one JavaScript file for Node.js 20 or later. It is not minified, so buyers and marketplace reviews can read what runs. Invisible characters are written as escapes in it.
- **parse5 and a small DOM instead of jsdom.** parse5 is the parser inside jsdom. A small DOM over its tree gives the review exactly what it reads. Tests compare its snapshots and reviews with jsdom's, on fixed pages and on 300 generated ones. Unsupported selectors throw rather than answer wrongly. parse5 stays a build-time dependency at the version already in the lockfile, so buyers install nothing.
- **The assistant asks; the skill never pays.** The command line never calls a paid tool. `visibility estimate` prints the engines with their prices and the full cost notice. `SKILL.md` forbids any paid call before the person agrees. `visibility calls` lists the calls only with `--agreed`. The assistant writes each answer to a line, and `visibility report` checks every line against the plan. Commentary on the results is the assistant's own, at no extra cost.
- **The build checks the marketplace's limits.** `npm run build:skill` fails if the package breaks a limit or holds invisible characters, and it reads the ZIP back with the engine's own reader. CI builds the package and runs it from the ZIP.

## Consequences

- The same rules, words and results as the web app, in seven languages, from any assistant that can run Node.js: about 1 MB of JavaScript, 275 KB zipped.
- Files stay on the person's computer. A page given by its address is fetched from its own site with the server's limits.
- The cost gate in an assistant rests on instructions and on the `--agreed` step. The command line cannot see whether the person said yes, so the notice and the instructions must stay plain, and the tests keep them whole.
- A new version of parse5 needs the comparison tests to pass again, like any dependency under [ADR 0004](0004-dependency-and-supply-chain-policy.md).

---

Return to the [decision records](README.md).
