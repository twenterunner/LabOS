# LabOS REV 1.0.106

Static GitHub Pages proof-of-concept for prototype laboratory operations. REV 1.0.106 keeps the established multi-lab planning, execution, quality and audit workflows and adds two targeted improvements: robust compact-desktop formatting and a stricter Scenario Lab decision layer.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.106_WEB.zip`.
2. Upload **all files and folders from the ZIP root** to the GitHub Pages repository root, replacing older LabOS runtime files.
3. Refresh the page.
4. Confirm the header shows **REV 1.0.106**.

The deployment uses versioned JS/CSS filenames and the reset service worker so stale GitHub Pages caches do not mask the new revision.

## What changed in REV 1.0.106

### Responsive shell / dashboard
- The primary navigation hamburger remains visible whenever the sidebar collapses.
- The top bar compresses progressively on smaller desktop windows, tablets and mobile browsers in desktop mode.
- Daily Operations Check proposal text no longer collapses into vertical one-character columns.

### Scenario Lab Stage 2
Open **Planning → Scenario Lab**.

- The comparison baseline is the accepted plan plus the selected scenario assumption, before optimization.
- The canonical planner can still test local resequencing, alternate resources, readiness recovery, portfolio trade-offs, weekend capacity, sister labs, external capacity and governed split-route concepts.
- **Only options that improve the baseline for the selected objective are displayed.** Unresolved or still-conflicted results are not proposed.
- A comparison table places the baseline and all surviving options side-by-side so delivery, network impact, disruption and cost can be compared before choosing.
- If the baseline is already best, LabOS says so instead of manufacturing a recommendation.
- Applying an option still requires rationale, creates audit evidence and keeps one-click undo.

## Governance
- Scenario mode is explicitly **NOT LIVE** until applied.
- Split-route remains a review proposal until transport/custody/handover controls are accepted.
- IndexedDB schema remains **35**; existing browser data is retained.

See `CHANGELOG_v1.0.106.md` and `VERIFICATION_v1.0.106.md`.
