# LabOS REV 1.0.97 — deployment reliability hotfix

- Fixed the blank GitHub Pages deployment caused by the REV 1.0.96 release archive structure.
- Restored a flat, root-ready GitHub Pages package.
- Removed historical verification scripts/logs/backups from the deployable package.
- Added revision-specific JS/CSS filenames to prevent stale asset reuse.
- Added visible boot diagnostics so missing runtime assets or startup failures can no longer appear as an unexplained empty page.
- Retained all REV 1.0.96 planning-engine and universal-timeline functionality.
