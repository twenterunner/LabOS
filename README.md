# LabOS REV 1.0.107

Static GitHub Pages proof-of-concept for prototype laboratory operations. REV 1.0.107 preserves the REV 1.0.106 responsive-layout and Scenario Lab improvements and tightens AUTO PLAN so **feasible is no longer treated as synonymous with better**.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.107_WEB.zip`.
2. Upload **all files and folders from the ZIP root** to the GitHub Pages repository root, replacing older LabOS runtime files.
3. Refresh the page.
4. Confirm the header shows **REV 1.0.107**.

The deployment uses versioned JS/CSS filenames and the reset service worker so stale GitHub Pages caches do not mask the new revision.

## What changed in REV 1.0.107

### AUTO PLAN — baseline-first decision logic
- The current accepted LIVE plan is the explicit comparison baseline.
- A candidate is shown as an **optimization** only when it is no worse than baseline on every critical delivery KPI and improves at least one outcome.
- Guardrails cover unplanned builds, total days late, maximum project delay, commitment worsening and priority-weighted lateness.
- A plan that solves more previously-unplanned work but increases lateness is classified as a **Recovery trade-off — not an optimization**.
- Recovery trade-offs are separated from optimization proposals and can never receive the **Recommended** label.
- Dominated recovery results are hidden when another recovery option is equal or better on every compared KPI.
- A new baseline-versus-options table makes the decision impact visible before opening a detailed plan review.
- If none of the tested strategies beats baseline, LabOS explicitly recommends keeping the current baseline instead of manufacturing a recommendation.

### Preserved from REV 1.0.106
- Compact desktop/tablet navigation keeps the hamburger reachable and top-bar controls compress progressively.
- Daily Operations Check text is protected from one-character vertical wrapping.
- Scenario Lab only proposes verified options that improve its scenario baseline and includes a baseline-versus-scenarios comparison table.
- Multi-lab, sister-lab, execution, quality, audit and undo workflows remain intact.

## Governance
- AUTO PLAN never changes LIVE planning until a proposal is reviewed and accepted.
- Recovery trade-offs remain reviewable for genuine blocker resolution, but the UI explicitly states which delivery KPIs get worse.
- IndexedDB schema remains **35**; existing browser data is retained.

See `CHANGELOG_v1.0.107.md` and `VERIFICATION_v1.0.107.md`.
