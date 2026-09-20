# LabOS REV 1.0.185 — Stage 3 Test-11 Correction & Release Evidence

Controlled checkpoint: **STAGE3-GITHUB-TEST-11**  
Visible build: **REV 1.0.185 · S3 TEST-11**  
Stage status: **GitHub manual-test checkpoint; NOT a Stage-3 RC**

## Scope and 10-stage ownership

Test-11 remains inside the established controlled rebuild. The browser defect reported against Test-10 — tapping a Green manual-replan alternative did not commit the intended move — is classified as a **Stage-2 Planning Engine integration regression discovered during the Stage-3 acceptance gate**. Stage 3 therefore remains open while the protected Stage-2 path is corrected and re-certified. Stage 4 has not started.

No ad-hoc UI patch, second manual planner, separate Validation planner, direct booking mutation, second persistence route, or sister-lab-specific scheduling engine was introduced.

The authoritative commit path remains:

`PlanningEngine solver scenario → canonical Stage-2 scenario command boundary → PlanningDelta / candidate → PlanCommitService → Stage-1 StateTransactionService → one persistence transaction → canonical live state → UI redraw`.

## Test-10 reproduction and root cause

Exact Test-10 package SHA-256 verified before correction:

`3ee8ad4b1da7c5ecb7f73482b773523eb46862152c92551710b732e8eae31acb`

The browser-visible Green alternative was calculated correctly, but the effective Validation in-lane integration attempted to call the Planning UI closure-private `commitScenario` function. The resulting failure was reproduced as:

`ReferenceError: commitScenario is not defined`

The generic correction exposes one shared Stage-2 scenario command boundary and delegates the existing Green / Yellow acceptance paths to that authority. Partial sister-lab Validation routing remains task/activity-level `SiteAssignment`; programme `homeSiteId` and `executionSiteId` semantics are not replaced by the selected booking site.

## Focused Test-11 correction evidence

- Shared Green command boundary / partial Validation assignment / rendered full-manual Green: **3/3 PASS**
- Exact Validation in-lane Green commit: **1/1 PASS**
- Persistence rollback + Prototype full-manual preservation: **2/2 PASS**
- Yellow confirmation / Red non-commit governance: **3/3 PASS**

Focused Test-11 total: **9/9 PASS, 0 FAIL**.

The focused tests prove:

- tapping a Green option changes the intended canonical live booking;
- the solver-selected date/resources are committed through the existing transaction architecture;
- unrelated bookings and network state remain unchanged;
- accepted partial sister-lab SiteAssignments survive the move;
- programme ownership (`homeSiteId` / `executionSiteId`) remains correct;
- successful acceptance performs exactly one persistence save;
- persistence failure rolls back atomically instead of leaving a phantom move;
- Prototype and Validation continue to use the shared Stage-2 planning authority;
- selecting Yellow alone performs zero persistence and requires controlled confirmation;
- accepted Yellow confirmation uses the same Stage-2 transaction exactly once;
- Red/blocked alternatives have no solver scenario and expose no direct commit action.

## Fresh remaining Stage-3 release suites on final Test-11 logic

The remaining protected suites requested for the Test-11 freeze were freshly rerun against the final logic tree:

- Validation identity continuity: **8/8 PASS**
- Real exported-state continuity regression: **8/8 PASS**
- Test-4 feedback / persisted-state regression: **9/9 PASS**
- Test-8 static/integration feedback: **11/11 PASS**
- Test-8 dynamic planning/transaction feedback: **6/6 PASS**
- Test-9 static feedback: **7/7 PASS**
- Test-9 dynamic feedback: **4/4 PASS**

The Test-8 dynamic suite was executed in deterministic chunks because the complete process exceeded the execution window; all six original assertions in the packaged test file passed. The test implementation itself was not weakened or changed for the release gate.

## Preserved protected evidence

The already completed Test-11 protected evidence remains:

### Stage 1
- architecture/read-purity: **10/10 PASS**
- integrity: **17/17 PASS**
- canonical boundaries: **3/3 PASS**
- functional regression: **16/16 PASS**
- Stage-1 total: **46/46 PASS**

### Stage 2
- graph/single-programme: **27/27 PASS**
- portfolio/scenario: **24/24 PASS**
- hardening: **19/19 PASS**
- canonical Stage-2 total: **70/70 PASS**
- browser/planning feedback: **5/5 PASS**
- real-state AUTO performance/equivalence: **2/2 PASS**

### Stage 3
- canonical network: **77/77 PASS**
- application integration: **14/14 PASS**
- transaction/reservation/lifecycle/external: **18/18 PASS**
- caller/governance audit: **15/15 PASS**
- release hardening: **10/10 PASS**
- prior manual-feedback: **5/5 PASS**
- Validation identity continuity: **8/8 PASS**
- real-state continuity: **8/8 PASS**
- Test-4 feedback: **9/9 PASS**
- Test-6 deployment/scenario guards: **8/8 PASS**
- Test-8 static: **11/11 PASS**
- Test-8 dynamic: **6/6 PASS**
- Test-9 static: **7/7 PASS**
- Test-9 dynamic: **4/4 PASS**
- focused Test-11 correction: **9/9 PASS**
- Test-11 build identification: **11/11 PASS**

Controlled Test-11 assertion position: **343/343 PASS, 0 FAIL**.

## Production-delta control

Compared with the exact Test-10 package, the intended production delta is limited to:

- `index.html`
- `index.stage3-edited.html`
- `labos-planning-stage2-1.0.185.js`
- `labos-planning-worker-1.0.185.js`
- `labos-app-1.0.185.js`
- `labos-version.json`

The logic delta is the generic Stage-2 scenario-command integration correction plus the controlled Test-11 identity. No unrelated Stage-1, Stage-3 network-engine, services, repository, demo-data, styling, manifest or service-worker production logic is changed.

## Structural release gate

Before package freeze the release process verifies:

- every root production JavaScript file parses with `node --check`;
- every script referenced by `index.html` exists;
- every active runtime script/CSS reference uses `STAGE3-GITHUB-TEST-11`;
- visible badge is `REV 1.0.185 · S3 TEST-11`;
- `labos-version.json` exposes the same checkpoint;
- the Stage-2 worker is keyed to the same controlled build;
- no unintended production delta exists relative to Test-10;
- historical Test-4 through Test-10 reports remain historical and are not rewritten to Test-11.

## Deferred Stage-10 requirement

Do **not** implement during Stage 3: make the Planning swimlane date/timeline header, lane-header context and `−`, `+`, `FIT` controls sticky during vertical scrolling in Stage 10 while preserving horizontal synchronization and global-header clearance.

## Acceptance state

Test-11 is a GitHub/browser manual-test checkpoint only. It is **not** a Stage-3 RC and does not complete Stage 3. The user must deploy Test-11 with existing IndexedDB/site data preserved, complete the Test-11 browser checklist, report the result, and explicitly accept Stage 3 before a protected Stage-3 checkpoint can be prepared. Stage 4 must not start before that acceptance.
