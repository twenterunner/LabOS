# LabOS REV 1.0.106 verification

**Automated checks: 44 passed / 0 failed.**

## Verified in this release
- Compact desktop/tablet navigation keeps the hamburger reachable before lower-priority header controls.
- Daily Operations Check proposal text is protected from action-button width compression.
- Scenario Lab builds an explicit scenario baseline and filters out candidates that do not improve it for the selected objective.
- Unresolved candidates and candidates with residual simulated conflicts are not proposed.
- Baseline-versus-options comparison table is present with delivery, portfolio, disruption and cost fields.
- Runtime demo verification confirms every displayed scenario option is marked as better than baseline and has zero residual scenario conflicts.
- Apply-to-LIVE rejects a candidate that is not flagged as a verified improvement.
- IndexedDB schema remains **35**.

## Runtime evidence
```json
{
  "version": "1.0.106-poc",
  "schema": 35,
  "baseline": {
    "target": "P26-1005",
    "evaluated": 9,
    "shown": 5,
    "filtered": 4,
    "ok": true
  },
  "outage": {
    "ok": true,
    "summary": {
      "conflicts": 4,
      "evaluated": 7,
      "shown": 4,
      "filtered": 3
    }
  },
  "guardOK": true,
  "requests": 24,
  "bookings": 117
}
```

## Limitation
A physical-device/browser-runtime pass is not claimed. The release was validated with source-level layout guards plus runtime planner/scenario tests in Node.
