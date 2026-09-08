# ProtoLab OS — Verification Report

**Application version:** 1.0.5-poc  
**Schema version:** 3  
**Verification date:** 2026-09-08  
**Target:** static GitHub Pages proof-of-concept

## Summary

The REV 1.0.5 package was checked with deterministic service/domain tests, an IndexedDB-adapter harness, a lightweight DOM startup/interaction harness, static/deployment checks, JavaScript syntax checks and local HTTP serving.

Final automated results:

- **46 / 46** domain, workflow, planning, guard-rail and data-integrity tests passed.
- **6 / 6** persistence / JSON import-export / reset / migration tests passed.
- **23 / 23** UI startup/rendering/interaction smoke tests passed in the deterministic DOM harness.
- **27 / 27** static/deployment/mobile-source checks passed.
- **9 / 9** key deployable files returned HTTP 200 from a local static server.
- JavaScript syntax checks passed for the runtime and verification scripts.

The four deterministic suites therefore contain **102 passing checks and 0 failures**. The HTTP checks are reported separately because they verify serving rather than domain behaviour.

## Important automation limitation

A prior attempt to use the available container Chromium binary hung even on a trivial local HTML page. Therefore this report does **not** claim successful full Chrome/Android browser automation. UI verification consists of deterministic DOM/runtime tests, source-level responsive checks and local HTTP serving. The user is also performing real Android/Chrome acceptance testing after GitHub Pages deployment.

## REV 1.0.5 verification focus

| Requirement | Result | Evidence / behaviour |
|---|---|---|
| Revision visible | PASS | Header contains `REV 1.0.5`; assets use `?v=1.0.5` cache-busting |
| Mobile navigation remains accessible | PASS | Narrow-width CSS explicitly preserves a 44 px hamburger button and reduces competing header width |
| Only two material routes | PASS | Request wizard exposes only **Engineering supplied** and **Lab supplied** |
| Engineering-supplied planning input | PASS | Supply owner and expected lab-arrival date are mandatory planning inputs; physical receipt/issue is still required for Build Readiness |
| Lab-supplied material feasibility | PASS | Exact part/revision/quantity must be reserved before AUTO-PLAN eligibility; arbitrary material cannot satisfy the requirement |
| Feasibility before schedule | PASS | AUTO-PLAN rejects requests until material feasibility and confirmed process/test planning inputs exist |
| Confirmed route required | PASS | Proposed default route is explicitly non-authoritative until Process Engineering confirms it |
| Standard process planning data | PASS | Setup time, cycle time, batch/unit basis, equipment capability and required competency are used |
| Standard Test Library | PASS | Released standard tests have setup/cycle time, capability and competency and are mapped from requested characterisation |
| New/modified process planning | PASS | Process Engineer must define development effort before the planner can schedule the provisional work |
| New test-method planning | PASS | Unmatched test requires development hours, provisional execution time, equipment capability and competency |
| Lab-owned standards/skills | PASS | Lab Manager/Administrator can edit process/test planning standards and lab staff competency assignments |
| Equipment readiness | PASS | Planner selects equipment by required capability and valid calibration |
| Staff readiness | PASS | Planner selects available staff with the required competency and supports substitution |
| Resource conflicts | PASS | Planner searches later slots/alternative resources and respects locked bookings |
| Booking explanation | PASS | Every booking retains `estimateBasis`, equipment, staff/skill, duration and start/end |
| Historical duration learning | PASS | Same-product historical median is combined with standard setup/cycle baseline; booking displays the evidence basis |
| Historical operational learning | PASS | Seed includes prior-build FPY, scrap, rework, issues and lessons; schedule view displays these insights |
| Closed build feedback | PASS | Closure captures actual process durations, FPY, scrap, rework, issues and lessons exactly once for future planning |
| Actual process duration | PASS | Traveller has separate Start/Complete actions and retains actual elapsed duration |
| Control Plan objective definition | PASS | Special characteristic accepts a target **or** objective lower/upper limits, while still requiring method/gauge, reaction plan and evidence |
| Separation of duties | PASS | Control Plan owner cannot self-approve where configured; independent Approver / Reviewer can approve |
| Product Safety action | PASS | Applicable request receives a concrete Product Safety approval record/direct action |
| Guided workflow | PASS | One 10-step vertical checklist replaces separate horizontal workspace/gate navigation |

## Practical workflow verified

The top-level request workflow is:

1. Request definition & submission
2. Material source & feasibility
3. Process route & test-method assessment
4. Lab feasibility, resource plan & committed timing
5. Control Plan, risk controls & special approvals
6. Build readiness
7. Serialise & execute digital traveller
8. Characterise, evaluate & disposition exceptions
9. Release approval
10. Deliver, retain records & feed learning

This ordering ensures a booking/forecast is not created merely because a request was submitted. The planner needs a credible material date/reservation and a confirmed process/test planning basis first.

## Core regression coverage

The automated domain suite additionally verifies:

- 15 seeded prototype requests, 25+ processes and 40+ unique serialized units;
- initial state invariants;
- request creation/submission guard rails;
- serial uniqueness and genealogy;
- process fit assessment and controlled process development/release;
- Control Plan revision control and independent approval;
- build-readiness blocker detection;
- unauthorised override rejection;
- failed measurement / quality-hold linkage;
- deviation mandatory-action closure guard;
- release blocked by unresolved holds;
- rework history retention;
- report assembly;
- auditor/admin permission behaviour;
- product-safety approval generation;
- demo reset deep-copy integrity.

## Persistence / migration coverage

The repository harness verifies:

- IndexedDB adapter initialization;
- save/reload persistence;
- JSON export metadata;
- compatible JSON import;
- demo reset;
- migration of earlier schema-1 data through to schema 3, adding current planning/material/approval model data without requiring the user to discard local requests.

## UI/runtime regression coverage

The deterministic DOM harness verifies:

- application ready flag, dashboard/navigation rendering, role selector and Action count;
- modal form interaction no longer closes the modal;
- backdrop touch/click does not close the modal;
- explicit modal close handling;
- guided vertical checklist, owners and next actions;
- visible REV badge;
- material source choices and exact allocation UI;
- planning prerequisite explanation, timing and resource bookings;
- Standard Test / competency planning UI;
- historical learning/estimate basis;
- technician Start/Complete execution;
- Control Plan independent approval handoff;
- Product Safety direct approval workflow.

## Static/deployment checks

Static checks verify:

- all required delivery files are present;
- all `index.html` assets are relative and exist;
- no external runtime JS/CSS dependency is required;
- responsive 820 px and 560 px breakpoints exist;
- 44 px touch target baseline and narrow-phone hamburger preservation;
- repository and identity abstractions remain present;
- service worker only clears old caches rather than serving stale app assets;
- guided workspace hides the legacy horizontal tabs/gate stepper;
- planning, materials, master-data and learning implementations are present in runtime source.

Local HTTP serving returned **200** for:

`index.html`, `styles.css`, `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js`, `manifest.webmanifest`, `USER_MANUAL.html`.

## Data-integrity principles retained

The application continues to enforce or explicitly model these important invariants:

- approved controlled revisions are not silently edited;
- serial numbers are unique;
- process execution retains the process revision used;
- unresolved release holds prevent release;
- required objective results require result/disposition;
- invalid calibration cannot be presented as compliant measurement equipment;
- mandatory gates require controlled override where bypass is allowed;
- a closed deviation cannot retain mandatory open actions;
- rework preserves original history;
- exact BOM allocations drive material genealogy;
- approved Control Plans preserve independent approval evidence.

## Acceptance perspective

**Engineering requester:** can define need/date/configuration and choose a meaningful Engineering/Lab material route without pretending to know the lab schedule.  
**Lab planner:** cannot schedule prematurely; receives material/process/test inputs, explainable duration estimates, resource constraints and historical same-product evidence before committing timing.  
**Process engineer:** controls whether requested operations/tests are existing, modified or new and owns planning allowances for development work.  
**Technician:** executes a controlled traveller and records actual duration/evidence.  
**Quality:** retains linked risk, Control Plan, measurement, deviation and release evidence.  
**Manager:** owns lab planning standards/skills and can see historical yield/rework/issue learning.  
**Auditor:** can reconstruct the basis for both build execution and the planning estimate rather than seeing unexplained booked hours.
