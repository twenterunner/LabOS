const fs=require('fs'),vm=require('vm');
const ctx={window:{},console};vm.createContext(ctx);for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});const P=ctx.window.ProtoLab;
let pass=0,fail=0;function test(n,fn){try{fn();console.log('PASS | '+n);pass++}catch(e){console.log('FAIL | '+n+' | '+e.message);fail++}}
function ok(x,m='assertion failed'){if(!x)throw new Error(m)}
test('Release is v1.0.35 schema 21',()=>{ok(P.VERSION==='1.0.35-poc');ok(P.SCHEMA_VERSION===21)});
let state=P.createDemoState(),product=state.products[0];state.identity={name:'Eva de Vries',role:'engineering_requester'};const r=new P.RequestService(state).create({title:'Reuse-first verification',productId:product.id,productRevision:product.revision,quantity:2,requiredDate:'2026-11-20',objective:'Reuse approved setup'});
test('New compatible request reuses released route automatically',()=>{ok(r.reusePackage.route.mode==='reused');const route=state.routes.find(x=>x.requestId===r.id);ok(route.confirmed===true)});
test('New compatible request reuses approved Control Plan',()=>{ok(r.controlPlanId);ok(r.reusePackage.controlPlan.mode==='reused');ok(state.controlPlans.find(x=>x.id===r.controlPlanId)?.status==='Approved')});
test('New compatible request reuses PFMEA knowledge',()=>{ok(r.reusePackage.pfmea.mode==='reused');ok(state.pfmea.filter(x=>x.requestId===r.id).length>0)});
test('Reused assets create no repeat build-change approvals',()=>ok(!state.approvals.some(a=>a.requestId===r.id&&a.stage==='build-change')));
const master=state.controlPlans.find(x=>x.id===r.controlPlanId),clone=P.beginBuildSpecificControlPlanRevision(state,r,master,'Characteristic adapted for this build');
test('Build-specific CP edit preserves approved master',()=>{ok(master.status==='Approved');ok(clone.status==='Draft');ok(clone.baselineId===master.id);ok(r.controlPlanId===clone.id)});
test('Build-specific CP edit asks Process Engineering and Quality',()=>{const a=state.approvals.filter(x=>x.requestId===r.id&&x.stage==='build-change'&&x.changeArea==='Control Plan');ok(a.some(x=>x.role==='Process Engineer'));ok(a.some(x=>x.role==='Quality Engineer'))});
test('Pending build-specific reviews block readiness',()=>{const rs=new P.ReadinessService(state).evaluate(r.id);ok(rs.issues.some(x=>/Build-specific reused-document/.test(x.name)))});
let safety=P.deepClone(r);safety.id='SAFETY-REUSE';safety.productSafety=true;safety.reusePackage={route:{mode:'reused'},controlPlan:{mode:'reused'},pfmea:{mode:'reused'},deltas:[]};state.requests.push(safety);P.markBuildSpecificDelta(state,safety,'PFMEA','Safety-related risk changed');
test('Safety-related delta adds Product Safety review',()=>ok(state.approvals.some(x=>x.requestId===safety.id&&x.stage==='build-change'&&x.role==='Product Safety Representative')));
const app=fs.readFileSync('app.js','utf8');
test('Workspace explains reuse-first behavior',()=>{ok(app.includes('REUSE-FIRST BUILD DEFINITION'));ok(app.includes('No Control Plan setup or reapproval required'));ok(app.includes('Change for this build'))});
test('Navigation uses permanent delegated handler',()=>{ok(app.includes("closest('[data-nav]')"));ok(!app.includes("$$('[data-nav]').forEach"))});
test('Navigation clears stale modal overlays',()=>ok(app.includes("closeModal();document.body.classList.remove('modal-open')")));
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
