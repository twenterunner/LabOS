# LabOS REV 1.0.94 — Master Planner decision cockpit, tiered AUTO-PLAN and provider-neutral project authority

## Master Planner

- Replaced repeated per-day month/week labels with a grouped calendar axis: **month / year → ISO calendar week + ISO week-year → weekday → zero-padded date → AM/PM**.
- Correct ISO week-year handling is used at year boundaries (for example, 1 Jan 2027 is **CW 53 · 2026**).
- Added a **Total days late** KPI.
- Reworked the top KPI row into actual filters for **All / On time / Late builds / Total days late / Commitment movement / Unplanned**. The previously informational yellow commitment-movement tile now performs a real filter action.
- Kept **Build commitment health** and made it the filtered result set driven by those tiles.
- Removed **Detailed bookings and estimate basis** from the Master Planner and removed the redundant Booking detail sub-navigation item.
- Normalised legacy potential-project probabilities stored as `70 / 45 / 60` to `0.70 / 0.45 / 0.60`. This fixes the 7000% display and, more importantly, prevents probability-weighted future capacity from being inflated by 100×.

## Tiered AUTO-PLAN

AUTO-PLAN is now a controlled three-tier decision engine rather than one planner attempt followed by a raw horizon error.

1. **Green · protected plan** — uses currently valid capability and does not move another project's existing plan.
2. **Yellow · controlled recovery** — may schedule calibration, maintenance or training, while retaining existing project plans.
3. **Red · portfolio trade-off** — may move other projects only if the quantified whole-lab objective improves. Any affected projects and date movements are shown before acceptance.

A candidate that cannot be completed safely is rejected. LabOS no longer presents a capacity search failure or a remote years-away date as a planning proposal. The live plan is not mutated while alternatives are evaluated.

The whole-lab objective explicitly penalises unplanned work, priority-weighted lateness, total lateness, worst-project lateness, commitment worsening and unnecessary booking churn. Red remains review-only and cannot be selected unless it beats the best protected/recovery result while genuinely moving an existing project.

AUTO-PLAN can also propose improvements beyond the selected plan, such as cross-training a second person for a single-point skill or protecting constrained equipment capacity.

## Escalation Mode

Added a separate **Escalation Mode** for exceptional project priority decisions.

- The selected project is planned first against all movable future capacity to obtain its earliest valid end-to-end schedule.
- The rest of the portfolio is then replanned using multiple deterministic orderings and the option with the smallest resulting whole-lab loss is selected.
- Completed/actual work remains protected and the final candidate must pass invariant, collision, readiness and qualification checks.
- Consequences to other projects are shown explicitly before the existing controlled plan-review/accept workflow.

## Project Teams, roles and approval rights

Expanded Engineering Team master data into a generic **Project Team authority model**:

- stable project-team ID;
- local / SSO / SCIM / external API identity source;
- optional external group key;
- project lead;
- stable principals with optional external principal IDs;
- one or more functional roles per principal;
- explicit approval rights per principal;
- optional enforcement of project-team authority rather than global demo-role fallback.

The same authority model is used by governed approval records and Control Plan approval. It is intentionally provider-neutral so a future identity connector can map enterprise principal/group IDs into the same records without redesigning the build workflow.

## Planning performance

The tier engine reuses the mutable production planner inside one clone per candidate instead of clone/commit work for every build. The slot finder retains the REV 1.0.93 blocker-jump logic. In the Chromium verification dataset, the complete five-strategy tier analysis completed in about **0.85 s**, and the three-strategy escalation analysis in about **0.74 s** on the test environment.

## Verification

REV 1.0.94 verification includes:

- JavaScript syntax for all runtime modules;
- grouped ISO calendar and 2026/2027 year-boundary test;
- Master Planner filter behavior and removal of Detailed bookings;
- probability normalisation regression;
- tiered AUTO-PLAN UI and rule enforcement;
- adversarial 900-day whole-lab closure proving that no remote forecast is fabricated and the live plan remains unchanged;
- Red-tier whole-lab-improvement gate;
- Escalation target-first planning plus full collision/readiness/invariant audit;
- project-team principal / role / approval-right enforcement;
- browser page-error check.

See `ROOT_CAUSE_PROOF_v1.0.94.md`, `VERIFICATION_v1.0.94.md`, and `VERIFICATION_BROWSER_v1.0.94.json`.
