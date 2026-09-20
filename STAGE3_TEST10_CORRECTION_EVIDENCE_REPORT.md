# LabOS REV 1.0.185 — Stage 3 Test-10 Correction & Evidence Report

Controlled checkpoint: **STAGE3-GITHUB-TEST-10**  
Visible build: **REV 1.0.185 · S3 TEST-10**  
Stage status: **GitHub manual-test checkpoint; NOT a Stage-3 RC**

## Scope

Test-10 remains inside the controlled Stage-1 / Stage-2 / Stage-3 architecture. Stage 4 has not started.

The Test-10 correction closes the Test-9 browser findings without adding another planner, network scheduler, UI-only transfer authority, or direct persistence bypass.

## Corrections preserved in this checkpoint

### Stage 1 — canonical identity guard

The fresh Test-9 persisted-state reproduction showed that the current canonical repair resolves all live Validation bookings in that export. No additional identity migration was invented for a failure that was not reproducible. Existing deterministic legacy Validation identity repair remains protected by the Validation-identity and real-state suites.

### Stage 2 — progressive bounded Validation manual search

`findNextManualPlanningOptionsV9` remains a bounded continuation of the same Stage-2 `PlanningEngine` / `manualConstraint` authority. Test-10 adds an incremental orchestration contract:

- reports checked-day progress while the bounded search is running;
- publishes Green/Yellow options immediately when discovered;
- remains cancellable through the existing scan token;
- never fabricates feasibility or changes Green/Yellow/Red semantics;
- the Validation in-lane UI consumes those callbacks rather than waiting for one opaque 60-day result.

### Stage 3 — reservation-aware network revalidation

Active competing `SoftHeld`, `Reserved` and `Committed` network-reservation windows are adapted into read-only Stage-2 planning constraints before `NetworkProposalService` asks the same PlanningEngine to propose or revalidate receiving-lab execution.

Important governance rules remain unchanged:

- the general receiving-readiness fingerprint retains its original meaning and does not include network reservations;
- revalidation/final acceptance ignores only the current request's own reservation;
- competing reservations remain constraints;
- no competing reservation is silently released, bumped or overridden;
- final acceptance still performs live revalidation;
- business mutations remain controlled transactions.

## Protected evidence position

### Prior completed evidence on the exact corrected logic source

- Stage-1 full protection: **46/46 PASS**
- Stage-2 canonical: **70/70 PASS**
- Stage-2 browser/planning: **5/5 PASS**
- Test-4 feedback: **9/9 PASS**
- Test-8 feedback static: **11/11 PASS**
- Test-8 feedback dynamic: **6/6 PASS**
- Real-state AUTO performance/equivalence: **2/2 PASS**; 17.17 s synchronous vs 6.65 s parallel = **2.58×** wall-time speedup with equivalent candidate semantics
- Stage-3 network: **77/77 PASS**
- Stage-3 application: **14/14 PASS**
- Stage-3 transaction/reservation/lifecycle/external: **18/18 PASS**

### Newly executed / re-executed during Test-10 finalization

- Test-9 feedback static: **7/7 PASS**
- Test-9 feedback dynamic: **4/4 PASS**
- Stage-3 caller audit: **15/15 PASS**
- Stage-3 release hardening: **10/10 PASS**
- Prior manual-feedback suite: **5/5 PASS**
- Validation identity continuity: **8/8 PASS**
- Real-state continuity: **8/8 PASS**
- Test-6 deployment/scenario guards after Test-10 metadata update: **8/8 PASS**
- Test-10 build identification: **11/11 PASS**

Current controlled-suite position: **334/334 PASS, 0 FAIL**.

Structural gates after Test-10 deployment metadata:

- production JavaScript parse: **11/11 PASS**
- `index.html` startup script references: **9/9 present**
- Stage-2 planning worker exists and is keyed internally and externally to `STAGE3-GITHUB-TEST-10`.

During the metadata-only transition, the older Test-6 deployment guard initially still expected the literal Test-9 identifier. That QA metadata expectation was advanced to Test-10 and rerun **8/8 PASS**; production logic was not changed for that test update.

## Deferred Stage-10 requirement

Do **not** implement during Stage 3: the planning swimlane date/timeline header, lane-header context and `−`, `+`, `FIT` controls must become sticky during vertical scrolling in Stage 10, remain horizontally synchronized with the swimlane timeline, and never obscure the global application header.

## Acceptance state

Test-10 is ready for GitHub Pages browser testing. It is not a Stage-3 RC. Stage 3 remains open until manual acceptance is reported and a final Stage-3 acceptance gate is explicitly authorized.
