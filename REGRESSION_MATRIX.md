# LabOS Regression Matrix — TEST-14

This is the canonical automated gate inventory for the current `STAGE3-GITHUB-TEST-14` browser-acceptance candidate. Interrupted/timed-out runs do not count as PASS. Historical reports remain immutable evidence.

## Stage 1 — Data & State Integrity

| Suite | File | Expected | TEST-14 result |
|---|---|---:|---:|
| Architecture/read purity | `qa/stage1-red-tests.js` | 10 | **10/10 PASS** |
| Integrity | `qa/stage1-integrity-tests.js` | 17 | **17/17 PASS** |
| Load/import/reset boundaries | `qa/stage1-boundary-tests.js` | 3 | **3/3 PASS** |
| Functional regression | `qa/stage1-regression.js` | 16 | **16/16 PASS** |

**Stage 1 total: 46/46 PASS.**

## Stage 2 — Planning Engine

| Suite | File | Expected | TEST-14 result |
|---|---|---:|---:|
| Graph/single-programme | `qa/stage2-graph-tests.js` | 27 | **27/27 PASS** |
| Portfolio/scenario | `qa/stage2-portfolio-tests.js` | 24 | **24/24 PASS** |
| Hardening | `qa/stage2-hardening-tests.js` | 19 | **19/19 PASS** |
| Browser/planning | `qa/stage2-browser-feedback-tests.js` | 5 | **5/5 PASS** |
| Real-state AUTO/performance/equivalence | `qa/stage2-test9-performance.js` | 2 | **2/2 PASS** |

Real-state fixture: `/mnt/data/LabOS_backup_2026-09-19_1.0.185_test9state.json`.

**Stage 2 total: 77/77 PASS.**

## Stage 3 — protected/build matrix

| Suite | File | Expected | TEST-14 result |
|---|---|---:|---:|
| Network architecture | `qa/stage3-network-tests.js` | 77 | **77/77 PASS** |
| Application integration | `qa/stage3-app-tests.js` | 14 | **14/14 PASS** |
| Transactions/reservations/lifecycle/external | `qa/stage3-transaction-tests.js` | 18 | **18/18 PASS** |
| Release hardening | `qa/stage3-release-hardening-tests.js` | 10 | **10/10 PASS** |
| Caller/governance audit | `qa/stage3-caller-audit.js` | 15 | **15/15 PASS** |
| Manual feedback | `qa/stage3-manual-feedback-tests.js` | 5 | **5/5 PASS** |
| Validation identity continuity | `qa/stage3-validation-identity-continuity-tests.js` | 8 | **8/8 PASS** |
| Real-state regression | `qa/stage3-realstate-regression-tests.js` | 8 | **8/8 PASS** |
| Test-4 feedback | `qa/stage3-test4-feedback-tests.js` | 9 | **9/9 PASS** |
| Test-6 deployment/build guard | `qa/stage3-test6-feedback-tests.js` | 8 | **8/8 PASS** |
| Test-8 static | `qa/stage3-test8-feedback-tests.js` | 11 | **11/11 PASS** |
| Test-8 dynamic | `qa/stage3-test8-feedback-dynamic-tests.js` | 6 | **6/6 PASS** |
| Test-9 static | `qa/stage3-test9-feedback-tests.js` | 7 | **7/7 PASS** |
| Test-9 dynamic | `qa/stage3-test9-feedback-dynamic-tests.js` | 4 | **4/4 PASS** |
| Test-11 shared governed boundary/manual | `qa/stage3-test11-manual-feedback-tests.js` | 3 | **3/3 PASS** |
| Test-11 exact partial Validation in-lane | `qa/stage3-test11-inlane-commit-test.js` | 1 | **1/1 PASS** |
| Test-11 rollback/Prototype | `qa/stage3-test11-rollback-prototype-tests.js` | 2 | **2/2 PASS** |
| Test-11 Yellow/Red | `qa/stage3-test11-yellow-red-tests.js` | 3 | **3/3 PASS** |
| Strengthened Test-12 persisted-state/manual path | `qa/stage3-test12-manual-browser-path-tests.js` | 7 | **7/7 PASS** |
| Build identification | `qa/stage3-build-identification-tests.js` | 11 | **11/11 PASS** |

**Stage-3 protected/build total: 227/227 PASS.**

Historical Test-11 implementation-detail assertions that required immediate Validation commit were strengthened after TEST-13 acceptance rejected that behavior. Current Test-11 protection requires common rationale governance, canonical Stage-2 commit, exactly-once persistence and complete Validation sequence retention.

## TEST-13 additional protection retained in TEST-14

| Suite | File | Expected | TEST-14 result |
|---|---|---:|---:|
| Planning command ownership | `qa/stage3-test13-command-ownership-tests.js` | 4 | **4/4 PASS** |
| Active-site Escalation | `qa/stage3-test13-escalation-site-scope-tests.js` | 5 | **5/5 PASS** |
| Expiry/revalidation lifecycle | `qa/stage3-test13-expiry-revalidation-tests.js` | 8 | **8/8 PASS** |
| Chromium mobile/touch | `qa/stage3-test13-browser-command-ownership.py` | 5 | **5/5 PASS** |

**TEST-13 additional total retained: 22/22 PASS.**

## TEST-14 Validation governance/completeness protection

| Suite | File | Expected | TEST-14 result |
|---|---|---:|---:|
| Validation manual governance/completeness | `qa/stage3-test14-validation-manual-governance-tests.js` | 5 | **5/5 PASS** |
| Validation Chromium governance | `qa/stage3-test14-validation-browser.py` | 3 | **3/3 PASS** |

**TEST-14 additional total: 8/8 PASS.**

## Controlled automated total

**380/380 PASS, 0 FAIL** = 46 Stage 1 + 77 Stage 2 + 227 Stage-3 protected/build + 22 retained TEST-13 + 8 TEST-14.

## Manual acceptance gate

Automated green status does not close Stage 3. `STAGE3_TEST14_MANUAL_BROWSER_CHECKLIST.md` remains **MANUAL PENDING** against the exact frozen TEST-14 ZIP with existing IndexedDB/site data preserved.
