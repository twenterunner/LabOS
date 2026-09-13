# LabOS REV 1.0.108

Static GitHub Pages proof-of-concept for prototype laboratory operations. REV 1.0.108 preserves REV 1.0.107 planning/scenario behavior and restores reliable role switching on Android and other compact screens.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.108_WEB.zip`.
2. Upload **all files and folders from the ZIP root** to the GitHub Pages repository root, replacing older LabOS runtime files.
3. Refresh the page.
4. Confirm the header shows **REV 1.0.108**.

The deployment uses versioned JS/CSS filenames and a reset service worker so stale GitHub Pages caches do not mask the new revision.

## What changed in REV 1.0.108

### Android / compact-screen role selector
At compact widths the header role selector stays hidden so the LabOS logo, My Work counter and active-lab selector remain usable. The **same Demo role selector is now available at the top of the hamburger navigation drawer**.

- Tap the hamburger menu.
- Choose a role from **Demo role**.
- LabOS persists the role, refreshes role-based navigation/content and closes the drawer.
- The hidden header selector and the mobile selector remain synchronized.
- The drawer control uses a native 46 px touch target for Android reliability.

### Preserved from REV 1.0.107
- AUTO PLAN only labels non-worsening improvements as optimization proposals.
- Feasible-but-worse schedules are clearly separated as recovery trade-offs and can never be Recommended.
- Scenario Lab only proposes options that beat its scenario baseline and includes a baseline-versus-options comparison surface.
- Compact desktop/tablet navigation keeps the hamburger reachable and protects text from narrow-column wrapping.

## Governance
- IndexedDB schema remains **35**; existing browser data is retained.
- No existing role permission definitions were changed; this release only restores access to the role-switching control on compact screens.

See `CHANGELOG_v1.0.108.md` and `VERIFICATION_v1.0.108.md`.
