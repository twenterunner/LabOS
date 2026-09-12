# REV 1.0.100 — deadline inconsistency root cause and fix

## Observed defect

The Planning health view could report **Forecast on / before requested date** while a swimlane bar visibly extended beyond the red **Required delivery** line.

## Proven root cause

The planner schedules a normal workday through **17:00**. Forecast health in REV 1.0.99 compared date-only values such as `2026-09-24` against `2026-09-24`. However, the red timeline marker was rendered at `2026-09-24T12:00:00`.

That created two different definitions of the same deadline. Example: a plan finishing at 16:00 on 24 September was correctly date-on-time according to the old health tile, but visually appeared four hours beyond the noon red line.

A second weakness was that health trusted `request.forecastDate` even when exact booking ends were available, allowing stale summary data to diverge from the canonical schedule.

## Correction

REV 1.0.100 defines one delivery truth:

1. The active canonical plan finish is the maximum non-historical booking end for the request.
2. The requested delivery cutoff is 17:00 local planning time on `requiredDate`.
3. `finish <= cutoff` is on time; `finish > cutoff` is late.
4. The displayed forecast date is reconciled from the exact plan finish.
5. The red required-delivery marker uses the same 17:00 cutoff.
6. Planning-health filters, badges and sister-lab recovery use the same calculation.

A same-day finish at 16:00 therefore renders before the line and is on time. A same-day finish at 18:00 renders after the line and is classified late (minimum one late day signal), eliminating the contradictory state.
