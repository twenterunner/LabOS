# LabOS REV 1.0.119

Static GitHub Pages proof-of-concept for LabOS prototype-build operations. No backend or npm installation is required.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.119_WEB.zip`.
2. Copy all files to the root of the GitHub Pages repository.
3. Commit/push and hard-refresh the page.
4. Confirm the header shows **REV 1.0.119**.

## REV 1.0.119 focus
- Manual replanning now stays **inside the swimlane** in both the main Planning tab and the specific Build workspace.
- The complete visible timeline width is evaluated at **calendar-day resolution**.
- **Green** highlights are complete feasible days using current controlled readiness with no other build moved.
- **Yellow** highlights are complete feasible days after validated calibration / maintenance / training readiness actions; acceptance is explicit.
- If the next valid solution is outside the visible range, the timeline expands to it and rescans the displayed width.
- Structural capability/skill gaps route to guided recovery.
- Normal mobile taps still open Planned Task; replanning requires the explicit move action or desktop grip.
- Single-test sister-lab routing remains independent of whole-build routing and is preserved by downstream replanning.

IndexedDB schema remains 35; existing browser data is retained.
