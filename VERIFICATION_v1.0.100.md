# LabOS REV 1.0.100 verification

## Automated functional/runtime verification

- **240 / 240 checks passed** (`VERIFICATION_CORE_v1.0.100.json`).
- Fresh demo state: schema 35, 24 demo requests, 8/8/8 distribution across LAB-NL / LAB-DE / LAB-US.
- Every internal lab has demo equipment, staff, material and planned active work.
- P26-1008, P26-1012 and P26-1024 each have a canonical plan spanning at least 28 calendar days.
- P26-1005 and P26-1006 are late at LAB-NL; each has at least one on-time sister-lab result from the same planner.
- P26-1005 comparison recommends LAB-DE in the supplied seed and controlled transfer succeeds without cross-site equipment/person leakage.
- Fresh demo planning-integrity audit: **0 issues**.
- Fresh demo data invariants: **0 errors**.
- Actual REV 1.0.99 demo state migrates schema 34→35, retains all 24 requests, produces 8/8/8 site distribution, and ends with **0 planning-integrity issues / 0 invariant errors**.
- Same-date cutoff regression: finish at 16:00 is on time; finish at 18:00 is late. Both use the same requested date, proving the old date-only ambiguity is removed.
- Timeline source contains explicit earlier/later panning controls and 17:00 required-delivery marker logic.

## Static/package verification

- All runtime JavaScript files pass `node --check`.
- Every local asset referenced by `index.html` exists.
- Unrelated icons/visual assets are SHA-256 identical to REV 1.0.99.
- Runtime hashes are recorded in `RUNTIME_MANIFEST_v1.0.100.json`.
- Final ZIP integrity is tested after creation.

## Browser limitation

A current Chromium click-through could not be executed because the environment blocks both localhost and `file://` navigation by administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). No browser pass is claimed. See `BROWSER_VERIFICATION_v1.0.100.txt`.
