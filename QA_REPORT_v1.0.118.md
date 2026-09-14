# LabOS REV 1.0.118 — focused regression report

## Defect addressed
REV 1.0.117 allowed the whole swimlane booking bar to participate in legacy pointer/native drag handlers. On a phone, small finger movement could therefore open manual move mode instead of the Planned Task dialog.

## Focused regression checks
- Whole planning bars are explicitly `draggable=false`.
- The legacy whole-bar native drag binding is disabled.
- Pointer move initiation starts only from `[data-v1065-start-move]`.
- Coarse-pointer CSS hides the in-bar move grip, making the full booking bar a stable phone/tablet tap target.
- Planned Task retains explicit **Move / replan this step**.
- Controlled tests expose **Send only this test to a sister lab →**.
- Test detection falls back to the canonical task definition for persisted bookings without `taskKind`.
- Existing single-test sister-lab apply/replan logic is unchanged from REV 1.0.117.

## Packaging checks
Runtime JavaScript syntax, manifest parsing, local runtime references and ZIP integrity are checked during packaging. IndexedDB schema remains 35.

## Qualification boundary
This is a focused interaction regression build. REV 1.0.117's deterministic planning/network qualification remains the baseline for the unchanged solver and single-test transfer engine. A physical Android smoke test after GitHub Pages cache refresh is still appropriate.
