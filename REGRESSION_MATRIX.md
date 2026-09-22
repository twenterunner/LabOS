# LabOS Regression Matrix — Stage-4 Browser Candidate

Candidate: `STAGE4-GITHUB-TEST-1` / `REV 1.0.185 · S4 TEST-1`  
Protected baseline: Stage-3 RC1, SHA-256 `bb90f0dd8b3951278a7a171301f7e901cd25677ce2dce4bb4187c45882541d24`.

Interrupted/timed-out runs are not PASS. Only completed invocations/ranges below are counted.

## Protected Stage 1

- `qa/stage1-red-tests.js` — **10/10 PASS**
- `qa/stage1-integrity-tests.js` — **17/17 PASS**
- `qa/stage1-boundary-tests.js` — **3/3 PASS**
- `qa/stage1-regression.js` — **16/16 PASS**

**Stage 1: 46/46 PASS.**

## Protected Stage 2

- graph/single-programme — **27/27 PASS**
- portfolio/scenario — **24/24 PASS**
- hardening — **19/19 PASS**
- browser/planning — **5/5 PASS**
- real-state performance/equivalence — **2/2 PASS**

**Stage 2: 77/77 PASS.**

## Protected Stage 3 core/build

- network architecture **77/77**
- app integration **14/14**
- transactions/reservations/lifecycle/external **18/18**
- release hardening **10/10**
- caller/governance audit **15/15**
- manual feedback **5/5**
- Validation identity continuity **8/8**
- real-state regression **8/8**
- Test-4 **9/9**
- Test-6 deployment/build **8/8**
- Test-8 static/dynamic **17/17**
- Test-9 static/dynamic **11/11**
- Test-11 protected paths **9/9**
- Test-12 persisted/manual path **7/7**
- Stage-3 build identification **11/11** (pre Stage-4 identity assignment)

**Stage-3 core/build: 227/227 PASS.**

Retained TEST-13:
- command ownership **4/4**
- active-site Escalation **5/5**
- stale proposal expiry/revalidation **8/8**
- Chromium mobile/touch **5/5**

**TEST-13: 22/22 PASS.**

TEST-14:
- Validation manual governance/completeness **5/5**
- Validation Chromium **3/3**

**TEST-14: 8/8 PASS.**

**Protected controlled total: 380/380 PASS, 0 FAIL.**

## Stage 4 — Readiness Engine

- `qa/stage4-readiness-red-tests.js` — **12/12 PASS** after RED baseline was recorded
- `qa/stage4-readiness-boundary-red-tests.js` — **3/3 PASS** after Stage-2 bypass reproduction/correction
- `qa/stage4-readiness-realstate-tests.js` — **4/4 PASS** on persisted-state export
- `qa/stage4-readiness-browser.py` — **9/9 PASS** in Chromium/mobile actual runtime
- `qa/stage4-build-identification-tests.js` — **11/11 PASS** after `STAGE4-GITHUB-TEST-1` identity assignment
- production JavaScript parse — **11/11 PASS**
- runtime script existence/build-key/module-order checks — **PASS**

## Controlled QA fixture notes

- Test-11 rollback fixture: the old 45-day Green search stopped reaching a valid alternative as relative demo dates advanced. The same failure reproduced on protected RC1. QA fixture now uses the canonical planning horizon; rollback/atomicity/Green assertions are unchanged.
- TEST-13 Chromium fixture: old `P26-1007-S2` no longer produced both Green and Yellow alternatives. The same failure reproduced on protected RC1. Fixture moved to deterministic `P26-1006-S2`; the five interaction/governance assertions are unchanged.
- Stage-4 browser Prototype render test uses the actual detached production render boundary. A legacy QA `show()` helper was not used because it invokes `buildGuidedSteps()` on live state before render and is not the production render boundary.

## Manual acceptance

Stage 4 remains **OPEN / NOT PROTECTED**. The exact frozen `STAGE4-GITHUB-TEST-1` package must pass `STAGE4_MANUAL_BROWSER_CHECKLIST.md` and receive explicit user acceptance before any Stage-4 RC/protected checkpoint exists.
