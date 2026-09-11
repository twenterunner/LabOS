# LabOS REV 1.0.97 — blank-page deployment root cause proof

## Reproduced failure

The REV 1.0.96 archive was not actually a root-ready GitHub Pages deployment package:

- REV 1.0.95 was flat: `index.html`, `app.js`, `core.js`, etc. were at the ZIP root.
- REV 1.0.96 wrapped the entire release inside a top-level `labos96/` directory.
- REV 1.0.96 also contained 143 package entries, including historical verification scripts, logs, pre-change backups and proof artifacts that are not required at runtime.

The screenshot symptom is the static shell (logo/header) rendering while the dynamic `#page` remains empty. That is consistent with an incomplete root deployment in which `index.html` / CSS are available but one or more required runtime JavaScript files are not available at the paths referenced by the page.

## Runtime proof

The REV 1.0.96 application runtime itself was extracted from the archive and executed with all five runtime JavaScript modules + CSS in an Android-size Chromium context. It reached `window.__PROTOLAB_READY__ === true`, rendered `Prototype Lab Dashboard`, rendered Planning navigation, and produced zero page errors. This isolates the observed blank page from the planner/runtime changes and proves the deployment artifact shape was the defect.

## General correction in REV 1.0.97

1. The deployment ZIP is flat at root and intentionally small.
2. Only required runtime files, icons, the three 5S demo images, manual and current verification documents are included.
3. Runtime JS/CSS files have REV-specific filenames (`labos-…-1.0.97.*`) so stale browser or service-worker assets cannot masquerade as the current release.
4. `index.html` contains visible boot diagnostics. Missing CSS/JS or a startup exception now produces an actionable message instead of a blank page.
5. A best-effort legacy service-worker/cache cleanup remains in the page, while the runtime remains usable if those APIs are unavailable.
6. All runtime references are checked against files physically present in the release.

No planner logic was rolled back. REV 1.0.97 is the REV 1.0.96 planning functionality packaged through a corrected deployment boundary.
