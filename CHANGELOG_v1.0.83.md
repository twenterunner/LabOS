# LabOS REV 1.0.83

## Lab Standards & Resources navigation

- Fixed the actual runtime cause of the missing sticky section menu. The dedicated standards menu was previously created and then deleted by a later generic navigator installer.
- A final authoritative sticky menu is now installed after all legacy render hooks.
- The menu contains Resource assurance, Equipment & scope, Methods & standards, People & competencies, Requesting teams, 5S workplace and Governance.
- The standards search remains available while the menu is sticky.
- Restored Equipment & scope as a first-class section in the consolidated standards workspace.
- Added an explicit `std-governance` target rather than relying on text heuristics.

## Controlled requesting / engineering teams

- Added `Lab Standards & Resources → Requesting teams` as controlled master data.
- Removed stale sensor-business demo options such as ADAS Sensors from fresh demo data.
- Fresh demo teams: Power Tool Platform, Motor & Drive, Mechanical Design, Electronics, Advanced Concepts and Systems Engineering.
- Engineering users are linked to a controlled team and New prototype request defaults to that team only for an engineering requester.
- Lab Planner / Administrator starts with no team selected when creating on behalf of Engineering.
- Blank, inactive and unknown teams are rejected by request creation/submission services.
- Admin can add, rename, activate and deactivate a team; rename updates users and request references atomically and deactivate preserves history.
- Existing REV82-style demo states migrate stale demo team names once; custom non-demo team names are retained.

## AUTO-PLAN robustness

- AUTO-PLAN is now transactional. Any thrown planning error restores the entire pre-plan state.
- Added a final target-related planning-integrity gate before a plan can be retained.
- Resource selection is readiness-first, load-aware and deterministic within near-equivalent finish windows.
- Candidate scoring considers required readiness intervention count, preferred-person penalty, future calibration/maintenance/qualification margin, 14-day resource load, finish time and deterministic resource IDs.
- A user/person preference is soft rather than excluding other valid capacity.
- Portfolio strategy selection now minimizes commitment damage and planning churn in addition to target timing.
- Every candidate is audited for equipment readiness, staff qualification, equipment/staff overlap, hard planning-event overlap and capability mismatch.
- Added `AUTO-PLAN DECISION QUALITY / Why this plan won` to explain the selected strategy and compare alternatives.

## Verification

- 22/22 release checks passed.
- Runtime rollback test deliberately injected an impossible capability and proved byte-for-byte state restoration after `ZERO_EQUIPMENT_CAPABILITY`.
- Resource resilience test made EQ-008 calibration-expired while EQ-007 remained ready for the same Electrical Test capability; AUTO-PLAN selected EQ-007, created no avoidable EQ-008 readiness job and finished with zero integrity conflicts.
- Chromium verified the final standards menu is the only section navigator, is computed `position: sticky`, remains at 72 px after scrolling, and contains all seven section links.
- Chromium verified team add/deactivate, blank Admin wizard default, Engineering requester team inheritance, legacy demo migration, optimizer strategy comparison and zero page errors.
