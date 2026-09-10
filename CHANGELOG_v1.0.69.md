# LabOS REV 1.0.69 — Guided execution and full-build sticky planning

Baseline: REV 1.0.68 static WEB / GitHub Pages build.

## Guided colour semantics

The sticky build workflow now uses one deterministic visual language:

- **Green** = completed.
- **Yellow** = current step / the next action the user should take.
- **Grey** = future step.
- **Red** = blocker or exception that prevents progress.

A current workflow stage that contains a blocker stays yellow so the user can still see where they are, while an explicit red **BLOCKER** flag and red blocker panel show what must be resolved.

## Next-action behaviour

For build execution, the sticky **NEXT ACTION** control now resolves to the actual action required for the current route step: start the operation, record required data, complete the execution, go to the prerequisite route step, or resolve equipment readiness. The corresponding primary action in the route card is yellow as well.

## Refined main route card

The execution card has been rewritten and restyled to make the hierarchy clearer. It now identifies the build-route step and total step count, sample completion, setup/recipe data, sample-level process data, Control Plan evidence, and a single highlighted next action. Current, completed and future route-step states use the same yellow/green/grey semantics as the sticky workflow.

## Full-build planning in sticky cockpit

The sticky build cockpit no longer shows only a seven-day slice. It now fits the **entire planned build flow** from the first booking to the last booking by default, at Morning/Afternoon planning resolution. Route steps not yet scheduled are called out explicitly.

Planning zoom controls are provided:

- **Fit** — show the whole build flow.
- **+** — zoom in for more timing detail.
- **−** — zoom back out.

Planned bars follow workflow state colours: completed green, current yellow, future grey.

## Sticky cockpit typography and layout

Typography in the build workflow, route substeps, plan and command area was enlarged slightly, spacing was rebalanced, and the full-width sticky area was kept compact enough to preserve useful working space below.

## Verification

`verification-v169.py` performs release checks for versioning, deterministic workflow/substep colours, next-action routing, full-flow planning and zoom controls, JavaScript syntax, and the existing v1.0.68 planning-capability regression. Result for this package: **24/24 checks passed**. The portfolio planner regression produced **14 successful build plans, 198 bookings, 0 equipment-capability mismatches and 0 invariant errors**.
