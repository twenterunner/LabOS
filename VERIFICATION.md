# LabOS REV 1.0.36 Verification

REV 1.0.36 focuses on a stable Guided Build Workflow operating shell while retaining the v1.0.35 reuse-first controls and navigation reliability.

Specific verification proves that:

- the current release is REV 1.0.36 on schema 21;
- the Guided Build Workflow has a sticky desktop checklist and compact sticky mobile rail;
- status semantics are green ✓ done, yellow ● ongoing, red ✕ blocked/late and grey ● future/open;
- Build identity, Edit, Approval and Next Step controls render in fixed cockpit slots;
- workflow switching no longer auto-scrolls the mobile page;
- reused Control Plans/routes/PFMEA remain inherited without repeat setup;
- build-specific deltas still trigger the relevant departmental reviews;
- permanent delegated navigation remains active.

Run the standard Node/UI/static/repository verification suites plus `verification-v136-node.js`.
