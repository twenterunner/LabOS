# LabOS Stage 3 — TEST 6 Package Freeze Report

Date: 2026-09-19

Controlled build: **STAGE3-GITHUB-TEST-6**  
Visible browser identifier: **REV 1.0.185 · S3 TEST**  
Product revision: **1.0.185**

## Freeze scope

This is a GitHub Pages manual-test package freeze only. It is **not** a Stage-3 RC and does not start Stage 4.

The frozen source includes the controlled Stage-1/Stage-2/Stage-3 continuity correction discovered by TEST 5 browser feedback:

- deterministic canonical repair of historical Validation `TESTREQ-<programme>-<standard-test>` booking identities to stable Validation activity IDs;
- structured unresolved/ambiguous integrity issues instead of display-name guessing;
- persisted repaired identity survives save/reload;
- Validation replanning replaces prior active bookings while retaining historical rows so accepted partial SiteAssignments remain the single live routing authority;
- common Stage-2 manual-alternative classification treats filling a previously unassigned resource as ordinary feasible planning and reserves Yellow for displacement/readiness changes;
- Validation manual replanning and task-level sister-lab routing consume the repaired stable activity identity through the existing Stage-2 PlanningEngine and Stage-3 NetworkProposalService/NetworkTransferService paths.

Detailed correction evidence: `STAGE3_TEST5_PERSISTED_VALIDATION_IDENTITY_CORRECTION_REPORT.md`.

## Fresh completed protection before freeze

### Stage 1
- architecture/read purity: 10/10 PASS
- integrity: 17/17 PASS
- canonical boundary: 3/3 PASS
- functional: 16/16 PASS
- total: **46/46 PASS**

### Stage 2
- graph: 27/27 PASS
- portfolio/scenario: 24/24 PASS
- hardening: 19/19 PASS
- canonical total: **70/70 PASS**
- browser/planning feedback: **5/5 PASS**

### Stage 3
- network/domain: **77/77 PASS**
- application: **14/14 PASS**
- transaction/lifecycle/external: **18/18 PASS**
- caller audit: **15/15 PASS**
- release hardening: **10/10 PASS**
- prior manual feedback: **5/5 PASS**
- TEST-4 feedback / persisted-state integration: **9/9 PASS**
- historical Validation identity continuity: **8/8 PASS**

### Build / structural
- controlled build identification: **8/8 PASS**
- root production JavaScript: **10/10 parse**
- local `index.html` script references: **9/9 present**

Current controlled-suite aggregate including build identification: **285/285 PASS, 0 FAIL**.

The historical identity regression deliberately failed against unmodified TEST 5 before correction. During final recertification the existing TEST-4 persisted-state suite also caught an overly conservative Green/Yellow classification after the active-booking correction (8/9 PASS, 1 FAIL). That test was not weakened; the shared Stage-2 classifier was corrected and the suite returned to 9/9 PASS, followed by fresh Stage-1/Stage-2/Stage-3 recertification.

## Browser / IndexedDB note

The Node Stage-1 repository tests use the documented in-memory fallback when IndexedDB is unavailable. Real browser/IndexedDB continuity must be tested on GitHub Pages **without resetting the user's existing LabOS IndexedDB state**.
