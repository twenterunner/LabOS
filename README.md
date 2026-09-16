# LabOS REV 1.0.157

REV 1.0.157 makes Prototype and Validation feel like one LabOS application. Both workstreams now use the same landing/portfolio pattern, the same Programme Logic canvas family and the same shared swimlane renderer. Validation programme rows are explicitly openable on desktop and mobile. Lab Standards & Resources is the single governed master-data home for processes, Standard Tests, equipment, competencies and 5S zones, with add/edit actions and plural equipment-capability / competency associations for process and test methods. Schema remains 38; no reset or migration is required.

# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.157**  
**Data schema: 38**

LabOS is a static-browser proof of concept for controlled Prototype and Validation/DV/PV laboratory operations, with shared planning, resources, evidence, approvals, audit and KPI services. It is designed for GitHub Pages deployment and stores POC state in IndexedDB in the browser.

## Deploy
1. Extract this ZIP.
2. Upload the complete ZIP contents to the GitHub Pages repository root.
3. Keep `index.html` at repository root.
4. Refresh the page and confirm the header shows **REV 1.0.157**.

The deployment package contains the current application, current task-based user manual, required assets and the release-specific QA report. Historical QA/changelog files are not bundled.

## Main files
- `index.html` — application shell.
- `labos-core-1.0.157.js`, `labos-services-1.0.157.js`, `labos-repository-1.0.157.js`, `labos-demo-data-1.0.157.js`, `labos-validation-1.0.157.js`, `labos-app-1.0.157.js` — application runtime.
- `labos-styles-1.0.157.css` — application styling.
- `USER_MANUAL.html` — current task-based help.
- `manifest.webmanifest`, `service-worker.js`, icons/images and `assets/` — deployment assets.



## REV 1.0.157 — one Prototype + Validation operating UX

- Gives **Prototype** and **Validation / DV / PV** the same workstream landing structure: the same metric strip, Active/Completed/All filters, search, portfolio table pattern, health presentation and full-row/open-button navigation.
- Fixes the Validation portfolio navigation defect that could make a programme appear untappable when an older/demo specification record had no customer metadata. Every Validation programme row now uses one common open handler on desktop and mobile.
- Keeps the REV 1.0.156 common **Programme Logic** architecture and aligns the visible workspace styling so Prototype and Validation no longer look like separate applications. The Prototype route graph and Validation requirement/test graph continue to keep their domain-specific semantics while using the same canvas interaction model.
- Uses the same REV 1.0.153 shared graphical swimlane renderer for **Prototype build timing and Validation programme timing**, including the common equipment/person calendar and Master Planner context.
- Consolidates governed master data under **Lab Standards & Resources** with explicit add/edit entry points for Processes, Standard Tests, Equipment and Competencies, plus a visible **+ 5S zone** action and guidance to the 5S workplace-control section.
- Adds an editable Equipment registry. Equipment assets may expose multiple controlled capabilities. Process and Standard Test methods may retain multiple equipment-capability and competency associations. The first association remains the current primary constrained-planning requirement for backward compatibility; additional associations are governed method/readiness metadata pending a future simultaneous multi-resource reservation kernel.
- Preserves all existing Prototype/Validation planning, customer-specification import, customer-defined Validation legs/sequences, RTM, development learning, Standard Test promotion, reports, lessons, audit, Twente Validation KPI demo history, sister-lab/external routing and shared resource-care behavior.
- Browser schema remains **38** and no Reset Demo Data is required.

## REV 1.0.155 — Validation builder, flowdown and learning

- Replaces the constrained Validation canvas interaction with true free block positioning. Visual placement is layout-only; it no longer silently changes a controlled leg or dependency. **Auto layout** restores a clean dependency-based arrangement.
- Makes **controlled specification → verification requirement → test/evidence** flowdown visible directly above the programme canvas and in the RTM workspace.
- Implements **reuse first**: released Test Library methods and previously released Validation methods are ranked using requirement context, prior programme use, same-product use and controlled history. Engineers can **Reuse**, **Adapt**, or develop a genuinely new method.
- Adaptation carries the source method/family into the existing shared REV 1.0.129 development-learning service. Measured Validation development hours are written into the same `developmentHistory` used by Prototype, so future Prototype and Validation estimates learn from both domains.
- Method-development completion releases the downstream adapted/new verification method while retaining original estimate, latest estimate and measured actual engineering hours.
- Candidate lessons are detected automatically from development overruns, lab-caused invalid tests, delays/recoveries, sister-lab recovery and external dependencies.
- The Validation report draft is automatically refreshed when controlled programme, requirement, planning, result or disposition data changes. Approval remains a separate human-controlled action, and an approved historical report is never overwritten.
- Makes the **customer specification** the controlled source for Validation. Users can define requirements manually, download/upload the controlled CSV template, or import local CSV, XLSX, DOCX and text-layer PDF requirements. Imported requirements remain engineer-reviewed controlled records; scanned/image-only PDF OCR is not fabricated by the static PoC.
- **Generate programme from specification** maps each imported requirement to the strongest released Standard Test / previous controlled Validation method, proposes adaptation where appropriate, and creates a schedulable development path only for genuine gaps. The resulting visual graph is populated automatically but remains under engineer review before release.
- A successfully developed Validation method can be nominated and approved into the shared Standard Test Library with traceability to its originating programme/development evidence.
- Adds **nine Twente Validation KPI demo programmes** across DV/PV with completed and active work, customer requirements, results, invalid-test/retest evidence, product failure/disposition, sister-lab recovery, development history, costs, lost/recovered days and report evidence. These are explicitly demo records, not claimed production results.
- Schema remains **38**. REV 1.0.155 adds compatible optional fields and UI/runtime behavior; no Reset Demo Data is required.

## REV 1.0.153 — unified Validation operating UX

- Generalises the Master Planner swimlane renderer so **All** shows Prototype and Validation on the same graphical timeline and **Validation** remains a graphical swimlane view instead of falling back to a table. Shared equipment/person lanes retain calibration, maintenance and training reservations.
- Validation bookings retain their programme/node identity in the canonical shared booking collection; clicking a Validation bar opens the exact programme and test in **Validation → Resource Plan**. Sister-lab execution remains visibly associated with the selected execution lab.
- Adds **Request Validation** to the common Requests front door and Prototype queue header for authorised engineering/planning roles. The guided intake captures DV/PV, product, Business Unit, home lab, required completion, DUT quantity, controlled specification and optional Prototype source, then opens the programme builder.
- Makes Validation DV/PV portfolio filters operational, exposes controlled Validation reports in the shared Reports workspace, and includes Validation DUT genealogy in Sample & Serial History.
- Integrates Validation actions into My Work / Action Centre with role ownership, live open/closed evaluation, and direct routing to Requirements, Builder, Resource Plan, Execution or Report. Adds the Validation Engineer role to the common role model.
- Adds guided Validation readiness resolution and current Help/manual guidance so blockers navigate to a concrete resolution workspace instead of leaving a text-only dead end.
- Preserves schema 38 and the REV 1.0.152 schema-37→38 migration; REV 1.0.153 is an application/UI/process-flow release and requires no new data reset or schema migration.

## REV 1.0.152 — native Validation / DV / PV domain

- Adds Validation as a native LabOS operating domain on top of the existing common platform services rather than a separate mini-application. Prototype and Validation share the canonical constrained planner, equipment, people/skills, calendars, calibration, maintenance, sister-lab routing, external testing, approvals, evidence, audit, lessons learned, My Work and KPI event model.
- Adds a controlled visual Validation Programme Builder backed by a directed workflow graph (`programmeNodes`, `programmeEdges`, `programmeLegs`, DUT allocations and genealogy). The graph is the operational definition used by planning/execution, not a decorative diagram.
- Supports sequential and parallel legs, split/merge, conditioning, waits/holds, transport, review/decision gates, method/fixture development, destructive DUT handling, external tests, sister-lab execution and Prototype-source dependencies including partial DUT releases.
- Adds controlled requirement/specification records and requirement-to-test mapping, verification status, unmapped-requirement visibility, specification revision impact comparison and closure gating.
- Adds shared AUTO PLAN and manual-planning flows for Validation, with deterministic constraint reasoning, forward feasible-slot search, downstream dependency propagation, critical-path/forecast impact, sister-lab recovery and external alternatives. Validation bookings remain canonical shared bookings and therefore consume the same people/equipment capacity as Prototype work.
- Adds controlled programme revision states (Draft / Under review / Released / In execution / Completed / Superseded). Structural edits after release create a new controlled revision and require an explicit release rationale.
- Adds Validation execution semantics for Pass, Valid product failure, Invalid test — lab caused, Invalid test — sample issue, Retest required, Blocked and Awaiting disposition. Disposition records are additive; failed/invalid historical results are never overwritten.
- Adds automatic Validation report preview, approval/closure controls, Validation audit events, candidate lessons learned, Portfolio/Master Planner/My Work integration, active Validation KPI calculations and ten varied demo programmes covering sequential, parallel, Prototype-linked/partial-release, sister-lab, external, method-development, destructive split, invalid/retest, product failure and specification-revision scenarios.
- Adds mobile-friendly Add step / reorder controls while retaining the full drag-and-drop workflow designer as the primary desktop experience.
- Adds explicit idempotent schema 37 → 38 migration. Existing REV 1.0.151 Prototype data is preserved without requiring Reset Demo Data.

## REV 1.0.150 — canonical equipment/resource semantics

- Fixed execution start/complete rejecting valid optical/microscope equipment when older records only carried a broad legacy capability/category.
- Added one canonical technical capability resolver used by planning, execution, load balancing, capacity forecasting and cost estimation.
- Added execution-readiness checks that combine technical capability, operational status, calibration, maintenance and governance readiness.
- Added a boundary migration that materialises canonical `planningCapability` values for older/imported equipment, process, test and booking records while retaining legacy descriptive fields.
- Removed direct raw `.capability === ...` / `.capability !== ...` business-logic comparisons from core, services and app runtime.
- Added resource-semantic consistency audit and targeted regression hooks.
- Preserved the REV 1.0.147 review-before-approval and independent Control Plan approval fixes.

## REV 1.0.144 — product-safe request and network-aware planning
- **Control Plan selection is product-scoped.** The new-request and Controls decision dropdowns show only approved reusable baselines whose controlled provenance resolves to the same product. A current/legacy Control Plan from another product cannot bypass the filter. Different revisions of the same product may still be proposed as a baseline; build-specific deltas and approvals remain controlled later.
- **Engineering-supplied material now has an explicit submission gate:** accountable supply owner + valid expected arrival at the lab. The user may continue completing a Draft, but the Draft cannot be submitted to the controlled build workflow until the timing basis exists (unless the exact material has already been issued).
- A known engineering-supply ETA is a **planning basis, not physical availability**. Resource definition/planning may proceed and AUTO PLAN uses that ETA as the earliest material-available date; Build Readiness/execution remains blocked until exact receipt/issue evidence exists. Lab-supplied material must be resolved in the Material step through exact stock reservation or a dated incoming supply plan before Plan & commit.
- **AUTO PLAN no longer stops at the home-lab dead end.** When the home result is unplanned, blocked, or has no verified optimization, LabOS automatically runs the canonical planner against every active sister lab and displays the configured external facility alternative with timing and cost evidence. Sister-lab routing still uses the formal sender/receiver acceptance handshake; external execution is qualified through the governed scenario decision before LIVE application.
- The network recovery panel clearly distinguishes home recovery, sister-lab transfer and external outsourcing so “no local plan” is not presented as “no planning option”.

### Guided build operating model retained
- The build workspace now uses one persistent sticky cockpit. It shows **Build number, Requested delivery, Original commitment, Current commitment, Latest forecast, Build workflow, Substeps, Planning, Current stage & owner, Approvals, and Next step & owner**.
- Workflow semantics are consistent: **green = completed evidence; yellow = the one action required now; grey = future/locked**. A real blocker is explained inside the current yellow action rather than becoming a second navigation scheme.
- The process-step body starts with **Purpose**, then the **yellow executable action**, then **Evidence progression**, followed by the detailed work for that step. Completed selected steps show green; future steps are read-only.
- Stage completion is evidence-driven. Approved/reused Control Plan evidence plus completed build-specific sign-offs closes Controls automatically; there is no redundant “confirm controls” acknowledgement after the real controlled action is complete.
- The guided-step engine resolves legacy/lazy state changes to a bounded fixed point before rendering. This prevents the first render from showing a previous stage while the underlying evidence already points to the next stage.
- Formal Build Readiness Review remains an explicit controlled human sign-off where the assurance profile requires it; the button now uses a navigation-safe handler.
- Async completion actions no longer force a late tab change if the user has already moved to a different build.
- Execution includes batch productivity tools: immutable Lab Sample IDs, bulk formal-serial series generation/editing, sample-register CSV import/export, batch-fill of controlled sample parameters, and the existing evidence-matrix/process-step CSV import/export.
- **Materials & Inventory is now editable after receipt** without destroying genealogy: authorised users can correct/set available quantity, add found/received quantity, record scrap/consumption, quarantine/release a lot, and update location/expiry/source evidence with a required reason and optional reference. Reserved build allocations can be resized/released; issued build material can be recorded as scrap/loss as a separate traceable disposition.
- The Controls stage now has **one canonical evidence gate** used by the green substeps, the yellow action, automatic reconciliation and click-time validation. A visually-complete Controls stage therefore advances automatically; if evidence is genuinely missing, the yellow action identifies the exact missing approval/evidence and owner instead of showing a dead-end error toast.

## Audit behavior retained from REV 1.0.141
- Audit build population is **completed/CLOSED builds only**.
- In-progress builds with nonconformities remain visible in **Operational watch**, but are excluded from audit findings, score, findings CSV and printed audit evidence pack.
- Build-linked audit findings cite the **specific build, deliverable, owner and record reference**.

## Data / evidence boundary
The POC uses browser-local persistence and JSON export/import. A production shared deployment should use governed backend storage for transactional data and evidence files while retaining stable IDs, controlled revisions, objective evidence, approval history and audit history.

## Compliance boundary
LabOS provides **IATF 16949- and ISO/IEC 17025-oriented workflow/evidence support**. It is not a certification system and does not replace the deploying organisation's QMS, customer-specific requirements, controlled procedures, auditor judgement, records-retention rules or approval authorities.

## REV 1.0.150 resource semantic repair
- Repairs REV 1.0.149 states where broad legacy resource descriptors could be promoted into technical `planningCapability` values.
- Preserves legacy descriptive category/location values while deriving controlled technical compatibility independently.
- Adds schema 36 → 37 migration and repairs process, test, route-step and booking capability semantics without resetting user data.
