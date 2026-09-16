# LabOS REV 1.0.150 — resource semantic repair regression

**Baseline:** REV 1.0.149  
**Regression reference:** REV 1.0.98 accepted working baseline

## Root cause corrected
REV 1.0.149 could materialise legacy descriptive resource values (`Joining cell`, `Measurement station`, `Precision bench`, `Assembly station`) into `planningCapability`. Once explicit, those broad descriptors overrode the older technical inference and caused valid equipment to appear absent.

REV 1.0.150 separates resource taxonomy from technical compatibility. Broad location/category descriptors remain preserved as legacy descriptive data but are rejected as controlled planning capabilities. Process, test, equipment, route-step and booking planning capabilities are repaired from controlled semantics. Existing schema-36 data is upgraded through an explicit 36 → 37 migration.

## Targeted verification
- Existing schema-36 state with deliberately polluted process/booking capabilities migrates to schema 37: PASS
- No broad descriptor remains in migrated booking planningCapability: PASS
- No broad descriptor remains as an active process planningCapability: PASS
- Incoming Inspection resolves to Optical Inspection: PASS
- Fastening / Torque resolves to Torque / Fastening: PASS
- Programming / Flashing resolves to Programming / Flashing: PASS
- Electrical Test resolves to Electrical Test: PASS
- Functional Verification resolves to Electrical Test: PASS
- Final Inspection resolves to Optical Inspection: PASS
- Microscope Station resolves to Optical Inspection while retaining legacy `Precision bench`: PASS
- Equipment technical capability migration remains non-destructive: PASS
- JS syntax checks (core, repository, services, demo data, app): PASS
- Runtime file/version references: PASS
- ZIP integrity: PASS
