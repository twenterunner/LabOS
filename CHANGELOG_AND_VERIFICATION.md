# LabOS REV 1.0.55 — platform-ready workstreams, scoped capability/SPC and exact process-revision readiness

## Purpose

REV 1.0.55 keeps Prototype as the implemented POC while establishing the navigation and shared-data framework for future Validation and Failure Analysis. It also replaces the former generic Process Capability surface with study-scoped Quality analytics and fixes a real readiness inconsistency between route revision history and the readiness gate.

## 1. LabOS menu / platform architecture

- Added **Requests** as the common demand front door.
- **Prototype** remains fully operational.
- **Validation** is a clearly marked future workstream with the reserved DV/PV / reliability flow: requirements → validation plan → test legs/DUTs → constrained planning → execution → results → requirement verification.
- Validation also reserves controlled **Test Development**: method gap → develop → qualify/commission → release → shared Test Library → reuse.
- **Failure Analysis** is a clearly marked future workstream with the reserved failure → triage/containment → evidence → hypotheses → analysis/experiments → root cause → corrective action → verification/retest → learning loop.
- Planning, products/BOM, standards/resources, equipment/calibration, competency, sample genealogy, Quality, Reports and management remain shared platform services.
- Future workstream pages are architectural placeholders only; they do not create fake workflow records.

## 2. Quality → Capability & SPC

The former top-level **Process Capability** menu is removed. Existing internal links to the legacy destination redirect to **Quality → Capability & SPC**.

Every analysis card is now one defined comparable population. The grouping key includes:

- product and product revision;
- configuration;
- process and routed process revision;
- equipment;
- Control Plan and revision;
- characteristic, unit, target/limits; and
- measurement method.

This prevents calibration offset or other characteristics from different products/configurations/equipment/specifications being pooled into one trend or one Cpk.

User filters now include Product, Configuration, Process, Equipment, Characteristic and time window. Cards expose the exact study scope, source builds and evidence traceability.

For statistical restraint in prototype work:

- fewer than 20 numeric observations → **capability not established**;
- Ppk is available from n ≥ 20 with a two-sided numeric specification using overall variation;
- Cpk is exposed only when n ≥ 20, scope is complete, a two-sided specification exists and the basic Individuals-chart 3σ screen has no point signal;
- company/customer Cpk acceptance criteria are not silently hard-coded as universal thresholds.

## 3. “Processes released” Build Readiness defect

Root cause: the route/execution UI already resolved the exact historical process revision saved on the route, but `ReadinessService` checked only the current live process-library record and required its current revision to equal the routed revision. Therefore revising a previously released process could make an older build show every routed method as released while Build Readiness still reported **Processes released** as blocked.

Fix:

- added one canonical exact-revision resolver used by readiness and route UI;
- a historically released routed revision remains valid after the library advances to a newer draft/under-review revision;
- an absent historical revision never silently falls forward to the current process definition;
- a genuine blocker identifies the exact route step/revision and its status, and states the exact evidence required to clear it.

This applies automatically to existing browser-persisted builds after deployment; no schema migration is required.

## 4. Verification

Final retained acceptance run: **1,954 passed / 0 failed**.

| Suite | Result |
|---|---:|
| Core domain / planner | 46 / 46 |
| Persistence / migration | 6 / 6 |
| Retained hard-gate / learning focused checks | 11 / 11 |
| REV 1.0.55 revision/menu/capability focused checks | 11 / 11 |
| UI interaction regression | 26 / 26 |
| Build Report + Lab Performance regression | 14 / 14 |
| Static/mobile/package-source checks | 20 / 20 |
| Role/build/workspace render stress, including future workstreams | 1,820 / 1,820 |
| **Total** | **1,954 / 1,954** |

JavaScript syntax checks pass for `core.js`, `services.js` and `app.js`.
