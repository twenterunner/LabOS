# LabOS REV 1.0.102 changelog

## Planning timeline
- Removed AM/PM from the active universal timeline and manual planning presentation.
- Manual solver constraints now use a complete working day (08:00–17:00) instead of separate AM/PM windows.
- Replaced earlier/later arrow navigation with touch swipe and mouse click-drag panning.
- Retained − / Fit / + zoom.

## Network Recovery
- Recovery eligibility is now `active AND (unplanned OR incomplete canonical plan OR late complete plan)`.
- On-time complete builds no longer appear as recovery candidates.
- Incomplete/unplanned builds no longer display a stale `forecastDate` as though it were a valid home forecast.

## Current plan vs replan-now
- The comparison modal now shows the current accepted execution plan separately.
- Site comparison rows are explicitly labelled as fresh **REPLAN NOW** results.
- This resolves the misleading case where the recovery list showed 17 Sep while the home-lab comparison showed 29 Sep: those values came from different calculations but were previously given the same “home forecast” wording.

## Elective sister-lab routing
- Any active build can open the same sister-lab comparison, whether or not recovery is required.
- Workspace planning includes a Lab Network Execution action.
- Planning includes an Optional Network Routing selector for active network projects.
- Accepted transfers are recorded as `recovery` or `elective`.
- KPI adds Recovery moves and Elective routing. Elective routing does not claim avoided external cost.

## Compatibility
- Schema remains 35.
- Existing REV 1.0.101 data is retained.
- The REV 1.0.101 startup repair including `enablePlanningDragV1065` remains present.
