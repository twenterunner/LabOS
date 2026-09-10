# LabOS REV 1.0.80 verification

REV 1.0.80 was built directly on REV 1.0.79.

Verification covers:

- version/cache identity and flat GitHub Pages package integrity;
- JavaScript syntax for all shipped JavaScript;
- manual-planning source guards for staged draft planning and Green/Yellow/Red option rendering;
- stale-live-plan protection and final invariant/conflict validation before manual save;
- month + CW + weekday + day-number swimlane headers;
- full-track weekend shading that is conditional on weekend planning being disabled;
- hard planning-event invalidation of overlapping future locked bookings;
- lock preservation without duplicate task creation, plus controlled release of infeasible locks;
- post-replan lab-closure residual collision guard;
- first-load reconciliation for existing saved lab-closure overlaps while preserving commitments;
- deterministic runtime closure regression on demo data: an intentionally locked future booking is placed inside a whole-lab closure and portfolio planning must relocate it outside the closure without invariant errors.

Run `python verification-v180.py` for executable verification evidence.

## Browser smoke-test note

A Chromium/Playwright navigation smoke test was attempted against a local HTTP server. This execution environment blocks localhost browser navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, so no browser-runtime pass is claimed. The shipped verification therefore relies on JavaScript syntax checks, source guards, the actual planner/runtime regression in Node, and state invariant checks. A quick exploratory browser pass should still be made after deployment to GitHub Pages.
