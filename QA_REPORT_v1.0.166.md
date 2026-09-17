# LabOS REV 1.0.166 — QA / Release Report

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.166_WEB.zip`  
**Visible/runtime revision:** `REV 1.0.166` / `1.0.166-poc`  
**Data schema:** `38` (unchanged; no reset required)

## Why REV 1.0.166 was required

REV 1.0.165 contained the requested helper/UI code, but its appended UI patch was outside the main LabOS application closure. In a real rendered browser path this caused an out-of-scope runtime failure (`openValidationV161 is not defined`), after which the user could still see older Planning/Validation UI. REV 1.0.166 moves the extension into the live application scope and validates the rendered interactions directly.

## User-visible corrections

1. **Planning titles visible** — the left project/programme column renders the real project/programme title as the primary label, with workstream, ID, product and due date below it. Desktop and mobile use word-aware wrapping rather than clipped/broken identifiers.
2. **Validation truly included in Planning** — the portfolio lane set is built from both active Prototype builds and active Validation programmes. Unplanned active Validation work still appears as a lane labelled `Not yet planned` rather than disappearing.
3. **Planning filter** — portfolio swim lanes have **All / Prototype / Validation** filters.
4. **Validation Add Test behavior** — tapping Add Test immediately presents exactly two first choices: **STANDARD TEST** and **TEST DEVELOPMENT**.
5. **Acceptance criteria** — every Validation test card visibly shows controlled acceptance criteria. Standard Test selection exposes the released criteria for confirmation; Test Development cannot be added without explicit criteria.
6. **Sample/serial-first flow** — Validation Test Flow starts with **1 · DEFINE SAMPLES**. Standalone Validation can define Lab Sample ID + formal serial; linked Validation reuses the source Prototype sample identities.
7. **Per-test genealogy** — each test has a **Samples / serials** action. Defined samples follow the leg/branch sequence automatically; a test can explicitly narrow/override the exact sample references.
8. **Prototype smarter test-development path** — Prototype End Characterisation presents **Standard Test** and **Test Development** in the live UI; Test Development uses the common estimator based on closest released test, controlled delta and measured Prototype + Validation history.
9. **Prototype sticky gap** — preventive-learning content is no longer placed in normal page flow behind the fixed cockpit. The spacer is calculated from the actual cockpit overlap and leaves only a small visual gap below the sticky menu.

## Rendered browser acceptance

The actual REV 1.0.166 runtime and stylesheet were executed in Chromium using an in-memory page shell because direct local/file navigation is blocked by the execution environment's browser administrator policy. This still executes the packaged JavaScript, CSS, DOM renderers and click handlers.

### Desktop — 1440 × 1000

- PASS — application booted with **0 page/runtime errors**.
- PASS — Planning domain filter rendered.
- PASS — **28** portfolio lane labels rendered in the demo state: **21 Prototype**, **4 Validation**, plus shared planning lanes.
- PASS — visible primary labels include real titles such as `Cordless Drill / Driver · motor/gear concept comparison`.
- PASS — selecting **Validation** leaves **4 Validation lanes** and **0 Prototype lanes**.
- PASS — Validation portfolio rows open the controlled programme.
- PASS — Validation Test Flow shows the sample register before the flow.
- PASS — representative programme rendered **4 test cards, 4 acceptance-criteria blocks and 4 per-test Samples/serials actions**.
- PASS — Add Test immediately rendered **STANDARD TEST** and **TEST DEVELOPMENT** choices.
- PASS — Prototype `Select tests` opened `Prototype tests · Standard Test or Test Development` with both sections present.
- PASS — fixed Prototype cockpit bottom to guided-content start measured about **8.9 px**, replacing the large blank band.

### Mobile — 390 × 844

- PASS — application booted with **0 page/runtime errors**.
- PASS — mixed Planning rendered the same **21 Prototype + 4 Validation** work lanes plus shared lanes.
- PASS — **Validation** filter leaves **4 Validation / 0 Prototype** lanes.
- PASS — project/programme titles render in the widened mobile project column.
- PASS — sample register, per-test acceptance criteria, per-test sample assignment and Add Test binary choice all render.
- PASS — fixed Prototype cockpit bottom to guided-content start measured about **8.3 px**; the former large blank band is removed.

## Static/package gates

The final package must and does pass:

- `node --check` for every packaged JavaScript file;
- valid `manifest.webmanifest` JSON;
- all local JS/CSS assets referenced by `index.html` exist;
- visible revision = `REV 1.0.166`;
- runtime version = `1.0.166-poc`;
- deployment reset marker = `1.0.166`;
- no stale `labos-*-1.0.165.*` runtime files in the ZIP;
- clean ZIP integrity and clean extraction recheck.

## Compatibility / boundary

- Schema remains **38** and existing browser data is retained; no demo reset is required.
- Existing Prototype/Validation IDs, samples, bookings, results, learning history, reports and audit history remain compatible.
- This remains a static-browser proof of concept. A production multi-user system still requires governed backend persistence, authorization enforcement, concurrency/transactions and controlled evidence storage.
