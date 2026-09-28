# LabOS TEST-7 — My Work resource-care cleanup

## User-reported problems
- My Work contained many calibration / maintenance / training cards with weak target identification.
- Duplicate cards could accumulate across repeated scheduling / legacy persisted data.
- The same apparent owner could be shown across all three labs.
- Retired automotive demo-sensor naming must not appear in LabOS.

## Corrections
1. Canonical resource-care deduplication now uses one active obligation per care type + site + target (+ competency for Training). Older duplicate reservations remain auditable as `Superseded`, but no longer produce active My Work cards.
2. Legacy generic care actions without a clean `careItemKey` are reconciled to the single active reservation when possible; stale/orphan and duplicate care actions are removed from active My Work state.
3. New scheduling replaces any prior logical action for the same controlled obligation instead of appending another card.
4. Every active care action is normalized to a target-specific title and context:
   - Calibration / Maintenance: equipment name + equipment ID + lab.
   - Training: person + competency + lab.
5. My Work now uses primary responsibility rather than every fallback action role:
   - Calibration -> local Metrology owner.
   - Maintenance -> local Lab Manager.
   - Training -> local Lab Manager.
   Administrators retain oversight, and Resource Assurance remains available for cross-role management.
6. Site ownership resolves from site-local staff first and lab metadata second, preventing fallback to one global owner for all labs. Demo ownership is distinct:
   - Twente: Lucas Vos / Daan Mulder (manager / metrology)
   - Stuttgart: Anna Keller / Markus Vogel
   - Detroit: Rachel Morgan / Daniel Brooks
7. Retired automotive demo-sensor product naming is scrubbed from persisted/imported data and the seeded future-project opportunity was renamed to `Next-gen industrial pressure sensor DV`. Power-tool functional terminology remains where it describes the tool function rather than the retired sensor product family.

## Focused verification
- `qa/mywork-resource-care-cleanup-test7.js`: 7/7 PASS.
- Prototype Create Draft: 3/3 PASS.
- Planning Scenario / external task restoration: 8/8 PASS.
- Planning swim-lane layout: 6/6 PASS.
- Future Projects / KPI: 6/6 PASS.
- Future-project Prototype/Validation work package + Scenario: 7/7 PASS.
- Copy previous Prototype/Validation scope: 4/4 PASS.
- Combined listed regression checks: 41/41 PASS.
- JavaScript syntax checks: PASS.

Interactive local Chromium navigation is blocked by the environment administrator policy, so TEST-7 remains a browser-acceptance candidate rather than a final accepted baseline.
