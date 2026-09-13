# LabOS REV 1.0.108 changelog

REV 1.0.108 builds directly on REV 1.0.107 and keeps IndexedDB schema 35. It restores role switching on Android and other compact-screen layouts without re-crowding the top bar.

## Android / compact-screen role switching
- Added a dedicated **Demo role** selector at the top of the slide-out navigation drawer whenever the sidebar is in overlay mode (up to 1120 px viewport width).
- The mobile selector uses a 46 px native select control so Android touch interaction remains reliable.
- Header and drawer role selectors are kept synchronized.
- Switching role from the drawer persists the identity, refreshes role-based navigation/content and closes the drawer automatically.
- Selecting the already-active role safely closes the drawer without unnecessary state churn.
- The desktop role selector remains unchanged and visible at normal desktop widths.

## Why this change
REV 1.0.107 intentionally hid the header role selector below 900 px to protect the compact header from overflow. On Android this removed the only visible role-selection control. REV 1.0.108 keeps the clean compact header, but moves role switching to the mobile navigation drawer where there is enough width for a robust native selector.

## Preserved
- REV 1.0.107 AUTO PLAN separation of verified optimization versus recovery trade-offs.
- REV 1.0.106 responsive/header formatting and Scenario Lab baseline comparison.
- Multi-lab, sister-lab, planning, execution, quality, audit and undo workflows.
- IndexedDB schema remains **35**; no reset or migration is required.
