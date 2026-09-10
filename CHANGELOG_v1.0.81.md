# LabOS REV 1.0.81 — Planning Integrity Root-Cause Fix

## Root cause proven

The four equipment-readiness failures shown for P26-1024 were not duplicate UI errors. They were valid detections against invalid future bookings created by the power-tool demo seed introduced in REV 1.0.79 and still present in REV 1.0.80.

The legacy seed selected the first resource matching a planning capability and then spaced work by calendar day. It did **not** call the production optimizer and did **not** validate future calibration, maintenance, qualification, shared equipment/staff capacity, or planning events. In the reproduced REV 1.0.80 portfolio this created 34 future equipment-readiness failures, 17 equipment overlaps and 121 staff overlaps. P26-1024 contributed four readiness failures: two on EQ-011 and two on EQ-007.

## Corrections

- Removed the shortcut demo scheduler. Fresh demo plans now use `PlannerService.autoPlan`, the same engine used by AUTO-PLAN.
- Added `planningIntegrityAudit()` covering equipment readiness, staff qualification, equipment overlaps, staff overlaps, hard planning-event overlaps and equipment capability mismatches.
- Added schema 31 migration and a one-time atomic repair for existing REV 1.0.80 demo states. Existing planning events, including whole-lab closures, remain hard constraints; commitments are preserved.
- Removed obsolete future seed bookings from Released / Delivered / Closed demo builds.
- Replanning now preserves completed/actual booking history and skips completed route/test work.
- AUTO-PLAN reuses a suitable already-scheduled future calibration/maintenance activity instead of creating duplicate care.
- AUTO-PLAN revalidates readiness at the final slot after capacity search, so a task shifted across a calibration/maintenance due date cannot be accepted invalid.
- Equipment-readiness resolution now groups failed bookings by root equipment resource and shows explicit calibration/maintenance causes.
- Manual-plan validation now uses time-accurate equipment readiness (`projectedEquipmentReadyAt`) rather than date-only readiness.

## Compatibility

REV 1.0.80 manual-planning Green/Yellow/Red tiers, month/CW swimlane headers, weekend shading and hard lab-closure behavior are retained.
