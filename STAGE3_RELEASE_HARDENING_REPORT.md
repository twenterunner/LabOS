# LabOS Controlled Rebuild — Stage 3 Release-Hardening Report

Date: 2026-09-19

## Artifact status

This package is a **GitHub Pages manual-test build**, not an accepted Stage-3 RC and not a Stage-4 baseline.

Controlled build identifier: **`STAGE3-GITHUB-TEST-6`**  
Visible browser identifier: **`REV 1.0.185 · S3 TEST`**

Protected accepted baseline remains Stage 2 RC1:
`ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE2_RC1_WEB.zip`  
SHA-256 `830e8b137f5398ff44952e7a54943a5ba4f64ffa993f3c48301774ef1afab6a8`

## Stage-3 release-hardening architecture incorporated

- Controlled sister-lab mutations use Stage-3 proposal/transfer services plus Stage-1 StateTransactionService.
- Whole/partial Prototype and Validation routing use canonical TransferScope/SiteAssignment semantics.
- Effective task/activity feasibility comparison uses NetworkProposalService and the protected Stage-2 PlanningEngine.
- Prototype and Validation share one planned-item interaction and governed partial-routing interaction.
- Historical persisted Validation TESTREQ booking identities are deterministically repaired to stable activity IDs at the Stage-1 canonical boundary; ambiguous/unresolved cases produce structured issues rather than display-name guesses.
- Validation replanning replaces prior active bookings while retaining historical rows, preserving accepted remote SiteAssignments as the single live routing authority.
- Manual-alternative classification is shared between Stage-2 feasible-slot calculation and Validation in-lane rendering; filling a previously unassigned resource does not falsely become a disruptive Yellow option.
- Validation leg/subflow transfer remains supported.
- Requested sister-lab transfers are derived into receiver My Work from canonical network records.
- External execution remains distinct and governed through ExternalExecutionRequest → approval → ExternalOrder.
- Overall / Per programme / Per equipment / Per person remain in one canonical Planning renderer.
- Canonical Planning exposes one whole-demand AUTO PLAN.

Detailed persisted-state correction evidence: `STAGE3_TEST5_PERSISTED_VALIDATION_IDENTITY_CORRECTION_REPORT.md`.

## Fresh automated certification against the corrected TEST-6 functional source

### Stage 1
- architecture/read purity: **10/10 PASS**
- integrity: **17/17 PASS**
- canonical boundary: **3/3 PASS**
- functional: **16/16 PASS**
- total: **46/46 PASS**

### Stage 2
- graph/single-programme: **27/27 PASS**
- portfolio/scenario: **24/24 PASS**
- hardening: **19/19 PASS**
- canonical total: **70/70 PASS**
- browser/planning feedback regression: **5/5 PASS**

### Stage 3
- network/domain: **77/77 PASS**
- application: **14/14 PASS**
- transaction/lifecycle/external: **18/18 PASS**
- caller audit: **15/15 PASS**
- release hardening: **10/10 PASS**
- prior manual-feedback regression: **5/5 PASS**
- Test-4 feedback/persisted-state regression: **9/9 PASS**
- historical Validation identity continuity: **8/8 PASS**

Pre-build-identification aggregate: **277/277 PASS, 0 FAIL**.

The existing Test-4 persisted-state regression briefly exposed a real post-repair Green/Yellow classification defect during final recertification (**8/9 PASS, 1 FAIL**). The test was not weakened. The shared Stage-2 manual-alternative classifier was corrected, after which the suite returned to **9/9 PASS** and all Stage 1/2/3 protection above was rerun.

## Browser / IndexedDB execution

The Node Stage-1 repository tests report IndexedDB unavailable and use the documented in-memory fallback. This is not a browser IndexedDB PASS. GitHub Pages browser testing with the user's existing carried-forward IndexedDB state remains the manual stage gate.

## Stage status

- Stage 1 — COMPLETE / PROTECTED after controlled continuity repair
- Stage 2 — COMPLETE / PROTECTED after controlled Validation replan correction
- Stage 3 — AUTOMATED FUNCTIONAL GATES GREEN / **AWAITING TEST-6 GITHUB MANUAL TEST**
- Stage 4 — NOT STARTED

Do not treat this package as a Stage-3 RC until the GitHub manual test is explicitly accepted.
