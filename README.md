# LabOS REV 1.0.103 — Scenario Lab Stage 2

REV 1.0.103 is an additive update to REV 1.0.102 and preserves the REV 1.0.98 working baseline while adding optimization and recovery to the operational digital twin.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.103_WEB.zip`.
2. Upload **all files and folders from the ZIP root** to the GitHub Pages repository root, replacing files with the same names.
3. Refresh the page.
4. Confirm the header shows **REV 1.0.103**.

## Scenario Lab
Open **Planning → Scenario Lab**. Choose an active build, optionally introduce an equipment outage, staff absence, lab closure, priority escalation or material delay, and choose the optimization objective. **Generate & rank recovery options** runs the existing canonical planning engine on a disposable clone.

The engine evaluates same-lab resequencing and alternative controlled resources, readiness/training recovery, portfolio trade-offs, target-first escalation, weekend capacity, sister labs, external facilities, selected-process split-route review and commitment movement. Nothing changes LIVE until an option is explicitly applied with rationale.

## Safety / governance
- Scenario mode is marked **NOT LIVE**.
- Applying a scenario records an audit entry and retains a one-click undo snapshot.
- Split-route is a governed review proposal only; LabOS does not fabricate a mixed-site schedule in the current single-execution-site model.
- Saved scenarios store compact definitions/results and are rerun against current LIVE data.
- Schema remains **35** and existing browser data is preserved.

See `CHANGELOG_v1.0.103.md` and `VERIFICATION_v1.0.103.md`.
