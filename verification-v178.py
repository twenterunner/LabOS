from pathlib import Path
import subprocess, tempfile, json, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name, cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.78', "ProtoLab.VERSION = '1.0.78-poc'" in core)
check('header version 1.0.78', 'REV 1.0.78' in idx)
check('cache bust 1.0.78', idx.count('?v=1.0.78')>=5)
check('manual planning entry points', 'data-v1078-manual-chooser' in app and 'data-v1078-open-manual' in app and 'Manual controlled planning' in app)
check('manual planning validation', 'v1078BuildManualPlanState' in app and 'Manual plan not applied' in app and 'selected equipment does not provide' in app)
check('main swimlane zoom controls', 'data-v1078-swim-zoom="out"' in app and 'data-v1078-swim-zoom="fit"' in app and 'data-v1078-swim-zoom="in"' in app)
check('build zoom always active', 'data-v1078-build-zoom' in app and 'removeAttribute(\'disabled\')' in app)
check('commitment replan reason shown', 'Latest replan reason:' in app)
check('replan reason KPI', 'Why are committed dates being replanned?' in app and 'PLANNING STABILITY' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)
# Planner domain regression
js=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab;let s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);const out=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});const failed=out.filter(x=>!x.ok),inv=P.validateInvariants(s);console.log(JSON.stringify({plans:out.length,failed:failed.length,bookings:s.bookings.length,invariants:inv.length}));if(failed.length||inv.length)process.exit(8);'''
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True,timeout=90)
check('portfolio planner regression',p.returncode==0)
if p.stdout.strip(): print('Domain:',p.stdout.strip())
# App runtime harness: verify manual-plan pure transaction, entry buttons and KPI reason rollup.
needle="window.addEventListener('DOMContentLoaded',init);"
instrument="window.__LABOS_V1078_TEST__={App,v1078ManualTaskRows,v1078BuildManualPlanState,workspaceSchedule,renderPlanning,v1078ReplanKpi,planningFingerprintV1070};\n"
inst=app.replace(needle,instrument+needle,1)
with tempfile.TemporaryDirectory() as td:
    td=Path(td); testjs=td/'app-test.js'; testjs.write_text(inst,encoding='utf-8')
    harness=r'''global.window=global;window.addEventListener=()=>{};window.removeEventListener=()=>{};window.innerWidth=1600;window.scrollTo=()=>{};window.visualViewport=null;global.innerWidth=1600;global.navigator={};global.location={href:'http://localhost',protocol:'http:'};global.CSS={escape:s=>String(s)};global.MutationObserver=class{observe(){} disconnect(){}};const n=()=>{};function d(){return {innerHTML:'',textContent:'',value:'',checked:false,dataset:{},clientWidth:1600,querySelector:()=>null,querySelectorAll:()=>[],classList:{add:n,remove:n,toggle:n,contains:()=>false},style:{},appendChild:n,prepend:n,remove:n,insertAdjacentHTML:n,insertAdjacentElement:n,setAttribute:n,removeAttribute:n,addEventListener:n,removeEventListener:n,focus:n,click:n,closest:()=>null,getAttribute:()=>'',getBoundingClientRect:()=>({height:50}),set onclick(v){},set onchange(v){},set oninput(v){}}};const roots={'#toastRoot':d(),'#page':d(),'#mainNav':d(),'#actionCount':d(),'#modalRoot':d(),'#roleSelect':d(),'#sidebar':d()};global.document={querySelector:s=>roots[s]||null,getElementById:id=>roots['#'+id]||null,querySelectorAll:()=>[],createElement:()=>d(),body:d(),documentElement:{style:{setProperty:n,removeProperty:n}},addEventListener:n};global.Blob=class{};global.URL={createObjectURL:()=>'',revokeObjectURL:n};global.requestAnimationFrame=f=>f();require(ROOT+'/core.js');require(ROOT+'/demo-data.js');require(ROOT+'/repository.js');require(ROOT+'/services.js');require(APPTEST);const P=global.ProtoLab,T=global.__LABOS_V1078_TEST__,A=T.App;A.state=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(A.state);P.ensurePlanningModel(A.state);A.state.identity={userId:'U12',name:'Admin',role:'administrator'};A.identity=new P.DemoIdentityProvider(A.state);new P.PlannerService().autoPlanPortfolio(A.state,{includePotential:false});const req=A.state.requests.find(r=>!['DELIVERED','CLOSED'].includes(r.status)&&A.state.routes.find(q=>q.requestId===r.id)?.steps?.length);const rows=T.v1078ManualTaskRows(req);if(!rows.length)throw Error('no manual task rows');const selections=rows.map(x=>({stepId:x.step.id,date:x.start.toISOString().slice(0,10),period:x.start.getHours()<13?'AM':'PM',equipmentId:x.b?.equipmentId||x.eqs[0]?.id||null,staffId:x.b?.staffId||x.staff[0]?.id||null,preferredStart:x.b?.start||null}));const result=T.v1078BuildManualPlanState(A.state,req.id,selections);if(!result.ok)throw Error('manual plan validation failed: '+result.errors.join('; '));const mr=result.next.requests.find(x=>x.id===req.id);if(mr.triage?.planQuality!=='Manual controlled plan'||mr.triage?.status!=='Reviewed')throw Error('manual plan not marked reviewed');const minv=P.validateInvariants(result.next);if(minv.length)throw Error('manual plan invariant failure: '+minv[0]);A.state=result.next;const ws=T.workspaceSchedule(mr);if(!ws.includes('data-v1078-open-manual="'+req.id+'"'))throw Error('manual plan button absent in build schedule');A.currentView='planning';const ph=T.renderPlanning();if(!ph.includes('data-v1078-manual-chooser'))throw Error('manual plan chooser absent in planning');P.recordCommitment(A.state,mr,mr.forecastDate,{reasonCategory:'Capacity / congestion',reason:'Verification replan reason'});const later=new Date(mr.forecastDate+'T12:00:00');later.setDate(later.getDate()+2);P.recordCommitment(A.state,mr,later.toISOString().slice(0,10),{reasonCategory:'Equipment outage',reason:'Verification equipment outage'});const k=T.v1078ReplanKpi();if(!k.includes('Equipment outage')||!k.includes('Verification equipment outage'))throw Error('reason KPI did not render');console.log(JSON.stringify({request:req.id,manualRows:rows.length,manualBookings:result.created.length,forecast:mr.forecastDate,manualButton:true,kpiReason:true}));process.exit(0);'''
    harness=harness.replace('ROOT',json.dumps(str(root))).replace('APPTEST',json.dumps(str(testjs)))
    p2=subprocess.run(['node','-e',harness],cwd=root,capture_output=True,text=True,timeout=90)
    check('manual planning and KPI runtime regression',p2.returncode==0)
    if p2.stdout.strip(): print('Runtime:',p2.stdout.strip())
    if p2.stderr.strip(): print('Runtime stderr:',p2.stderr.strip())
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} checks passed")
if failed:
    print('Failed: '+', '.join(failed)); sys.exit(1)
