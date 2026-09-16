# LabOS REV 1.0.152 — QA Report

**Release:** LabOS REV 1.0.152  
**Schema:** 38  
**Baseline:** REV 1.0.151 populated release  
**Scope:** Native Validation / DV / PV expansion while preserving Prototype and common LabOS services.

## Release decision

**PASS — release candidate accepted for the static-browser PoC.**

The Validation domain is implemented on top of the existing LabOS common services. It does not introduce a second planner. Validation scheduling creates canonical shared bookings and therefore competes with Prototype for the same equipment, personnel and calendars.

## Architecture / data model checks

- PASS — Validation runtime loads as a first-class module before the application UI.
- PASS — controlled directed programme graph with programme nodes, edges and legs.
- PASS — DUT allocations/genealogy, requirements, results, evidence/disposition/report/audit structures present.
- PASS — shared constrained planner used for Validation; generated Validation bookings use the canonical booking shape.
- PASS — schema version is 38.
- PASS — explicit schema 37 → 38 migration.
- PASS — migration is idempotent.
- PASS — no Reset Demo Data is required for migration.

## REV 1.0.151 → REV 1.0.152 populated migration

The migration test started from a real populated REV 1.0.151 state.

- before schema: 37
- after schema: 38
- Validation programmes seeded for the demo state: 10
- Validation programme nodes: 56
- migration entries: 1
- second migration run did not duplicate Validation programmes or nodes

Preservation checks passed for existing:

- requests
- routes
- equipment
- staff
- standard tests
- products
- materials
- Control Plans
- calibration certificates
- bookings
- actions

## Validation graph / programme-builder acceptance

PASS:

- drag standard test from library to canvas
- add test leg
- rename leg
- reorder leg
- create sequential/parallel structures in the seeded graph programmes
- Split allocation UI and controlled quantity validation
- Merge nodes / dependency graph integrity
- destructive DUT allocation protection
- duplicate node
- delete/undo/redo graph mutation path
- zoom + / zoom - / Fit
- canvas persistence / save-reload graph identity
- requirement coverage UI
- Prototype-source linkage UI
- external-test node
- method-development node
- desktop builder rendering
- mobile Add step flow
- mobile move/reorder controls

The released-programme structural-edit test also passed: a structural change to a Released programme creates a new controlled revision in **Under review**, and explicit rationale is required to release that revision.

## Planning acceptance

PASS — intact three-leg Validation programme AUTO PLAN using the canonical LabOS planner.

Measured browser-side planning/proposal time in the release acceptance test: **0.564 s**.

The proposal included:

- feasibility result
- current/proposed forecast
- requested completion
- impact
- critical path
- alternatives/recovery context

PASS — committed the controlled AUTO PLAN proposal.

PASS — manual planning searches forward when the requested day is unavailable and returns controlled GREEN/YELLOW/RED semantics with exact reasoning. In the exercised case, the requested 22 Sep slot returned a YELLOW feasible alternative on 25 Sep.

PASS — moving a Validation test replans downstream descendants after the moved test. Dependency timing also propagates through Split/Merge structures so a downstream activity cannot be placed earlier on the same day than its predecessor finish.

PASS:

- sister-lab route one test
- sister-lab route complete leg
- sister-lab route complete programme
- sister-lab execution lab persists on the programme node after commit
- external test planning

## Shared-resource planning regression

Core planner test:

- plan result: feasible
- created Validation bookings: 6
- planning failures: 0
- shared booking shape: PASS
- booking domain: Validation

This confirms that Validation work is scheduled through the same constrained resource model rather than a duplicate Validation-only solver.

## Fault injection

All deliberate fault cases passed their expected protection/diagnostic behavior:

- circular dependency attempted → rejected
- disconnected programme graph → detected
- destructive DUT allocated twice → rejected
- Split allocation not equal to available DUT total → rejected
- method deleted → detected
- method revision changed → detected
- equipment deleted after planning → detected
- calibration expiry → detected
- staff qualification expiry → detected
- partial Prototype release → staggered DUT availability retained
- linked Prototype build slip → detected
- linked Prototype build cancellation → detected
- specification revision → affected programme identified
- sister lab unavailable → handled without stale accepted route
- external supplier delay → propagated
- Merge with incomplete upstream branch → blocks execution
- report generated before closure → remains draft
- repeated approval → rejected
- MSA/GRR readiness blocker → detected
- post-plan equipment deletion → detected

Fault campaign overall result: **PASS**.

## Execution / result / disposition controls

PASS:

- rich Validation node inspector available
- result/disposition action exposed
- controlled disposition UI available for failed/invalid result
- disposition saves as a separate record
- original failed/invalid result is not overwritten
- repeated report approval is rejected

Result semantics distinguish valid product failure from lab-caused invalid testing so legitimate product failures are not treated as Lab-Caused RFT failures.

## KPI integration

REV 1.0.151 KPI regression hook remains healthy:

- KPI definitions available: 42
- selected-period calculations execute without console errors
- existing Prototype KPI calculations remain functional

Validation KPI calculation coverage exercised included:

- Validation OTD
- test plan completion
- requirement verification coverage
- valid-test-first-time / lab-caused rerun semantics
- method readiness
- equipment readiness
- MSA/GRR readiness
- report closure time
- failure disposition time
- Validation cost
- Validation lead time
- days lost / recovered
- sister-lab capture
- outsourcing avoided
- development estimate accuracy (left null where controlled evidence is insufficient rather than fabricated)

## Prototype regression

PASS:

- REV 1.0.142 workflow liveness across 22 populated Prototype builds
- REV 1.0.142 fault reconciliation
- REV 1.0.142 idempotence across 22 builds
- REV 1.0.142 serial stability / duplicate rejection
- REV 1.0.143 workflow regression across 22 builds
- REV 1.0.144 material/Control Plan gate regression
- REV 1.0.145 self-healing/load-balance behavior
- REV 1.0.146 Control Plan / action-queue behavior
- REV 1.0.147 review-before-approval hook retained
- REV 1.0.148 canonical equipment/resource semantics
- global invariant validation returned no issues

## Browser/UI checks

Desktop Validation builder acceptance: **PASS**.  
Mobile Validation add/reorder acceptance: **PASS**.  
Release-control browser acceptance: **PASS**.  
Console/page errors in these suites: **0**.

A direct Playwright navigation to a local `http://127.0.0.1` server was attempted for a final hosted smoke test, but the execution environment blocks localhost navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. This is an environment restriction, not an application error. Browser acceptance therefore used the exact release HTML/CSS/JS assets loaded directly into Chromium, which is the same approach used for the release interaction/fault suites. No hosted-browser pass is claimed.

## Static release checks

PASS:

- `node --check` for every JavaScript release file
- manifest JSON parse
- all local `index.html` asset references resolve
- visible `REV 1.0.152` reference present
- Validation module reference present
- service worker updated for REV 1.0.152
- README reports schema 38 / REV 1.0.152
- current user manual includes Validation/DV/PV operating instructions

## Release contents / naming

Required release name:

`ProtoLabOS_Prototype_Build_POC_v1.0.152_WEB.zip`

Required QA report:

`QA_REPORT_v1.0.152.md`

ZIP integrity: **PASS** — final packaged archive was extracted and revalidated; all compressed entries passed `unzip -t`, all extracted JavaScript files passed syntax checking, required REV 1.0.152 files were present, and no REV 1.0.151 runtime/QA file was included.

## Known scope boundary

This remains a static-browser PoC using browser-local persistence. Production multi-user deployment still requires governed backend storage, authentication/authorization enforcement, controlled evidence storage, concurrency handling and server-side audit/transaction guarantees. Failure Analysis remains a future operating domain; its KPI framework placeholders do not fabricate FA production data.
