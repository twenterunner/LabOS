# LabOS WEB POC — REV 1.0.64

## Changes
- Engineering dashboard: all six summary tiles are now interactive filters for the request list.
- Planning move workflow: drag now has a pointer-event fallback, a visible drag grip, clickable/drop-target feasible options, capable equipment + qualified people search, working-hour-aware multi-day duration handling, and automatic downstream replanning.
- Planning feasibility no longer rejects long activities merely because they extend beyond one working day.
- Lab Standards & Resources now embeds a Resource Assurance & Availability section with filter tiles and exact out-of-service/return windows.
- Resource Assurance now highlights setups already reserved out of service for calibration or maintenance and shows affected/next-use builds.
- 5S workplace control now includes three raster bench-top visual references in the standards page and 5S check modal.
- Resource Assurance links from Lab Standards & Resources now open the relevant resource/type rather than a generic page.
- Sticky local navigation from the previous release is retained.
- Static asset/cache revision raised to 1.0.64.

## Verification completed
- JavaScript syntax checks: app.js, core.js, services.js.
- Pure-render smoke test across Dashboard, Planning, Lab Standards & Resources, Resource Assurance, Quality, Management, Requests, Reports and Admin for representative roles.
- Engineering dashboard verified to render exactly six filter controls.
- Resource Assurance integration verified to render six assurance filters and setup pull/return data.
- 5S gallery verified to reference all three packaged raster assets.
- Planning feasibility tested with a 12-hour activity and a deliberately blocked assigned welder; eight feasible alternatives were returned and an alternate capable welder was selected.
- Demo-state invariant validation: 0 invariant errors.
