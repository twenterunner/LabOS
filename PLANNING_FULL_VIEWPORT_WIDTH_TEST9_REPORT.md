# LabOS Planning full viewport width — TEST-9

Root cause reproduced from TEST-8 screenshot: the runtime tried to set the planning board width dynamically, but the stylesheet retained `width: calc(100vw - var(--sidebar)) !important`. On a mobile browser using a wide/desktop-scaled layout while the sidebar itself was hidden, the fixed 244 px sidebar reservation remained, leaving a large blank strip on the right. The normal inline width assignment could not override the CSS `!important` rule.

TEST-9 correction:
- removes the fixed sidebar subtraction from the planning-board CSS fallback;
- measures the actual sidebar rectangle at runtime;
- if the sidebar is off-screen/hidden, the board spans the complete viewport width;
- if the desktop sidebar is genuinely visible, the board spans from its real right edge to the viewport right edge;
- runtime width/margin values are themselves applied with `!important`, so legacy CSS cannot override them;
- the 1-year-past / 1-year-future timeline and +/- zoom behavior from TEST-8 are preserved.

Focused QA: 7/7 PASS plus JavaScript syntax checks for all active TEST-9 runtime files.
