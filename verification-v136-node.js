const fs=require('fs'),vm=require('vm');
const ctx={window:{},console};vm.createContext(ctx);for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});const P=ctx.window.ProtoLab;
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),index=fs.readFileSync('index.html','utf8');
let pass=0,fail=0;function test(n,fn){try{fn();console.log('PASS | '+n);pass++}catch(e){console.log('FAIL | '+n+' | '+e.message);fail++}}function ok(x,m='assertion failed'){if(!x)throw new Error(m)}
test('Release is v1.0.36 schema 21',()=>{ok(P.VERSION==='1.0.36-poc');ok(P.SCHEMA_VERSION===21)});
test('Fixed workspace cockpit renders stable slots',()=>{ok(app.includes('workspaceFixedCockpit'));ok(app.includes('workflow-edit-slot'));ok(app.includes('workflow-approval-slot'));ok(app.includes('workflow-next-slot'));ok(app.includes('workflow-command-current'))});
test('Guided workflow has compact mobile rail',()=>{ok(app.includes('renderGuidedMobileRail'));ok(css.includes('.guided-mobile-rail'));ok(css.includes('.guided-mobile-step'))});
test('Desktop guided checklist is sticky',()=>{ok(css.includes('.fixed-guided-workspace .guided-nav{position:sticky'));ok(css.includes('max-height:calc(100vh - 190px)'))});
test('Mobile keeps cockpit sticky and hides duplicate full checklist',()=>{ok(css.includes('.workspace-fixed-cockpit{top:68px'));ok(css.includes('.fixed-guided-workspace .guided-nav{display:none}'))});
test('Guided status semantics use green yellow red',()=>{ok(css.includes('.guide-row.complete .guide-check'));ok(css.includes('.guide-row.current .guide-check'));ok(css.includes('.guide-row.blocked .guide-check'));ok(css.includes('background:#fff2c7'));ok(css.includes('background:#fdeaea'))});
test('Tick/dot/X icons share centered typography',()=>{ok(css.includes('.workflow-step-icon,.guide-check,.guided-mobile-icon,.reuse-icon'));ok(css.includes('place-items:center'))});
test('Step switching no longer scrolls the page automatically',()=>{ok(app.includes("App.workspaceTab=normalizeWorkspaceTab(el.dataset.workspaceTab);render()"));ok(!app.includes("$('#guidedDetail')?.scrollIntoView"))});
test('Approval dock remains role aware',()=>{ok(app.includes('function guidedApprovalDock'));ok(app.includes('canApproveRecord(relevant)'));ok(app.includes("data-approve-record"));ok(app.includes("data-approve-cp"))});
test('Next-step dock keeps lifecycle actions in one place',()=>{ok(app.includes('function guidedNextDock'));ok(app.includes('Submit request →'));ok(app.includes('Acknowledge delivery →'));ok(app.includes('Review gate & advance…'))});
test('Reuse-first baseline remains present',()=>{ok(app.includes('REUSE-FIRST BUILD DEFINITION'));ok(app.includes('No Control Plan setup or reapproval required'));ok(app.includes('Change for this build'))});
test('Versioned assets point to v1.0.36',()=>{ok(index.includes('styles.css?v=1.0.36'));ok(index.includes('app.js?v=1.0.36'));ok(index.includes('REV 1.0.36'))});
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
