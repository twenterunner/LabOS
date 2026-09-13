# LabOS REV 1.0.104 — Scenario Lab Stage 2 input clarity

REV 1.0.104 is a narrow update to REV 1.0.103. It preserves the complete Scenario Lab Stage 2 recovery engine and fixes the scenario-builder inputs so users only see assumptions that actually affect the selected simulation.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.104_WEB.zip`.
2. Upload **all files and folders from the ZIP root** to the GitHub Pages repository root, replacing files with the same names.
3. Refresh the page.
4. Confirm the header shows **REV 1.0.104**.

## Scenario Lab input rules
Open **Planning → Scenario Lab**.

- **Current risk / recovery scan:** no resource or dates; evaluates current LIVE conditions.
- **Equipment outage:** equipment + unavailable-from + unavailable-through.
- **Person absence:** person + unavailable-from + unavailable-through.
- **Lab closure:** unavailable-from + unavailable-through.
- **Priority escalation:** no dates; target becomes Critical in the scenario only.
- **Material delay:** one date, **Material available on**.

**Generate & rank recovery options** still runs the existing canonical planning engine on a disposable clone. Nothing changes LIVE until an option is explicitly applied with rationale.

## Safety / governance
- Scenario mode is marked **NOT LIVE**.
- Apply records an audit entry and retains a one-click undo snapshot.
- Split-route remains a governed review proposal rather than fabricated mixed-site bookings.
- Schema remains **35** and existing browser data is preserved.

See `CHANGELOG_v1.0.104.md` and `VERIFICATION_v1.0.104.md`.
