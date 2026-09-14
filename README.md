# LabOS REV 1.0.112

Static GitHub Pages proof-of-concept for prototype laboratory operations. REV 1.0.112 is a focused multi-lab scoping correction built on REV 1.0.109.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.112_WEB.zip`.
2. Upload **all files from the ZIP root** to the GitHub Pages repository root, replacing the older LabOS runtime files.
3. Refresh the browser.
4. Confirm the header shows **REV 1.0.112**.

Versioned JS/CSS filenames and the reset service worker are retained to prevent stale GitHub Pages assets from masking the update.

## REV 1.0.112 correction
The Master Planner health tiles were being rendered correctly in an active-lab planning context, then overwritten by a later post-render enhancement after the enterprise state had been restored. That caused every laboratory to show the same enterprise totals.

REV 1.0.112 makes the planning-health model explicitly active-lab scoped whenever no explicit request subset is supplied, and the post-render planning experience re-enters the active-lab state before rebuilding KPI tiles, Commitment Health and grouped timeline headers.

With the shipped demo dataset the expected local metrics are:

| Metric | NL-TW | DE-ST | US-DT |
|---|---:|---:|---:|
| All open | 8 | 5 | 8 |
| On time | 2 | 4 | 5 |
| Late builds | 2 | 0 | 0 |
| Total days late | 9 | 0 | 0 |
| Commitment movement | 4 | 4 | 5 |
| Unplanned | 4 | 1 | 3 |

A controlled sister-lab transfer changes the request `executionSiteId`; therefore the build leaves the source lab's operational metrics and enters the receiving lab's metrics, while home-site transfer history remains retained.

## Data compatibility
IndexedDB schema remains **35**. Existing browser data is retained; no reset is required.

See `CHANGELOG_v1.0.112.md`, `QA_REPORT_v1.0.112.md`, and `VERIFICATION_v1.0.112.md`.


## REV 1.0.112
- Per-build swimlanes again show the selected build required-delivery red line on every task lane.
- Tapping/clicking a future planned task exposes **Move / replan this step**, which opens the existing Green / Yellow / Red validated manual-move flow. Completed/historical work remains locked.
- Build-specific route changes are preserved: automatic reuse no longer restores a removed operation on the next render. After an unnecessary method (for example Thermal Soak) is removed, one confirmation records both route confirmation and the explicit route/method review when the remaining definition is technically ready, then advances to the next controlled stage.
- Route/test edits reopen process and controls review, preventing stale review state.
- Process planning and guided resolution now evaluate the exact governed process revision recorded on the route.
