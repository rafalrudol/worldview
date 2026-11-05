# Worldview — public results atlas

Static bilingual PL/EN site, built from reviewed, committed public JSON. Plain Node.js static generation (similar output to Astro, with zero npm dependencies). No client JavaScript, network APIs, analytics, private harness imports or build-time model calls.

## Local build

Requires Node 22+. Run `npm ci --ignore-scripts`, then `npm run check`. Output: `dist/`. To select a reviewed bundle use `RESULTS_FILE=data/reviewed.json npm run build`. Only the selected bundle is copied publicly, not the whole input directory. Set `SITE_URL` to the final HTTPS preview origin for absolute OG metadata.

The default fixture is hand-authored synthetic data: two questions, one fictional model, two historical observations, incomplete attempts including an error. It is NOT the runner's mock export, a real benchmark, or evidence about any actual model. Null metrics are not zero. Synthetic leaderboards are forbidden. The second question intentionally exercises the no-results state.

## Export contract 1.0.0

`schema/public-1.0.0.json` is the public JSON Schema (2020-12). `src/validate.mjs` validates its pinned keyword subset plus semantic references, codebook scopes, costs and ranking eligibility. This is independent of generic harness manifest schema 2 and internal summary schema 1. Do not pass either private format directly. No direct-emission adapter exists in this repository or in the light Worldview runner.

Question records retain `{id,topic,pl,en,refusalProne}`. The runner's current task version is `worldview-v1`. Runs reference a model, question, task version, language-specific `taskSha256: {pl,en}` and redacted source hash, version/date and judge run. Question IDs identify immutable wording: changing either prompt requires a new question ID, so older runs are never shown under a rewritten prompt. Independent `samples.pl` / `samples.en` hold up to 20 attempts; repetitions are not translation pairs. `clusters` are scoped to `(questionId, judgeRunId)`, shared across models/languages only within that scope. Refusal and hedging taxonomies stay separate. Unknown temperatures, provider/cache reports, token usage, costs, metrics, uncertainty and drift are null, not guessed.

Each non-null metric requires its method, denominator and provenance. Its interval may be null on descriptive run pages, never on rankings. Optional leaderboard aggregates must be computed and reviewed upstream: common complete question coverage, shared task/codebook per question, one model version, explicit intervals and tie groups. This site renders the reviewed tie groups; it does not invent significance or compute bootstrap statistics. Methodological correctness, route equality and human judgement still require review.

Unjudged runs use `judgeRunId: null`, `judgeProvenance: null`, no clusters, null annotation fields and null metrics. `modelVersion: null` means an unverified/unknown version; do not substitute the requested route as a verified version. Each attempt retains `startedAt` (null only for synthetic fixtures). Non-null run estimates use the total annotated attempt count across PL+EN as denominator; board estimates use the number of equally weighted questions. The 0–1 estimate type covers only consistency/evasiveness/divergence/drift, not future cost or length metrics. Only complete `stop`/`end_turn` textual answers may be annotated. Semantic checks supplement the schema: unique IDs/repetitions, resolved references, shared codebooks, classifier exclusions, error/truncation consistency, complete JSD samples, comparable ranking coverage/versions and intervals, cost coverage, and unique board metrics.

## Mandatory publication boundary

Before committing ANY real data, a human must review the actual export for privacy, provider terms, IP rights and consent. The `publication` object records that attestation; setting strings does not perform the review. No raw endpoints, credentials, billing identifiers, internal manifests, private context, usage.raw or provider traces are accepted as fields. Strings can still contain sensitive material: unknown-field rejection and HTML escaping are not a privacy scanner. Keep raw evidence private. If using human/private prompts obtain explicit consent before collection and publication. Never commit data first and redact later: Git history and preview caches also retain it.

Immutable run IDs and editorial corrections preserve historical observations. Do not silently rewrite unfavourable results. Human reviewers should document question translation equivalence, route/cache exclusions, judge/language bias and uncertainty. Basal is a classifier, not a generative respondent; Bielik/PLLuM are not claimed as tested. Code/demo are MIT; actual output rights must be cleared separately before applying a public data license.

## Editorial content and sharing

Rafał can edit `content/changelog.pl.md` and `.en.md`; initial technical notes are explicitly not attributed to him. Markdown supports headings, paragraphs and lists, escaped by default; raw HTML and Markdown images/links are literal text. Static 1200×630 PNG social cards are generated for every question/model in each language, including visible synthetic warnings. The original pixel alphabet transliterates Polish accents; full Unicode remains in HTML metadata and alt text. No external font license or image service is needed. Social crawlers need an externally reachable HTTPS preview with `SITE_URL` set; bot-visible previews are not yet verified without a host.

## Hosting and deployment safety

Cloudflare Pages: build `npm run check`, output `dist`, Node 22. Netlify: `netlify.toml` supplies the same settings. GitHub Action only validates/builds and uploads an artifact; it does NOT provision hosting, publish Pages, or deploy production. Changes under `data/**` trigger builds. Actions are commit-pinned; fork PRs need no secrets. Choose one reviewed bundle in the host environment (default is synthetic).

Only a Netlify draft or Cloudflare branch preview is authorized. For a Netlify draft, use the authenticated CLI/API without `--prod`, obtain its exact origin, rebuild with `SITE_URL`, then upload to that same draft. Cloudflare preview requires an existing authorized account/project; do not create shared infrastructure or alter production. Connect a provider account/project before deployment; repository push alone is not a deployment. No production/custom domain or merge without Rafał's approval. All pages and headers are noindex. Removing that restriction is a separate publication decision.

## Verification and licenses

`npm run check` runs the static build, bilingual-route/link/anchor and PNG decoding checks, history and empty-data assertions, XSS/unknown-field/consent failures, incomplete-JSD and synthetic-ranking rejection, interval/common-coverage constraints, and workflow safety checks. Render/accessibility checks are performed separately in Chromium; automated checks do not establish full WCAG compliance.

See `DEPENDENCIES.md` for the runtime/toolchain audit. Site bundle: zero JS/npm dependencies, system fonts only. Node is a build tool, not shipped to readers.

Tracking: TT-4911 in Labs 2. Runner ownership remains in `thinking-typewriters/usage` under `model-benchmark/worldview/`; this repository does not change that worker's code.
