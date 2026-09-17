# LabOS REV 1.0.167 — QA / Release Report

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.167_WEB.zip`  
**Visible/runtime revision:** `REV 1.0.167` / `1.0.167-poc`  
**Schema:** `38` — unchanged; existing browser data is retained.

## User-reported defects repaired

1. **Validation DUT count / linked Prototype samples** — Validation no longer shows `0 DUTs` when its controlled DUT population comes from a linked Prototype. Real Prototype sample/serial rows are reused first. If the Prototype sample history has not yet materialised every row, planned inherited sample identities are exposed up to the source Prototype quantity without inventing formal serial numbers.
2. **Add Test Leg** — the Validation designer now uses a dedicated live `REV 1.0.167` Add Test Leg handler. A new leg inherits the defined sample population, persists, gives an explicit confirmation toast, re-renders, and scrolls/highlights the new leg so the action is visible on mobile and desktop.
3. **Planning / selected laboratory** — the later combined Prototype + Validation Planning renderer is again wrapped in the selected-laboratory boundary. The active lab selector now controls the swim-lane work population, bookings, readiness reservations and planning situations. Work executed at the selected sister lab for another home lab remains visible as incoming network work.
4. **Requests → Request Validation** — the Requests front door no longer labels Validation as future. Validation is shown as operational with a `+ Request Validation` action that opens the controlled Validation request/programme intake.
5. **Validation cockpit clarity** — the Product / DUT count uses the same sample truth as the Test Flow. When a user reviews a completed earlier step while a later step is currently active, the NEXT STEP action returns to the current active step instead of walking through already-completed stages again.

## Rendered Chromium interaction gate

The packaged HTML/CSS/JS was executed in headless Chromium using the same injected-document method used for prior LabOS releases because direct local/file navigation is blocked by the environment administrator policy.

Targeted mobile acceptance at **390 × 844** passed **8 / 8** checks:

- application boots to ready;
- zero browser runtime/page errors;
- Requests shows **Request Validation**;
- selecting **DE-ST / Stuttgart** scopes Planning so the Stuttgart Validation programme is present and the Twente Validation programmes are absent;
- **Add Test Leg** increases the rendered leg count by exactly one;
- linked Validation with programme quantity forced to zero still resolves a non-zero inherited sample/DUT population from the Prototype source;
- the Validation designer does not display `0 DUTs` when inherited samples exist;
- no interaction errors after all tested actions.

A separate rendered interaction check confirmed `+ Request Validation` opens the **New Validation programme** intake modal.

## Static and packaging gates

The final package is required to pass and was checked for:

- `node --check` on every packaged JavaScript runtime file;
- valid `manifest.webmanifest` JSON;
- all local JS/CSS assets referenced by `index.html` exist;
- visible revision `REV 1.0.167`;
- runtime version `1.0.167-poc`;
- revisioned runtime filenames use `1.0.167`;
- service-worker deployment marker uses `1.0.167`;
- clean ZIP integrity and clean extraction.

## Compatibility boundary

No schema reset is required. Existing Prototype and Validation IDs, bookings, sample/serial history, results, audit history, lessons and reports remain compatible. LabOS remains a static-browser proof of concept; production multi-user deployment still requires governed backend persistence, authorization enforcement, concurrency/transactions and controlled evidence storage.
