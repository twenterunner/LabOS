# LabOS REV 1.0.107 verification

**Automated checks: 45 passed / 0 failed.**

## Verified in this release
- AUTO PLAN uses the current LIVE plan as the baseline and treats feasibility separately from optimization.
- A displayed optimization cannot worsen unplanned builds, total lateness, maximum delay, commitment worsening or priority-weighted lateness.
- Recovery trade-offs are separated, never marked Recommended, and dominated recoveries are suppressed.
- Baseline-versus-verified-options comparison table is present.
- The current demo portfolio reproduces the reported problem shape: solving more unplanned work creates much more lateness, and REV 1.0.107 no longer recommends those outcomes as optimizations.
- A synthetic regression test proves that 4 → 0 unplanned combined with 9 → 76 late days is classified as recovery, while a non-worsening improvement is classified as optimization.
- REV 1.0.106 compact-desktop formatting and Scenario Lab baseline filtering remain in place.
- IndexedDB schema remains **35**.

## Runtime evidence
```json
{
  "version": "1.0.107-poc",
  "schema": 35,
  "requests": 24,
  "bookings": 117,
  "baseline": {
    "score": 4249780,
    "unplanned": 4,
    "totalLateDays": 9,
    "weightedLateDays": 24,
    "maxLateDays": 6,
    "commitmentWorseningDays": 9,
    "churn": 0,
    "openBuilds": 8
  },
  "optimizationCandidates": [],
  "recoveryTradeoffs": [
    {
      "tier": "red",
      "metrics": {
        "score": 2115786,
        "unplanned": 0,
        "totalLateDays": 72,
        "weightedLateDays": 204,
        "maxLateDays": 36,
        "commitmentWorseningDays": 9,
        "churn": 6,
        "openBuilds": 8
      },
      "gains": [
        "unplanned"
      ],
      "losses": [
        "totalLateDays",
        "maxLateDays",
        "weightedLateDays"
      ]
    }
  ],
  "suppressedCandidates": [
    {
      "tier": "yellow",
      "reason": "Suppressed because Red \u00b7 portfolio trade-off is equal or better on every compared KPI."
    }
  ],
  "recommended": null,
  "allRows": [
    {
      "tier": "green",
      "complete": false,
      "eligible": false,
      "recoveryReviewable": false,
      "suppressed": false,
      "gains": [
        "unplanned"
      ],
      "losses": [
        "totalLateDays",
        "maxLateDays",
        "weightedLateDays"
      ]
    },
    {
      "tier": "yellow",
      "complete": true,
      "eligible": false,
      "recoveryReviewable": false,
      "suppressed": true,
      "gains": [
        "unplanned"
      ],
      "losses": [
        "totalLateDays",
        "maxLateDays",
        "weightedLateDays"
      ]
    },
    {
      "tier": "red",
      "complete": true,
      "eligible": false,
      "recoveryReviewable": true,
      "suppressed": false,
      "gains": [
        "unplanned"
      ],
      "losses": [
        "totalLateDays",
        "maxLateDays",
        "weightedLateDays"
      ]
    }
  ],
  "synthetic": {
    "bad": {
      "isOptimization": false,
      "isRecoveryTradeoff": true,
      "gains": [
        "unplanned"
      ],
      "losses": [
        "totalLateDays",
        "maxLateDays",
        "weightedLateDays"
      ]
    },
    "good": {
      "isOptimization": true,
      "isRecoveryTradeoff": false,
      "gains": [
        "unplanned",
        "totalLateDays",
        "commitmentWorseningDays",
        "weightedLateDays"
      ],
      "losses": []
    }
  }
}
```

## Limitation
A full physical-device browser pass is not claimed. JavaScript syntax, HTML/manifest parsing, source-level UX guards and the real demo planner runtime were verified in Node.
