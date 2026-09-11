# LabOS REV 1.0.94 verification

Run from the release folder:

```text
node verification-v194.js
```

Result: **40/40 passed**.

Coverage includes JavaScript syntax, schema 31→33 migration, fresh-state invariants, provider-neutral project-team authorization, calendar/UI markers, Yellow decision gating, tiered score guard, escalation flow, bounded interval-jump search, eight representative single-build plans, the complete 21-build atomic portfolio, final planning-integrity audit, controlled task-manifest equality, capacity exhaustion, unavailable equipment, transactional rollback, performance bounds, collision injection, task label/missing/duplicate fault injection and invalid role/right injection.

Browser QA additionally verified:

- 3 month groups, 8 ISO week groups and 56 day cells for the eight-week planner horizon;
- zero repeated legacy month/week day headers;
- Total days late and all five commitment-health filters;
- live Unplanned filtering (8/8 visible rows in the seeded state);
- Detailed bookings section absent;
- escalation visible only to an authorized planning role;
- project-team editor with 12 principals, 12 role selectors, 84 right checkboxes and provider/group fields;
- portfolio and escalation proposal dialogs contain decision-tier summaries and no raw solver text;
- the sticky schedule shows the same stable task numbers and names as the manual planner, including test work and final handover;
- completed route work is labelled as completed before the remaining-work plan, not incorrectly shown as unplanned.
