# LabOS Stage 3 — TEST-13 Correction Evidence Report

**Product revision:** 1.0.185  
**Controlled build:** `STAGE3-GITHUB-TEST-13`  
**Visible identity:** `REV 1.0.185 · S3 TEST-13`  
**Status:** GitHub/manual-browser acceptance package; **NOT a Stage-3 RC or protected checkpoint**  
**Stage 4:** not started

## 1. Scope of TEST-13

TEST-13 is a controlled correction build created after TEST-12 browser feedback. It preserves the protected Stage-1/Stage-2 architecture and keeps Stage 3 open for manual acceptance.

Three generic architectural corrections are covered:

1. **Stage 2 — Green/Yellow manual-replan command ownership and touch stability.**
2. **Stage 3 — site-scoped Escalation Mode.**
3. **Stage 3 — governed stale/expired sister-lab proposal revalidation.**

No alternate planner, Validation-only scheduler, direct UI booking mutation, alternate persistence path or separate sister-lab scheduler was introduced.

## 2. Stage-2 manual Green/Yellow correction

TEST-12 could render Green/Yellow alternatives but a tap/click could be interpreted as a Planning-view command because the Planning board itself carried the command attribute `data-canonical-plan-view`. The resulting render caused the observed **tap → screen flash → no governed manual action** symptom.

TEST-13 separates state and command ownership:

- Planning board context uses `data-canonical-plan-perspective`.
- Only genuine Planning view controls use `data-canonical-plan-view`.
- Progressive manual-search rendering reconciles discovered options by stable key so an action node is retained across progress updates rather than destroyed/recreated during a touch gesture.

Canonical commit architecture remains:

`Green/Yellow selection → shared PlanningEngine → governed reason/confirmation → canonical scenario/candidate → PlanCommitService → StateTransactionService → exactly one persistence transaction → canonical state → redraw`.

### Regression evidence

- `qa/stage3-test12-manual-browser-path-tests.js`: **7/7 PASS**
  - Prototype Green exactly-once commit.
  - Prototype Yellow confirmation-gated exactly-once commit.
  - Validation Green exactly-once commit.
  - Validation Yellow confirmation-gated exactly-once commit.
  - cross-domain capacity remains protected.
- `qa/stage3-test13-command-ownership-tests.js`: **4/4 PASS**.
- `qa/stage3-test13-browser-command-ownership.py`: **5/5 PASS** in real Chromium mobile/touch execution.

The Chromium gate proves the same Green/Yellow DOM node survives progressive refresh, real touch reaches the governed action, the manual action does not change Planning perspective, and genuine view controls still work.

## 3. Stage-3 active-site Escalation Mode

The Escalation population previously lacked an explicit active-laboratory scope through chooser → analysis → review. TEST-13 uses the canonical Planning population for the active lab:

`active site → PlanningEngine.rows({siteId, domain:'all', filter:'all'}) → active-site programme IDs → Escalation chooser → target-first analysis with explicit siteId/requestIds → review/commit restricted to the same site population`.

Prototype and Validation are both included through the common PlanningEngine population.

### Regression evidence

`qa/stage3-test13-escalation-site-scope-tests.js`: **5/5 PASS**.

It proves LAB-NL, LAB-DE and LAB-US resolve their own programme populations, Prototype and Validation share the canonical population, and Escalation request IDs exactly equal the canonical active-site rows.

## 4. Stage-3 expired proposal revalidation

Proposal `expiresAt` is treated as bounded proposal validity, not automatic destruction of the formal governed request.

Controlled lifecycle:

`Requested/UnderReview → proposal validity elapsed → NETWORK_REVALIDATION_REQUIRED → read-only exact-scope preview → receiver Refresh or Reject → Refresh stores fresh proposal/fingerprints/reservation windows/new expiresAt on the same formal request → fresh receiver decision → final live revalidation → atomic acceptance only if currently feasible`.

A final regression exposed that Refresh initially failed to copy the refreshed proposal's `expiresAt` to the request. TEST-13 corrects this at `NetworkTransferService.refresh()`. A successful governed Refresh therefore actually creates a fresh validity window rather than immediately re-entering revalidation.

No LIVE SiteAssignment is created by stale detection, preview or Refresh.

### Regression evidence

- `qa/stage3-test13-expiry-revalidation-tests.js`: **8/8 PASS**.
- `qa/stage3-network-tests.js`: **77/77 PASS**, including the strengthened expired-proposal invariant.
- persisted `P26-1009` coverage enters governed revalidation rather than terminal `NETWORK_REQUEST_EXPIRED`.

## 5. Fresh automated regression position

All required behavioral/build suites completed after the relevant corrections. Long suites were executed in deterministic completed ranges; interrupted/timed-out invocations were not counted as PASS.

### Stage 1 — 46/46 PASS

- architecture/read purity: 10/10
- integrity: 17/17
- canonical boundaries: 3/3
- functional regression: 16/16

### Stage 2 — 77/77 PASS

- graph/single-programme: 27/27
- portfolio/scenario: 24/24
- hardening: 19/19
- browser/planning feedback: 5/5
- real-state AUTO/performance/equivalence: 2/2

### Stage 3 protected historical matrix — 227/227 PASS including identity/deployment gates

- Network: 77/77
- Application: 14/14
- Transactions/reservations/lifecycle/external: 18/18
- Release hardening: 10/10
- Caller/governance audit: 15/15
- Manual feedback: 5/5
- Validation identity continuity: 8/8
- real-state continuity: 8/8
- Test-4: 9/9
- Test-6 build/deployment guard: 8/8
- Test-8 static: 11/11
- Test-8 dynamic: 6/6
- Test-9 static: 7/7
- Test-9 dynamic: 4/4
- Test-11 shared-boundary/manual: 3/3
- Test-11 exact in-lane partial Validation: 1/1
- Test-11 rollback/Prototype: 2/2
- Test-11 Yellow/Red: 3/3
- Test-12 persisted-state/manual-browser path: 7/7
- build identification: 11/11

### TEST-13 additional regression — 22/22 PASS

- command ownership: 4/4
- active-site Escalation scope: 5/5
- expiry/revalidation lifecycle: 8/8
- Chromium mobile/touch: 5/5

### Controlled automated total

**372/372 PASS, 0 FAIL.**

This total extends the frozen TEST-12 350/350 matrix with 22 TEST-13 assertions; historical TEST-12 reports remain unchanged.

## 6. Manual acceptance still required

Automated/structural evidence does **not** complete Stage 3. The exact TEST-13 ZIP must be deployed while preserving the user's existing IndexedDB/site data and manually verified using `STAGE3_TEST13_MANUAL_BROWSER_CHECKLIST.md`.

Stage 3 remains **OPEN** until explicit user acceptance. No Stage-3 protected checkpoint or Stage 4 work is authorized yet.
