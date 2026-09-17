# LabOS REV 1.0.182 — release QA

## Release purpose

REV 1.0.182 is a regression-recovery and architecture consolidation release. The Overall Planning page now renders from the generic `PlanningEngine` rather than a project-specific patch path. Prototype and Validation use the same feasibility/planning model for AUTO-PLAN, manual slot search, local recovery, sister-lab comparison and receiving-lab revalidation.

## Planning architecture checks

Executable tests loaded the **actual packaged** `labos-core`, demo data, services and `labos-planning-1.0.182.js` files.

- Planning engine contains **0 hard-coded `P26-…` or `V26-…` IDs**.
- Selected-lab Overall population: 11 open programmes in the test fixture.
- Tile filters return distinct canonical populations: All 11; With bookings 5; Validation planned 1; Active situations 0; Forecast late 2; Commitment movement 6.
- Domain filter reconciles exactly: All 11 = Prototype 8 + Validation 3.
- Prototype AUTO-PLAN produced a complete 8-booking feasible plan.
- Validation AUTO-PLAN produced a complete 4-booking feasible plan.
- Prototype sister-lab comparison found a feasible LAB-DE alternative with 8 controlled bookings.
- Validation sister-lab comparison found a feasible LAB-DE alternative with 4 controlled bookings.
- Prototype manual slot search returned Green / Yellow / Red alternatives (2 / 3 / 3 in the fixture).
- Validation manual slot search returned feasible Yellow plus blocked Red alternatives (3 / 3 in the fixture); Green is only shown when the same controlled resources remain feasible.
- Local Optimize Recovery was verified to stay in the current lab while Compare Sister Labs returned independent network alternatives.

## Sister-lab governance

The generic transfer API was exercised for both domains:

1. A feasible sister-lab scenario was calculated.
2. `requestSisterLab()` created a **Requested** transfer and did **not** move LIVE work.
3. The receiving-lab context then called `acceptSisterLab()`.
4. The candidate was recalculated against current target-lab constraints before commit.
5. The transfer became **Accepted** and execution moved to the receiving lab.

The Overall Planning UI exposes pending requests as **SISTER-LAB REQUEST / APPROVAL**. Incoming requests provide **Accept & revalidate** and **Reject** actions; outgoing requests remain **Awaiting receiving lab**. Validation programme-level “Compare sites” now uses the same request/acceptance boundary instead of directly changing execution lab.

## Overall Planning renderer checks

The actual packaged `renderCanonicalPlanning()` function was executed in a JavaScript harness against a real demo state. The generated HTML was asserted to contain:

- exactly six Planning filter tiles;
- All / Prototype / Validation filters;
- − / + / FIT controls;
- the independent `canonical-plan-scroll` timeline container;
- clickable `data-plan-booking` bars for manual replanning;
- separate **Optimize recovery** and **Compare sister labs** actions;
- formatted fixed project cells using `canonical-project-top`;
- Validation Archive Manager access.

Each tile was rendered independently and the number of actual project lane buttons matched the canonical filtered programme model. The no-match state renders only an empty message, not an unrelated programme.

Pointer-drag horizontal panning and Shift+wheel horizontal scrolling are installed on the independent Overall timeline. Per-programme / per-equipment / per-person views continue to use their established renderer because those views were not the reported regression.

## Build workflow regression checks

A real demo build with **Engineering supplied** material and a known future delivery date was used. The material assessment reported:

- planning timing known: **true**;
- physical build readiness: **false**;
- material committed/complete: **false**.

The Build Workflow Materials step therefore remained incomplete. A future availability promise is no longer interpreted as “all material provided”.

A second build with a technically complete route/method definition but no explicit controlled Process & Methods review was tested. The final workflow reported:

- Process & Methods technical definition ready: **true**;
- explicit definition-fingerprint confirmation: **false**;
- Process & Methods state: **current**;
- downstream Planning state: **pending**.

The Process & Methods page contains an explicit **Confirm Process & Methods** action. The confirmation stores a fingerprint of the controlled route/test definition, so a later method/route change invalidates it automatically.

## Selected-lab Audit and KPI checks

Audit scope was executed independently for LAB-NL, LAB-DE and LAB-US. For each scope:

- every equipment record belonged to that lab;
- every staff record belonged to that lab;
- every active booking in the scoped evidence set executed in that lab;
- incoming transferred work executing there remained eligible for the scoped population.

KPI filtering was executed for all three internal labs and `v151F().lab` followed the selected application lab each time. The KPI page renders the selected laboratory as read-only context rather than offering an independent “all labs” KPI scope.

Time-series KPI panels now use the common `v151LineChart()` renderer. The generated KPI dashboard contained line series and did not render the old `v151BarChart` grouped/stacked time-series bars. Pareto charts remain Pareto charts because those are categorical rankings, not time plots.

## Lessons learned and development learning

The existing V177 engine proof was rerun after the planning/workflow changes:

- Prototype lesson `AUTO-LESSON-P-P26-1201` was generated by the normal closeout learning engine and surfaced on the similar follow-on build.
- Validation lesson `AUTO-LESSON-V-V26-0201` was generated by the normal Validation learning engine and surfaced on the similar follow-on Validation.
- Prototype measured-development trajectory remains 22 h → 20 h → 18 h recommendation as actual history accumulates.
- Validation powered-thermal-cycle trajectory remains 23 h → 18 h → 17.5 h, with the next similar Validation receiving the current 17.5 h / 2.2 d Medium-confidence estimate.

No finished lesson text is inserted directly into the lesson stores for these proof cases; the demo seeds source evidence/actuals and runs the production learning functions.

## Static/package checks

- All packaged JavaScript passes `node --check`.
- `labos-version.json` parses and reports REV 1.0.182.
- `manifest.webmanifest` parses.
- `index.html` references only 1.0.182 runtime assets.
- Final ZIP is cleanly extractable and passes `unzip -t`.

## Browser limitation

A fresh Chromium interaction run is **not claimed**. Browser navigation in the execution environment has been unreliable/blocked in earlier runs. This release instead executes the actual planning renderer and canonical engines in JavaScript harnesses plus package-level integrity checks. The user should still perform the final GitHub Pages visual smoke after deployment.

## Preserved complex Validation / reporting regression

The final packaged report generator was executed for `V26-0205` after the Planning and workflow refactor. It still returns:

- 4 Test Legs;
- 31 controlled tests;
- 31 descriptions;
- 31 acceptance-criteria records;
- 31 DUT-level result sets;
- 31 setup photographs;
- 31 conclusions;
- 31 decision rules;
- technical-record readiness **PASS** with 0 critical gaps.

The generated report HTML still contains at least two SPLIT and two MERGE / REJOIN structures from the controlled Test Flow.
