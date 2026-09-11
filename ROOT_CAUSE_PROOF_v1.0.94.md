# Root-cause proof — LabOS REV 1.0.94

## 1. Master Planner date / calendar formatting

### Root cause
The active swimlane renderer generated the complete month, `CWxx`, weekday, date and AM/PM text **inside every single day cell**. Apart from being visually repetitive, the old week helper returned only the week number and did not carry the ISO week-year. At year boundaries this makes calendar-week interpretation ambiguous and the repeated labels become unreadable at an 8-week fit view.

### Correction
REV 1.0.94 post-processes the live planning axis into three levels:

- grouped month/year bands;
- grouped ISO week bands formatted `CW nn · yyyy`;
- individual weekday + zero-padded date cells, with AM / PM halves.

The ISO calculation is based on the Thursday rule in UTC. Automated boundary proof: **1 Jan 2027 → year 2026, week 53**.

## 2. Yellow Commitment movement tile did nothing

### Root cause
The Master Planner used the generic `metric(...)` renderer. `Commitment movement` was therefore a styled information card and had no command or filter binding. The explanatory copy even stated that it was information only.

### Correction
The complete top row is now made of actionable filter tiles. `Commitment movement` sets `App.filters.planHealth='movement'` and immediately filters Build commitment health. The same pattern is used for All, On time, Late builds, Total days late and Unplanned.

## 3. Detailed bookings section remained present

### Root cause
The active planner renderer appended a `planning-details` card after the commitment-health cards. Later layout wrappers also built a Booking detail sub-navigation destination around it.

### Correction
The detailed booking card has been removed from the active planner render output. REV 1.0.94 also removes any legacy Booking detail jump created by an earlier compatibility layer.

## 4. Probability-weighted capacity could be inflated by 100×

### Root cause
The power-tool demo data stored future-project probability as `70`, `45`, and `60`, while all display and forward-capacity code interprets probability as a fraction from 0 to 1. A 70% project was therefore displayed as **7000%** and its probability-weighted load could be multiplied by 70 rather than 0.70.

### Correction
New demo data uses fractional probabilities. `ensureEnterpriseModel()` also migrates persisted legacy values in the range `(1, 100]` by dividing them by 100 and clamps all values to `[0,1]`. This removes both the display defect and the hidden future-capacity distortion.

## 5. AUTO-PLAN still behaved like a dead end after REV 1.0.93

### Root cause
REV 1.0.93 correctly eliminated the prior iteration-driven multi-year result by introducing a calendar horizon, but the public workflow still had only one planning strategy. When protected capacity could not fit a task, it could only return `CAPACITY_UNRESOLVABLE`. That is a technically safe stop, but not a useful planning answer.

The planner also had no explicit distinction between:

- a plan that preserves existing commitments;
- a plan that adds a recoverable readiness action;
- a plan that trades capacity between projects;
- an executive escalation in which one project intentionally takes precedence.

### Correction
REV 1.0.94 evaluates complete end-to-end candidates without changing live state:

**Green:** no new training/readiness and no movement of existing project plans.

**Yellow:** calibration / maintenance / training may be scheduled, but existing project plans remain protected.

**Red:** all movable future project work may be re-optimised. Red is eligible only when its quantified whole-lab objective is better than the best protected/recovery result **and** at least one previously planned project genuinely becomes later. If global re-optimisation improves the plan without worsening another project, it is treated as a lower-disruption result instead of being labelled a trade-off.

Every candidate undergoes the same invariant and planning-integrity audit before it can be presented.

## 6. Why a remote year can no longer become “best feasible”

The production slot search is bounded by a real date horizon and jumps to the end of known blocking intervals. REV 1.0.94 adds an adversarial regression test with a whole-lab closure extending roughly 900 days while the useful planning horizon is only 45 + 30 recovery days.

Observed result:

- no eligible candidate;
- failure code `CAPACITY_UNRESOLVABLE` inside the planner engine;
- UI converts that into tier/recovery guidance rather than the raw exception;
- no remote forecast is written;
- original live bookings are byte-for-byte unchanged in the test;
- no old `no conflict-free slot exists within the controlled planning horizon` message is exposed.

## 7. Escalation semantics

Escalation is intentionally separate from normal AUTO-PLAN. The chosen target is forced first in every escalation candidate, all movable future work is replanned afterward, and multiple orderings are compared. Candidate ranking is lexicographic: earliest target completion first, then the best whole-lab objective for the remaining portfolio. The complete resulting plan is still review-only.

Chromium regression on the demo portfolio produced a valid target-first candidate with zero invariant failures, zero booking collisions and zero readiness-audit failures.

## 8. Project authority was global-role based

### Root cause
The prior Project/Requesting Team record described membership, while approval checks primarily used the user’s global demo role. That is not a sufficient enterprise identity boundary and would make later SSO integration invasive.

### Correction
Project Teams now own provider-neutral role bindings: stable principal ID, external principal key, functional role IDs and approval-right IDs. When team governance is enabled, governed records resolve the required approver through the build’s Project Team. A non-authorised team member is denied even if another principal on that team has the required right. Administrator remains an explicit system-level exception.
