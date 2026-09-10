# LabOS REV 1.0.74

Baseline: static WEB / GitHub Pages REV 1.0.73.

## Requested changes

- Recent engineering requests on **My Work** use responsive cards: 4 columns on very wide screens, 3 on normal desktop, 2 on smaller desktop/tablet and 1 on narrow screens.
- **Immediate workload & bottlenecks** now shows **Last / Current / Next** together. The remaining selector changes the period size between Week and Month. Each period shows people load, equipment load, resource-assurance hours and the strongest current bottlenecks.
- Added a visible **Calendar settings** action directly on the Planning page. It controls **Allow prototype builds on weekends**; the same setting remains available under Administrator Configuration → Planning calendar.
- Build-request **Build plan swimlanes** are now a fold-out. Expansion state is retained while the workspace re-renders or the plan zoom changes.
- Removed the 5S image/reference gallery and 5S visual-example entry points from the operational UI.
- Planning-event review is reduced to the decision that matters: **Committed-date movements included in this decision**, plus the editable decision rationale and Accept / Reject controls. The duplicate forecast-impact and resource/timing sections are not rendered for planning events.

## Planning drag defect correction

The green move path contained an ID mismatch introduced in REV 1.0.71: a prevalidated green proposal was stored under a newly generated key, but the displayed option inherited the older V1070 ID. As a result, a highlighted green slot could be visible while the click/drop handler could not retrieve its exact proposal.

REV 1.0.74 normalizes every displayed move option to one key that resolves to the exact prevalidated proposal. The cache now stores and restores the proposal map as well as the visible options.

Move commit is also transactional:

1. validate the exact selected target against the current planning fingerprint;
2. apply the already-simulated next state;
3. verify that the selected booking reached the exact displayed start/equipment/person;
4. persist the state before rendering;
5. clear all move overlays and caches;
6. redraw the plan.

A redraw problem can no longer roll back an already saved planning transaction. A save failure does roll the transaction back.

## Verification

See `VERIFICATION_v1.0.74.md` and `verification-v174.py`.
