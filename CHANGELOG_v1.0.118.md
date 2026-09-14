# LabOS REV 1.0.118 — change log

## Mobile-safe planning interaction
- Fixed the REV 1.0.117 defect where a normal phone tap on a narrow swimlane booking could be interpreted as a drag/manual replan after only a few pixels of finger movement.
- A planning booking bar is now always a normal tap/click target.
- On phones/tablets (coarse pointers), the in-bar drag grip is hidden; intentional movement starts from **Move / replan this step** in the Planned Task dialog.
- On desktop, the explicit grip remains draggable; the whole booking bar is never draggable.
- Legacy pointer/native-drag paths are disabled or constrained to the explicit grip.

## Single-test sister-lab routing
- The Planned Task dialog now labels the action **Send only this test to a sister lab →**.
- Test recognition also resolves the current canonical task definition, so older IndexedDB bookings that do not yet carry `taskKind` still expose the action when they are controlled tests.
- The REV 1.0.117 transfer engine is retained: only the selected test receives a sister-lab site override and downstream work is replanned/validated.

IndexedDB schema remains 35.
