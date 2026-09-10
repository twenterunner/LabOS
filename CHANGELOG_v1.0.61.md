# LabOS REV 1.0.61 — web POC changes

This release remains the static GitHub Pages / browser IndexedDB POC. It does not use the desktop SQLite pilot.

## Changes
- Engineering-request workflow now surfaces exact missing required inputs instead of leaving Step 1 yellow with a generic disabled next-action. The current P26-0056-style case explicitly identifies a missing Build configuration and opens the controlled request editor at that field.
- Generic management KPI navigation is no longer labelled “Resolve”; it says “Open affected items” unless there is a true guided resolver.
- Administrator can abort and archive an in-progress build with a required rationale. The build becomes read-only, future bookings are removed, and the audit trail records the action.
- Archive manager supports a user-defined cutoff date and typed confirmation before permanent deletion of eligible archived builds.
- Planning build bars are draggable. Drag start exposes feasible slots based on the assigned person, equipment, resource-care reservations and planning situations. Dropping onto a feasible slot moves that task and replans downstream tasks to earliest feasible slots.
- Sample register is collapsed by default regardless of sample count.
- Sticky section navigation is installed on long operational pages; Standards & Resources gets a sticky local search and quick-section chips.
- Resource Assurance is consolidated across Calibration, Maintenance, Training and EHS. Six summary tiles act as filters: All, Calibration, Maintenance, Training, EHS, Risks / Actions.
- Resource Assurance supports search, status, forward horizon, and drill-down to each individual equipment asset.
- Configurable in-app expiry lead time supports weeks or months.
- Combined assurance reporting allows any subset of Calibration/Maintenance/Training/EHS and shows overdue, 0–30, 31–60 and 61–90 day buckets.
- Planning/lesson/MSA review rationale is pre-populated from the trigger/evidence and remains editable by the reviewer.
- Vacation/staff-absence proposal preview now clearly states that nothing has been saved yet and explains what accepting the impact/replan will do.
- 5S checks now include clear visual GOOD and BAD workplace examples plus explicit scoring expectations.
