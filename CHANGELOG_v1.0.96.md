# LabOS REV 1.0.96 — single planning engine + universal semantic timeline

## Purpose

REV 1.0.96 removes the remaining competing planning behaviors. AUTO PLAN, MANUAL PLAN, tiered portfolio optimization and Escalation now share one planning-engine facade and the same scheduling kernel, canonical task definition, resource/readiness rules and final integrity gates. The Master Planner, build-specific planning step and sticky build cockpit also share one timeline renderer and one zoom contract.

## Planning engine

- `PlanningEngineV1096` is the single orchestration surface for protected planning, controlled recovery, portfolio optimization, escalation and manual constraints.
- Manual choices are stored as date/AM-PM/resource **constraints** and then solved by the same `PlannerService.autoPlan` kernel used by AUTO PLAN; the manual UI does not manufacture bookings independently.
- Protected planning isolates a blocked build transactionally and continues solving feasible sibling builds.
- A tier can only be selected when its candidate is **complete**. A partial Green candidate can diagnose blockers but cannot masquerade as an actionable plan.
- Green preserves existing project plans and uses released capability only.
- Yellow may schedule controlled readiness / qualification recovery while preserving other project plans.
- Red may worsen another project only when the quantified whole-lab objective improves relative to the best complete protected alternative.
- Escalation plans the selected target first after releasing movable future capacity, then rebuilds the remaining portfolio over multiple deterministic orderings and keeps the least-damaging valid result.
- Every accepted candidate must pass canonical task coverage, invariants, collision checks and readiness checks.
- Planning search remains bounded by a useful date horizon; a capacity failure never becomes a remote multi-year “best feasible” date.
- Blockers open a guided transaction: root cause → applicable recovery → same engine recalculation → impact review / acceptance.

## Universal swimlane timeline

- One renderer is now used in the **Master Planner**, **build-specific Resource plan & committed timing**, and the **sticky build cockpit**.
- Removed the fixed Horizon selector above planning lanes.
- Controls are leading and consistently ordered **− · Fit · +**.
- **−** zooms in by reducing the date duration shown; **+** zooms out by increasing the duration. Zoom changes the time domain, not the pixel width.
- **Fit** derives the earliest/latest bounds of the selected build population, including delivery / commitment / forecast markers, and fits that complete range to the available width.
- Swimlanes are always `100%` of the available page width and no longer become a giant horizontally scrolling pixel canvas.
- Calendar headers use one aligned hierarchy: **MONTH YEAR → ISO CW + ISO week-year → weekday/date (+ AM/PM at detailed scale)**.
- Weekend shading is retained when weekends are disabled.
- At broader time scales the day row adapts to week-period labels instead of cramming unreadable daily text.
- Legacy generic zoom, sticky-only zoom and post-render grouped-axis mutation are disabled so there is no competing timeline implementation.

## Master Planner population + filters

- Portfolio lanes are created from **all active builds first**, not from existing bookings. An active/committed build with no valid bookings is therefore visible as **Schedule unresolved** instead of disappearing.
- The six commitment-health tiles — All, On time, Late builds, Total days late, Commitment movement and Unplanned — now filter the actual swimlane build population.

## Verification

Dedicated REV 1.0.96 verification: **73 / 73 passed, 0 failed**, including a real Chromium browser run with **0 page errors**.

Adversarial coverage includes universal timeline sizing/zoom/ISO week-year, all six swimlane filters, committed-but-unplanned visibility, canonical auto/manual/sticky task alignment, partial-build failure isolation, manual constraint validation through the shared solver, target-first escalation integrity, and a 900-day lab-closure horizon guard. Reference portfolio timing in the verification environment: AUTO PLAN ~3.45 s; Escalation ~1.28 s.
