from pathlib import Path
import subprocess, sys, tempfile, json
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.77',"ProtoLab.VERSION = '1.0.77-poc'" in core)
check('header version 1.0.77','REV 1.0.77' in index)
check('cache bust 1.0.77',index.count('?v=1.0.77')>=5)
check('submitted build forced to sequential review','workflowReviewV1077' in app and "App.workspaceTab='materials'" in app)
check('controls precede schedule',"['configuration','materials','processrisk','controls','schedule'" in app)
check('explicit stage confirmations','Confirm material basis & continue' in app and 'Confirm route & methods & continue' in app and 'Confirm controls & continue' in app)
check('control plan no longer routed behind planning','data-v1077-confirm-process-controls' in app)
check('assurance report options','Full overview report' in app and 'Call-up report' in app and 'data-v1077-report-csv' in app)
check('assurance formatting css','.assurance-table-v1075 td strong' in css and 'display:block' in css)
check('sticky standards navigation','standards-sticky-v1077' in app and 'position:sticky!important' in css)
check('5S actions/history exposed','Open 5S actions' in app and '5S check-in history' in app)
check('profiles explicitly internal','LabOS internal control profiles — not IATF 16949 classifications.' in app)
check('process detail on configure','CONTROLLED PROCESS DETAIL' in app and 'v1077ProcessDetailMarkup' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)

# Domain planner regression remains valid after UI workflow changes.
js_domain=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab;let s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);const plan=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});const fail=plan.filter(x=>!x.ok),inv=P.validateInvariants(s);let mismatches=0;for(const b of s.bookings||[]){if(!b.equipmentId)continue;const eq=s.equipment.find(e=>e.id===b.equipmentId),route=s.routes.find(x=>x.requestId===b.requestId),st=route?.steps?.find(x=>x.id===b.stepId),proc=st&&s.processes.find(x=>x.id===st.processId),rr=s.requests.find(x=>x.id===b.requestId),tr=(rr?.testRequirements||[]).find(x=>x.id===b.stepId),test=tr?.standardTestId&&s.standardTests.find(x=>x.id===tr.standardTestId),need=test?(P.planningCapabilityForTest(test)||test.equipmentCapability):tr?.equipmentCapability||(proc?P.planningCapabilityForProcess(s,rr,proc):null),got=P.equipmentPlanningCapability(eq);if(need&&got!==need)mismatches++;}console.log(JSON.stringify({plans:plan.length,failed:fail.length,bookings:(s.bookings||[]).length,mismatches,invariants:inv.length}));if(fail.length||mismatches||inv.length)process.exit(7);'''
p=subprocess.run(['node','-e',js_domain],cwd=root,capture_output=True,text=True,timeout=90)
check('portfolio planner regression',p.returncode==0)
if p.stdout.strip(): print('Domain:',p.stdout.strip())

# Instrument app to execute the guided workflow calculations without a browser.
needle="window.addEventListener('DOMContentLoaded',init);"
instrument="window.__LABOS_V1077_TEST__={App,buildGuidedSteps,v1077WorkflowReview,v1077ControlsTechnicalReady,workspaceFlow,v1075AssuranceSection,v1075FiveSSection,assuranceControlMatrix,v1077ProcessDetailMarkup};\n"
inst=app.replace(needle,instrument+needle,1)
with tempfile.TemporaryDirectory() as td:
    td=Path(td); testjs=td/'app-test.js'; testjs.write_text(inst,encoding='utf-8')
    harness=r'''global.window=global;window.addEventListener=()=>{};window.removeEventListener=()=>{};window.innerWidth=1600;window.scrollTo=()=>{};window.visualViewport=null;global.innerWidth=1600;global.navigator={};global.location={href:'http://localhost',protocol:'http:'};global.CSS={escape:s=>String(s)};global.MutationObserver=class{observe(){} disconnect(){}};const n=()=>{};function d(){return {innerHTML:'',textContent:'',value:'',checked:false,dataset:{},querySelector:()=>null,querySelectorAll:()=>[],classList:{add:n,remove:n,toggle:n,contains:()=>false},style:{},appendChild:n,prepend:n,remove:n,insertAdjacentHTML:n,insertAdjacentElement:n,setAttribute:n,addEventListener:n,removeEventListener:n,focus:n,click:n,closest:()=>null,getAttribute:()=>'',getBoundingClientRect:()=>({height:50}),set onclick(v){},set onchange(v){},set oninput(v){}}};const roots={'#toastRoot':d(),'#page':d(),'#mainNav':d(),'#actionCount':d(),'#modalRoot':d(),'#roleSelect':d(),'#sidebar':d()};global.document={querySelector:s=>roots[s]||null,getElementById:id=>roots['#'+id]||null,querySelectorAll:()=>[],createElement:()=>d(),body:d(),documentElement:{style:{setProperty:n,removeProperty:n}},addEventListener:n};global.Blob=class{};global.URL={createObjectURL:()=>'',revokeObjectURL:n};global.requestAnimationFrame=f=>f();require(ROOT+'/core.js');require(ROOT+'/demo-data.js');require(ROOT+'/repository.js');require(ROOT+'/services.js');require(APPTEST);const P=global.ProtoLab,T=global.__LABOS_V1077_TEST__,A=T.App;A.state=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(A.state);P.ensurePlanningModel(A.state);A.state.identity={userId:'U12',name:'Admin',role:'administrator'};A.identity=new P.DemoIdentityProvider(A.state);const product=A.state.products[0],req=new P.RequestService(A.state).create({title:'Sequential flow test',productId:product.id,quantity:2,requiredDate:'2026-10-20',objective:'verify sequential build definition',materialOwnership:'Engineering supplied',materialSupplyOwner:'Admin',materialSupplyDate:'2026-09-20',materialSupplyReference:'TEST',assuranceProfile:'validation',configuration:'TEST'});new P.RequestService(A.state).submit(req.id);req.workflowReviewV1077={materialsReviewed:false,processReviewed:false,controlsReviewed:false};let steps=T.buildGuidedSteps(req);const ids=steps.map(x=>x.id),cur=steps.find(x=>x.state==='current');if(cur?.id!=='materials')throw Error('submitted build did not stop at materials: '+cur?.id);if(!(ids.indexOf('controls')<ids.indexOf('schedule')))throw Error('controls are still after resource planning');const sched=steps.find(x=>x.id==='schedule');if(!sched?.locked)throw Error('schedule not locked before material/process review');req.workflowReviewV1077.materialsReviewed=true;const route=A.state.routes.find(x=>x.requestId===req.id);route.confirmed=true;steps=T.buildGuidedSteps(req);if(steps.find(x=>x.state==='current')?.id!=='processrisk')throw Error('process review did not follow materials');req.workflowReviewV1077.processReviewed=true;steps=T.buildGuidedSteps(req);const next=steps.find(x=>x.state==='current');if(next?.id==='schedule'&&T.v1077ControlsTechnicalReady(req).applicable)throw Error('planning opened before applicable controls');const flow=T.workspaceFlow(req);if(T.v1077ControlsTechnicalReady(req).applicable&&!T.v1077ControlsTechnicalReady(req).ready&&!flow.includes('data-v1077-confirm-process-controls'))throw Error('control plan route is not directly guided from process definition');const profile=T.assuranceControlMatrix();if(!profile.includes('not IATF 16949 classifications'))throw Error('profile disclaimer missing');const ass=T.v1075AssuranceSection();if(!ass.includes('Full overview report')||!ass.includes('Call-up report'))throw Error('assurance report controls missing');const five=T.v1075FiveSSection();if(!five.includes('5S check-in history'))throw Error('5S history missing');const p=A.state.processes.find(x=>x.status==='Released');const detail=T.v1077ProcessDetailMarkup(p,req,route.steps[0]);if(!detail.includes('CONTROLLED PROCESS DETAIL')||!detail.includes('Required evidence'))throw Error('process detail sheet incomplete');console.log(JSON.stringify({currentAfterSubmit:cur.id,order:ids.slice(0,6),currentAfterMaterial:'processrisk',currentAfterProcess:next?.id,assuranceReports:true,fiveSTracking:true,processDetail:true}));process.exit(0);'''
    harness=harness.replace('ROOT',json.dumps(str(root))).replace('APPTEST',json.dumps(str(testjs)))
    p2=subprocess.run(['node','-e',harness],cwd=root,capture_output=True,text=True,timeout=90)
    check('sequential workflow runtime regression',p2.returncode==0)
    if p2.stdout.strip(): print('Runtime:',p2.stdout.strip())
    if p2.stderr.strip(): print('Runtime stderr:',p2.stderr.strip())

failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
