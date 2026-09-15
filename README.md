# LabOS Prototype Build POC — REV 1.0.124

Static HTML/CSS/JavaScript proof-of-concept for GitHub Pages. Upload **all files from the root of this ZIP to the repository root**. `index.html` must remain at root.

## What changed in REV 1.0.124

This is a stabilization release following deeper fault-injection of REV 1.0.122/1.0.123. It fixes stale task-routing state, incoming/home sister-lab planning visibility, inactive sister-lab overrides, and validity/provenance issues in test-specific external commercial evidence.

### Test-specific external sourcing cost & evidence
Open **Lab Standards & Resources → Standard Test Library → Edit standard & external cost**. Each Standard Test can maintain supplier/test house, pricing basis (fixed/test, per sample, per batch), price, setup/admin, transport/handling, nominal lead time, quote/invoice reference, validity dates and an optional supporting file up to 8 MB in this browser POC.

A currently valid test-specific price takes precedence over the generic external-facility benchmark. Expired or future-dated commercial evidence remains auditable but is excluded from active sourcing economics. If commercial terms change, the old quote/invoice revision is retained in history and its attachment is not silently reused as proof for the new terms.

### Single-operation sister-lab routing
Any active canonical **process, formal test, development, or final quality/release/handover** task can be evaluated independently at an active internal sister lab. Build ownership remains at the home lab. Transfer lead time, downstream replanning, task coverage, invariants and whole-portfolio planning integrity are revalidated before acceptance.

The Planning view now shows a routed operation in both useful contexts: as part of the complete home-lab build and as incoming work in the receiving lab. This display-only network scope does **not** relax the lab-isolated planning-engine scope.

If a previously selected sister lab becomes inactive, the planner stops with a governed `TASK_SITE_UNAVAILABLE` blocker rather than scheduling there. Guided recovery lets the planner choose another active sister lab or return only the affected operation to the build lab.

## Data and deployment
LabOS remains a browser-local POC using IndexedDB/JSON persistence with schema **35**. Production deployment should store binary evidence in governed object/document storage while retaining immutable metadata and references in the LabOS domain model.

See `CHANGELOG_v1.0.124.md`, `QA_REPORT_v1.0.124.md`, and `VERIFICATION_v1.0.124.md`.
