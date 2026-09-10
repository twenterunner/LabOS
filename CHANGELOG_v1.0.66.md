# LabOS REV 1.0.66

## Planning resolution
- Planning presentation and move suggestions now use **Morning / Afternoon** resolution rather than minute-by-minute choices.
- Feasible move choices are generated at AM/PM boundaries while still checking equipment, qualified staff, existing bookings, resource-assurance reservations, absences and dependencies underneath.
- Portfolio/build/equipment/people swimlanes now display AM/PM subdivisions.

## Build request sticky cockpit
- Reworked the build request cockpit into a **full-width sticky control surface**.
- Integrated the complete Guided Build Workflow into the sticky area.
- Added a second row with **substeps for the selected workflow stage**, including process-route steps and execution-route steps.
- Added a compact **planning swimlane** directly in the sticky cockpit.
- Added an **overall 0–100% progress indicator**.
- Removed the duplicate left-hand Guided Build Workflow panel so the working area below is full width.

## Next-action banner
- The global My/Team Next Action banner is restricted to the Dashboard and Action Centre only.
- Ordinary pages and build workspaces no longer receive this banner.

## Release checks
- Version/cache-bust updated to 1.0.66.
- JavaScript syntax checks added for all runtime files.
- Static acceptance checks added in `verification-v166.py`.
