# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.166**  
**Data schema: 38**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores POC state in IndexedDB in the browser.

## Deploy
1. Extract this ZIP.
2. Upload the complete ZIP contents to the GitHub Pages repository root.
3. Keep `index.html` at repository root.
4. Refresh the page and confirm the header shows **REV 1.0.166**.

The deployment package contains the current application, current task-based user manual and required assets. Historical QA/changelog files are deliberately kept outside the runtime ZIP.

## Main files
- `index.html` — application shell.
- `labos-core-1.0.166.js`, `labos-services-1.0.166.js`, `labos-repository-1.0.166.js`, `labos-demo-data-1.0.166.js`, `labos-app-1.0.166.js` — application runtime.
- `labos-styles-1.0.166.css` — application styling.
- `USER_MANUAL.html` — current task-based help.
- `manifest.webmanifest`, `service-worker.js`, icons/images and `assets/` — deployment assets.

## REV 1.0.166 — rendered Planning/Validation correction and Prototype sticky-layout repair

- Fixes the REV 1.0.165 UI-scope defect: the prior UI extension was outside the main LabOS application closure, so the browser could continue with older rendered paths despite the new helper code being present. REV 1.0.166 installs the changes inside the live application runtime.
- Planning now renders one true mixed-domain portfolio with **All / Prototype / Validation** swim-lane filters. Active Validation programmes appear as first-class lanes even before they have bookings, and project/programme titles are the primary visible lane label on desktop and mobile.
- Validation **Add Test** immediately asks **Standard Test** or **Test Development**. Standard Tests show released acceptance criteria; Test Development requires explicit acceptance criteria and uses the learned cross-domain development estimate.
- Validation begins with a visible **Define Samples** register. Linked Prototype programmes inherit the Prototype sample IDs/serials; standalone Validation defines its own sample IDs/serials. Exact samples can then be assigned/overridden per test while automatically following the leg/branch flow by default.
- Every Validation test card visibly carries acceptance criteria plus a **Samples / serials** action.
- Prototype End Characterisation retains the REV 1.0.165 **Standard Test / Test Development** split and shared smart-development estimator, now executing in the live application scope.
- Prototype sticky cockpit spacing is corrected by moving preventive-learning content into the guided detail and reserving only the actual overlap below the fixed cockpit. The former large blank band is removed on desktop and mobile.
- Schema remains **38**; no reset is required.

## REV 1.0.165 — ReisSlim-style Validation flow, adaptive test development and preventive learning

- **The Portfolio navigation tab is removed.** Prototype, Validation, Planning, KPI and Reports now provide the operational views without a separate Portfolio workspace entry.
- **Prototype Build keeps the established process-flow workflow.** Prototype does not use the Validation designer. Its yellow/green guided workflow, route/process steps, controlled evidence, approvals, genealogy and planning hand-off remain intact.
- **Validation is test-flow first.** Opening a Validation programme goes directly to **Validation Test Flow Definition**. The engineer defines Test Legs, exact DUT/sample allocation, Standard Tests or controlled Test Development, then continues to shared resource Planning.
- The Validation designer follows the proven ReisSlim interaction model: independent **Test Leg** columns, sequential tests within a leg, explicit DUT/sample splits, recursive sub-branches, controlled allocation per branch, automatic merge/rejoin into the parent path, tests after merge, and additional independent Test Legs. Activities remain attached to a controlled leg/branch; there are no floating test blocks.
- Every added Validation test begins with a **test intent**. LabOS ranks the full released Standard Test library and shows the closest matches before allowing new development. Strong matches are directed to reuse; controlled adaptations record the delta from the closest standard; a generic new method is blocked when it would duplicate a strong released match unless a specific controlled delta is supplied.
- **Method-development time is learned, not fixed.** Adapt/new-test estimates use the closest standard, match gap, controlled delta complexity and actual development effort from comparable completed Validation work. Recording actual development hours updates the learning history for future estimates, with estimate basis and confidence shown to the engineer.
- **Requirement Coverage is removed from the active Validation workflow.** Existing requirement records remain available to historical report/audit logic but no longer appear as a separate workflow tab or planning gate.
- **Validation remains first-class in shared Planning.** Active Validation demand is planned against the same people, equipment, skills, calibration/maintenance state, closures and existing Prototype bookings. Validation booking records remain identifiable as `domain: Validation` / `programmeType: validation` while sharing the constrained resource calendar.
- **Lessons Learned are now preventive controls rather than retrospective notes.** Every completed Prototype Build and closed Validation Programme is auto-captured. Material learning records carry the previous problem, evidence/root cause status, prevention control, detection/readiness check, risk, applicability and effectiveness state. Successful closeouts are retained as reference baselines but do not clutter the recurrence-prevention queue.
- At the start of similar Prototype or Validation work, LabOS surfaces relevant preventive lessons by product and overlapping process/test methods. Users must **Apply control**, give a rationale for **Not applicable**, or create a preventive action. The source lesson is never deleted by that decision.
- Reports now include a **Product Lessons Learned · Prevent Recurrence** report combining Prototype + Validation evidence, recurring failure patterns, carried-forward prevention controls and effectiveness status, with CSV export and browser Print/PDF.
- Schema remains **38**. Existing IDs, execution evidence, results, planning data, audit history and prior learning records are preserved; no reset is required.

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
