# LabOS Controlled Rebuild — Stage 2 Acceptance Report

**Release:** LabOS Rev 1.0.185 — Stage 2 RC1  
**Stage:** 2 of 10 — Planning Engine  
**Decision:** COMPLETE AND PROTECTED, subject only to package-byte verification performed after this report is written.  
**Protected source baseline:** Rev 1.0.185 — `ca256107a58ed18e9303c9e0fdbe20e14fead5a4d68a04d75a7804b83629a8ab`  
**Prior accepted rebuild baseline:** Stage 1 RC2 — `2d642d4568b7b8b525fc238505ed70df6cf3971687e84a6fa2fe1e62851f3ee8`

## A. Architecture before

Stage 1 RC2 contained a capable resource-feasibility scheduler but planning was surrounded by accumulated V1094/V1096/V1099/V1107/V132 orchestration, two manual-planning semantics, a flat global scheduling cursor, and a Validation adapter that converted Validation work into a synthetic Prototype-shaped request. Prototype `parallelGroup` and Validation `predecessorIds` existed in the data model but were not first-class scheduling dependencies. Planning commits also had multiple state-replacement paths.

## B. Architecture after

Stage 2 establishes one canonical graph-aware planning architecture:

`Programme adapters → PlanningProblem/TaskGraph → PlanningEngine → one PlannerService resource kernel → PlanningProposal → PlanningDelta → PlanCommitService → Stage-1 StateTransactionService → repository/audit`.

Prototype and Validation compile to the same task-graph contract. Prototype parallel groups become explicit DAG branches/merges. Validation uses stable activity IDs and real predecessor relationships. Manual planning, feasible-slot search, replanning, portfolio/scenario planning and recovery/escalation all reach the same scheduling kernel. `PlanningContext` supplies deterministic `asOf`, calendar and horizon policy. Forecasts derive from the active plan rather than stale cache fields.

## C. Legacy / duplicate planning code removed or consolidated

The effective runtime V1094/V1096/V1099/V1107/V132 portfolio/scenario entry points now delegate to `PlanningPortfolioService`. `PlannerService.autoPlanPortfolio` delegates to the same service. Manual planner compatibility entry points delegate into `PlanningEngine`; accepted manual moves and three-tier manual saves use the Stage-2 atomic transaction boundary. The legacy V163 Validation portfolio preview and commit were consolidated onto `PlanningPortfolioService` and the same atomic commit path.

Historical implementation bodies remain physically present in the accumulated Rev-185 source where removal at this stage would add unnecessary release risk. They are overridden by later Stage-2 definitions and are classified as historical/compatibility code, not live competing schedulers. Stage 3 must audit sister-lab lifecycle code separately.

## D. Changed files and why

- `index.html` — loads the Stage-2 planning module after the existing planning module and before the application layer.
- `labos-planning-stage2-1.0.185.js` — new canonical graph-aware planning contracts, task compilation, deterministic planning context, portfolio service, structured blockers, planning deltas, plan commit service, and compatibility delegation.
- `labos-services-1.0.185.js` — integrates graph-aware/deterministic kernel hooks and performance-safe candidate-in-place behavior while preserving compatible low-level resource feasibility.
- `labos-app-1.0.185.js` — migrates effective AUTO/portfolio/manual/recovery/Validation-portfolio acceptance paths to PlanningDelta + PlanCommitService + Stage-1 StateTransactionService and exposes QA hooks.

No production changes were made to core, demo data, repository, Stage-1 state module, styles, service worker or version metadata.

## E. Actual tests executed

### Protected Stage 1
- Architecture/read purity: **10 PASS / 0 FAIL**
- Integrity: **17 PASS / 0 FAIL**
- Canonical load/import/reset boundary: **3 PASS / 0 FAIL**
- Protected functional regression: **16 PASS / 0 FAIL**
- **Stage-1 total: 46 PASS / 0 FAIL**

### Stage 2
- Graph/single-programme: **27 PASS / 0 FAIL**
- Portfolio/scenario: **24 PASS / 0 FAIL**
- Hardening/application commit: **19 PASS / 0 FAIL**
- **Stage-2 total: 70 PASS / 0 FAIL**

### Application comparison
- Smoke: 11/12 byte-equivalent + 1 required Stage-2 planning correction; **0 genuine regressions**.
- 70 built-in hooks: 67/70 byte-equivalent + 2 timestamp-only + 1 required Stage-2 Validation-DAG correction; **0 genuine regressions**.
- Runtime caller/delegation audit: **12/12 PASS**, plus explicit V163 portfolio-delegation and atomic-commit checks.

Browser/IndexedDB: **NOT EXECUTABLE** because the execution environment blocks local Chromium navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. This is not counted as PASS.

## F. Final performance benchmarks

| Scenario | Median | Average | Result |
|---|---:|---:|---|
| Ordinary Prototype | 140.431 ms | 140.983 ms | feasible |
| Parallel Prototype | 142.541 ms | 143.570 ms | feasible |
| Single Validation | 191.744 ms | 190.193 ms | feasible |
| Validation DAG / parallel legs | 158.409 ms | 161.445 ms | feasible |
| 2 programmes × 6 strategies | 798.796 ms | 794.595 ms | feasible |
| 28 programmes × 1 strategy | 885.477 ms | 888.932 ms | 26 feasible / 2 blocked |
| 28 programmes × 6 strategies | 10.278 s | 10.251 s | 26 feasible / 2 blocked per strategy |

Final-source sanity checks remained consistent (~836 ms for two programmes × six strategies and ~10.41 s for the 28-programme six-strategy portfolio).

## G. Remaining known risks

1. Real-browser IndexedDB could not be executed in this environment and should be verified on an unrestricted browser before a pilot.
2. Historical Rev-185 wrapper bodies remain in the large accumulated application/services files. Runtime tests prove they are not effective competing Stage-2 schedulers, but later controlled cleanup remains desirable.
3. Readiness policy is still consumed through compatibility interfaces; Stage 4 owns the canonical Readiness Engine redesign.
4. Sister-lab transfer/request/accept/reject lifecycle remains intentionally Stage-3 scope. Stage 2 provides the common scheduling substrate only.
5. The static PoC remains single-browser persistence rather than a transactional multi-user backend. Stage-1/2 boundaries are designed to permit later API/database/SSO migration.

## H. Stage-1 regression status

**GREEN — 46/46 protected checks passed on the final Stage-2 source.** The Stage-1 canonical state, persistence, ownership, audit and read-purity architecture remains protected.

## I. Enterprise-readiness impact

Stage 2 materially improves backend portability and operational trust. Planning now has explicit contracts, deterministic context, structured blockers, graph dependencies, stable IDs, delta commits and atomic transaction boundaries. A future server-side planning service can implement the same PlanningProblem/PlanningProposal contract without forcing the UI/domain model to be rewritten. The same kernel is now suitable for Stage-3 network routing rather than creating lab-specific planners.

## J. Full 10-stage roadmap

1. **Data & State Integrity — COMPLETE / PROTECTED**
2. **Planning Engine — COMPLETE / PROTECTED (Stage 2 RC1)**
3. Network / Sister-Lab Capability — next, AUDIT ONLY
4. Readiness Engine
5. Workflow Engine
6. Execution & Evidence Engine
7. Reporting Engine
8. Lessons Learned Engine
9. KPI Engine
10. Tab / UI / UX Review

## K. Exact next action

The next action is **Stage 3 — Network / Sister-Lab Capability AUDIT ONLY**. Do not implement Stage 3 until the audit is completed and explicitly authorized.
