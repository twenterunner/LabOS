# LabOS REV 1.0.53 — readiness reconciliation, material output limits and mobile workflow hardening

## Correctness fixes

### Readiness status is live
A readiness row is no longer allowed to remain yellow after its underlying condition has cleared. Equipment/person reassignment now persists the change, re-evaluates the exact readiness check, closes the resolver, rerenders the workspace and shows the remaining blockers separately. Opening a resolver for a condition that is already satisfied also forces the stale workspace state to reconcile immediately.

The people-readiness calculation now evaluates only bookings that actually require a person. Non-staff planning records can no longer keep the Qualified people gate yellow while the resolver reports no failing person.

### Exact staff alternative is retained
The planning engine now treats a user-selected staff assignment as a hard planning preference for that task. Unavailable people are removed from the normal candidate pool whenever an available associated person exists. The staff resolver only displays candidates whose full simulated plan retains that exact person. This removes the failure mode where the user selected Noah but the subsequent planner error referred to Daan.

## Material receipt / output control
Engineering-supplied receipt now defaults Quantity received to the exact remaining BOM need. A larger receipt issues the needed amount and stores the excess on the same lot as available buffer stock. A smaller receipt is accepted as real evidence and recalculates a material-output limiter from all issued BOM lines.

The limiter is persistent only after real material has been issued, is migrated safely from schema 25 to schema 26, appears in the material workspace/report, and caps automatic sample creation. Existing identifiers are never silently deleted.

## Android / modal layout
All dialogs now combine responsive CSS with `window.visualViewport` sizing. The modal backdrop follows the actual visible browser viewport (including Android zoom/keyboard/orientation changes), and modal children are constrained so oversized controls cannot push the dialog off the right edge. Tables remain horizontally scrollable inside the dialog rather than expanding the dialog itself.

The process-data matrix now uses concise CP/measurement headings. Sample number, permanent Lab Sample ID and formal serial appear on separate lines. Sampling/method/reaction-plan detail remains in the CP summary/foldout rather than being repeated in every column heading.

## Verification
Retained current-version acceptance: **1,916 / 1,916 passed** before packaging:

| Suite | Result |
|---|---:|
| Core domain / planner | 46 / 46 |
| Persistence / migration | 6 / 6 |
| Tough planning scenarios | 10 / 10 |
| Role/build/workspace render stress | 1,783 / 1,783 |
| UI interaction regression | 23 / 23 |
| Build Report + Lab Performance | 14 / 14 |
| REV 1.0.53 focused behavioral checks | 14 / 14 |
| REV 1.0.53 static/mobile/source checks | 20 / 20 |

JavaScript syntax checks for core.js, repository.js, services.js, app.js and service-worker.js also pass.
