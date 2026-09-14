# LabOS REV 1.0.113 — changelog

## Controls-stage dead-end fix

REV 1.0.112 could show the Control Plan as approved while a Product Safety approval was still pending. The later Control Plan-specific cockpit override returned immediately with **Control Plan approved** and therefore hid the pending Product Safety approval that the base workflow knew about. The yellow Next Action consequently fell back to a generic **Continue · … ↓** scroll action, which did not resolve the gate and appeared to do nothing.

REV 1.0.113 makes Product Safety a first-class controls-stage gate after Control Plan approval:

- if the active Product Safety Representative is authorised, both SIGN-OFF and NEXT ACTION expose **Approve Product Safety** directly;
- otherwise the user gets a direct **Switch to <assigned Product Safety Representative>** action;
- the controls-stage blocker model now names Product Safety approval explicitly instead of falling back to a generic scroll action;
- after Product Safety approval, the existing **Confirm controls & continue** step becomes available once all controlled inputs are ready;
- a historical "approval reset after edit" warning is no longer worded as an outstanding fresh-signoff requirement after that edited Control Plan revision has already been re-approved.

## Preserved fixes

The REV 1.0.112 route-loop, direct manual-replan and per-build deadline-line corrections remain in place, as do the active-lab planning KPI scoping, Scenario Lab baseline rules and transfer-integrity protections from earlier releases.

## Data compatibility

IndexedDB schema remains **35**. No reset is required.
