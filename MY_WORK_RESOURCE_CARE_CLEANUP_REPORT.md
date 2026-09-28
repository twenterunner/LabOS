# LabOS My Work Resource-Care Cleanup — TEST-5

Product revision remains `1.0.185`.

Visible build identity: `REV 1.0.185 · MY WORK RESOURCE CARE CLEANUP TEST-5`.

## Problem reproduced

The resource-care workflow could leave more than one active readiness reservation/action for the same controlled resource when the underlying due-date key changed or a later reservation replaced an older one. My Work also allowed scheduled care work from far into the future to remain actionable indefinitely. Legacy ownership reconciliation selected a role owner globally rather than from the resource's execution lab, and care-card titles did not consistently expose the exact equipment asset.

## Corrections

- Resource-care ownership is now resolved by lab first.
- The three demo internal labs have distinct Lab Manager and Metrology owners and realistic site-local staff names.
- Calibration cards identify equipment by equipment name and asset ID; training cards identify the person and competency.
- My Work only surfaces scheduled resource-care obligations within the actionable 21-day horizon (overdue/current items remain actionable).
- My Work is scoped to the active lab for resource-care obligations.
- Only one active scheduled reservation can exist for a given care type/resource/skill. Legacy duplicates are reconciled; superseded care actions are removed from the active action queue.
- Rescheduling the same logical care obligation with a changed due-date/item key supersedes the previous reservation rather than creating another active card.
- A scheduled care booking and its governed action cannot both render as separate My Work cards.
- Retired demo product-family naming and identifiers were removed from packaged source/demo data. A one-time compatibility scrub also normalises that naming in previously persisted demo state and saves the corrected state.

## Focused regression evidence

`qa/mywork-resource-care-cleanup-tests.js`: **7/7 PASS**

Coverage includes:

1. distinct site-local Lab Manager / Metrology ownership for all three internal labs;
2. local owner assignment in resource-care forecasting;
3. duplicate active-care reconciliation;
4. exact equipment + lab + local owner in My Work;
5. replacement scheduling without active-card accumulation;
6. 21-day My Work action horizon;
7. package/persisted-state removal of retired demo naming.

Additional retained regression suites executed successfully:

- Prototype Create Draft: 3/3 PASS
- Scenario Planner / external-lab restore: 8/8 PASS
- Future Projects / KPI: 6/6 PASS
- Future work-package / Scenario responsiveness: 7/7 PASS
- Copy previous Prototype / Validation scope: 4/4 PASS
- Planning swim-lane layout: 6/6 PASS
- Stage-3 My Work network inbox: 4/4 PASS

The old Stage-4 build-identification test is intentionally not applicable because it asserts the historical `STAGE4-GITHUB-TEST-1` build ID. The Stage-4 real-state test also requires an external backup JSON fixture that is not present in this package/runtime. No production acceptance claim is made from those two tests.

## Browser acceptance to perform

Switch between NL, DE and US as Lab Manager and verify that resource-care cards show the active lab's local owner and exact resource. Reschedule the same maintenance/calibration item twice and verify only the latest active obligation appears. Also reload the page to confirm the compatibility reconciliation persists.


## TEST-6 deployment hardening

TEST-6 adds immutable build-specific runtime filenames, a build-aware manifest and updater, and the unique `deploy-test6.html` publication check. This specifically addresses same-product-revision GitHub Pages/browser cache ambiguity seen with TEST-4.
