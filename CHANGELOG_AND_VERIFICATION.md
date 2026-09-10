# LabOS REV 1.0.54 — hard workflow gates, learning closeout and mobile report clarity

## 1. Green now means completed

Lab Setup no longer infers completion from records merely existing in the database. Each setup area has a minimum-information rule and an explicit reviewed-completion milestone. A step turns green only when both conditions are true. Later steps are locked until all preceding steps are completed. Migration to schema 27 intentionally clears old inferred setup ticks so an upgraded lab must review its setup milestones rather than inheriting decorative green states.

The guided build workflow follows the same sequencing principle: later required stages cannot be opened while an earlier stage is incomplete.

The Equipment setup stage also prevents a dead end after import: equipment records with missing calibration or maintenance durations are listed directly in the wizard and can be completed there before continuing.

## 2. Lessons & Learning is a controlled closeout workflow

Engineering handover & close now contains a first-class **Lessons & Learning** workbench. LabOS derives candidate lessons from the complete build record using deterministic evidence rules, including:

- quality / deviation and yield exceptions;
- schedule commitment changes and total schedule churn;
- material-output constraints;
- failed governed Control Plan measurements;
- route operations materially slower than the planning basis; and
- process/method development that was proven and released during the build.

Linked evidence is consolidated so a failed measurement already covered by its quality deviation is not proposed again as a second lesson. Multiple commitment movements are summarized as one schedule-learning proposal.

Every proposal exposes its evidence in a foldout. The user must **Accept** or **Reject** it and record rationale. Accepted lessons become retained learning records; rejected proposals retain their rejection rationale. A delivered build cannot be closed while lesson proposals remain undecided. Accepted learning, evidence, recommendation and decision rationale are included in the controlled Build Report.

## 3. Audit-history formatting defect fixed

Structured before/after snapshots are summarized into readable object identity/status information rather than serializing full JavaScript objects into narrow report cells. This removes the raw JSON wall seen in the closeout/audit screenshot.

## 4. Build Report terminology and mobile layout

The report now uses explicit terminology:

- `11 of 12 operations` means execution evidence has been retained for 11 of the 12 required route operations for that sample.
- `Not linked to current BOM` replaces the internal `Unmatched` status and means a historical/migrated material issue remains traceable but does not satisfy a current BOM requirement.

Simple report tables use fixed, viewport-safe layouts rather than inheriting the large minimum width used by analytical matrices. Material genealogy, sample register, common evidence, approval and lesson tables wrap inside the Android modal; complex analytical matrices may still scroll horizontally inside their own controlled container. Approval person/date/comment information is kept on separate lines rather than concatenating text.

## 5. Commitment changes have an owning action

The ambiguous `Commitment movement waiting for acceptance` KPI is replaced by **Commitment decisions**. When the feasible forecast differs from the current promised date, the KPI becomes a direct action. Its queue shows build, current commitment, proposed forecast, movement and reason, then opens the existing controlled commitment decision workflow to keep or change the commitment with rationale.

## 6. Retained prior fixes

REV 1.0.54 retains live readiness reconciliation, deterministic selected-person planning, material receipt/output limiting, visual-viewport Android modal containment, controlled process/Control Plan execution, 5S, configurable test families, personal Action Centre, LIMS import/setup wizard, concise Build Report and the exception-first Lab Performance cockpit.

## Verification

Final retained acceptance target: **1,927 / 1,927 passed** after package extraction.

| Suite | Result |
|---|---:|
| Core domain / planner | 46 / 46 |
| Persistence / migration | 6 / 6 |
| Tough planning / disruption scenarios | 10 / 10 |
| Role/build/workspace render stress | 1,783 / 1,783 |
| UI interaction regression | 23 / 23 |
| Readiness/material/mobile/staff behavior | 14 / 14 |
| Build Report + Lab Performance | 14 / 14 |
| Hard-gate/lessons/terminology focused checks | 11 / 11 |
| Static/mobile/package-source checks | 20 / 20 |

A genuine physical Android/iOS browser exploratory pass cannot be automated in this execution environment; responsive containment and behavior are covered by the automated suite, with user-device screenshots used to identify the final visual issues.
