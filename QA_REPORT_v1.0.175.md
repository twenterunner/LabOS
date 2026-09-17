# LabOS REV 1.0.175 — Management Demo Help visibility repair

## Defect fixed
REV 1.0.174 installed the Management Demo through a late `renderHelp` wrapper. If later application patches did not finish evaluating, the application could still boot using the older Help renderer and the showcase hub would be absent.

## REV 1.0.175 implementation
- Management Demo rendering is now part of the core Help route.
- The Help route has a duplicate guard and directly prepends the Management Demo hub whenever the returned Help HTML does not already contain it.
- The showcase renderer itself is a normal function on the core render path rather than a late wrapper.
- The repair action is bound in the original `bindDynamic()` path.
- The hub always renders all 11 expected showcase definitions, visibly marking any missing records.
- `Prepare / repair showcase` forces additive seed repair without Reset Demo Data.
- `ensureDemoShowcaseV175` is a first-class alias preserving the V174/V173 migration path.

## Verification gates
See packaged test results generated during release: JavaScript syntax checks; demo-state executable fixture (11/11); static core Help-route assertion; direct Help-hub renderer unit check; revision/asset checks; ZIP extraction/integrity.

## Executed verification
- `node --check` passed for every packaged JavaScript file.
- Fresh canonical demo state: **11/11 showcase projects present**.
- Deliberately damaged/older demo state with all showcase markers removed, four statistical builds removed and both showcase Validation programmes removed: **force repair restored 11/11** without resetting the state.
- The exact packaged `renderManagementDemoHubV175()` function was executed against the repaired state and returned:
  - visible `MANAGEMENT DEMO · REV 1.0.175` heading;
  - `11/11 ready`;
  - exactly **11** showcase project cards;
  - `managementDemoShowcase` DOM anchor.
- Static assertion confirms the core `case 'help'` route prepends the hub whenever normal Help HTML does not already contain it.
- Static assertion confirms the repair handler is in the original `bindDynamic()` function, not a late wrapper.
- `index.html` references only REV 1.0.175 runtime/style assets and all referenced local assets exist.
- `labos-version.json` reports revision `1.0.175`, runtime `1.0.175-poc`.

## Browser-environment limitation
A Chromium render was attempted through the available headless browser, but this execution environment enforces an administrator policy that blocks both localhost and `file:` navigation. Therefore browser rendering could not be used as the release gate. The Help hub itself was instead executed directly from the packaged JavaScript with a real LabOS demo state and the core Help route was asserted in the packaged source.
