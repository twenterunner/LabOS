# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.137**  
**Data schema: 35**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores POC state in IndexedDB in the browser.

## Deploy
1. Extract this ZIP.
2. Upload the complete ZIP contents to the GitHub Pages repository root.
3. Keep `index.html` at repository root.
4. Refresh the page and confirm the header shows **REV 1.0.137**.

The deployment package intentionally contains only the files needed for this revision plus the current user manual. Historical changelogs, QA reports and verification reports are not bundled into each application ZIP.

## Main files
- `index.html` — application shell.
- `labos-core-1.0.137.js`, `labos-services-1.0.137.js`, `labos-repository-1.0.137.js`, `labos-demo-data-1.0.137.js`, `labos-app-1.0.137.js` — application runtime.
- `labos-styles-1.0.137.css` — application styling.
- `USER_MANUAL.html` — current task-based help.
- `manifest.webmanifest`, `service-worker.js`, icons/images and `assets/` — deployment assets.

## Data / evidence boundary
The POC uses browser-local persistence and JSON export/import. A production shared deployment should use governed backend storage for transactional data and evidence files while retaining immutable references and audit history.

## Compliance boundary
LabOS provides IATF 16949- and ISO/IEC 17025-oriented workflow/evidence support. Its Audit Readiness page is an internal readiness aid, not a certification result. The deploying organisation remains responsible for its QMS, customer-specific requirements, controlled procedures, auditor judgement, retention rules and approval authorities.

## REV 1.0.137 current behavior
- New prototype requests default Delivery location to **In the Lab**.
- Equipment & laboratory scope is an integrated asset/calibration/maintenance/competency evidence register.
- Manual/no-dedicated-equipment process steps such as Surface Preparation no longer create false equipment blockers.
- Process Definition uses an explicit, role-aware guided action so Planner ↔ Process Engineer hand-offs cannot end with no executable step.
- Build Report capability/distribution plots are expanded by default.
- A complete solver-valid manual plan can be committed directly; AUTO-PLAN remains optional.
