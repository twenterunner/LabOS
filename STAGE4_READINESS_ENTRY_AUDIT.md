# LabOS Stage 4 Entry Audit — Readiness Engine

**Date:** 2026-09-20  
**Stage:** 4 of 10 — Readiness Engine  
**Position:** **OPEN — ENTRY AUDIT COMPLETE; PRODUCTION IMPLEMENTATION NOT STARTED**  
**Protected baseline:** `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE3_RC1_WEB.zip`  
**Protected SHA-256:** `bb90f0dd8b3951278a7a171301f7e901cd25677ce2dce4bb4187c45882541d24`

## 1. Protected-baseline physical verification

The exact protected Stage-3 RC1 archive was materialized and physically reverified before any Stage-4 source change:

- SHA-256: **PASS** — exact match to protected sidecar;
- ZIP compressed-data integrity: **PASS — zero errors**;
- package manifest: **131/131 PASS**;
- production JavaScript parse: **11/11 PASS**;
- accepted runtime identity present: `STAGE3-GITHUB-TEST-14`;
- accepted visible identity present: `REV 1.0.185 · S3 TEST-14`;
- Stage-4/debug/range-runner artifacts in protected archive: **none found**.

No protected Stage-1/2/3 production source was modified during this entry audit.

## 2. Existing readiness architecture found in the protected source

### 2.1 Legacy Prototype readiness service

`labos-services-1.0.185.js` contains `ReadinessService`. It is Prototype-request specific: `evaluate(requestId)` resolves only `state.requests`. It combines material, process/test release, Control Plan, equipment, people and approval checks into a boolean `ready` result plus `checks`/`issues`.

It is called by Prototype lifecycle/guidance/UI paths, including Build Readiness Review, READY TO BUILD, dashboard/action guidance and the workspace Readiness workbench.

### 2.2 Existing shared resource-readiness primitives

Existing controlled primitives already cover important Readiness dimensions and should be consumed rather than duplicated:

- staff qualification/certificate validity;
- equipment capability and planned-use readiness;
- approved calibration certificate evidence;
- calibration renewal versus evidence-gap distinction;
- maintenance state and scheduled care;
- process/equipment EHS, commissioning and in-house calibration governance;
- material planning/build assessment;
- process/test planning assessment;
- `ResourceCareService` for calibration/maintenance/training scheduling;
- protected Stage-2 `PlanningEngine` resource/capacity feasibility and recovery.

### 2.3 Validation readiness gap

The active Validation workflow is `Test Flow → Resource Plan → Execution → Report & Close`. Its Execution gate is currently blocked by absence of bookings, not by a shared pre-execution readiness assessment. `ReadinessService.evaluate()` does not resolve Validation programme IDs. `validationTechnicalRecordReadinessV169` is post-execution/report technical-record readiness and is not a substitute for pre-execution resource readiness.

### 2.4 Network and external execution boundaries

Stage-3 `SiteAssignmentResolver.siteForTask()` is the protected task-level site authority. `NetworkReadinessGateway` is a site-summary/fingerprint mechanism for network proposal validity, not a task/programme execution-readiness engine. External execution already has governed request/order services and `StateTransactionService` transaction wrappers. Stage 4 must consume these boundaries, not replace them.

## 3. Reproduced / observed defects and gaps

### 3.1 REPRODUCED — Stage-1 read-purity regression in legacy Readiness evaluation

Against an untouched `P.createDemoState()` from protected RC1, evaluating all 32 Prototype requests changed canonical state for **4** requests:

- `P26-1201`
- `P26-1203`
- `P26-1204`
- `P26-1202`

For `P26-1201`, a nominal `ReadinessService.evaluate()` call changed canonical state by adding/normalizing BOM/test/approval data. The observed changes included creation of two test requirements and four approval records with new timestamps.

Root cause in source: `ReadinessService.evaluate()` directly calls mutating `ensureMaterialRequirements`, `ensureTestRequirements`, `ensureApprovalRecords`, and later uses other legacy assessment helpers that may normalize live state. This violates the protected Stage-1 invariant that reads/render paths do not mutate business state.

**Controlled classification:** Stage 1 protected baseline remains protected; the specific read-purity regression is **formally reproduced and narrowly reopened** for correction within the Stage-4 workstream. No Stage-1 redesign is authorized.

### 3.2 OBSERVED STRUCTURAL VIOLATION — Stage-2 planning commit boundary

The Readiness blocker UI contains direct equipment/staff reassignment handlers that mutate live bookings and related route/planning-preference fields, then call persistence directly. This is inconsistent with the protected Stage-2 invariant that UI controls do not directly mutate canonical planning state and that accepted planning changes commit through `PlanningDelta → PlanCommitService → StateTransactionService` exactly once.

**Controlled classification:** this is a **Stage-2 regression candidate identified by source audit**. It is **not yet reopened** in this audit. The first implementation action must add a dedicated failing regression that exercises/proves the effective Readiness reassignment path before any correction is made.

### 3.3 Stage-4 architectural gaps

The current Readiness path also lacks:

- one Prototype + Validation canonical readiness contract;
- deterministic explicit `asOf` context;
- explicit `READY / BLOCKED / WARNING / NOT_APPLICABLE` semantics;
- stable structured blocker codes/entity/site/use-time references;
- task-level assigned-site readiness evaluation for sister-lab work;
- integrated external-execution readiness projection;
- one shared blocker-resolution command boundary instead of UI-specific calculations.

These are Stage-4 responsibilities, not reasons to redesign Stage 1–3.

## 4. Proposed canonical Stage-4 architecture

Create one new Stage-4 canonical Readiness layer, preferably in `labos-readiness-stage4-1.0.185.js`, loaded after protected State/Planning/Network services and before application presentation.

### 4.1 `ReadinessContext`

Deterministic context carrying at minimum:

- explicit `asOf`;
- programme/domain;
- optional task/activity;
- resolved execution site;
- warning thresholds / evaluation mode where needed.

No hidden `now()`/`todayISO()` dependency is allowed when an explicit evaluation date is required.

### 4.2 `ReadinessEngine`

One read-only authority for Prototype and Validation. Domain adapters may compile their different programme/task structures into one assessment contract but must not become separate engines.

The engine should evaluate applicable dimensions including:

- product/scope definition;
- material / DUT / sample readiness;
- canonical plan completeness;
- process/method/test release and governance;
- Control Plan/approval prerequisites where applicable;
- equipment capability, operational/governance state, calibration and maintenance at planned use time;
- staff availability, qualification and training validity at planned use time;
- EHS/commissioning prerequisites through existing controlled governance assessments;
- SiteAssignment/site consistency for sister-lab tasks;
- governed external execution order/readiness where applicable.

### 4.3 `ReadinessAssessment`

Return one deterministic structured projection with at minimum:

- `status`: `READY | BLOCKED | WARNING | NOT_APPLICABLE`;
- `ready` compatibility boolean;
- programme/domain/task/site/as-of context;
- `checks[]`;
- `blockers[]`;
- `warnings[]`;
- `notApplicable[]`.

Each check/blocker should carry a stable code, dimension, status/severity, entity reference, site, planned-use time, owner/action/evidence and machine-readable details.

### 4.4 Pure evaluation + governed mutation boundary

Readiness evaluation is pure. It must not call mutating `ensure...` normalizers on live canonical state. Required compatibility normalization belongs at explicit load/import/write boundaries or must be performed on detached projections.

Readiness-changing actions are commands, not reads:

- equipment/staff replanning delegates to protected `PlanningEngine` and commits through `PlanningDelta / PlanCommitService / StateTransactionService`;
- calibration/maintenance/training actions use the existing resource-care/planning semantics and a governed transaction/audit boundary;
- network task site comes from protected `SiteAssignmentResolver`;
- external execution uses protected Stage-3 external request/order transaction paths.

### 4.5 Compatibility facade

After the canonical engine is green, existing `P.ReadinessService` callers should delegate to it as a compatibility facade instead of retaining a competing readiness authority.

The Prototype and Validation UIs should consume the same structured assessment. Stage 4 must not redesign the overall Workflow Engine; any broader workflow-state redesign remains Stage 5. Validation may be guarded from starting execution by the Stage-4 assessment without changing the Stage-5 workflow architecture.

## 5. Required RED tests before production correction

The next controlled implementation step is test-first. Add failing tests against untouched RC1 that protect:

1. **read purity / determinism** — Prototype and Validation evaluation leaves canonical state byte-identical and gives stable output for the same explicit context;
2. **cross-domain contract** — Prototype and Validation both use one canonical readiness engine;
3. **equipment readiness** — capability, status/governance, calibration evidence/expiry/warnings, maintenance and planned-use time;
4. **people readiness** — availability, skill qualification and training validity/expiry at planned-use time;
5. **material/DUT/sample/process/method/Control Plan/EHS applicability**;
6. **network assigned-site readiness** — remote task evaluated at `SiteAssignmentResolver` site without ownership rewrite;
7. **external execution readiness** — governed request/order state only;
8. **structured status semantics** — READY/BLOCKED/WARNING/NOT_APPLICABLE and explainable stable blockers;
9. **transaction boundary** — readiness-changing commands are atomic, audited and exactly-once persisted;
10. **Stage-2 regression reproduction** — Readiness equipment/staff reassignment cannot directly mutate bookings and must route through the canonical Planning commit architecture.

Do not correct the Stage-2 source path until item 10 fails against the protected baseline and the regression is formally reopened.

## 6. Protected regression gates required after Stage-4 source integration

A Stage-4 candidate must rerun, at minimum:

- complete Stage 1 gate: **46 assertions**;
- complete Stage 2 gate: **77 assertions**;
- complete Stage-3 protected/build gate: **227 assertions**;
- retained TEST-13: **22 assertions**;
- TEST-14 governance/completeness: **8 assertions**;
- current protected total: **380 assertions**;
- production JS parse/reference/build-identification/deployment gates;
- strengthened TEST-12 manual path;
- TEST-13 Chromium/touch and active-site/revalidation protections;
- TEST-14 Validation Chromium/governance protections;
- new Stage-4 unit/architecture/real-state/browser/mobile suites;
- package manifest/hash/temporary-artifact verification before any browser candidate freeze.

Any Stage-1/2/3 regression found by the Stage-4 candidate must be reproduced and corrected only at its protected architectural owner.

## 7. Exact next safe action

**Do not edit production source yet.** First create the Stage-4 RED architecture/purity/boundary regression suites against the untouched protected RC1 baseline. Reproduce the known Readiness read-mutation defect and the direct Readiness planning-reassignment boundary defect in tests, then implement the single canonical Stage-4 Readiness architecture only after those failures are recorded.

Stage 5 remains **NOT STARTED**. The Stage-10 sticky Planning timeline/date/lane/`−`/`+`/`FIT` requirement remains deferred.
