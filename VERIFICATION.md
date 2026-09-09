# LabOS REV 1.0.37 Verification

REV 1.0.37 focuses on responsive phone/laptop layout, a genuinely fixed Guided Build cockpit, and reliable plan/workflow navigation. Schema remains 21; no user data reset is required.

Verification includes fixed-cockpit geometry, measured spacer logic, 1120 px compact layout, auto-fit reuse tiles, delegated workflow navigation, modal cleanup before build opening, and tappable planning swimlane bars/lane labels.

---

# LabOS REV 1.0.36 Verification

Historical REV 1.0.36 introduced the stable Guided Build Workflow operating shell; REV 1.0.37 strengthens its responsive/fixed behavior and navigation reliability.

Specific verification proves that:

- historical REV 1.0.36 used schema 21; REV 1.0.37 remains on schema 21;
- the Guided Build Workflow has a sticky desktop checklist and compact sticky mobile rail;
- status semantics are green ✓ done, yellow ● ongoing, red ✕ blocked/late and grey ● future/open;
- Build identity, Edit, Approval and Next Step controls render in fixed cockpit slots;
- workflow switching no longer auto-scrolls the mobile page;
- reused Control Plans/routes/PFMEA remain inherited without repeat setup;
- build-specific deltas still trigger the relevant departmental reviews;
- permanent delegated navigation remains active.

Run the standard Node/UI/static/repository verification suites plus `verification-v136-node.js`.
