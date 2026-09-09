# LabOS REV 1.0.34 Verification

Verified against the exact source snapshot used to create the delivery ZIP.

- 11/11 REV 1.0.34 report-format / print / evidence-control checks
- 16/16 unified-report / Quality / migration checks
- 11/11 Resource Assurance checks
- 16/16 instrumented comprehensive Build Report render checks
- 4/4 controlled measurement-edit functional checks
- 8/8 Characterisation CSV round-trip functional checks
- 46/46 core domain/regression checks
- 6/6 repository/storage checks
- 23/23 UI smoke/regression checks
- 31/31 static/package checks
- 5/5 JavaScript syntax checks

**Total: 177 passed / 0 failed** (172 functional/static/regression + 5 syntax).

REV 1.0.34-specific verification proves that:

- the Build Report modal cannot widen beyond the mobile viewport; wide tables scroll only inside their local evidence wrappers;
- mobile report process flow and cards reflow rather than requiring whole-document horizontal panning;
- Print / save PDF uses a dedicated full-document print view, not the height-limited modal;
- print CSS removes scroll/max-height constraints, uses A4 pagination, repeats table headers and keeps plots/photos inside printable bounds;
- report approval is bound to both an evidence-set version and deterministic measurement fingerprint;
- any newly recorded or corrected measured evidence invalidates the current approval state;
- when an approved Build Report is affected, the old report revision is retained as Superseded and the next report revision requires approval;
- an untracked measurement change is caught by the fingerprint reconciliation safety net;
- unchanged batch saves or CSV round trips do not create spurious report revisions;
- revision history, current evidence set and last evidence change are visible in the report;
- the archived pressure DV dossier still renders 32 specified end-characterisation results, four critical/safety-characteristic distribution plots, Cpk/anomaly analysis and comprehensive photo evidence as one FINAL/APPROVED Build Report.
