# LabOS REV 1.0.45 Verification

REV 1.0.45 is the hardened acceptance build based on REV 1.0.44 / schema 21.

Current verification results:

- `verification-node.js`: **46 / 46 passed** — baseline domain/service regression.
- `verification-ui-node.js`: **23 / 23 passed** — application shell and guided-workflow regression.
- `verification-v145-node.js`: **62 / 62 passed** — S1/S2 governance fixes plus readiness, multi-sample execution, matrix capture, capability/normality reporting and improvement implementation.
- `ui-stress-v145.js`: **1,783 / 1,783 passed** — all main views across roles plus every demo build/workspace phase, malformed optional-array resilience and escaping checks.
- `scenarios-v145.js`: **10 / 10 passed** — nominal portfolio plan, locked booking, equipment outage, whole-lab shutdown, delayed samples/material, zero-capability, zero-skill, expired calibration, commitment governance and readiness behavior.

The v1.0.45 targeted suite specifically verifies that lifecycle/release/quality/Control Plan rules are enforced in the domain layer rather than relying only on hidden/disabled GUI controls; invalid JSON is rejected before persistence; IDs remain unique under deletion/burst creation; and the current documentation/assets consistently identify REV 1.0.45.

Historical `verification-vXXX-node.js` scripts are retained as revision-specific regression evidence and intentionally contain version assertions for the revision named in their filename. Use the current tests above for acceptance of REV 1.0.45.
