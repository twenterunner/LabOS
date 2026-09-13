# LabOS REV 1.0.104 changelog

## Scenario Lab input clarity hotfix

REV 1.0.104 is a narrow UX/correctness update on top of REV 1.0.103 Scenario Lab Stage 2. The planning/recovery engine, ranking logic, sister-lab recovery, external alternatives, split-route review, apply/undo governance and schema remain unchanged.

### Fixed
- **Current risk / recovery scan** no longer shows meaningless `From` / `To` dates or an affected-resource field. A recovery scan now visibly states that it evaluates the current LIVE portfolio exactly as it stands.
- **Priority escalation** no longer asks for dates; it simply raises the selected build to Critical inside the disposable scenario.
- **Material delay** now asks for one meaningful input only: **Material available on**.
- **Equipment outage** and **Person absence** show only the relevant resource plus **Unavailable from / Unavailable through**.
- **Lab closure** shows only **Unavailable from / Unavailable through** and no irrelevant resource selector.
- Scenario definitions now store only the inputs that actually apply to the selected disruption, preventing inactive date fields from being mistaken for scenario assumptions.

### Preserved
- Same canonical planning engine for LIVE and scenario execution.
- Stage 2 recovery search and ranking across local recovery, target protection, portfolio trade-offs, weekend capacity, sister labs, external facilities, split-route review and commitment movement.
- Apply-to-LIVE rationale, audit record and one-click undo.
- Saved analyses and rerun against latest LIVE state.
- Schema **35**; no IndexedDB reset or migration.
