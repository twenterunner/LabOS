# TEST-11 — External routing mobile restore

- Corrected external-routing eligibility so canonical prototype process/inspection activities such as Final Inspection are not rejected solely because their task kind is `process` rather than literal `test`.
- External routing still requires: current/non-historical work, planner authority, canonical independent task routing, and at least one active external provider.
- Moved the external-routing action into an explicit body callout in the planned-item modal, so the action remains visible on Android/narrow viewports and cannot be lost below a wrapped sticky footer.
- Preserves the TEST-10 governed external-execution lifecycle and full-bleed Planning geometry.
