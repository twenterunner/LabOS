# LabOS REV 1.0.125 — Change Log

**Date:** 15 September 2026  
**Base:** REV 1.0.124  
**Schema:** 35 (unchanged)

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
- Business unit is sourced from Configuration → Project Teams.
- Fresh demo data now contains multiple business units so the chart can be exercised without overwriting persisted user master data.

## Manual replanning transaction defect
- Fixed the error: **“Move not applied: The move transaction did not reproduce its prevalidated target.”**
- Root cause: `manualPlan()` correctly rebuilt the schedule but regenerated booking IDs. The commit transaction then looked for the obsolete source booking ID after applying the validated next state.
- REV 1.0.125 commits and verifies a move by the stable canonical task identity (`requestId + stepId`) and then verifies the prevalidated date/equipment/person assignment.
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
- Existing REV 1.0.124 user data migrates without reset.
- Existing `commitmentHistory`, audit history, network transfer rationales and scenario rationales are retained.
