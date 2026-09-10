# LabOS REV 1.0.79

## Planner/readiness consistency
- Fixed the root cause of post-AUTO-PLAN equipment-readiness failures: AUTO-PLAN used semantic planning capabilities while the readiness UI still compared legacy broad equipment categories.
- Readiness now uses the same process/test capability and competency model as AUTO-PLAN.
- Processes that intentionally need no dedicated equipment no longer create false "No equipment assigned" blockers.
- Projected calibration, maintenance and training readiness is time-accurate. A same-day prerequisite only counts after its scheduled completion time.
- AUTO-PLAN booking records retain their semantic planning capability for later verification and troubleshooting.

## 5S and Lab Standards & Resources
- Saving or closing a 5S corrective action preserves the user's page position instead of jumping to the top.
- Lab Standards & Resources now uses the same pill-style sticky section-navigation pattern used elsewhere, with an integrated search field.
- Existing 5S history and open-action tracking remains persistent.

## E0 / E1 / V / P internal profiles
- E0: Pre-A / exploratory engineering; deliberately lean and restricted to preliminary internal experiments.
- E1: A-sample / structured engineering; controlled repeatable experiments used for project conclusions.
- V: B-sample / validation; formal verification/validation evidence.
- P: C-sample / production intent; strongest prototype governance.
- The UI explicitly states that these are internal LabOS profiles, not IATF 16949 classifications, and that applicable statutory/customer/product-safety/competence/measurement/laboratory requirements cannot be waived by the profile.

## Fresh demonstration portfolio
- All previous seeded build/request data is intentionally replaced on demo-dataset migration.
- New demo contains 24 power-tool prototype requests across 12 product families, including drills, impact drivers, grinders, sanders, saws, oscillating multi-tools, rotary hammers, routers, heat guns and planers.
- Requests cover E0/E1/V/P and multiple workflow stages from draft through closed, with varied routes, tests, sample populations and historical planning/KPI outcomes.
- User identity and the weekend-planning preference are preserved when the demo portfolio is replaced.
