# LabOS Prototype Build POC — REV 1.0.181

**Current prototype release:** REV 1.0.181  
**Data schema:** 38  
**Deployment:** static HTML/CSS/JS for GitHub Pages; browser state in IndexedDB.

## REV 1.0.181 — canonical planning architecture

This release replaces the recent Planning-page special cases with one domain-neutral planning layer, `ProtoLab.PlanningEngine`, used by Prototype Builds and Validation programmes.

The canonical planning API is:

- `planProgrammeV181(state, id, options)` — one constrained plan path for Prototype and Validation.
- `compareProgrammeLabsV181(state, id)` — evaluates the complete programme independently at every active internal lab.
- `optimizeProgrammeRecoveryV181(state, id)` — compares complete feasible scenarios against the accepted baseline and distinguishes genuine recovery from resilience-only alternatives.
- `findProgrammeSlotsV181(state, bookingId, options)` — the same feasibility model behind manual Green / Yellow / Red slot search.
- `scopeLabV181(state, siteId)` — the selected-lab context used by Audit.

`PlanningEngine` contains no demo project IDs or per-project routing rules. Programme type is an input to the same engine, not a separate planner.

### Planning UI

- The Planning route renders directly from the canonical PlanningEngine row set.
- The six summary tiles filter the **actual programme lanes**, not only tile counts or a cloned view.
- All / Prototype / Validation uses the same canonical row query.
- `−`, `+` and `FIT` remain above the swim lanes.
- The timeline supports horizontal pointer/mouse drag scrolling.
- Every programme lane has **Optimize recovery** and **Compare sister lab**.
- Clicking a live booking opens the generic manual slot finder:
  - **Green** — feasible with the current controlled resource assignment;
  - **Yellow** — feasible with a controlled resource/readiness reassignment and requires a rationale before commitment;
  - **Red** — infeasible on that day and cannot be committed.
- Slot search uses day resolution and searches weeks/months forward.

### Sister-lab and recovery behaviour

The complete programme is replanned at each active internal lab with the same equipment capability, calibration/readiness, staff competence, availability, material/DUT availability, dependency and capacity constraints. A lab is shown as feasible only if the complete constrained plan succeeds. Recovery alternatives that do not improve the accepted plan are labelled **Resilience only**, not as an optimization.

### Selected-lab Audit

Audit Readiness is rendered from the same active-lab context as Planning. Equipment, people, calibration/training evidence, Prototype Builds, Validation programmes, bookings and audit events are scoped to the selected lab. Incoming transferred work actually executed at that lab remains in scope.

## Existing demo/reporting features retained

REV 1.0.181 retains the substantial management-demo content from earlier revisions, including:

- complex completed power-tool Validation `V26-0205` with 24 DUTs, 4 Test Legs, 31 tests, branches/splits/merges, setup photos and a FINAL approved report;
- ISO/IEC 17025-style technical Validation reporting with visual Test Flow, per-test description, method, acceptance criteria, decision rule, equipment/calibration, measurements, photos and conclusion;
- 40-part Prototype statistical demos for normal/non-normal distributions and fliers;
- engine-generated Lessons Learned and history-based development-hour recommendations;
- Prototype→Validation dependency timing propagation and controlled audit history;
- Validation search/filter controls;
- Management Demo launcher in Help.

## Deploy

1. Extract the ZIP.
2. Upload the complete contents to the GitHub Pages repository root.
3. Keep `index.html`, `labos-version.json` and `update.html` at repository root.
4. If a browser still shows an older revision, open `update.html` once. It clears browser caches/service-worker registrations but does not clear LabOS IndexedDB data.
5. Confirm the application header shows **REV 1.0.181**.

## Main files

- `index.html` — application shell.
- `labos-core-1.0.181.js` — domain model and core workflows.
- `labos-services-1.0.181.js` — constrained scheduling/resource services.
- `labos-planning-1.0.181.js` — canonical cross-domain PlanningEngine and public planning API.
- `labos-repository-1.0.181.js` — persistence.
- `labos-demo-data-1.0.181.js` — demo dataset.
- `labos-app-1.0.181.js` — application UI and interaction layer.
- `labos-styles-1.0.181.css` — application styling.
- `USER_MANUAL.html` — task-based help.
- `DEMO_GUIDE_v1.0.181.md` — management-demo walkthrough.
- `QA_REPORT_v1.0.181.md` — executable verification for this release.
