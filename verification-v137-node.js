const fs=require('fs'),vm=require('vm');
const ctx={window:{},console};vm.createContext(ctx);for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});const P=ctx.window.ProtoLab;
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),index=fs.readFileSync('index.html','utf8');
let pass=0,fail=0;function test(n,fn){try{fn();console.log('PASS | '+n);pass++}catch(e){console.log('FAIL | '+n+' | '+e.message);fail++}}function ok(x,m='assertion failed'){if(!x)throw new Error(m)}
test('Release is v1.0.37 schema 21',()=>{ok(P.VERSION==='1.0.37-poc');ok(P.SCHEMA_VERSION===21)});
test('Workspace cockpit is fixed to app chrome',()=>{ok(css.includes('position:fixed!important'));ok(css.includes('.workspace-cockpit-spacer'));ok(css.includes('--workspace-cockpit-height'))});
test('Cockpit spacer is measured after render',()=>{ok(app.includes('function syncWorkspaceCockpitLayout'));ok(app.includes('getBoundingClientRect().height'));ok(app.includes('scheduleWorkspaceCockpitLayout'))});
test('Guided navigation respects measured cockpit height',()=>{ok(css.includes('var(--workspace-cockpit-height,126px)'));ok(css.includes('.fixed-guided-workspace .guided-nav'))});
test('Small laptop and landscape layout releases sidebar width',()=>{ok(css.includes('@media(max-width:1120px)'));ok(css.includes('.sidebar{transform:translateX(-100%)'));ok(css.includes('.main{margin-left:0'))});
test('Compact guided rail is available through 1120px',()=>{ok(css.includes('.guided-mobile-rail'));ok(css.includes('display:grid!important'));ok(css.includes('.fixed-guided-workspace .guided-nav{display:none!important'))});
test('Reuse tiles auto-fit rather than force three narrow columns',()=>{ok(css.includes('repeat(auto-fit,minmax(240px,1fr))'));ok(css.includes('word-break:normal'))});
test('Workflow buttons can wrap instead of clipping text',()=>{ok(css.includes('white-space:normal!important'));ok(css.includes('.workflow-dock-button'))});
test('Opening a build clears stale modal overlays',()=>{ok(app.includes("function openRequest(id,tab='overview'){closeModal();document.body.classList.remove('modal-open')"));ok(app.includes("if(innerWidth<1121)$('#sidebar')?.classList.remove('open')"))});
test('Workspace step taps use permanent delegated handler',()=>{ok(app.includes("const wt=target.closest('[data-workspace-tab]')"));ok(app.includes("App.workspaceTab=normalizeWorkspaceTab(wt.dataset.workspaceTab);render()"))});
test('Planning build bars open the build schedule',()=>{ok(app.includes("ev.kind==='build'&&ev.requestId"));ok(app.includes('data-open-request="${esc(ev.requestId)}" data-tab="schedule"'))});
test('Planning lane labels open their build',()=>{ok(app.includes('const laneOpen=req?'));ok(app.includes('aria-label="Open build plan ${esc(req.id)}"'))});
test('Interactive planning targets are touch friendly',()=>{ok(css.includes('.swim-bar.interactive,.swim-label.interactive'));ok(css.includes('touch-action:manipulation'))});
test('Versioned assets point to v1.0.37',()=>{ok(index.includes('styles.css?v=1.0.37'));ok(index.includes('app.js?v=1.0.37'));ok(index.includes('REV 1.0.37'))});
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
