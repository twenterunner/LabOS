# LabOS Controlled Rebuild — Stage 2 Planning Feedback Correction within Stage 3 Acceptance

Date: 2026-09-19
Controlled build target: **STAGE3-GITHUB-TEST-4**
Product revision: **1.0.185**

## Scope

This correction was performed only because Stage-3 GitHub manual testing exposed regressions inside the protected Stage-2 Planning boundary. Stage 4 was not started and no new planner or scheduler was introduced.

## Browser findings and architectural causes

1. **Planning perspectives diverged.** Canonical Planning tabs reused the legacy `data-plan-view` event path, allowing non-Overall selections to enter the older Visual Resource Planning renderer. The canonical views now use a dedicated `data-canonical-plan-view` path that stops the legacy handler. Overall, Per programme, Per equipment and Per person remain in one canonical renderer; only grouping changes.

2. **In-lane manual replan lost its Green/Yellow overlay.** The existing V1190 in-lane replanner searches for the governed timeline/booking DOM contract (`data-v1096-timeline`, range metadata and `data-planning-booking-v1061`). The canonical Stage-2 board had stopped exposing that contract, so the action fell back to the full manual planner. The canonical board now exposes the same contract while retaining its canonical booking IDs and data model. No second manual-planning engine was created.

3. **Tap/replan response was slow.** The fallback path performed repeated synchronous constrained solves. A representative pre-correction full manual-slot search took about 7.1 seconds in the Node demo environment, and an individual constrained candidate took roughly 170–230 ms. The governed in-lane scan now yields to the browser after every constrained candidate rather than processing a batch of five synchronously. The planned-task prompt still opens before the constrained scan begins, so user interaction is not intentionally blocked on the full scan.

4. **Validation-demand planning versus AUTO PLAN was confusing.** Source tracing confirmed both were adapters over the same Stage-2 `PlanningPortfolioService`: the Validation action was a validation-only compatibility orchestration, whereas AUTO PLAN covered the whole portfolio. The canonical Planning page now exposes one whole-demand AUTO PLAN action. Validation-only compatibility planning remains available only where workflow-specific compatibility needs it; it is not presented as a competing Planning-page authority.

## Regression protection added

`qa/stage2-browser-feedback-tests.js` contains five cases covering:

- dedicated canonical perspective event path;
- same canonical Planning shell for all four perspectives;
- canonical in-lane timeline/booking contract;
- event-loop yielding after each constrained candidate;
- one whole-demand AUTO PLAN on canonical Planning while retaining the single Stage-2 portfolio kernel.

The suite is additional feedback protection; it does not replace the canonical Stage-2 70-case acceptance gate.

## Architecture preserved

- One Stage-2 PlanningEngine / PlannerService remains the scheduling authority.
- Prototype and Validation still share the same scheduling kernel.
- Manual, AUTO, portfolio and sister-lab feasibility remain adapters to the same planning architecture.
- Stage-3 transfer governance remains separate from Stage-2 scheduling authority.
- Stage-1 StateTransactionService and persistence boundaries are unchanged.
