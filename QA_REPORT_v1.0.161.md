# LabOS REV 1.0.161 — Validation reset / shared-platform QA

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.161_WEB.zip`  
**Implementation baseline:** clean REV 1.0.151 Prototype release  
**Schema:** 38  
**Objective:** rebuild Validation as a specialisation of the existing LabOS Prototype architecture instead of repairing the separately evolved Validation UI.

## 1. Architecture acceptance

PASS:

- REV 1.0.151 Prototype runtime is the source baseline for the rebuild.
- One canonical LabOS application runtime; there is no standalone Validation mini-application.
- Prototype records are tagged `programmeType = prototype`; Validation uses `programmeType = validation` and domain-specific collections while sharing common LabOS services.
- Prototype and Validation use the same page shell, guided-workspace language, cards, status semantics, Programme Logic canvas renderer, planning vocabulary, constrained planner, equipment/staff/calibration/skill resources, Portfolio, My Work/action mechanism, KPI framework, reporting framework and Archive Manager.
- Validation bookings use canonical LabOS booking/resource constraints and compete with Prototype demand.
- Schema remains 38. Existing schema-38 browser data is accepted; schema 37 → 38 migration is retained and idempotent.

## 2. Requirements → Validation programme

PASS:

- requirements-first programme flow;
- manual requirement entry, pasted structured text and CSV-style intake;
- released Standard Test ranking with coverage and delta context;
- controlled Reuse / Adapt / Combine / Develop-new decisions;
- test-development activity generation where coverage/delta requires it;
- programme legs generated from controlled requirement categories;
- no floating Validation activities;
- dependency-cycle detection;
- requirement → activity → result → evidence RTM roll-up.

Regression fixture: **4 Validation programmes, 14 controlled requirements, 15 programme activities**. All four programme graphs pass structural validation with **0 floating activities**.

## 3. Shared planning / Prototype linkage

PASS:

- existing Prototype canonical planner still schedules baseline Prototype demand;
- Validation AUTO PLAN produces canonical shared-resource bookings;
- Validation bookings are tagged as Validation while retaining the common booking shape;
- linked Prototype movement updates the Validation DUT-available boundary;
- active Validation planning can be rerun from the new DUT boundary;
- sister-lab comparison returns all active network sites and uses the same constrained planning path;
- equipment/staff/calibration/skills/calendar constraints are not duplicated into a separate Validation planner.

## 4. Execution, report and KPI

PASS:

- controlled Validation result/evidence capture;
- mapped requirements become Verified only from recorded passing mapped-test results;
- automatic Validation Report includes controlled programme, requirements, activities, bookings, results, evidence, traceability and audit count;
- Validation KPI aggregation produces selected-period programme load, on-time completion, days late, pass rate, sister-lab use, external-test count and method-development learning metrics;
- existing common KPI framework remains available for Prototype and Validation filtering.

## 5. Shared lessons learned

PASS:

- Validation automatically derives evidence-based learning candidates from controlled programme evidence (including development overruns, failed results, execution-duration deltas, Prototype timing propagation and successful sister-lab recovery patterns).
- Accepted Validation learning is written into the same shared learning pool used by Prototype.
- Validation surfaces relevant accepted Prototype/Validation lessons using product, method/test and requirement/issue similarity.
- Historical lesson decisions are controlled as **Apply / Acknowledge / Dismiss / Convert** with rationale and audit history.
- New Validation learning is controlled as **Accept / Dismiss / Convert to improvement** with rationale.
- Convert creates a controlled improvement proposal/action rather than silently modifying a released Standard Test or process.
- Validation closeout is blocked while automatically detected lesson proposals remain undecided.

Regression fixture demonstrates a Validation programme surfacing an accepted **Prototype** lesson for the same product and recording a controlled application decision.

## 6. Unified Archive Manager

PASS:

- one Archive Manager lists Prototype Builds and Validation Programmes;
- filter by work type and active/archived state;
- archive requires a reason and retains evidence/audit history;
- restore is supported for both programme types;
- Administrator-only permanent deletion is blocked until the configured retention period has elapsed;
- Validation-owned requirements, legs, activities, results, evidence, reports, development/learning applications and improvement records are included in controlled deletion scope.

Rendered-browser acceptance archived and restored `V26-0104` successfully.

## 7. Prototype regression and invariants

Automated integrated regression: **33/33 PASS**.

Includes:

- 24 Prototype requests retained;
- 24 Prototype routes retained;
- 37 equipment records retained;
- 24 staff records retained;
- 10 released/demo Standard Tests retained;
- Prototype canonical planner still schedulable;
- all Validation graphs valid;
- requirement ranking and shared planning;
- Prototype → Validation timing propagation;
- sister-lab comparison;
- RTM/report generation;
- cross-module learning;
- unified archive semantics;
- Validation KPI population;
- application global invariant validation: **0 findings**.

Visual/source regression: **13/13 PASS**, confirming both domains use the same shared canvas root, lane/node components, guided layout, cockpit semantics, page/card language and existing LabOS design variables.

## 8. Rendered browser smoke

Because direct Chromium navigation to localhost is blocked by the execution environment, the final application payload was inlined and injected into an `about:blank` Chromium document through DevTools for a real DOM/render smoke.

PASS:

- application reaches ready state with `ProtoLab.VERSION = 1.0.161-poc`;
- header displays REV 1.0.161;
- Validation portfolio/workspace opens;
- Report & Close renders the RTM and shared Lessons & Reuse workbench;
- relevant Prototype lesson is shown inside Validation;
- learning decision buttons render correctly;
- unified Archive Manager renders both Prototype and Validation records;
- Validation archive → archived state → restore round-trip succeeds;
- no boot-error element is present.

## 9. Static/package gates

PASS before ZIP delivery:

- JavaScript `node --check` for all packaged runtime scripts;
- manifest JSON parse;
- every local `src`/`href` referenced by `index.html` exists;
- visible revision = REV 1.0.161;
- runtime version = `1.0.161-poc`;
- schema = 38;
- no standalone Validation runtime;
- final ZIP extraction and `unzip -t` integrity: PASS.

The delivered runtime ZIP was built from this exact verified REV 1.0.161 working tree.
