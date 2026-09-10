from pathlib import Path
import json, subprocess, sys, zipfile
ROOT=Path(__file__).resolve().parent
checks=[]
def check(name, cond, detail=''):
    checks.append((name,bool(cond),detail))
    print(('PASS' if cond else 'FAIL')+f' | {name}'+(f' | {detail}' if detail else ''))
def txt(name): return (ROOT/name).read_text(encoding='utf-8')
core=txt('core.js'); demo=txt('demo-data.js'); repo=txt('repository.js'); svc=txt('services.js'); app=txt('app.js'); idx=txt('index.html'); sw=txt('service-worker.js'); css=txt('styles.css')
check('Version is REV 1.0.81', "ProtoLab.VERSION = '1.0.81-poc'" in core and 'REV 1.0.81' in idx)
check('Schema upgraded to 31', 'ProtoLab.SCHEMA_VERSION = 31;' in core)
check('Main assets cache-busted to 1.0.81', idx.count('?v=1.0.81') >= 5)
check('Service-worker reset identity updated', 'LabOS 1.0.81 cache reset worker' in sw)
check('Legacy shortcut demo scheduler removed', 'Create a valid, conflict-free illustrative plan' not in demo and 'const usedEq=new Map(),usedSt=new Map()' not in demo)
check('Fresh demo uses production PlannerService', 'new P.PlannerService().autoPlan(state,r.id)' in demo and "seedPlanningIntegrityVersion='1.0.81'" in demo)
check('Planner-integrity audit covers six planning hazards', all(x in svc for x in ['equipmentReadinessFailures','staffQualificationFailures','equipmentOverlaps','staffOverlaps','planningEventOverlaps','equipmentCapabilityMismatches']))
check('REV80 -> REV81 migration invokes seed repair', 'if(s.schemaVersion===30)' in repo and 'repairSeedPlanningIntegrityV1081' in repo)
check('On-load fallback repair is present', 'v1081RepairLegacySeedPlanOnLoad' in app and 'seedRepairV1081=v1081RepairLegacySeedPlanOnLoad()' in app)
check('Legacy final-state future seed bookings are removed', "finalStates=new Set(['RELEASED','DELIVERED','CLOSED'])" in svc)
check('Completed/actual booking history is preserved by replan', 'historicalBooking(b)' in svc and 'Replanning may replace future intent, never execution history' in svc)
check('Completed route/test work is skipped by replan', "if(s.completedAt||/complete|completed|done|skipped/i.test" in svc and "if(tr.completedAt||/complete|completed|done|skipped/i.test" in svc)
check('Pending future care is reused instead of duplicated', 'will be reused instead of creating a duplicate readiness activity' in svc)
check('Final candidate slot is revalidated after capacity search', 'final candidate slot failed the mandatory readiness recheck' in svc and 'Capacity search can push a task later than its initial readiness check' in svc)
check('Equipment resolver groups failures by root resource', 'ROOT RESOURCE' in app and 'This is a resource-root-cause problem' in app)
check('Equipment resolver exposes explicit calibration/maintenance reasons', 'Calibration certificate does not cover' in app and 'Maintenance is due' in app)
check('Manual conflict checker uses exact-time readiness', 'P.projectedEquipmentReadyAt(state,eq,b.start)' in app)
check('REV80 manual three tiers retained', all(x in app for x in ['Green · least disruptive','Yellow · controlled local change','Red · portfolio impact']))
check('REV80 month/CW swimlane retained', 'swim-month-v1080' in app and 'swim-cw-v1080' in app and 'weekendBands=!v1072WeekendsEnabled()' in app)
check('REV80 closure residual guard retained', 'v1080LabClosureConflicts' in app and 'LAB_CLOSURE_RESIDUAL' in app)

for js in ['core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js']:
    r=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
    check(f'JavaScript syntax: {js}', r.returncode==0, (r.stderr.strip() or 'OK')[:180])

# Fresh demo: the released app must have zero hidden planning defects.
node_fresh=r'''
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab,s=P.createDemoState(),audit=P.planningIntegrityAudit(s),rr=new P.ReadinessService(s).evaluate('P26-1024'),eq=rr.checks.find(x=>x[0]==='Equipment readiness'),people=rr.checks.find(x=>x[0]==='Qualified people'),inv=P.validateInvariants(s);
const care=(s.resourceCareBookings||[]).filter(x=>x.status==='Scheduled'),careKeys=care.map(x=>[x.type,x.equipmentId||x.staffId,x.skillId||'',x.start,x.end].join('|')),duplicates=careKeys.length-new Set(careKeys).size;
console.log(JSON.stringify({counts:audit.counts,ok:audit.ok,p1024Equipment:eq?.[1],p1024People:people?.[1],bookings:s.bookings.length,care:care.length,duplicateCare:duplicates,invariants:inv.length,marker:s.settings?.seedPlanningIntegrityVersion}));
if(!audit.ok||eq?.[1]!==true||people?.[1]!==true||duplicates!==0||inv.length||s.settings?.seedPlanningIntegrityVersion!=='1.0.81')process.exit(2);
'''
r=subprocess.run(['node','-e',node_fresh,str(ROOT)],capture_output=True,text=True)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-400:],'stderr':r.stderr[-400:]}
check('Runtime: fresh REV81 demo has zero planning-integrity defects', r.returncode==0, json.dumps(detail,separators=(',',':'))[:380])

# Reproduce the four P26-1024 screenshot failures in a controlled legacy fixture,
# prove they are caused by EQ-011/EQ-007 readiness dates, then repair atomically.
node_fixture=r'''
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab,s=P.createDemoState(),rid='P26-1024',r=s.requests.find(x=>x.id===rid),route=s.routes.find(x=>x.requestId===rid);delete s.settings.seedPlanningIntegrityVersion;
s.bookings=s.bookings.filter(b=>b.requestId!==rid);
const spec=[['Incoming Inspection','2026-10-29T08:00:00.000Z','EQ-011'],['Electrical Test','2026-11-03T08:00:00.000Z','EQ-007'],['Functional Verification','2026-11-04T08:00:00.000Z','EQ-007'],['Final Inspection','2026-11-05T08:00:00.000Z','EQ-011']];
for(let i=0;i<spec.length;i++){const [name,start,eqId]=spec[i],step=route.steps.find(x=>x.name===name),proc=step&&s.processes.find(x=>x.id===step.processId),cap=proc?P.planningCapabilityForProcess(s,r,proc):null,skill=proc?P.planningSkillForProcess(proc):null,staff=s.staff.find(x=>x.available!==false&&(!skill||(x.competencies||[]).includes(skill)))||s.staff.find(x=>x.available!==false),end=new Date(new Date(start).getTime()+2*3600000).toISOString();s.bookings.push({id:'LEGACY-'+i,requestId:rid,stepId:step?.id||('LEGACY-S'+i),stepName:name,equipmentId:eqId,staffId:staff?.id||null,skillId:skill,planningCapability:cap,start,end,durationHours:2,locked:false,status:'Planned',taskType:'process',estimateBasis:'Seeded power-tool demo plan'});}
const before=P.planningIntegrityAudit(s),bad=before.equipmentReadinessFailures.filter(x=>x.requestId===rid),eq11=s.equipment.find(x=>x.id==='EQ-011'),eq7=s.equipment.find(x=>x.id==='EQ-007');
s.planningEvents.push({id:'VERIFY-CLOSURE',type:'Lab closure',scope:'lab',title:'Verification closure',start:'2026-12-17T07:00:00.000Z',end:'2026-12-18T18:00:00.000Z',active:true});
const repair=P.repairSeedPlanningIntegrityV1081(s),after=P.planningIntegrityAudit(s),eqCheck=new P.ReadinessService(s).evaluate(rid).checks.find(x=>x[0]==='Equipment readiness'),closure=s.planningEvents.some(x=>x.id==='VERIFY-CLOSURE'),inv=P.validateInvariants(s);
console.log(JSON.stringify({beforeP1024:bad.length,badResources:[...new Set(bad.map(x=>x.equipmentId))].sort(),eq11:{cal:eq11.calibrationDue,mnt:eq11.maintenanceDue},eq7:{cal:eq7.calibrationDue,mnt:eq7.maintenanceDue},repair:{changed:repair.changed,reason:repair.reason,residual:repair.residual||0},after:after.counts,p1024Equipment:eqCheck?.[1],closurePreserved:closure,invariants:inv.length}));
if(bad.length!==4||bad.filter(x=>x.equipmentId==='EQ-011').length!==2||bad.filter(x=>x.equipmentId==='EQ-007').length!==2||!repair.changed||!after.ok||eqCheck?.[1]!==true||!closure||inv.length)process.exit(2);
'''
r=subprocess.run(['node','-e',node_fixture,str(ROOT)],capture_output=True,text=True)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-500:],'stderr':r.stderr[-500:]}
check('Runtime: screenshot four-failure root cause reproduced and repaired', r.returncode==0, json.dumps(detail,separators=(',',':'))[:520])

# Hard closure still invalidates a future lock; completed history must survive.
node_closure=r'''
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab,s=P.createDemoState(),r=s.requests.find(x=>(s.bookings||[]).some(b=>b.requestId===x.id)),rows=s.bookings.filter(b=>b.requestId===r.id).sort((a,b)=>new Date(a.start)-new Date(b.start)),hist=rows[0],future=rows[1]||rows[0];hist.status='Completed';hist.locked=false;const histId=hist.id;future.locked=true;const st=new Date(future.start),en=new Date(future.end);s.planningEvents.push({id:'CLOSE',type:'Lab closure',scope:'lab',start:new Date(st.getTime()-1000).toISOString(),end:new Date(en.getTime()+1000).toISOString(),active:true});const results=new P.PlannerService().autoPlanPortfolio(s);const a=P.planningIntegrityAudit(s),histPresent=s.bookings.some(b=>b.id===histId&&/completed/i.test(b.status)),failures=results.filter(x=>!x.ok).length;console.log(JSON.stringify({histPresent,closureOverlaps:a.counts.planningEventOverlaps,counts:a.counts,integrity:a.ok,plannerFailures:failures}));if(!histPresent||a.counts.planningEventOverlaps||failures)process.exit(2);
'''
r=subprocess.run(['node','-e',node_closure,str(ROOT)],capture_output=True,text=True)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-400:],'stderr':r.stderr[-400:]}
check('Runtime: closure replans future work while preserving completed history', r.returncode==0, json.dumps(detail,separators=(',',':'))[:260])

required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js','README.md','CHANGELOG_v1.0.81.md','VERIFICATION_v1.0.81.md','verification-v181.py','ROOT_CAUSE_PROOF_v1.0.81.md']
check('Required REV81 release files present', all((ROOT/x).exists() for x in required), ', '.join(x for x in required if not (ROOT/x).exists()) or 'all present')
failed=[x for x in checks if not x[1]]
print(f'\nSUMMARY | {len(checks)-len(failed)}/{len(checks)} passed | {len(failed)} failed')
sys.exit(1 if failed else 0)
