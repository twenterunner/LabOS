# LabOS REV 1.0.93 — explicit Control Plan governance and bounded AUTO-PLAN

## Purpose

REV 1.0.93 corrects two defects found in the controlled build workflow:

1. the build could appear to offer a yellow **Continue** action while an edited Control Plan was still waiting for approval; and
2. AUTO-PLAN could search so far beyond the requested delivery that a date years in the future could be presented as the least-bad / "best feasible" proposal.

## Control Plan approval workflow

- The sticky **SIGN-OFF** and **NEXT ACTION** areas now expose the actual Control Plan governance gate instead of presenting a non-working Continue button.
- When final Quality Engineering approval is pending, the workflow names the responsible Quality Engineer and states that **Resource plan & committed timing remains locked**.
- The Control Plan workspace now contains a compact **Control Plan approval path** showing:
  1. controlled definition;
  2. build-specific change sign-off; and
  3. final Quality Engineering approval.
- Editing Control Plan content invalidates the approval of that revision. The edited revision returns to **Draft**, review/approval timestamps are cleared, and a fresh approval round is created.
- Prior approvals are retained as **Superseded** audit evidence rather than silently overwritten.
- An already Approved build-specific Control Plan is never edited in place: LabOS creates a new build-specific revision.
- Once the governed approval path is complete, the revision can become an approved reusable Control Plan in the product portfolio.

## AUTO-PLAN root-cause correction

### Root cause in REV 1.0.92

The two slot-search routines used fixed iteration counts (`5000` / `8000`) rather than a calendar planning horizon. Each failed attempt advanced through `nextWorkStart()`, which jumps over nights and weekends. Consequently those iteration counts represented **years of possible calendar movement**, not a controlled number of hours/days. Candidate ranking could therefore accept an extremely late but technically conflict-free plan as the "best feasible" option.

The defect became especially visible after the final closeout work was made an explicit scheduled booking, because that step used the same unbounded slot search.

### REV 1.0.93 correction

- Detailed planning now has an explicit date-based horizon: by default **180 days from planning start or requested delivery + 90 days, whichever is later**. The values remain configurable through planner settings.
- Slot search is bounded by that horizon and returns a controlled `CAPACITY_UNRESOLVABLE` blocker when no feasible slot exists.
- LabOS explicitly tells the user that the planning horizon was reached rather than fabricating a multi-year "best" date.
- Failed proposals remain atomic: no partial bookings or forecast are committed to live state.
- The search now jumps to the end of known blocking intervals (bookings, closures and other hard events) instead of repeatedly testing each intervening hour, substantially reducing pathological search work.

## Root-cause proof

Using the actual REV 1.0.92 PlannerService with the same synthetic hard-capacity scenario:

- requested delivery: **18 Sep 2026**
- whole-lab capacity unavailable through: **7 Jun 2029**
- REV 1.0.92 proposed forecast: **13 Jun 2029**
- lateness: **999 days**

Running the same scenario through REV 1.0.93:

- planner stops at the controlled horizon: **15 Mar 2027**
- result: `CAPACITY_UNRESOLVABLE`
- live bookings remain unchanged
- no bogus forecast is written

See `ROOT_CAUSE_PROOF_v1.0.93.md`, `ROOT_CAUSE_REPRO_BEFORE_v1.0.93.json` and `ROOT_CAUSE_REPRO_AFTER_v1.0.93.json`.

## Verification

- JavaScript syntax checks pass for all application/service-worker files.
- Runtime Control Plan revision/invalidation tests pass.
- Normal AUTO-PLAN regression succeeds and stays inside the controlled horizon.
- The exact multi-year defect is reproduced on the unmodified REV 1.0.92 service and rejected on REV 1.0.93.
- Headless Chromium verifies the requester and Quality Engineering sticky-governance states with no page errors.
- Aggregate targeted verification: **22 / 22 passed, 0 failed**.
