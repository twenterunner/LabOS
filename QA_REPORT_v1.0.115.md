# LabOS REV 1.0.115 — targeted controls-stage regression report

## Trigger

REV 1.0.113 could still leave `P26-1004 · Random Orbital Sander · noise/vibration experiment` at **Reuse approved controls; review build-specific changes** with a yellow **Continue** button that did not progress.

## Root cause

Two model/UI inconsistencies were found.

1. The guided workflow required Product Safety approval during the Controls stage, but `ensureApprovalRecords()` did not instantiate the Product Safety approval until **BUILD READINESS REVIEW**. At `PROCESS DEFINITION`, the workflow therefore had `safetyReady = false` but no pending approval record to action. The UI fell through to a generic scroll-style Continue button.
2. Older/demo Control Plan characteristics can contain the controlled gauge in `gauge`, while the technical readiness predicate only accepted `equipment`. This allowed a historical/seeded Control Plan to appear Approved yet still fail the technical Controls readiness calculation.

## Corrections

- Product Safety approval is now instantiated from **PROCESS DEFINITION**, the point where the Controls gate becomes actionable.
- Pending Product Safety approval is preserved through Controls and Planning. Build Readiness approval remains deferred until **BUILD READINESS REVIEW**.
- `v1077ControlsTechnicalReady()` explicitly refreshes approval records before evaluating the gate, so existing schema-35 IndexedDB states self-repair when reopened.
- Product Safety action is sequenced after the required Control Plan is approved; it no longer jumps ahead of an incomplete CP.
- Controlled characteristic readiness accepts either the current `equipment` field or the legacy/seeded `gauge` field as the defined measurement resource.
- Once Product Safety is approved and the CP is technically complete, the normal **Confirm controls & continue →** action becomes eligible.

## Dynamic regression results

A Node execution harness loaded the real REV 1.0.115 core, demo dataset and services and exercised the actual data-model functions.

**16 / 16 targeted checks passed**, including:

- schema remains 35;
- exact `P26-1004` C-sample / Product Safety / PROCESS DEFINITION state;
- Product Safety approval created at Controls;
- no duplicate approvals after repeated reconciliation;
- existing schema-35 state with a missing Product Safety record self-repairs;
- Product Safety not created before PROCESS DEFINITION;
- Product Safety created from PROCESS DEFINITION onward;
- non-safety A-sample remains free of unnecessary Product Safety approval;
- B- and C-sample Product Safety cases both receive the approval gate;
- Emma Bos has the governed Product Safety approval authority for `P26-1004`;
- an Approved Product Safety record remains Approved at PROCESS DEFINITION;
- Build Readiness pending approval remains deferred before the readiness gate;
- the exact screenshot state becomes technically Controls-ready after Product Safety approval;
- controls evaluation refreshes approval state before checking readiness;
- Product Safety is not offered before a required CP is approved;
- the direct Product Safety action is wired to the existing controlled approval handler.

In addition, all **12 seeded B/C-sample Control Plans** were checked after the legacy `gauge` compatibility correction; all 12 are definition-ready under the current predicate.

## Static/package verification

- all runtime JavaScript passes `node --check`;
- all runtime references in `index.html` resolve to REV 1.0.115 assets;
- no IndexedDB schema change;
- package ZIP integrity verified after creation.

## Browser qualification boundary

Chromium is installed in the execution environment, but navigation to both local HTTP and `file://` application URLs is blocked by an administrator browser policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore this report does **not** claim a fresh automated browser-click qualification. The defect was reproduced and closed at the actual core/service/data-model code paths used by the UI, plus source wiring checks for the direct approval and confirmation actions.
