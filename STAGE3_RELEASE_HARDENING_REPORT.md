# LabOS Controlled Rebuild — Stage 3 Release-Hardening Report

Date: 2026-09-19

## Artifact status

This package is a **GitHub Pages manual-test build**, not an accepted Stage-3 RC and not a Stage-4 baseline.

Controlled build identifier: **`STAGE3-GITHUB-TEST-4`**

Visible browser identifier: **`REV 1.0.185 · S3 TEST`**

Protected accepted baseline remains:
- `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE2_RC1_WEB.zip`
- SHA-256 `830e8b137f5398ff44952e7a54943a5ba4f64ffa993f3c48301774ef1afab6a8`

Initial Stage-3 WIP source:
- `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_WIP1_WEB.zip`
- SHA-256 `67ed14bfb0f613385a5f0bca61530a2d745795371db251fa6b62ccff8c751ec3`

## Stage-3 release-hardening corrections already incorporated

1. Scenario Lab sister-lab submission delegates to the canonical Stage-3 network transaction boundary rather than directly appending business state and calling persistence.
2. Scenario Lab external alternatives cannot be applied directly to LIVE state.
3. External execution follows the distinct governed path: `ExternalExecutionRequest` -> commercial approval -> `ExternalOrder`, through `StateTransactionService`.
4. Pending external commercial approvals are derived into My Work from canonical external state.
5. Controlled-build identification preserves product revision 1.0.185 while exposing the exact Stage-3 checkpoint in browser UI/deployment metadata.
6. Requested sister-lab transfers are derived into receiver My Work from canonical network records.
7. Governed single-operation Prototype sister-lab routing is reachable from the planned-task action prompt.
8. Future/potential-project probability-weighted demand is visible in canonical Overall Planning.

## Controlled Stage-2 reopen incorporated before TEST 4

GitHub manual testing of TEST 3 exposed Planning integration regressions. These were corrected inside the existing Stage-2 architecture, not by introducing another planner:

- Overall / Per programme / Per equipment / Per person now remain in one canonical Planning renderer and interaction shell.
- The canonical board exposes the existing governed in-lane replanning contract, restoring Green/Yellow feasible alternatives through the same Stage-2 planning kernel.
- Constrained in-lane scanning yields after each candidate instead of synchronously processing a multi-candidate batch, improving perceived response without bypassing feasibility logic.
- The canonical Planning page exposes one whole-demand AUTO PLAN; Validation-only compatibility planning is not presented there as a competing authority.

Detailed evidence: `STAGE2_PLANNING_FEEDBACK_CORRECTION_REPORT.md`.

## Fresh automated certification against the corrected TEST-4 source

### Stage 3
- Network/domain: **77/77 PASS**
- Application: **14/14 PASS**
- Reservation/lifecycle/external transactions: **18/18 PASS**
- Caller audit: **15/15 PASS**
- Release-hardening additions: **10/10 PASS**
- Prior Stage-3 manual-feedback regression: **5/5 PASS**
- Build-identification hardening: **8/8 PASS**
- Stage-3 suite total: **147/147 PASS, 0 FAIL**

### Protected Stage 2 canonical gate
- Graph/single-programme: **27/27 PASS**
- Portfolio/scenario: **24/24 PASS**
- Hardening: **19/19 PASS**
- Canonical Stage-2 total: **70/70 PASS, 0 FAIL**

Additional Stage-2 browser-feedback regression suite: **5/5 PASS**.

### Protected Stage 1 gate
- Architecture/read purity: **10/10 PASS**
- Integrity: **17/17 PASS**
- Canonical boundary: **3/3 PASS**
- Functional regression: **16/16 PASS**
- Stage-1 total: **46/46 PASS, 0 FAIL**

Canonical Stage-1/2/3 total: **263 PASS / 0 FAIL**. Including the additional Stage-2 browser-feedback regression suite: **268 PASS / 0 FAIL**.

Structural checks before freeze:
- Root production JavaScript parse: **10/10 PASS**
- `index.html` local script references: **9/9 present**

## Change-boundary evidence versus TEST 3

Runtime comparison against `STAGE3-GITHUB-TEST-3` shows:
- changed runtime integration file: `labos-app-1.0.185.js`;
- unchanged Stage-1 core/state/repository/services, Stage-2 planning kernel files, Stage-3 network module, styles and service worker;
- `index.html`, `index.stage3-edited.html`, and `labos-version.json` changed for TEST-4 checkpoint identification.

This preserves one Stage-2 scheduling authority and one Stage-3 network authority.

## Browser / IndexedDB execution

The Node integrity protection does not provide real browser IndexedDB certification. Previous attempts to automate the static browser tree were restricted by the execution environment. Browser/IndexedDB therefore remains a **manual GitHub Pages gate**, not an automated PASS.

## Stage status

- Stage 1 — COMPLETE / PROTECTED
- Stage 2 — COMPLETE / PROTECTED after controlled reopen + recertification
- Stage 3 — AUTOMATED GATES GREEN / **AWAITING TEST-4 GITHUB MANUAL TEST**
- Stage 4 — NOT STARTED

Do not treat this package as a Stage-3 RC until the GitHub manual test is explicitly accepted.
