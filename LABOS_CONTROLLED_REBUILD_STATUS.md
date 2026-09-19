# LABOS CONTROLLED REBUILD — AUTHORITATIVE STATUS

## Protected source baseline

- **LabOS Rev 1.0.185**
- SHA-256: `ca256107a58ed18e9303c9e0fdbe20e14fead5a4d68a04d75a7804b83629a8ab`

## Accepted rebuild baselines

- Stage 1 RC2: `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE1_RC2_WEB.zip`
- Stage 1 RC2 SHA-256: `2d642d4568b7b8b525fc238505ed70df6cf3971687e84a6fa2fe1e62851f3ee8`
- Stage 2 RC1: `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE2_RC1_WEB.zip`
- Stage 2 RC1 package SHA-256 is computed after ZIP creation and must be recorded alongside the distributed ZIP/continuity prompt.

Do **not** substitute Rev 186, Rev 187, RC1 from Stage 1, or another experimental build as the protected development baseline.

## Roadmap status

1. ✅ Data & State Integrity — COMPLETE AND PROTECTED
2. ✅ Planning Engine — COMPLETE AND PROTECTED
3. ⬜ Network / Sister-Lab Capability — NEXT: AUDIT ONLY
4. ⬜ Readiness Engine
5. ⬜ Workflow Engine
6. ⬜ Execution & Evidence Engine
7. ⬜ Reporting Engine
8. ⬜ Lessons Learned Engine
9. ⬜ KPI Engine
10. ⬜ Tab / UI / UX Review

## Stage 1 protected architecture

- normal persistence is persistence-only;
- reads do not mutate caller-owned canonical state;
- session/UI lab cannot silently become programme ownership;
- `homeSiteId`, `executionSiteId`, and `booking.siteId` are distinct;
- booking ownership precedence is explicit booking site → equipment/staff site → programme execution/home fallback;
- Prototype and Validation share canonical programme access;
- commitment history is the commitment ledger;
- forecast is derived from canonical active planning data;
- load/import/reset perform explicit canonical repair and persist immediately;
- application/business code does not depend directly on IndexedDB;
- structured audit and controlled state transactions are protected.

## Stage 2 protected architecture

- one authoritative graph-aware planning kernel;
- Prototype and Validation compile into the same PlanningProblem/task-graph contract;
- Prototype parallel groups and merges schedule as real DAG dependencies;
- Validation uses stable activity IDs and `predecessorIds`, not activity-name reconciliation;
- manual planning, feasible-slot search, replanning, portfolio/scenario and recovery reach the same kernel;
- deterministic `PlanningContext.asOf`, calendar and horizon inputs;
- bounded infeasibility with structured blockers rather than absurd multi-year plans;
- portfolio planning supports Prototype + Validation through `PlanningPortfolioService`;
- proposal calculation is source-state/audit pure;
- accepted planning uses `PlanningDelta → PlanCommitService → StateTransactionService`;
- effective AUTO, portfolio, manual three-tier, in-lane move, recovery and Validation-portfolio acceptance paths do not wholesale-replace enterprise state;
- failed planning persistence/validation rolls back;
- Stage-3 sister-lab lifecycle remains deliberately deferred.

## Final Stage-2 release evidence

- Stage 1: **46/46 PASS**
- Stage 2: **70/70 PASS**
- Application smoke: **0 genuine regressions**
- 70-hook comparison: **0 genuine regressions**
- Runtime caller audit: **12/12 PASS** plus V163 delegation/atomic-commit proof
- Browser/IndexedDB: **NOT EXECUTABLE** due execution-environment browser policy; do not retrospectively call PASS.

## Known risks / deferred work

- Verify real browser + IndexedDB on an unrestricted device before pilot deployment.
- Historical accumulated Rev-185 wrapper bodies remain but are not effective Stage-2 schedulers; later controlled cleanup is desirable.
- Readiness architecture remains Stage 4.
- Sister-lab transfer lifecycle and network governance remain Stage 3.
- Enterprise multi-user database/SSO deployment remains future infrastructure; Stage-1/2 boundaries are designed for it.

## Continuity rule

When resuming in a new conversation:

1. attach/provide the latest accepted RC ZIP;
2. provide this handover;
3. verify the ZIP/hash before modification;
4. confirm Stages 1 and 2 are protected;
5. work only on Stage 3 AUDIT first;
6. do not silently replace the baseline;
7. if artifacts conflict with this handover, stop and investigate rather than guessing.

## Exact next action

**STAGE 3 — NETWORK / SISTER-LAB CAPABILITY AUDIT ONLY.**
Do not implement Stage 3 until the audit findings, canonical architecture and regression shield have been presented and explicitly authorized.
