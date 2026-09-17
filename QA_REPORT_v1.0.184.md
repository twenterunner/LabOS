# LabOS REV 1.0.184 — QA report

## Release objective

Restore reliable access to Planning from the application menu without reintroducing another version-specific runtime patch, while preserving the generic cross-domain planning architecture introduced in the preceding refactor.

## Root cause found

The Planning menu entry itself was not the only issue. The main application router called `renderCanonicalPlanning()` directly, but that function lived inside the later canonical-planning module scope. The test helper inside that module could render Planning successfully, while the real menu route could throw `ReferenceError: renderCanonicalPlanning is not defined`.

Audit Readiness had the same structural risk because `renderSelectedLabAudit()` was also module-local.

## Generic routing fix

REV 1.0.184 introduces one application-level view-renderer registry:

- `registerViewRenderer(view, renderer)`
- `renderView(view, fallback)`

The canonical Planning module registers:

- `planning -> renderCanonicalPlanning`
- `audit-readiness -> renderSelectedLabAudit`

The main router now resolves those views through the registry. It no longer reaches into a later module's private scope.

Planning is also a permanent **Shared operations** menu entry for every authenticated demo role. Planning visibility is no longer coupled to the current demo role. Write/commit behavior remains governed by the application's normal permission checks.

## Executable menu/navigation regression

The final application source was loaded and the actual `nav('planning') -> render()` path was executed for all 12 demo roles:

- Engineering Requester
- Engineering Project Lead
- Prototype Lab Coordinator / Planner
- Process Engineer
- Prototype Technician
- Quality Engineer
- Metrology / Measurement Owner
- Product Safety Representative
- Lab Manager
- Approver / Reviewer
- Auditor / Read-only
- Administrator

For every role the assertions confirmed:

1. the rendered menu contains `data-nav="planning"`;
2. the navigation route resolves to `planning`;
3. the resulting page contains the canonical Planning board (`data-canonical-planning="1"`).

This directly exercises the menu route rather than merely calling the Planning renderer in isolation.

## Planning UI regression

The same final source was checked for the requested Planning behavior:

- 6 Planning metric/filter tiles are rendered;
- each tile filters the actual programme-lane collection;
- current fixture lane counts: All 11, With bookings 5, Planned Validation 1, Active situations 0, Forecast late 2, Commitment movement 6;
- All / Prototype Builds / Validation domain filter is present;
- `−`, `+`, `FIT` controls are present;
- horizontal mouse/pointer panning remains installed;
- planned booking bars remain clickable for manual replanning;
- manual slot search uses the same `PlanningEngine.feasibleSlots()` for Prototype and Validation;
- `Optimize recovery` remains local to the selected lab;
- `Compare sister labs` evaluates other internal labs separately.

## Generic planning engine regression

`labos-planning-1.0.184.js` contains no P26/V26 demo IDs.

Executable final-source tests found feasible examples for both domains:

### Prototype

- Auto plan: P26-1001 -> forecast 2026-10-06, 8 bookings.
- Sister-lab plan: P26-1001 -> LAB-DE, forecast 2026-09-23, 8 bookings.
- Manual slot search: P26-1005 -> Green 3, Yellow 3, Red 3 within the bounded QA search.

### Validation

- Auto plan: V26-0101 -> forecast 2026-10-05, 4 bookings.
- Sister-lab plan: V26-0101 -> LAB-DE, forecast 2026-09-30, 4 bookings.
- Manual slot search: V26-0103 -> Yellow 3, Red 3 within the bounded QA search.

The generic sister-lab request/receiver-acceptance workflow was also executed for one Prototype and one Validation programme. The live execution site did not change at request time; it changed only after receiver acceptance and a fresh feasible plan.

## Selected-lab Audit

`PlanningEngine.auditScopedState()` was executed for LAB-NL, LAB-DE and LAB-US. The assertions confirm that equipment, staff and active bookings are restricted to the selected lab while incoming transferred work executed at that lab remains in scope.

The live Audit Readiness route now uses the same renderer registry as Planning, removing the same module-scope navigation defect from Audit.

## Build workflow regression

P26-1001 material assessment was checked explicitly:

- planning timing defined: yes;
- complete material commitment: no;
- physical build readiness: no;
- Material workflow step: not complete.

This prevents a promised/future material date from making Material Receipt appear green.

The workflow-selection regression also verifies that Planning cannot bypass an incomplete Process & Methods gate.

## KPI regression

The KPI renderer was executed for LAB-NL, LAB-DE and LAB-US:

- the KPI filter follows `activeLabId`;
- each lab produces different KPI output;
- the current trend renderer contains line plots (`v151-line`);
- the previous time-series bar/surface-style renderer is not used for those trends.

## Validation report / learning preservation

The complex power-tool Validation demo V26-0205 remains intact:

- 4 Test Legs;
- 31 tests;
- 31 descriptions;
- 31 acceptance criteria;
- 31 result sets;
- 31 setup photographs;
- 31 conclusions;
- 31 decision rules;
- technical-record readiness passes with no critical missing records;
- visual report still contains SPLIT and MERGE / REJOIN structures.

Engine-generated Prototype and Validation lessons remain generated and surfaced on later similar work. Development-hour recommendations still change as measured actual history accumulates.

## Package gates

Before release:

- every packaged JavaScript file is checked with `node --check`;
- `labos-version.json` and `manifest.webmanifest` parse successfully;
- `index.html` references only REV 1.0.184 runtime assets;
- the final ZIP passes `unzip -t`;
- the ZIP is extracted to a clean verification folder;
- the executable navigation/planning regression is rerun against that clean extraction.

## Browser limitation

A full Chromium visual click-through is not claimed because browser navigation in this execution environment remains unreliable. The Planning-menu defect was instead reproduced and verified through the actual application navigation function and router against the packaged runtime.
