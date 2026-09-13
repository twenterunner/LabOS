# LabOS REV 1.0.109

Static GitHub Pages proof-of-concept for prototype laboratory operations. This release hardens planning integrity, Scenario Lab qualification, input boundaries and responsive layouts after a broad REV 1.0.108 fault-injection campaign.

## Deploy
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.109_WEB.zip`.
2. Upload **all files and folders from the ZIP root** to the GitHub Pages repository root, replacing the older LabOS runtime files.
3. Refresh the browser.
4. Confirm the header shows **REV 1.0.109**.

Versioned JS/CSS filenames and the reset service worker are retained to avoid stale GitHub Pages assets.

## Main safety changes
- Sister-lab moves preserve shared calibration/readiness dependencies and must pass a whole-portfolio integrity gate before acceptance.
- Scenario Lab compares optimization candidates to the untouched LIVE plan; the disrupted Scenario-as-is state is displayed separately.
- Worse-than-LIVE scenario recoveries are not called optimizations or Recommended.
- Scenario application rejects stale twins and performs a final whole-portfolio integrity audit.
- Impossible calendar dates are rejected.
- Prototype quantity defaults to a controlled maximum of 5,000 unless explicitly configured otherwise.
- Fractional/negative sample-generation counts are rejected and requested quantity cannot be exceeded.
- Request filters and Scenario Lab controls are width-contained across Android/desktop breakpoint boundaries.
- Compact-screen role switching from REV 1.0.108 remains available via the hamburger drawer.

## Data compatibility
IndexedDB schema remains **35**. Existing browser data is retained; no reset is required.

See `CHANGELOG_v1.0.109.md`, `QA_REPORT_v1.0.109.md`, and `VERIFICATION_v1.0.109.md`.
