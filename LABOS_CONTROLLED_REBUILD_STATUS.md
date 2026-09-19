# LABOS CONTROLLED REBUILD — AUTHORITATIVE STATUS

Date: 2026-09-19

## Protected source baseline

- LabOS Rev **1.0.185**
- SHA-256: `ca256107a58ed18e9303c9e0fdbe20e14fead5a4d68a04d75a7804b83629a8ab`

## Accepted protected checkpoints

- Stage 1 RC2: `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE1_RC2_WEB.zip`
- SHA-256: `2d642d4568b7b8b525fc238505ed70df6cf3971687e84a6fa2fe1e62851f3ee8`
- Stage 2 RC1: `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE2_RC1_WEB.zip`
- SHA-256: `830e8b137f5398ff44952e7a54943a5ba4f64ffa993f3c48301774ef1afab6a8`

Stage 2 RC1 remains the accepted protected development baseline until Stage 3 is explicitly accepted.

## Current controlled test build

- Product revision: **1.0.185**
- Controlled checkpoint: **STAGE3-GITHUB-TEST-5**
- Visible browser identifier: **REV 1.0.185 · S3 TEST**
- Status: **GitHub manual-test build; not a Stage-3 RC**

## Roadmap

1. ✅ Stage 1 — Data & State Integrity — COMPLETE / PROTECTED
2. ✅ Stage 2 — Planning Engine — COMPLETE / PROTECTED after controlled reopen + recertification
3. 🟡 Stage 3 — Network / Sister-Lab Capability — AUTOMATED GATES GREEN / AWAITING TEST-5 GITHUB MANUAL TEST
4. ⬜ Stage 4 — Readiness Engine — NOT STARTED
5. ⬜ Stage 5 — Workflow Engine — NOT STARTED
6. ⬜ Stage 6 — Execution & Evidence Engine — NOT STARTED
7. ⬜ Stage 7 — Reporting Engine — NOT STARTED
8. ⬜ Stage 8 — Lessons Learned Engine — NOT STARTED
9. ⬜ Stage 9 — KPI Engine — NOT STARTED
10. ⬜ Stage 10 — Tab / UI / UX Review — NOT STARTED

## Current protected architecture

- Stage-1 StateTransactionService / persistence / read-purity boundaries remain protected.
- One Stage-2 graph-aware PlanningEngine / PlannerService remains the only scheduling authority.
- Prototype and Validation share the same planning kernel and one planned-item interaction model.
- Overall / Per programme / Per equipment / Per person use one canonical Planning renderer and booking model; only grouping changes.
- Manual in-lane replan uses the Stage-2 planning kernel and common Green/Yellow/Red feasibility semantics for Prototype and Validation.
- Canonical Planning exposes one whole-demand AUTO PLAN covering Prototype + Validation demand.
- Stage-3 whole/partial sister-lab feasibility is exposed through NetworkProposalService and applied through governed NetworkTransferService transactions.
- Prototype tasks and Validation activities use stable canonical IDs end-to-end.
- Validation leg/subflow transfer remains supported through TransferScope.subflow.
- Requested sister-lab work is derived into receiver My Work from canonical network records.
- Internal sister labs and external providers retain distinct governance.
- No Stage-4 readiness implementation has started.

## Fresh protection executed on the corrected TEST-5 source

Canonical Stage 2: **70/70 PASS**
- graph: 27/27
- portfolio/scenario: 24/24
- hardening: 19/19

Stage 1: **46/46 PASS**
- architecture/read purity: 10/10
- integrity: 17/17
- canonical boundary: 3/3
- functional: 16/16

Stage 3 canonical/supporting suites:
- network/domain: 77/77
- application: 14/14
- transaction/lifecycle/external: 18/18
- caller audit: 15/15
- release hardening: 10/10
- prior Stage-3 manual-feedback regression: 5/5

Additional controlled regression suites:
- Test-4 feedback / persisted-state integration: **9/9 PASS**
- Stage-2 browser-feedback regression: **5/5 PASS**
- build identification after TEST-5 checkpoint advance: **8/8 PASS**

Structural protection after checkpoint advance:
- root production JavaScript: **10/10 parse**
- local index script references: **9/9 present**

Real browser/IndexedDB automation is not certified by the Node protection suite. The Stage-1 repository tests use the documented in-memory fallback when IndexedDB is unavailable. The GitHub Pages browser test remains the manual stage gate.

## Continuity rule

Do not start Stage 4 and do not create a Stage-3 RC until TEST 5 browser feedback is accepted and the final Stage-3 acceptance gate is explicitly authorized.
