# LabOS REV 1.0.110 verification

**Result: 39 passed / 0 failed.**

Isolated Chromium loaded the actual REV 1.0.110 runtime with an in-memory repository and exercised Active lab switching at 1366 px and 360 px, local KPI values, Commitment Health membership and late filtering. Local network navigation was not used; production IndexedDB/server authorization are outside this focused regression.

## Checks

- PASS — Core runtime identifies 1.0.110
- PASS — IndexedDB schema remains 35
- PASS — Index references labos-core-1.0.110.js
- PASS — Index references labos-demo-data-1.0.110.js
- PASS — Index references labos-repository-1.0.110.js
- PASS — Index references labos-services-1.0.110.js
- PASS — Index references labos-app-1.0.110.js
- PASS — Index references labos-styles-1.0.110.css
- PASS — Header shows REV 1.0.110
- PASS — Service worker identifies 1.0.110
- PASS — No old 1.0.109 runtime asset references in index
- PASS — Planning health default uses explicit active-lab scope guard
- PASS — Post-render planning enhancements re-enter active-lab scope
- PASS — Explicit empty row lists stay empty
- PASS — JavaScript syntax: labos-core-1.0.110.js
- PASS — JavaScript syntax: labos-demo-data-1.0.110.js
- PASS — JavaScript syntax: labos-repository-1.0.110.js
- PASS — JavaScript syntax: labos-services-1.0.110.js
- PASS — JavaScript syntax: labos-app-1.0.110.js
- PASS — JavaScript syntax: service-worker.js
- PASS — JSON parses: manifest.webmanifest
- PASS — HTML parses: index.html
- PASS — HTML parses: USER_MANUAL.html
- PASS — All local index asset references exist
- PASS — Dynamic: LAB-NL tile metrics @ 1366px — {"got": ["8", "2", "2", "9", "4", "4"], "expected": ["8", "2", "2", "9", "4", "4"]}
- PASS — Dynamic: LAB-DE tile metrics @ 1366px — {"got": ["5", "4", "0", "0", "4", "1"], "expected": ["5", "4", "0", "0", "4", "1"]}
- PASS — Dynamic: LAB-US tile metrics @ 1366px — {"got": ["8", "5", "0", "0", "5", "3"], "expected": ["8", "5", "0", "0", "5", "3"]}
- PASS — Dynamic: No page errors @ 1366px — []
- PASS — Dynamic: LAB-NL tile metrics @ 360px — {"got": ["8", "2", "2", "9", "4", "4"], "expected": ["8", "2", "2", "9", "4", "4"]}
- PASS — Dynamic: LAB-DE tile metrics @ 360px — {"got": ["5", "4", "0", "0", "4", "1"], "expected": ["5", "4", "0", "0", "4", "1"]}
- PASS — Dynamic: LAB-US tile metrics @ 360px — {"got": ["8", "5", "0", "0", "5", "3"], "expected": ["8", "5", "0", "0", "5", "3"]}
- PASS — Dynamic: No page errors @ 360px — []
- PASS — Dynamic: LAB-NL commitment list count — ["P26-1001", "P26-1002", "P26-1003", "P26-1004", "P26-1005", "P26-1006", "P26-1007", "P26-1008"]
- PASS — Dynamic: LAB-NL late filter count — 2
- PASS — Dynamic: LAB-DE commitment list count — ["P26-1009", "P26-1010", "P26-1011", "P26-1012", "P26-1016"]
- PASS — Dynamic: LAB-DE late filter count — 0
- PASS — Dynamic: LAB-US commitment list count — ["P26-1017", "P26-1018", "P26-1019", "P26-1020", "P26-1021", "P26-1022", "P26-1023", "P26-1024"]
- PASS — Dynamic: LAB-US late filter count — 0
- PASS — Dynamic: No uncaught page errors — []
