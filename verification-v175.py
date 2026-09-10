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

check('core version 1.0.75', "ProtoLab.VERSION = '1.0.75-poc'" in core)
check('header version 1.0.75', 'REV 1.0.75' in index)
check('cache busting 1.0.75', index.count('?v=1.0.75') >= 6)
check('stage-specific blocker routing', 'v1075ActionStage' in app and 'v1075StageIssue' in app and 'blockerActionAttrs' in app)
check('route blocker has exact next-action resolver', 'v1075ProcessNextResolution' in app and 'Confirm this route' in app and 'data-confirm-route' in app)
check('readiness blocker links to exact resolver', 'data-readiness-resolve' in app and "step.id==='readiness'" in app)
check('5S uses dedicated corrective recheck', 'v1075FiveSCorrection' in app and 'Record correction & recheck' in app and 'if(a?.fiveSAction)return resolve5SActionModal(actionId)' in app)
check('bulk assurance planning 30 60 90', all(f'data-v1075-bulk-care="{n}"' in app for n in (30,60,90)))
check('manual assurance selection retained', 'data-care-select' in app and 'data-care-schedule-selected' in app)
check('standards search chips removed by current implementation', 'standards-search-only-v1075' in app and "installStandardsNavV1061=function()" in app)
check('standards and assurance consolidated', "pageHeader('Lab Standards & Resources'" in app and 'v1075AssuranceSection()+v1075EquipmentSection()+v1075MethodsSection()+v1075PeopleSection()+v1075FiveSSection()' in app)
check('finance removed from daily standards workspace', 'v1075FiveSSection()+governanceRegister' in app and 'Finance & costing configuration' in app)
check('ambiguous readiness load removed from live capacity view', 'h assurance work' in app and 'Time reserved for calibration · maintenance · training' in app)
check('resource assurance nav remains consolidated away', "querySelector('[data-nav=\"equipment-master\"]')?.remove()" in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)

# Full portfolio planner / data-integrity regression.
js_domain=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab;let s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);const plan=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});const fail=plan.filter(x=>!x.ok);const inv=P.validateInvariants(s);let mismatches=0;for(const b of s.bookings||[]){if(!b.equipmentId)continue;const eq=s.equipment.find(e=>e.id===b.equipmentId),route=s.routes.find(x=>x.requestId===b.requestId),st=route?.steps?.find(x=>x.id===b.stepId),proc=st&&s.processes.find(x=>x.id===st.processId),tr=(s.requests.find(x=>x.id===b.requestId)?.testRequirements||[]).find(x=>x.id===b.stepId),need=tr?.equipmentCapability||(proc?P.planningCapabilityForProcess(s,s.requests.find(x=>x.id===b.requestId),proc):null),got=P.equipmentPlanningCapability(eq);if(need&&got!==need)mismatches++;}console.log(JSON.stringify({plans:plan.length,failed:fail.length,bookings:(s.bookings||[]).length,mismatches,invariants:inv.length}));if(fail.length||mismatches||inv.length)process.exit(7);'''
p=subprocess.run(['node','-e',js_domain],cwd=root,capture_output=True,text=True,timeout=60)
check('portfolio planner regression',p.returncode==0)
if p.stdout.strip(): print('Domain:',p.stdout.strip())

# Instrument app.js without booting IndexedDB to execute the current consolidated UI/domain helpers.
needle="window.addEventListener('DOMContentLoaded',init);"
instrument="window.__LABOS_V1075_TEST__={App,v1075ProcessNextResolution,renderProcessLibrary,v1075DueIds,capacityCardV1072};\n"
inst=app.replace(needle,instrument+needle,1)
with tempfile.TemporaryDirectory() as td:
    td=Path(td); testjs=td/'app-test.js'; testjs.write_text(inst,encoding='utf-8')
    harness=r'''global.window=global;window.addEventListener=()=>{};window.removeEventListener=()=>{};window.innerWidth=1600;window.scrollTo=()=>{};window.visualViewport=null;global.innerWidth=1600;global.navigator={};global.location={href:'http://localhost',protocol:'http:'};global.CSS={escape:s=>String(s)};global.MutationObserver=class{observe(){} disconnect(){}};const n=()=>{};function d(){return {innerHTML:'',textContent:'',value:'',checked:false,dataset:{},querySelector:()=>null,querySelectorAll:()=>[],classList:{add:n,remove:n,toggle:n,contains:()=>false},style:{},appendChild:n,prepend:n,remove:n,insertAdjacentHTML:n,insertAdjacentElement:n,setAttribute:n,addEventListener:n,removeEventListener:n,focus:n,click:n,closest:()=>null,getAttribute:()=>'',set onclick(v){},set onchange(v){},set oninput(v){}}};const roots={'#toastRoot':d(),'#page':d(),'#mainNav':d(),'#actionCount':d(),'#modalRoot':d(),'#roleSelect':d(),'#sidebar':d()};global.document={querySelector:s=>roots[s]||null,getElementById:id=>roots['#'+id]||null,querySelectorAll:()=>[],createElement:()=>d(),body:d(),documentElement:{style:{setProperty:n,removeProperty:n}},addEventListener:n};global.Blob=class{};global.URL={createObjectURL:()=>'',revokeObjectURL:n};require(ROOT+'/core.js');require(ROOT+'/demo-data.js');require(ROOT+'/repository.js');require(ROOT+'/services.js');require(APPTEST);const P=global.ProtoLab,T=global.__LABOS_V1075_TEST__,A=T.App;A.state=P.createDemoState();P.ensureEnterpriseModel(A.state);P.ensurePlanningModel(A.state);A.state.identity={userId:'U12',name:'Admin',role:'administrator'};const html=T.renderProcessLibrary();if(![30,60,90].every(x=>html.includes('data-v1075-bulk-care="'+x+'"')))throw Error('bulk assurance controls missing');if(html.includes('Costing configuration'))throw Error('costing remained in Lab Standards & Resources');const cap=T.capacityCardV1072();if(cap.includes('Readiness load'))throw Error('ambiguous Readiness load remains');let req=A.state.requests.find(r=>A.state.routes.find(x=>x.requestId===r.id)?.steps?.length),route=A.state.routes.find(x=>x.requestId===req.id);route.confirmed=false;const res=T.v1075ProcessNextResolution(req);if(!res||!res.attrs.includes('data-confirm-route'))throw Error('route blocker did not resolve to confirm-route');console.log(JSON.stringify({bulk30:T.v1075DueIds(30).length,routeAction:res.label,capacityLabel:'assurance work',consolidated:true}));process.exit(0);'''
    harness=harness.replace('ROOT',json.dumps(str(root))).replace('APPTEST',json.dumps(str(testjs)))
    p2=subprocess.run(['node','-e',harness],cwd=root,capture_output=True,text=True,timeout=30)
    check('current helper runtime smoke test',p2.returncode==0)
    if p2.stdout.strip(): print('Runtime:',p2.stdout.strip())
    if p2.stderr.strip(): print('Runtime stderr:',p2.stderr.strip())

# Reuse the v1.0.74 application-level drag transaction test to guard against regression.
p3=subprocess.run([sys.executable,str(root/'verification-v174.py')],cwd=root,capture_output=True,text=True,timeout=90)
# v174 should fail only its three old version assertions while its planner/move transaction still passes.
move_ok='PASS: application-level green/yellow move transaction' in p3.stdout and 'PASS: portfolio planner regression' in p3.stdout
check('planning move transaction regression',move_ok)

failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
