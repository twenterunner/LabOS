# LabOS REV 1.0.118 verification

1. On Android/coarse pointer, tapping a process/test swimlane booking opens **Planned Task** and does not start manual move mode.
2. Small finger jitter while tapping cannot produce the “No end-to-end feasible move…” toast.
3. A controlled test Planned Task offers **Send only this test to a sister lab →** for Lab Planner/Administrator.
4. That action opens task-level sister-lab comparison and does not invoke whole-build transfer.
5. **Move / replan this step** remains the explicit manual-planning entry point.
6. Desktop move grip remains available; the booking body itself is not draggable.
7. Existing persisted test bookings without `taskKind` are recognised from the canonical task definition.
