# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.162**  
**Data schema: 38**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores POC state in IndexedDB in the browser.

## Deploy
1. Extract this ZIP.
2. Upload the complete ZIP contents to the GitHub Pages repository root.
3. Keep `index.html` at repository root.
4. Refresh the page and confirm the header shows **REV 1.0.162**.

The deployment package contains the current application, current task-based user manual and required assets. Historical QA/changelog files are deliberately kept outside the runtime ZIP.

## Main files
- `index.html` — application shell.
- `labos-core-1.0.162.js`, `labos-services-1.0.162.js`, `labos-repository-1.0.162.js`, `labos-demo-data-1.0.162.js`, `labos-app-1.0.162.js` — application runtime.
- `labos-styles-1.0.162.css` — application styling.
- `USER_MANUAL.html` — current task-based help.
- `manifest.webmanifest`, `service-worker.js`, icons/images and `assets/` — deployment assets.

## REV 1.0.162 — one visual Programme Builder for Prototype and Validation

- Replaces the older lane-oriented programme editor with one reusable **LabOS Programme Builder** used by both Prototype Build and Validation Programme construction. It is one canvas engine with domain adapters, not two builders.
- Uses a structured left-to-right programme model: every activity belongs to the main flow or a controlled parallel leg; normal use never leaves floating activities and users do not draw connector arrows manually.
- Adds activity/test library, central canvas, selected-item properties, undo/redo, zoom −/+/Fit, auto-layout, search/jump, programme validation, Save and feasibility checking.
- Supports forgiving drag/drop insertion, reordering, movement between legs, multi-select movement, new parallel-leg creation, nested splits, split/merge reconstruction, leg rename/move/delete, duplication, replacement and safe deletion impact review.
- Adds visual DUT/sample allocation for fixed quantity, percentage, same-DUT continuation, destructive testing and retained samples. Over-allocation and impossible destructive reuse are blocking validation findings.
- Validation requirements are draggable. Dropping a requirement opens ranked Standard Test matches and can create a controlled test-development activity when no suitable released method exists; requirement links remain traceable through replacement where valid.
- Adds reusable Prototype and Validation subflow templates, recently used/favorites/search categories, optional Structure/Requirements/Resources/Planning/Execution overlays and a minimap only for larger programmes.
- Draft programmes remain low-friction. Structural edits to Released programmes use controlled revision handling and rationale; Draft / Under Review / Released / Superseded is visible in the builder.
- Mobile/tablet keeps the same programme model while providing tap selection, long-press/drag support and explicit move controls so precision drag/drop is not mandatory.
- Existing Prototype routes and Validation legs/activities migrate into the new shared structure at repository load and synchronise back into the existing planner, execution, genealogy, requirement, booking and audit records. Existing IDs are preserved. Schema remains **38** and no reset is required.
- Performance/regression qualification includes >100 activities, >20 parallel legs, dependency-loop/orphan checks, destructive genealogy cases, save/reload-shaped persistence, controlled revisions and real rendered browser drag/drop.

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
