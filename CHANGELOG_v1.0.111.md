# LabOS REV 1.0.111

## Fixes

1. **Per-build deadline marker restored** — every task lane now resolves the selected build as its due-date source, so the red required-delivery line remains visible in Per Build.
2. **Direct tap-to-replan restored** — tapping/clicking a future planned task provides `Move / replan this step`, opening the existing validated Green / Yellow / Red manual-move engine.
3. **Thermal Soak / reused-route loop removed** — build-specific route edits are no longer overwritten by the automatic reuse package on the next render. If the remaining route/method definition is technically ready, `Confirm route` also records the explicit route/method review and advances to the next guided stage.
4. **Controlled review invalidation** — route/process/method/test changes reopen process review and applicable-control review.
5. **Exact revision consistency** — planning assessment and guided blocker resolution use the exact governed process revision stored on the route, matching ReadinessService behavior.

IndexedDB schema remains **35**; no reset is required.
