# ProtoLab OS — Verification Report

**Application version:** 1.0.3-poc  
**Schema version:** 1  
**Verification date:** 2026-09-07  
**Target:** static GitHub Pages proof-of-concept

## Summary

The delivered package was checked with deterministic service/domain tests, an IndexedDB-adapter test harness, a lightweight UI-startup/runtime harness, static/deployment checks, JavaScript syntax checks and an HTTP serving check.

Final automated results:

- **32 / 32** domain, workflow, guard-rail and data-integrity tests passed.
- **5 / 5** persistence / JSON import-export / reset tests passed.
- **12 / 12** UI startup/rendering/interaction smoke tests passed in a deterministic DOM harness, including modal-touch regression checks, guided-workspace source/runtime checks, and the independent Control Plan approval path.
- **14 / 14** static/deployment/mobile-source checks passed, including versioned asset URLs, stale service-worker cleanup, modal isolation, the guided-workspace replacement, and explicit Approver/Reviewer Control Plan permission.
- Required GitHub Pages assets returned **HTTP 200** from a local static server.
- All shipped JavaScript files passed `node --check` syntax validation.

No failed automated test remains in the packaged version.

## Important browser-automation limitation

A real headless-Chromium run was attempted. The Chromium binary available in the execution environment hung even when asked to render a trivial one-line local HTML file, with environment-level DBus/Chromium process errors. Therefore this report **does not claim successful real-browser automation** of Chrome/Edge/Android.

Instead, browser-facing verification consists of:

- deterministic UI startup/rendering execution using a DOM harness,
- source-level responsive/mobile checks,
- relative-path and asset-existence checks,
- local HTTP 200 checks,
- and deterministic service/domain verification of the workflows behind the UI.

A deploying organisation should still perform normal acceptance testing on its intended Chrome/Edge/Android versions after publishing to GitHub Pages.

## Verification matrix

| Area requested | Result | Evidence / scope |
|---|---|---|
| Application startup | PASS | UI runtime harness sets application ready flag and renders dashboard/navigation |
| Navigation structure | PASS | UI runtime/static checks; actual Chromium click automation not claimed |
| Guided request workspace | PASS | Horizontal workspace tabs and separate gate stepper removed from request workspace; one vertical tappable checklist shows state, owner and next action |
| Guided owner handoff | PASS | Checklist/detail source checks include demo role handoff; Control Plan explicitly routes Quality owner → independent Approver / Reviewer |
| Modal/form interaction | PASS | Regression harness verifies taps/clicks inside modal inputs and on the surrounding backdrop do not close the modal; only explicit Cancel/Close controls close it |
| Mobile layout/source checks | PASS | Responsive breakpoints at 820 px and 560 px; 44 px touch target baseline |
| IndexedDB persistence | PASS (adapter harness) | `IndexedDBStorageRepository` save/load tested against deterministic IndexedDB-compatible mock |
| Refresh persistence | PASS (adapter equivalent) | Save then reload through a new repository read path preserves state |
| JSON export/import | PASS | Schema metadata, export and compatible import tested |
| Reset demo data | PASS | Restores 15 seeded requests |
| New request | PASS | `RequestService.create` tested; UI six-step wizard implemented |
| Request submission | PASS | Mandatory field guard tested; submission creates audit/action state |
| Triage/lifecycle progression | PASS (logic/source) | Controlled gate-review UI requires evidence; readiness gate has hard conditions |
| Route building | PASS (logic/source) | Insert released/modified/new process flow implemented |
| Drag/reorder | PASS (source/runtime path) | Drag/drop handler updates order and writes audit event; real browser drag automation not claimed |
| Parallel split/merge | PASS (source/data) | Parallel group model plus split/stacked branches/merge visual rendering implemented |
| Rework loop | PASS | Seeded rework route and history verified |
| Standard process selection | PASS | 25+ processes; fit assessment tested |
| New process development | PASS | Incomplete development cannot release |
| Process release | PASS | Completed development creates reusable Released process Rev A |
| PFMEA linkage | PASS | Seeded route-linked risk items; add-risk workflow implemented |
| Control Plan creation | PASS (source/UI) | New draft Control Plan can be created from a request |
| Control Plan definition completion | PASS (source/UI + service guard) | Draft special-characteristic controls require target/specification, method and reaction plan before approval; draft controls are editable |
| Control Plan approval | PASS | Independent approval records approver/time; Approver / Reviewer has explicit permission |
| Separation of duties | PASS | Self-approval rejected; Quality owner is guided to independent Approver / Reviewer |
| Revision control | PASS | Approved plan is superseded; new Draft revision is created rather than edited in place |
| Build readiness gate | PASS | Seeded blocker scenario detected; exact blocker guidance generated |
| Guard-rail behaviour | PASS | Release hold, incomplete development, invalid conditions and evidence checks covered |
| Override behaviour | PASS | Unauthorised override rejected; authorised path requires reason/risk and audit history |
| Serial generation | PASS | Unique serial generation tested |
| Genealogy | PASS | Delivered/reworked serials retain materials/process history; delivery reference verified |
| Material allocation | PASS (source/UI) | Controlled material-lot allocation path writes audit and genealogy allocation |
| Planning | PASS | Auto-plan assigns resources and preserves process order |
| Resource conflict recovery | PASS | Planner filters invalid calibration and searches available alternatives |
| Technician substitution | PASS | Planner assigns available staff rather than unavailable seeded resource |
| Build execution | PASS (source/UI guard paths) | Digital traveller records serial/process revision/operator/equipment/evidence |
| Mandatory evidence | PASS (source/UI guard path) | Step completion rejects missing evidence |
| Characterisation manual entry | PASS (source/UI) | Raw values and traceability metadata retained |
| Characterisation CSV import | PASS (source/UI) | CSV import implemented; example CSV included |
| Pass/fail calculation | PASS | Objective limit evaluation tested |
| Quality hold | PASS | Failed seeded measurement is linked to release hold |
| New deviation | PASS (source/UI) | Issue workflow creates release hold and audit history |
| Deviation closure | PASS | Mandatory open action prevents closure |
| Rework | PASS | Original history plus explicit rework loop retained |
| Release | PASS | Unresolved release hold blocks release |
| Delivery | PASS | Delivered serials retain recipient/date/reference; acknowledgement flow implemented |
| Audit history | PASS | Request/process/CP/measurement/deviation/release changes append audit events |
| Role permissions | PASS | Auditor view/no execution and Administrator wildcard tested |
| Report generation | PASS | Report service assembles request, serial, measurement and deviation evidence |
| GitHub Pages relative paths | PASS | All entry-page assets are relative and exist |
| External runtime dependency check | PASS | No external JS/CSS dependency required |
| Static HTTP serving | PASS | index/CSS/JS/manifest/manual returned HTTP 200 |

## Data integrity invariants checked

The deterministic suite checks or exercises these rules:

- serial numbers are unique;
- released builds cannot pass release with an unresolved release hold;
- a closed deviation cannot retain a mandatory open action;
- an approved Control Plan is revised by creating a new revision, not silently edited;
- separation of duties can prevent self-approval;
- process development cannot release with incomplete gates;
- planner does not allocate equipment with invalid calibration;
- planner substitutes available staff where feasible;
- measurement objective limits produce deterministic pass/fail;
- delivered serial genealogy retains delivery evidence;
- rework preserves original process history.
- demo reset creates a fresh deep copy rather than reusing mutated seed arrays;
- seeded approved Control Plans carry independent approver evidence.

The application also evaluates additional invariants on startup through `ProtoLab.validateInvariants()`.

## Verification scripts included

These scripts are optional evidence; they are **not required to run the application**:

- `verification-node.js` — domain/workflow/guard-rail tests
- `verification-repository-node.js` — IndexedDB repository adapter, export/import/reset tests
- `verification-ui-node.js` — deterministic UI startup/render/interaction smoke harness, including modal tap regression
- `verification-static.py` — static asset, relative path and responsive-source checks

The production POC itself requires no Node, npm or Python.

## Final acceptance review

### Engineering requester

**Yes for the POC.** A six-step wizard captures need, purpose, date/priority, configuration, characterisation and review. The workspace exposes requested date, forecast, readiness, risk, owner and next action.

### Lab planner

**Yes for the POC.** Requests have one workspace, Action Centre, readiness explanations and AUTO-PLAN resource assignment with alternative-resource search.

### Process engineer

**Yes for the POC.** Released process reuse, fit assessment, modified/new-process decision, trials and controlled release are represented.

### Technician

**Yes for the POC.** The digital traveller presents the current step, controlled revision, serial/equipment and mandatory evidence in one context.

### Quality

**Yes for the POC.** Process risk, special characteristics, Control Plan, measurement traceability, deviations, release holds and approvals are linked.

### Manager

**Yes for the POC.** Demand, development load, quality holds, cost, delivery and bottleneck-style KPI views are provided.

### Auditor

**Yes for the POC.** Request, serial genealogy, process revision, equipment, measurements, deviations, approvals and append-only audit events can be reconstructed from the seeded evidence model.

## POC limitations that remain intentionally enterprise-side

The static proof-of-concept is not a substitute for:

- server-enforced identity/security;
- central multi-user concurrency;
- authoritative e-signatures;
- enterprise record retention/backup;
- controlled corporate document storage;
- live ERP/PLM/MES/HR/calibration integrations;
- formal software validation for a regulated/controlled production environment.

See `docs/FUTURE_ENTERPRISE_ARCHITECTURE.md` for the migration approach.
