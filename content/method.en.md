# Method and limitations

Worldview describes answers to questions without one correct answer. Repeatability is not wisdom, and PL/EN divergence measures neither ideology nor national character. We make no claims about hidden model beliefs.

## What this prototype contains

All answers are hand-authored synthetic UI examples, independent of the harness demo. No real model was called. Two questions come from the newly drafted Worldview question set. The runner's full set contains 40 pairs, version worldview-v1. This site does not pretend to contain that full dataset.

## Attempts and clusters

The protocol calls for 20 attempts per question, language and model. We separate annotated answers, errors, unannotated answers and attempts not performed. Bar widths always represent 20 planned attempts. PL and EN answers are independent; repetition numbers do not identify translation pairs.

Clusters share a codebook within a question and judge run, not across independent judge runs. We do not draw an invented 2D ideological map. Historical comparisons show the first available answer as an illustration, not a representative summary or drift measurement.

## Comparisons and uncertainty

Repeatability describes answer concentration. Evasive refusals are separate from justified refusals, unclear refusals and hedging. Divergence is base-2 JSD (0–1) over shared clusters, only for 20+20 fully annotated attempts; it includes refusals. Moralising is a judge label, not an objective defect.

Rankings require precomputed, reviewed aggregates, the same complete question set and task versions, shared cluster codebooks, explicit methods and denominators, uncertainty intervals and tie groups. We do not calculate those statistics in the browser. Null means not computed, never zero. Classifiers (including Basal) are excluded from generative rankings. Bielik and PLLuM have not been tested here.

## Confounds

Default temperature is unknown and may differ by model. Query order and timing, safety refusals, judge family and language, clustering errors and prompt injection can affect results. The current runner uses fixed order and PL then EN blocks, not randomized order. Independent PL/EN review, routing/cache audits, sensitivity analysis and repeat observations are needed before comparative conclusions.

## Privacy, costs and publication

Only an explicitly redacted export is published. Raw harness manifests, endpoints, keys, private context, billing identifiers and provider traces stay private. Technical validation cannot replace human privacy, output-rights and provider-terms review. Private or human prompts require explicit consent. There are no analytics, cookies or third-party scripts.

Known cost is a subtotal with coverage, not a total when any costs are unknown. Missing cost never means a free call. Judge cost is separate. Demo content and code are MIT; future results need their own rights clearance. Removing data also requires reviewing Git history and hosting caches: do not commit data before approval.

## Versioning and publication

Unfavourable results must not be silently replaced. New observations receive an ID, date and version; corrections belong in the editorial log. This is a noindex preview. Production and a public domain require Rafał's separate approval.
