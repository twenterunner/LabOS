# LabOS REV 1.0.100 — multi-lab demo & planning-consistency release

REV 1.0.100 is built from the REV 1.0.99 multi-lab extension while preserving REV 1.0.98 as the protected functional baseline.

## Deploy to GitHub Pages

1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.100_WEB.zip`.
2. Upload the **contents** to the repository root. Keep `index.html` at the root and keep the `assets` folder intact.
3. Commit/publish through GitHub Pages.
4. Reload the site and confirm the header shows **REV 1.0.100**.
5. Existing REV 1.0.99 browser data migrates automatically from schema 34 to schema 35. Demo data is upgraded in-place; non-demo controlled work is not redistributed.

## What changed

- The 24 power-tool demo requests are distributed **8 / 8 / 8** across Twente, Stuttgart and Detroit.
- Each internal lab contains real site-owned people, equipment, material and planned demo work.
- Three demo builds have canonical schedules spanning more than a month, so month-to-month waterfall behavior can be exercised.
- Twente has a deliberate site-scoped demo closure. `P26-1005` and `P26-1006` therefore become genuinely late at the home lab; the same planning engine finds on-time sister-lab alternatives (Stuttgart for both in the supplied seed).
- The universal waterfall timeline now has explicit **← earlier** and **later →** navigation in addition to `− / Fit / +` zoom.
- Delivery health, sister-lab recovery and the red required-delivery marker use one canonical timing rule: the exact active-plan finish compared with the requested delivery cutoff at **17:00** on the requested date.
- Forecast dates are reconciled from the actual final booking end when a canonical plan exists.
- Enterprise planning-integrity checks now respect site ownership for lab-wide planning events, avoiding false cross-site closure conflicts.

## Root-cause correction

REV 1.0.99 drew the red required-delivery marker at **12:00** on the requested date, while the planner operates through **17:00** and health used only the calendar date. A valid booking ending at 16:00 could therefore appear visually to cross the red deadline while still being classified as on time. REV 1.0.100 removes that mixed time basis. See `ROOT_CAUSE_AND_FIX_v1.0.100.md`.

## Verification

`VERIFICATION_CORE_v1.0.100.json` contains **240/240 passed checks** covering the fresh demo, all three labs, site isolation, long-horizon schedules, deliberately late scenarios, sister-lab recovery, exact delivery-cutoff behavior, controlled transfer, migration 34→35, planning integrity and invariants.

JavaScript syntax, HTML runtime references, unchanged visual assets and ZIP integrity are also checked during packaging. A current Chromium click-through is **not claimed**: the execution environment blocks both localhost and file URLs by administrator policy. This limitation is documented rather than represented as a browser pass.
