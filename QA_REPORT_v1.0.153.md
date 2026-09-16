# LabOS REV 1.0.153 — QA Report

**Release:** LabOS REV 1.0.153  
**Schema:** 38  
**Baseline:** REV 1.0.152 released package, preserving the populated REV 1.0.151 → 1.0.152 Validation data model migration  
**Scope:** Unified Prototype + Validation planning UI, common Validation request intake, and cross-module Validation process-flow integration/hardening.

## Release decision

**PASS — release candidate accepted for the static-browser PoC.**

REV 1.0.153 closes the main REV 1.0.152 UI integration gap: Validation work is no longer shown as a separate table in Master Planner. Prototype and Validation now use the same graphical timeline renderer and common booking/resource model. Validation also enters through the common Requests front door and is integrated into My Work, Reports, Sample & Serial History and Help.

No new schema migration is required. Schema remains **38**; the historical schema 37 → 38 migration correctly remains attributed to REV 1.0.152.

## Master Planner / swimlane integration

PASS:

- **All** domain renders Prototype and Validation work on the same graphical swimlane timeline.
- **Validation** domain remains graphical; it no longer falls back to a bookings table.
- Validation bars use canonical shared bookings from `state.bookings` and therefore consume the same people/equipment capacity as Prototype.
- Prototype bars remain visible in the combined view.
- per-programme Validation view renders schedulable programme nodes as individual lanes.
- equipment view remains graphical and includes shared work plus resource-care reservations.
- people view uses the same common work/resource context.
- calibration / maintenance / training reservations remain available in shared resource views.
- clicking a Validation booking opens the exact controlled Validation programme in **Resource Plan** and retains the selected test/node.
- sister-lab execution site remains part of the booking/node model used by the graphical planner.
- mobile planner renders and supports horizontal timeline navigation.

Browser acceptance observed Validation and Prototype bars together in the All view with zero page/console errors.

## Validation request front door

PASS:

- **Request Validation** is available from the common Requests front door.
- the Prototype request queue header also provides the cross-workstream **Request Validation** action for authorised roles.
- authorised roles include Engineering Requester, Engineering Lead, Lab Planner, Process Engineer, Validation Engineer, Lab Manager and Administrator.
- request modal captures DV/PV, product, Business Unit, home lab, required completion, DUT quantity, controlled specification ID/revision, requesting team and optional Prototype source.
- creating a Validation request creates the controlled programme, initial leg, source/start/end nodes and expected DUT records.
- request creation writes audit history.
- successful creation opens the graphical Programme Builder rather than leaving the user in a table/form workflow.

End-to-end browser test: Validation programme count **10 → 11**, builder opened, and audit event was present.

## Validation portfolio / navigation

PASS:

- DV / PV filter chips are functional rather than decorative.
- tested DV filtering reduced the displayed set from 10 to 7 programmes.
- Validation is shown as an operational workstream on the Requests front door; stale “future Validation” messaging is no longer shown in primary application views.
- primary audited views — Dashboard, Requests, Prototype queue, Validation, Planning, Sample & Serial History, Reports, Management/KPI and Help — rendered without browser errors.
- Failure Analysis remains correctly identified as the future domain.

## My Work / Action Centre

PASS:

- Validation actions participate in the existing Action Centre rather than a separate Validation task list.
- ownership evaluates the common user/role model, including the new **Validation Engineer** role.
- Validation actions close dynamically when their underlying controlled condition is resolved instead of remaining stale.
- Open action routes to the correct programme and relevant workspace: Requirements, Builder, Resource Plan, Execution or Report.
- Lab Planner browser test exposed an applicable Validation action and opened the exact programme.

## Reports and genealogy integration

PASS:

- common Reports workspace includes controlled Validation report records.
- report cards expose programme, stage, revision, owner and approval state and route to the controlled Validation report.
- Sample & Serial History includes Validation DUT genealogy for the active laboratory.
- Validation DUT records retain programme/source/revision/configuration/condition/status context and open the controlled genealogy view.

## Validation planning regression

PASS — canonical Validation planning remains operational after the UI consolidation.

Representative three-leg programme `V26-0032`:

- planner result: feasible
- shared Validation bookings created: **6**
- planning failures: **0**
- forecast: **22 Sep 2026**
- days late: **0**
- critical-path activities: **6**

All 10 seeded Validation demo programme graphs passed graph-integrity validation with no graph errors.

## Prototype regression

The REV 1.0.153 integration changes were checked against the retained Prototype regression hooks.

PASS:

- REV 1.0.142 workflow liveness across **22** populated Prototype builds — 0 failures.
- REV 1.0.142 stale-state/fault reconciliation.
- REV 1.0.142 stage idempotence across **22** builds.
- REV 1.0.142 serial identity stability and duplicate-serial rejection.
- REV 1.0.143 workflow audit across **22** builds — 0 failures.
- REV 1.0.144 Control Plan/material-gate self-test.
- REV 1.0.145 load-balance/self-healing test.
- REV 1.0.146 Control Plan/action-workflow self-test.
- REV 1.0.147 review-before-approval hook remains present.
- REV 1.0.148 canonical resource semantics: optical-inspection compatibility PASS and no direct resource-semantic logic leaks reported by the hook.
- global `validateInvariants` returned **0** issues on the release demo state.

## KPI regression

PASS:

- REV 1.0.151 KPI definition layer remains available: **42** definitions.
- Management/KPI view rendered in browser acceptance without console/page errors.
- Prototype and Validation remain on the common KPI framework; no separate Validation-only KPI engine was introduced.
- Failure Analysis remains a reserved future domain and no FA production values are fabricated.

## Schema / existing-state compatibility

PASS:

A populated schema-38 state was round-tripped through the REV 1.0.153 `MigrationService`:

- schema before: 38
- schema after: 38
- Prototype request IDs preserved
- Validation programme IDs preserved
- booking IDs preserved
- second migration pass did not duplicate Prototype requests
- second migration pass did not duplicate Validation programmes

REV 1.0.153 therefore requires **no Reset Demo Data** and no new schema migration.

## Desktop / mobile UI checks

Desktop PASS:

- common Requests front door
- Validation portfolio filtering
- shared All planner
- graphical Validation-only planner
- equipment planner
- central Validation reports
- shared Validation DUT genealogy
- exact planner-bar navigation
- zero page/console errors in tested flows

Mobile PASS at 390 × 844:

- REV 1.0.153 revision badge source is correct
- Request Validation entry available
- graphical Programme Builder available
- phone **Add step** flow available
- explicit Earlier / Later node reorder controls available
- shared Master Planner rendered
- horizontal timeline behavior retained
- zero page/console errors

## UI / process-flow audit

The audit specifically checked for the issues most likely to arise when a new domain is added to an older Prototype-centric shell:

- stale “future Validation” labels in operational views
- Validation-only tables where a common graphical planner should be used
- filters that render but do not change data
- bookings that cannot navigate to their controlled source record
- Validation actions that are invisible because ownership assumes Prototype `requestId`
- Validation actions that route only to a generic portfolio instead of the required step
- reports isolated from the common Reports workspace
- DUT genealogy isolated from Sample & Serial History
- readiness blockers that explain a problem but do not give a resolution path
- mobile builder dependence on desktop drag gestures

No release-blocking issue remained in the audited primary flows after the REV 1.0.153 fixes.

## Static release checks

PASS:

- `node --check` for every REV 1.0.153 JavaScript release file.
- manifest JSON parse.
- every local asset referenced by `index.html` exists.
- visible revision reference is **REV 1.0.153**.
- runtime `ProtoLab.VERSION` is **1.0.153-poc**.
- current runtime/style filenames use **1.0.153**.
- service-worker deployment-reset marker updated to 1.0.153.
- README identifies REV 1.0.153 / schema 38 and documents the unified planner/request changes.
- current User Manual identifies REV 1.0.153.

## Release contents / naming

Required release name:

`ProtoLabOS_Prototype_Build_POC_v1.0.153_WEB.zip`

Required QA report:

`QA_REPORT_v1.0.153.md`

Final packaging: **PASS**. The release payload contains 26 archive entries (including the `assets/` directories), current REV 1.0.153 runtime/style files, current documentation/assets and this QA report. No REV 1.0.151/1.0.152 runtime file and no older QA report is included. The packaged ZIP was extracted into a clean directory, all extracted JavaScript files passed `node --check`, `unzip -t` reported no compressed-data errors, and the exact extracted payload passed the browser UI smoke suite with zero page/console errors.

## Environment note

Browser interaction tests load the exact release HTML/CSS/JS assets directly into Chromium. The execution environment previously blocks localhost/127.0.0.1 browser navigation by administrator policy, so no new localhost-hosted pass is claimed here. This does not alter the static asset, JavaScript, interaction or ZIP-integrity checks.

## Scope boundary

LabOS remains a static-browser proof of concept using browser-local persistence. A production multi-user deployment still requires governed backend storage, authentication/authorization enforcement, controlled evidence storage, concurrency/transaction handling and server-side audit guarantees. Failure Analysis remains the next future common-services domain.
