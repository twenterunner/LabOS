# LabOS REV 1.0.100 changelog

## Planning consistency

- Replaced mixed date-only/noon deadline logic with a canonical delivery-health calculation.
- Required delivery cutoff is 17:00 on the requested delivery date, matching the planner workday.
- Health uses the exact final active booking end when a canonical plan exists.
- Forecast fields are reconciled from canonical bookings during migration and after demo planning.
- Planning health tiles/list, planning badges and sister-lab recovery use the same helper.
- Lab-wide planning-event integrity checks are site-aware.

## Waterfall navigation

- Added explicit `←` / `→` timeline panning controls.
- Panning preserves the current zoom span and moves the visible window 35% earlier/later.
- `Fit` still returns to the full selected-plan range.
- Zoom now retains the current panned center rather than jumping back to the fitted center.

## Demo portfolio

- 24 power-tool projects distributed 8/8/8 across LAB-NL, LAB-DE and LAB-US.
- Prototype product defaults exercise all three internal labs.
- Added three long-horizon builds: P26-1008, P26-1012 and P26-1024 (each >28 calendar days in the seeded canonical schedule).
- Added a site-scoped Twente closure to create real capacity pressure.
- P26-1005 and P26-1006 are intentionally late at Twente and have on-time sister-lab alternatives in the supplied seed.
- No shortcut/fabricated bookings are used; demo schedules are rebuilt through `PlannerService` with site scoping.

## Data model

- Schema 34 → 35 migration is data-preserving for non-demo data.
- Demo datasets receive the requested multi-lab test portfolio in-place.
- Migration history records the delivery-truth and demo-portfolio upgrade.
