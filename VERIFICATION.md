# ProtoLab OS REV 1.0.20 Verification

Focused verification for the operational-dashboard redesign.

## Automated checks

`verification-v120-node.js`: **10/10 passed**

- REV 1.0.20 is active.
- Week horizon returns last/current/next week.
- Month horizon returns previous/current/next month.
- Scheduled calibration/maintenance/training bookings are part of the operational data model.
- Dashboard exposes horizon, product and project filters.
- People workload versus available capacity renders for all three periods.
- Equipment workload versus available capacity renders for all three periods.
- Ongoing builds, deliverables/owners and intervention queue render.
- Product/project filtering changes build demand while shared readiness downtime remains visible.
- Dashboard links explicitly to the complementary Management KPI trend/outlook view.

JavaScript syntax checks passed for `app.js` and `core.js`.

## Scope note

This was a focused dashboard release. It does not claim a new exhaustive real-Android/browser automation pass of every historical feature. Existing data schema is unchanged from REV 1.0.19, so a demo-data reset is not required.
