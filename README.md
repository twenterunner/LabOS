# LabOS — Laboratory Operations System

**Current prototype release: REV 1.0.139**  
**Data schema: 35**

LabOS is a static-browser proof of concept for controlled prototype-build and engineering-laboratory operations. It is designed for GitHub Pages deployment and stores POC state in IndexedDB in the browser.

## Deploy
1. Extract this ZIP.
2. Upload the complete ZIP contents to the GitHub Pages repository root.
3. Keep `index.html` at repository root.
4. Refresh the page and confirm the header shows **REV 1.0.139**.

The deployment package intentionally contains only the files needed for this revision plus the current user manual. Historical changelogs, QA reports and verification reports are not bundled into each application ZIP.

## Main files
- `index.html` — application shell.
- `labos-core-1.0.139.js`, `labos-services-1.0.139.js`, `labos-repository-1.0.139.js`, `labos-demo-data-1.0.139.js`, `labos-app-1.0.139.js` — application runtime.
- `labos-styles-1.0.139.css` — application styling.
- `USER_MANUAL.html` — current task-based help.
- `manifest.webmanifest`, `service-worker.js`, icons/images and `assets/` — deployment assets.

## Data / evidence boundary
The POC uses browser-local persistence and JSON export/import. A production shared deployment should use governed backend storage for transactional data and evidence files while retaining immutable references and audit history.

## Compliance boundary
LabOS provides IATF 16949- and ISO/IEC 17025-oriented workflow/evidence support. Its Audit Readiness page is an internal readiness aid, not a certification result. The deploying organisation remains responsible for its QMS, customer-specific requirements, controlled procedures, auditor judgement, retention rules and approval authorities.

## REV 1.0.139 current behavior
- Prototype workflow ownership is evidence-driven: the current yellow stage always exposes an executable action for its actual owner.
- A genuine build-specific route/work-instruction delta shows the exact remaining reviewer and direct sign-off; Planning cannot be selected as the escape from an unfinished Process Definition stage.
- Stale/orphaned route or Control Plan review records are reconciled without inventing approvals; completed evidence advances automatically to the next applicable workflow stage.
- Controls-stage sign-off and Next Action point to the same executable decision, preventing disabled/governance dead ends.
- Resource Planning becomes the next owner only after Material, Process Definition and applicable Controls are genuinely complete. Manual planning and direct commit remain supported.
- Sequential green/yellow/grey/red workflow semantics, sister-lab decision evidence, visible sample registration and planning-around-constraints behavior remain preserved.
