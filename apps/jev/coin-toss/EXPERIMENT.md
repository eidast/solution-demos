# Coin Toss × Jev experiment protocol

## Question and scope

The current **v3** exercise compares Jev's three answer types—Choice, Noul, and Score—on the same future fair coin flip. It sends all three questions in **one Jev provider request per toss**. Only after all three answers pass validation does the server generate the independent coin outcome with Node.js `crypto.randomInt(2)`. One complete run has 100 requests and 100 coin results.

This is a comparison of response forms and uncertainty behavior, **not a way to predict an unknowable future random bit**. The outcome is absent from Jev's state. Accuracy near 50% is expected for a method with no information. A method should not be called superior on this exercise from one run's hit rate. Choice and Noul naturally represent categorical and yes/no questions; Score is intended for an ordered spectrum, so its two-level coin encoding is a diagnostic adaptation rather than a recommended production use. [TypeSafe primitives](https://docs.typesafe.ai/primitives).

## Three questions against one state

For each toss number, the request state says an independent fair software coin will be flipped **after** Jev answers. It includes the ordinal for audit, but no prior results, current counts, or future coin value. The questions are:

| Method | Question and raw answer | Derived prediction | Forecast used for Brier |
| --- | --- | --- | --- |
| Choice | Select `heads` or `tails`; returns `choice` and both probabilities. | Use Jev's selected label. | Returned probability for heads. |
| Noul | Is the next result heads? Returns `noul` from 0 to 1. | Above 0.5 = heads; below 0.5 = tails; exactly 0.5 = undecided. | The `noul` value. |
| Score | Place the outcome on a two-rung scale: tails = 0, heads = 1. Returns a position and probabilities for rungs 0 and 1. | Position above 0.5 = heads; below 0.5 = tails; exactly 0.5 = undecided. | Probability assigned to the heads rung (`1`). The position itself is shown separately. |

The OpenRouter request uses question types `choice`, `noul`, and `score`. Vercel's Evaluation HTTP API calls Noul `boolean` and returns `probability`; the server maps that response back to the same Noul comparison. Vercel support is covered by a simulated-provider test, while the live three-question response was checked through OpenRouter. [TypeSafe primitives](https://docs.typesafe.ai/primitives), [Vercel Evaluation](https://vercel.com/docs/ai-gateway/modalities/evaluation).

The choice criteria name heads and tails; Noul's true/false criteria mean heads/tails; Score's ordered array is `[tails, heads]`. All three answers are validated before flipping. Choice requires a valid selected label and two finite probabilities in `[0,1]` summing within 0.06 of one; Noul/Boolean requires a finite value in `[0,1]`; Score requires a finite position in `[0,1]` and two valid rung probabilities summing within 0.06 of one. An incomplete answer fails the entire toss and produces no coin result.

## Metrics and interpretation

For each method the app reports predicted heads, predicted tails, undecided calls, correct calls, and accuracy as `correct / non-undecided`. The coin winner uses **actual coin outcomes only**; 50–50 is a tie, and partial runs have no winner. The app also reports a mean Brier score for heads forecasts:

```text
mean Brier = mean((forecast P(heads) - actualHeads)^2)
actualHeads = 1 for heads, 0 for tails
```

Lower Brier is better. A constant forecast of 0.5 has an expected Brier of 0.25 against an independent fair coin. A highly confident heads forecast is penalized when the coin lands tails. Choice and Noul supply a direct heads probability; Score's heads-rung mass is used only for this diagnostic. A single run can rank methods by observed Brier, but it cannot establish a stable winner. Compare many complete runs with the same provider, model, prompt, code revision, and protocol; report method coverage and prediction bias alongside accuracy and Brier. If a method consistently predicts one side, its accuracy is driven by the coin's realized mix, not foresight.

The three questions share one state and provider call, so they are paired on the same eventual coin outcome. Different wording and answer shapes are part of the comparison; they are not a controlled test of primitive type alone. A stronger study would use a labeled task where relevant evidence is available, predefine metrics, repeat runs, and vary one question design choice at a time. [TypeSafe guidance on multiple questions](https://docs.typesafe.ai/primitives).

## Historical findings and protocol boundaries

**V1—Jev choice counted as coin:** On September 23, 2026 UTC, three complete local OpenRouter `typesafe/jev-1.13` runs each returned heads in all 100 `choice` answers: 300/300 heads choices, no failed calls. Returned heads probabilities ranged from 0.76 to 0.90 (mean about 0.806). The identical sequences did not support the original variability hypothesis. V1 generated no independent coin; these were model decisions, not random tosses. The local ignored log IDs start `84266133`, `b0b4ccb7`, and `8403eb77`. A separate one-call log was a development check. The logs remain `schemaVersion: 1` and do not identify the cause of Jev's heads preference.

**V2—one Choice prediction, independent coin:** A complete local OpenRouter run (`aa4b349b…`) had 50 coin heads, 50 coin tails, and a tie; Jev predicted heads on all 100 calls and matched 50. There were 53 changes between consecutive coin outcomes and no failed calls. Jev's heads probabilities ranged from 0.84 to 0.90 (mean about 0.866). Its 102-event ignored log has `schemaVersion: 2`. One 50–50 run does not prove long-run fairness or Jev accuracy beyond that run.

**V3—three paired primitives:** This protocol keeps the independent coin, asks three Jev questions per provider call, and records separate method predictions and forecast scores. Do not pool v1, v2, and v3 prediction rates or winners as if their prompts and measurements were identical. The old log files are retained unchanged.

### First live v3 observation

One complete local OpenRouter `typesafe/jev-1.13` v3 run on September 23, 2026 UTC (`052350ac…`) made 100 successful three-question requests with no failed calls. The independent coin yielded **51 heads and 49 tails**, so heads won. The coin changed side 42 times between consecutive tosses. The 102-event ignored local log has `schemaVersion: 3`.

| Method | Predicted heads / tails / undecided | Correct / covered | Mean heads forecast | Mean Brier |
| --- | ---: | ---: | ---: | ---: |
| Choice | 100 / 0 / 0 | 51 / 100 | 0.870 | 0.379 |
| Noul | 13 / 49 / 38 | 31 / 62 | 0.496 | 0.250 |
| Score | 100 / 0 / 0 | 51 / 100 | 0.700 | 0.286 |

Noul's 0.250 Brier is approximately the constant-0.5 reference, not evidence of a predictive advantage. Its 38 abstentions at exactly 0.5 reduce the coverage of its binary accuracy measure. Choice and Score's heads-leaning forecasts were more confident and had higher Brier loss on this independent coin sequence. These results show how the answer forms express uncertainty under this wording; **one run cannot establish a generally best primitive**, and Score remains a less natural fit for a binary categorical event.

## API and local logs

| Route | Behavior |
| --- | --- |
| `GET /api/coin-toss/status` | Provider label and whether a key is configured; does not verify credits or access. |
| `POST /api/coin-toss/runs` with `{}` | Creates an in-memory v3 run and a local log. |
| `POST /api/coin-toss/runs/:id/toss` with `{}` | Makes one provider call containing the three questions, validates all answers, flips one fair software coin, commits the paired results, and returns the full run. Concurrent requests for the same run are rejected. |
| `GET /api/coin-toss/runs/:id` | Reads the current in-memory run after a lost POST response. |

Each run writes Git-ignored `apps/jev/coin-toss/logs/<run-id>.jsonl`. The directory has mode `0700`, and files have mode `0600`. Every new event has `schemaVersion: 3`, UTC `at`, and `runId`:

| Event | Recorded fields |
| --- | --- |
| `run_started` | Provider, model, target 100, protocol `jev-three-primitives-crypto-coin-v3`, coin source. |
| `toss_completed` | Number, actual outcome, each method's raw normalized signal, derived prediction, match, Brier contribution, provider duration, exact bounded state and questions. |
| `toss_failed` | Number, duration, bounded request, controlled error category; no coin result. |
| `run_completed` | Actual coin counts and winner; per-method heads/tails/undecided/correct counts and mean Brier. |

A failed call does not flip the coin, and retrying can add a paid provider call. The browser reads run state after a lost response before retrying. Pausing stops future calls after the current one. New Run abandons the UI link to the old run. Server restart clears in-memory runs but preserves logs; there is no automatic log replay or deletion. Logs exclude API keys, Authorization headers, raw provider bodies, usage/billing metadata, and participant data. The local server binds to loopback by default; see [security](../../../SECURITY.md) and the [integration contract](../../../docs/INTEGRATIONS.md).

## Acceptance checks

- A complete v3 run shows 100 numbered rows with one coin outcome and three method answers each; actual heads plus tails equals 100. Each method's heads, tails, and undecided counts also sum to 100.
- The test provider verifies one three-question request per toss, strict answer validation, failure without a flip, provider-specific Boolean mapping, and summary calculations. A live provider response is needed to confirm the selected provider supports the three-question contract.
- The coin is a software simulation, not a physical coin. The Vercel model ID here does not pin a numbered revision; provider behavior can change independently of the coin generator.

## Monorepo migration

This demo moved into `apps/jev/coin-toss/`. Existing local reports or logs move with the directory and remain ignored by Git. The move changes filesystem paths only: saved schemas, permissions, retention, provider IDs, question wording, protocol, and metric definitions are unchanged. Existing HTTP routes remain available. See [the migration notes](../../../docs/MONOREPO.md).
