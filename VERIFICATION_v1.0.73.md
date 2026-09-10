# LabOS REV 1.0.73 verification

Automated checks run in the build environment:

- JavaScript syntax checks for `app.js`, `core.js`, `demo-data.js`, `repository.js`, `services.js` and `service-worker.js`.
- Version/cache-busting checks for REV 1.0.73.
- Static checks for batch material receipt, yellow next actions, green completed BOM rows, one-sheet method release, delayed approval creation and autonomous planning inference.
- Request/approval regression: zero premature readiness/release approvals in Draft Request and Submitted states.
- Material regression: exact issued quantities for all engineering-supplied BOM lines result in both planning-ready and build-ready material state without requiring a prior supply promise.
- Full demo portfolio AUTO-PLAN: 14/14 plans completed, 0 planner failures, 198 build bookings, 0 equipment-capability mismatches and 0 invariant errors.
- Deliberate skill-loss stress test: all current staff competency associations/certificates were removed; AUTO-PLAN still completed 14/14 plans by creating 18 controlled training prerequisites rather than returning false zero-skill infeasibility.
- Method authority regression: a Process Engineer can release a complete method sheet without a duplicate approval; a non-Process-Engineer cannot release it until Process Engineering approves.

Result: **24/24 automated release checks passed** (`verification-v173.py`).

Browser automation was not used for this release because browser execution is restricted in the current build environment. The checks above are structural/domain tests and should not be represented as exhaustive manual browser validation.
