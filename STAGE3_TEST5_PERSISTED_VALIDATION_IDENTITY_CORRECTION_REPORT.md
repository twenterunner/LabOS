# LabOS Stage 3 — TEST 5 Persisted Validation Identity Correction Report

Date: 2026-09-19

Source under review: **STAGE3-GITHUB-TEST-5**  
Corrected checkpoint target: **STAGE3-GITHUB-TEST-6**

## Browser defect

A carried-forward Validation booking could open the common planned-item window but fail to expose task-level sister-lab routing and fail to produce working in-lane manual alternatives, while Prototype remained correct.

## Confirmed historical identity cause

Historical Validation planning used synthetic identities such as `TESTREQ-<programme>-<standard-test>` before Stage 2 established stable Validation activity IDs end-to-end. Current planning/network paths require the stable activity ID.

A new red regression fixture deliberately converted a canonical Validation booking to a historical TESTREQ identity. Against unmodified TEST 5 the initial continuity regression produced **2 PASS / 4 FAIL**, proving the canonical boundary did not repair the stale reference.

## Stage-1 canonical repair

`DataRepairService.repairValidationBookingIdentity` now repairs deterministic historical Validation references at the canonical load/import/reset boundary. It uses stable activity references, task-definition genealogy and the historical standard-test relationship. It never resolves by display name alone.

- unique deterministic match → stable Validation activity ID is materialised;
- unresolved reference → `VALIDATION_BOOKING_ACTIVITY_UNRESOLVED` structured integrity issue;
- ambiguous reference → `VALIDATION_BOOKING_ACTIVITY_AMBIGUOUS` structured integrity issue;
- related SiteAssignment/network task references and planning constraints are updated only when deterministic;
- ownership/site semantics are otherwise preserved;
- already-canonical reload is read-stable and does not cause repeated persistence.

## Stage-2 correction discovered by the new regression

The new continuity test also exposed that Validation replanning could append new active bookings while retaining an old local live booking. `_validationPlan` now removes only the programme's prior **active** bookings before solving/replacing its live Validation plan; historical rows remain for traceability. This ensures an accepted Stage-3 SiteAssignment remains the single live routing authority.

During final recertification, the existing persisted-state regression caught a follow-on manual-alternative classification issue: when the corrected Validation planner assigned a real resource to a booking that had previously been unassigned, the old classifier incorrectly downgraded that feasible option to Yellow. A shared Stage-2 classifier now treats `unassigned → valid assigned resource` as ordinary feasible planning; Yellow is reserved for displacing an already-controlled resource or adding readiness/care work. The same classifier is used by `PlanningEngine.feasibleSlots` and the Validation in-lane renderer.

## Regression evidence

Historical Validation identity continuity suite: **8/8 PASS**

It proves:
- deterministic historical TESTREQ → stable activity repair;
- ownership/site semantics preserved;
- unresolved identity produces structured issue and no guess;
- persistence/reload stability;
- repaired planned-item routing + Stage-2 manual alternatives;
- canonical network alternatives and accepted remote assignment survive replan/reload;
- repair is input-read-pure;
- ambiguous identity produces structured issue and no guess.

Existing Test-4 feedback/persisted-state regression remains **9/9 PASS** after the final classification correction, without weakening the test.

No Stage-4 functionality was introduced.
