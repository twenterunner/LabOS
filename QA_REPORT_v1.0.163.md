# LabOS REV 1.0.163 — Prototype flow / Validation designer / integrated planning / learning QA

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.163_WEB.zip`  
**Visible revision:** `REV 1.0.163`  
**Runtime:** `ProtoLab.VERSION = 1.0.163-poc`  
**Schema:** `38` — no reset required

## Scope implemented

REV 1.0.163 changes the REV 1.0.162 construction model in four deliberate ways:

1. **Prototype Build:** the visual Programme Builder is removed from the Prototype user experience. Prototype retains the established guided process-flow/workflow, route steps, current yellow action, controls, evidence, approvals, genealogy and planning hand-off.
2. **Validation:** the construction experience is a guided visual Programme Designer following the working LabOS pattern reviewed from the `twenterunner/ReisSlim` repository: programme definition / requirement flowdown → DUT population → standard/adapted/new-test selection → explicit sequential flow / branches / merge → readiness → shared resource planning. Tests remain snapped to controlled legs; there is no floating free-form graph.
3. **Planning:** active Validation programmes are first-class demand in the main Planning workspace. The planner creates Validation bookings in the same constrained booking/resource calendar used by Prototype, equipment, people, calibration, maintenance and closures.
4. **Lessons learned:** every completed Prototype Build and closed Validation Programme creates an automatic structured learning record. A baseline learning record is created even when no material exception occurred. Similar-product learning is surfaced when the next Prototype or Validation work is opened, and Reports includes a consolidated Product Lessons Learned Report with CSV export and print/PDF support.

## Static / syntax gate

- `node --check` passed for every packaged JavaScript file.
- `manifest.webmanifest` parses as valid JSON.
- `index.html` references REV 1.0.163 runtime/style files.
- Visible revision = `REV 1.0.163`.
- Runtime version = `1.0.163-poc`.
- Service-worker deployment reset marker = `1.0.163`.
- Schema remains `38`.

## Model / service regression

Targeted executable model test passed.

Observed fixture result:

- Validation programmes returned by integrated portfolio planner: **4**
- Validation programmes planned: **4**
- Validation programmes blocked: **0**
- Resulting booking domain: **Validation**
- Automatic learning records added during the fixture: **2**
  - Prototype: **PASS**
  - Validation: **PASS**
- Similar-work matching returned exact/similar product history with scored matches.
- Product learning report consolidated both Prototype and Validation history.

The planner test explicitly verifies that Validation uses the existing shared constrained booking model rather than a Validation-only calendar.

## Rendered browser interaction gate

A Chromium/Playwright rendered acceptance run executed **19 / 19 checks successfully, 0 failures**:

1. application boots to `ready`;
2. REV 1.0.163 visible;
3. no runtime errors after boot;
4. Prototype opens the established Build Workflow/process flow;
5. Prototype visual Programme Builder is absent;
6. prior similar-work lessons are surfaced in the Prototype workspace;
7. Validation workspace opens;
8. guided Validation Programme Logic designer renders;
9. designer exposes explicit common-flow / parallel-leg semantics;
10. Validation designer surfaces relevant prior learning;
11. Planning shows an integrated Prototype + Validation portfolio;
12. Planning exposes the Validation-demand planning action;
13. commitment health contains Validation work;
14. Validation planning preview states that the same people/equipment resource pool is used;
15. Product Lessons Learned Report is available;
16. Product Lessons report exposes CSV export;
17. Validation planner returns active programme rows;
18. automatic product report contains captured learning;
19. no runtime errors after all tested interactions.

## Automatic lessons learned behaviour

For a **Prototype closeout**, LabOS captures where available:

- route/process identity;
- actual vs estimated durations;
- duration overruns;
- deviations / quality exceptions;
- failed measurements;
- scrapped samples;
- commitment replans;
- planning booking evidence.

For a **Validation closeout**, LabOS captures where available:

- requirement count / verified coverage;
- Validation tests and test-development activities;
- actual vs estimated execution/development duration;
- failed results and disposition context;
- Prototype-to-Validation timing impact;
- sister-lab/network route used;
- shared planning bookings.

If no material exception exists, LabOS still records a baseline lesson recommending reuse of the released route/test sequence and current planning assumptions.

At the start of subsequent work, matching prioritises:

1. same product;
2. same work type;
3. overlapping processes/tests.

The surfaced lesson can be marked **Reviewed** or **Not applicable** without deleting or rewriting the source evidence.

## Product Lessons Learned Report

Reports now provides a product-scoped combined history containing:

- Prototype learning records;
- Validation learning records;
- recurring recommendations;
- duration-overrun / failure / replan signals;
- source programme/build and date;
- evidence history;
- CSV export;
- browser print / Save as PDF.

## Persistence / compatibility

- Existing schema remains **38**.
- Existing request, programme, route, requirement, genealogy, planning, result, evidence and audit IDs are retained.
- The REV 1.0.162 structured model may remain as compatibility/migration data, but Prototype no longer exposes the visual builder UI.
- Existing accepted lesson records remain supported; automatic V1.0.163 closeout learning is mirrored into the controlled lesson store for reuse by existing learning workflows.

## Scope boundary

This remains a static-browser proof of concept using browser-local persistence. A production multi-user deployment still requires governed backend storage, authentication/authorization enforcement, transactions/concurrency, controlled evidence storage and server-side audit guarantees.
