# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.144**  
**Data schema: 35**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores POC state in IndexedDB in the browser.

## Deploy
1. Extract this ZIP.
2. Upload the complete ZIP contents to the GitHub Pages repository root.
3. Keep `index.html` at repository root.
4. Refresh the page and confirm the header shows **REV 1.0.144**.

The deployment package contains the current application, current task-based user manual and required assets. Historical QA/changelog files are deliberately kept outside the runtime ZIP.

## Main files
- `index.html` — application shell.
- `labos-core-1.0.144.js`, `labos-services-1.0.144.js`, `labos-repository-1.0.144.js`, `labos-demo-data-1.0.144.js`, `labos-app-1.0.144.js` — application runtime.
- `labos-styles-1.0.144.css` — application styling.
- `USER_MANUAL.html` — current task-based help.
- `manifest.webmanifest`, `service-worker.js`, icons/images and `assets/` — deployment assets.

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
