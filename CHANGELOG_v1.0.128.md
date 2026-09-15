# LabOS REV 1.0.128 — Change Log

## Business Unit KPI allocation migration repair

- Reproduced the deployed-upgrade defect where an existing browser database from a pre-Business-Unit release mapped every legacy `Power Tools` demo assignment to `Professional Power Tools`.
- Added an in-place REV 1.0.128 demo migration that recognizes only the known 24 `P26-1001`–`P26-1024` seeded examples when they are still collapsed to the legacy value.
- Project Teams are remapped to the controlled BU master records, and the known demo requests receive matching historical BU snapshots.
- No reset is required; user-created/real portfolios and already-diverse demo data are preserved.
- Default 13-week KPI verification now shows multiple BUs in Twente, Stuttgart and Detroit.


**Date:** 15 September 2026  
**Base:** REV 1.0.126  
**Schema:** 35 (unchanged)

## Controlled Business Unit master data
- Added **Configuration → Business Units** as governed organization master data.
- Administrators can create, rename, activate and deactivate Business Units. Deactivation is blocked while active Project Teams still reference the unit.
- Project Team setup now uses a controlled Business Unit dropdown instead of a free-format text field.
- Project Teams store a stable `businessUnitId`; the readable name is synchronized from the master record.
- Existing free-text Business Unit values are migrated automatically into Business Unit master records without requiring a data reset.
- Requests receive a Business Unit ID/name snapshot when created (and when their Project Team is deliberately changed), preserving historical selected-period KPI allocation if a Project Team later moves to another Business Unit.
- KPI Business Unit allocation resolves the request snapshot first, then the Project Team master as a compatibility fallback.
- Fresh demo data now spans five configured Business Units: **Professional Power Tools, Consumer & DIY, Outdoor & Garden, Industrial Solutions, Battery & Energy Systems**.
- Fresh demo request distribution: **5 / 5 / 5 / 5 / 4 requests** across those five units.


## Manual replan vs AUTO PLAN semantics
- Fixed a policy defect where the Manual Planner persisted its validation constraint as a permanent optimizer lock.
- Manual replans are now **re-optimizable by default**: the chosen date becomes the live plan and the reason stays in history, but AUTO PLAN may later propose a better slot.
- Added an explicit **Protect this slot from AUTO PLAN** option for true hard operational commitments. The full Manual Planner has the same protection control.
- Reason and protection are deliberately separate: the reason explains *why* the change happened; protection determines *whether* the optimizer may revisit it.
- Existing implicit REV 1.0.125 manual constraints are migrated to soft semantics without changing the current live dates or deleting their history.
- AUTO PLAN can now classify release of an active soft manual delay as a verified optimization when no critical delivery KPI worsens, even when the programme's final forecast remains unchanged.
- Optimization review cards show the affected task, current → proposed date, days recovered and the original human reason before acceptance.

## KPI period model
- Reworked **Lab Performance / KPI** so one selected reporting period drives the headline KPI set.
- Period choices: last 13 weeks, last 12 calendar months, last 8 calendar quarters, selected week, selected month, or custom date range.
- **Internal network utilization** now uses transfer/acceptance timestamps inside the selected period instead of lifetime totals.
- Capacity utilization is calculated from active-lab booking hours inside the selected period divided by configured available staff/equipment hours for that same period.
- Delivery, quality, readiness, cost and 5S headline metrics are restricted to evidence/events inside the selected period.
- Added an explicit KPI definition fold showing the date basis used for each metric.

## Business-unit allocation
- Added a selected-period **business-unit allocation** view on the KPI tab.
- Toggle the pie between **Time spent** and **Direct resource cost**.
- Time is summed from active-lab booking hours.
- Direct resource cost uses the same booking hours multiplied by labour role rates plus equipment hourly rates.
- Business-unit allocation resolves the request Business Unit snapshot first and the controlled Project Team/Business Unit master only as a compatibility fallback.
- Fresh demo data spans five controlled Business Units so the chart is immediately testable without altering existing persisted assignments.

## Manual replanning transaction defect
- Fixed the error: **“Move not applied: The move transaction did not reproduce its prevalidated target.”**
- Root cause: `manualPlan()` correctly rebuilt the schedule but regenerated booking IDs. The commit transaction then looked for the obsolete source booking ID after applying the validated next state.
- REV 1.0.128 commits and verifies a move by the stable canonical task identity (`requestId + stepId`) and then verifies the prevalidated date/equipment/person assignment.
- The source-state fingerprint and final whole-plan integrity checks remain in place, so stale proposals are still rejected safely.

## Replan reason governance
- Every **manual in-lane replan** now requires a reason category and free-text explanation before applying Green or Yellow alternatives.
- The full **Manual Planner** also requires a reason category and explanation before Save.
- Accepted **AUTO-PLAN / portfolio replan proposals** retain the existing mandatory decision note and now also capture a replan reason category.
- Task-level replans are stored separately from commitment-date movements in `planningReplanHistory`, including task, before/after slot/resources, reason, actor and timestamp.
- If a replan also moves the committed delivery date, the same causal event is linked into commitment history rather than losing the original operational reason.
- Build Planning now shows **Task Replan History** alongside immutable commitment history.
- KPI includes **Replan causes · selected period**, including task moves that did not change the delivery commitment.
- **Commitment & replan history** CSV now exports both task replans and committed-date replans.

## Compatibility
- No IndexedDB schema change.
- Existing REV 1.0.126 user data migrates without reset.
- Existing `commitmentHistory`, audit history, network transfer rationales and scenario rationales are retained.
