# LabOS REV 1.0.129 — Change Log

## Development-time learning
- Added canonical `developmentHistory` evidence records.
- Development records retain planned/recommended hours, measured actual engineering hours, development type, start/completion dates, trial count, outcome, build/lab/product context and notes.
- Only completed records with `actualSource = Measured` and a non-failed outcome influence future recommendations.
- Exact-method history is preferred; recent exact evidence is weighted above older evidence; family history is fallback only.
- Process development and unmatched test development show a learned recommendation and require rationale for >10% override.
- AUTO-PLAN uses learned development history as the provisional duration when no explicit development allowance has yet been entered.
- Normal UI release paths prompt for measured development actuals before method release; the ProcessService release gate also refuses release without measured actual development time.
- Closed-build capture retains measured process/test development evidence and upserts by the stable source development record.
- Standard Test dossiers now show planned-vs-actual development history and a trend chart.
- Lab Performance adds a Standard-Test selector with development history over time.
- A controlled manual Standard-Test development episode can be recorded for work performed outside a build workflow.
- Demo data seeds explicitly marked illustrative development-history evidence for every Standard Test so the feature can be exercised immediately.

## Compatibility
- Browser state remains schema 35; no reset required.
- Existing process/test development records are normalized in place.
- Existing real/user states are never given demo development history; seeding is restricted to `settings.demoDataset`.
