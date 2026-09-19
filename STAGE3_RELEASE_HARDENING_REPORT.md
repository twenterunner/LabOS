# LabOS Controlled Rebuild — Stage 3 Release-Hardening Report

Date: 2026-09-19

## Artifact status

This package is a **GitHub Pages manual-test build**, not an accepted Stage-3 RC and not a Stage-4 baseline.

Protected accepted baseline remains:
- `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE2_RC1_WEB.zip`
- SHA-256 `830e8b137f5398ff44952e7a54943a5ba4f64ffa993f3c48301774ef1afab6a8`

Stage-3 source used for hardening:
- `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_WIP1_WEB.zip`
- SHA-256 `67ed14bfb0f613385a5f0bca61530a2d745795371db251fa6b62ccff8c751ec3`

## Release-hardening corrections

1. Scenario Lab sister-lab submission now delegates to the canonical Stage-3 network transaction boundary instead of directly appending business state and calling persistence.
2. Scenario Lab external alternatives can no longer be applied directly to LIVE state.
3. External execution now follows the distinct governed path: `ExternalExecutionRequest` -> commercial approval -> `ExternalOrder`, each through `StateTransactionService`.
4. Pending external commercial approvals are derived into My Work from canonical external state.
5. Added dedicated Stage-3 release-hardening regression coverage for the above authority/rollback paths.

## Fresh automated certification against this exact production source

### Stage 3
- Network/domain: **77/77 PASS**
- Application: **14/14 PASS**
- Reservation/lifecycle/external transactions: **18/18 PASS**
- Caller audit: **15/15 PASS**
- Release-hardening additions: **10/10 PASS**
- Stage-3 total: **134/134 PASS, 0 FAIL**

### Protected Stage 2 regression
- Graph/single-programme: **27/27 PASS**
- Portfolio/scenario: **24/24 PASS**
- Hardening: **19/19 PASS**
- Stage-2 total: **70/70 PASS, 0 FAIL**

### Protected Stage 1 regression
- Architecture/read purity: **10/10 PASS**
- Integrity: **17/17 PASS**
- Canonical boundary: **3/3 PASS**
- Functional regression: **16/16 PASS**
- Stage-1 total: **46/46 PASS, 0 FAIL**

Combined Stage-1/2/3 automated assertions: **250 PASS / 0 FAIL**.

Structural checks:
- Root production JavaScript parse: **10/10 PASS**
- `index.html` local script references: **9/9 present**

## Browser / IndexedDB execution

Real Chromium execution was attempted against the static tree, including a direct `file://` navigation. The execution environment blocked the navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore browser/IndexedDB is **NOT EXECUTABLE in the current tool environment**, not PASS and not FAIL.

The GitHub Pages manual test is therefore a mandatory final human stage gate before accepting Stage 3 or moving to Stage 4.

## Performance evidence

Measurements only; no arbitrary threshold was invented:
- Whole Prototype network proposal: 281.99 ms
- Partial Prototype network proposal: 203.83 ms
- Whole Validation network proposal: 246.04 ms
- Governed whole Prototype request + acceptance: 891.03 ms
- External request + commercial approval: 273.47 ms
- NetworkRecordAdapter normalization of 1,000 records: 0.957 ms

See `qa/STAGE3_PERFORMANCE_FINAL.json`.

## Stage status

- Stage 1 — COMPLETE / PROTECTED
- Stage 2 — COMPLETE / PROTECTED
- Stage 3 — AUTOMATED RELEASE HARDENING GREEN / **AWAITING GITHUB MANUAL TEST**
- Stage 4 — NOT STARTED

Do not treat this package as a Stage-3 RC until the GitHub manual test is accepted explicitly.
