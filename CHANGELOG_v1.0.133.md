# LabOS REV 1.0.133 changelog

## Prototype build flow and AUTO PLAN
- Material receipt is now evidence-aware. If the exact BOM is fully received/issued, the Material Receipt route step is considered satisfied and is removed from future planning-task coverage.
- Accepted planning situations (lab closure, vacation, equipment/staff availability events) remain hard constraints and are planned around. The automatic horizon extends beyond finite active events with a bounded recovery buffer.
- Calibration readiness now separates: calibration renewal genuinely required, calibration certificate/evidence gap, and future scheduled calibration. Missing evidence no longer causes an unnecessary calibration activity.
- AUTO PLAN recovery carries the exact task and equipment context into the guided resolution. Calibration diagnostics include planned-use date and calibration due date where available.
- Accepted planning situations are shown as calculation context only, never as a blocker the user must remove.
- Planning coverage failures now name the specific missing/mismatched task instead of generic “Planned activity”.
- Prototype execution treats a Material Receipt route step as complete when the governed material workflow already proves the full build material is issued.

## Compatibility
- Data schema remains 35; no reset is required.
- Existing planning, multi-lab, role and build evidence structures are retained.
