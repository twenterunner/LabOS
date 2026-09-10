# LabOS REV 1.0.76

## Smart planning / replanning
- Individual build re-optimization no longer assumes every other unlocked build booking is immovable.
- AUTO-PLAN now compares three valid strategies: build-only constrained planning, selective-ripple replanning of likely conflicting programmes, and target-first portfolio replanning.
- If any strategy can meet the requested date, LabOS prefers the valid solution with the least impact on other programmes; otherwise it selects the earliest valid forecast and then minimizes collateral movement.
- Locked work is always preserved. Every candidate is post-validated for booking integrity and technical equipment capability before it can be proposed.
- The selected strategy is retained in the planning record and audit rationale.

## Planning decision UX
- Replan review now has one consolidated **Plan impact** section instead of separate repeated forecast/resource sections.
- Other programmes affected by the selected build's replan are highlighted yellow and show forecast movement and changed-booking count.
- The guided action sequence is explicit: **Review / re-optimize plan** (yellow) first, then **Commit forecast** (yellow) after the plan is accepted.
- A focused build-plan review applies the reviewed resource plan but does not silently change its committed delivery date. Commit is the next controlled action.
- Planning-event and portfolio-wide decisions retain their established one-transaction handling for accepted cross-programme impacts.

## Information architecture
- **Equipment & laboratory scope** was removed from the daily Lab Standards & Resources workspace and moved into **Audit Readiness**, where detailed equipment capability/range/resolution/readiness belongs with audit evidence.
- Lab Standards & Resources now focuses on resource assurance, methods, people/competencies and workplace standards.
