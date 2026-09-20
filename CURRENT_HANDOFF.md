# LabOS Current Engineering Handoff

**Read this first in every new chat/session.**  
**Last updated:** 2026-09-20T20:29:28Z  
**Product revision:** `REV 1.0.185`  
**Controlled runtime identity:** `STAGE3-GITHUB-TEST-14`  
**Visible identity:** `REV 1.0.185 · S3 TEST-14`  
**Current open stage:** **Stage 3 of 10 — Network / Sister-Lab Capability**  
**Release state:** **TEST-14 frozen/manual-browser candidate; NOT a Stage-3 RC/protected checkpoint**

## 1. Source-of-truth reading order

1. `CURRENT_HANDOFF.md`
2. `CONTROLLED_REBUILD.md`
3. `LABOS_INVARIANTS.md`
4. `LABOS_ARCHITECTURE.md`
5. `REGRESSION_MATRIX.md`
6. latest relevant entries in `DECISION_LOG.md`
7. `NEW_CHAT_CONTINUITY_PROMPT.md`

Conversation memory is not engineering authority. Repository evidence, package bytes, hashes and completed regression evidence control.

## 2. Controlled rebuild dashboard

| Stage | Status |
|---|---|
| 1. Data & State Integrity | **COMPLETE / PROTECTED — 46/46 current TEST-14 gate PASS** |
| 2. Planning Engine | **COMPLETE / PROTECTED baseline — reopened regression corrected; 77/77 current TEST-14 gate PASS** |
| 3. Network / Sister-Lab Capability | **OPEN / CURRENT STAGE — TEST-14 automated matrix green; manual browser acceptance pending** |
| 4. Readiness Engine | **NOT STARTED** |
| 5. Workflow Engine | **NOT STARTED** |
| 6. Execution & Evidence Engine | **NOT STARTED** |
| 7. Reporting Engine | **NOT STARTED** |
| 8. Lessons Learned Engine | **NOT STARTED** |
| 9. KPI Engine | **NOT STARTED** |
| 10. Tab / UI / UX Review | **NOT STARTED** |

**Stage 4 has not started.**  
**No Stage-3 RC or protected Stage-3 checkpoint exists.**

Deferred Stage-10 requirement: Planning swimlane date/timeline header, lane context and `−`, `+`, `FIT` controls remain deferred until Stage 10 unless an earlier-stage architecture genuinely requires them.

## 3. Frozen baselines

### TEST-13 frozen baseline — physically verified

Package: `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_GITHUB_TEST13_WEB.zip`  
SHA-256: `4a714bac86cb00aa6514c9b1162a14f9944cc93e08a55008da4b830172ca431d`

TEST-13 manual browser acceptance was **REJECTED** because Validation Green bypassed rationale/formal acceptance and a partial Validation planning candidate could remove the rest of the Validation sequence.

### Earlier frozen TEST-12 baseline

Package: `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_GITHUB_TEST12_WEB.zip`  
SHA-256: `e6d896ea12f537699593c3a50631d556300cb3f36f7b87a652eaf036698f92c7`

Earlier historical protected hashes remain documented in historical acceptance evidence.

## 4. TEST-14 automated evidence

Complete current automated matrix:

- Stage 1: **46/46 PASS**
- Stage 2: **77/77 PASS**
- Stage-3 protected/build matrix: **227/227 PASS**
- TEST-13 additional protection: **22/22 PASS**
- TEST-14 Validation governance/completeness protection: **8/8 PASS**

**Controlled total: 380/380 PASS, 0 FAIL.**

Post-identity release gates also pass:

- build identification: **11/11 PASS**
- Test-6 deployment/build guard: **8/8 PASS**
- strengthened TEST-12 manual path: **7/7 PASS**
- TEST-13 command ownership: **4/4 PASS**
- TEST-13 active-site Escalation: **5/5 PASS**
- TEST-13 stale-proposal revalidation: **8/8 PASS**
- TEST-13 Chromium/touch: **5/5 PASS**
- TEST-14 Validation governance/completeness: **5/5 PASS**
- TEST-14 Validation Chromium: **3/3 PASS**

## 5. Accepted TEST-14 corrections

### Stage 2 — Validation Green/Yellow manual governance

Both Validation Green and Yellow manual alternatives use the same rationale-gated canonical acceptance boundary.

Selection alone performs **zero persistence** and no LIVE booking mutation. Empty rationale cannot accept. Explicit rationale + formal Apply commits through:

`PlanningEngine → canonical scenario → PlanningDelta / PlanCommitService → StateTransactionService → exactly one persistence transaction → canonical state → redraw`.

No second Validation planner or direct UI booking mutation is accepted.

### Stage 2 — Validation sequence completeness

`P.validationPlanningCoverageV14` and `P.assertPlanningCandidateCompletenessV14` enforce that a Validation planning candidate contains exactly one active booking for every canonical Validation activity before it may replace LIVE programme bookings.

Reject before commit:

- missing Validation activity;
- duplicate active booking for an activity;
- orphan Validation booking.

Incomplete candidates fail with `PLANNING_CANDIDATE_INCOMPLETE`.

Completeness is enforced after Validation solver output and again at `PlanningDelta.fromCandidate` / commit boundary. A single-test replan may move downstream tests when dependencies/capacity require it, but the remaining Validation sequence may not disappear.

### Preserved TEST-13 corrections

- Planning board context uses `data-canonical-plan-perspective`; only genuine view commands use `data-canonical-plan-view`.
- Progressive manual search preserves Green/Yellow action DOM identity.
- Escalation is scoped to the active laboratory's canonical `PlanningEngine.rows({siteId,...})` population.
- stale sister-lab proposal Refresh preserves governed request identity/scope and renews `expiresAt`; preview/Refresh do not create LIVE SiteAssignments.

## 6. Intended production delta versus frozen TEST-13

Behavioral production changes are limited to:

- `labos-app-1.0.185.js`
- `labos-planning-stage2-1.0.185.js`

`labos-network-stage3-1.0.185.js` is unchanged from frozen TEST-13.

Identity-only changes for TEST-14 are limited to:

- `index.html`
- `index.stage3-edited.html`
- `labos-version.json`
- `labos-planning-stage2-1.0.185.js`
- `labos-planning-worker-1.0.185.js`

Historical TEST-13 reports/package remain immutable rejected-acceptance evidence.

## 7. TEST-14 package identity

Frozen/manual-browser candidate package name:

`ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_GITHUB_TEST14_WEB.zip`

The package-internal copy of this handoff intentionally refers to the external `.sha256.txt` sidecar for the final outer ZIP SHA-256 because an archive cannot contain its own final digest without changing that digest. The repository copy of this file is updated after ZIP creation with the exact outer SHA-256.

**Final outer ZIP SHA-256: see `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_GITHUB_TEST14_WEB.sha256.txt` until the repository copy is finalized after package creation.**

## 8. Manual acceptance still required

TEST-14 is **not Stage-3 acceptance**. Deploy the exact TEST-14 ZIP over the existing site while preserving existing IndexedDB/site data and execute `STAGE3_TEST14_MANUAL_BROWSER_CHECKLIST.md`.

Critical checks include:

- Validation Green opens rationale/formal acceptance before persistence;
- empty rationale cannot accept;
- accepted Validation Green/Yellow commits once and survives refresh/reopen;
- replanning one Validation test retains the entire Validation sequence;
- downstream tests may move but may not disappear;
- Prototype Green/Yellow remain functional;
- Planning touch/pan/view-command behavior remains correct;
- active-site Escalation remains site-specific;
- stale sister-lab proposal Refresh/revalidation remains correct;
- no duplicate bookings or SiteAssignments are introduced.

Any Stage-1/Stage-2/Stage-3 browser failure keeps Stage 3 open and must be reproduced/fixed at the generic owning architecture.

## 9. Exact next safe action

**Deploy and manually browser-test the exact frozen TEST-14 package with existing IndexedDB/site data preserved.** Do not start Stage 4 and do not create a protected Stage-3 checkpoint until all required browser checks pass and the user explicitly accepts Stage 3.
