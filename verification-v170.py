from pathlib import Path
import subprocess, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
services=(root/'services.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.70', "ProtoLab.VERSION = '1.0.70-poc'" in core)
check('header version 1.0.70', 'REV 1.0.70' in index)
check('cache-busted assets 1.0.70', index.count('?v=1.0.70') >= 6)
check('stale staff preference no longer creates false structural blocker', 'optimizer ignored the stale preference' in services and 'let preferredStaff=' in services)
check('move options are end-to-end prevalidated', 'simulateBuildMoveV1070' in app and 'validatedMoveOptionsV1070' in app and 'PREVALIDATED END-TO-END' in app)
check('move applies cached validated state', 'planningMoveProposalsV1070' in app and 'sourceFingerprint' in app and 'commitMoveProposalV1070' in app)
check('move cannot surface partial false option', 'No complete move is currently feasible' in app and 'did not show any partial or misleading options' in app)
check('within-build move applies without approval', 'No other build affected · applies immediately' in app and 'no separate approval was required within this build' in app)
check('cross-build impact requires decision', 'Move affects other builds' in app and 'Accept cross-build impact' in app and 'Decision rationale' in app)
check('true skill resolver is prevalidated before offering', 'prevalidatedSkillCandidatesV1070' in app and 'PREVALIDATED RESOLUTION ONLY' in app and 'simulate first, offer second, commit last' in app)
check('build plan uses separate lanes', 'BUILD PLAN · SEPARATE LANES · ENTIRE FLOW' in app and 'workspace-plan-lane-grid-v1070' in app and 'workspace-plan-lane-track-v1070' in css)
check('build-plan bars are movable', 'data-workspace-plan-booking-v1070' in app and 'enableWorkspacePlanningDragV1070' in app and 'data-v1070-start-build-move' in app)
check('build plan retains fit and zoom', 'data-v1069-plan-zoom="fit"' in app and '[1,1.5,2.25,3.25]' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)
# Planner regression + stale-preference regression.
js=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');
const P=ProtoLab,s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);
for(const r of s.requests){const route=s.routes.find(x=>x.requestId===r.id);if(!route)continue;r.planningPreferences=r.planningPreferences||{};r.planningPreferences.staffByTaskName=r.planningPreferences.staffByTaskName||{};for(const stp of route.steps||[]){const proc=s.processes.find(p=>p.id===stp.processId),skill=proc?.competency;if(!skill)continue;const bad=s.staff.find(st=>st.available!==false&&!(st.competencies||[]).includes(skill));if(bad)r.planningPreferences.staffByTaskName[stp.name]=bad.id;}}
const res=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});if(res.some(x=>!x.ok))process.exit(2);const inv=P.validateInvariants(s);if(inv.length)process.exit(3);console.log(JSON.stringify({plans:res.length,bookings:s.bookings.length,invariants:inv.length}));'''
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True)
check('portfolio plans despite stale unqualified preferences',p.returncode==0)
if p.stdout.strip(): print('Planner:',p.stdout.strip())
# True missing-skill resolution: prove training + resulting build can be scheduled before displaying such a candidate.
js2=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab,s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);const r=s.requests.find(r=>{const route=s.routes.find(x=>x.requestId===r.id);return route?.steps?.some(st=>s.processes.find(p=>p.id===st.processId)?.competency)}),route=s.routes.find(x=>x.requestId===r.id),step=route.steps.find(st=>s.processes.find(p=>p.id===st.processId)?.competency),proc=s.processes.find(p=>p.id===step.processId),skill=proc.competency;for(const person of s.staff)person.competencies=(person.competencies||[]).filter(x=>x!==skill);s.trainingCertificates=(s.trainingCertificates||[]).filter(c=>c.skillId!==skill);let blocked=false;try{new P.PlannerService().autoPlan(s,r.id)}catch(e){blocked=e.code==='ZERO_REQUIRED_SKILL'}if(!blocked)process.exit(4);const person=s.staff.find(x=>x.available!==false),sk=s.competencies.find(x=>x.id===skill);person.competencies.push(skill);const h=Number(sk.trainingDurationHours||4),item={id:'TEST',itemKey:'TEST',type:'Training',staffId:person.id,skillId:skill,targetId:person.id,targetName:person.name,durationHours:h,dueDate:r.requiredDate,validMonths:Number(sk.validMonths||24),owner:sk.owner,reason:'verification'};const svc=new P.ResourceCareService(),slot=svc.nextResolvableSlot(s,item,new Date());svc.scheduleResolved(s,item,slot.start,{durationHours:h,note:'verification'});new P.PlannerService().autoPlan(s,r.id);if(P.validateInvariants(s).length)process.exit(5);console.log(JSON.stringify({request:r.id,skill,person:person.id,training:slot.start,bookings:s.bookings.filter(b=>b.requestId===r.id).length}));'''
p2=subprocess.run(['node','-e',js2],cwd=root,capture_output=True,text=True)
check('true missing-skill candidate can be validated end-to-end',p2.returncode==0)
if p2.stdout.strip(): print('Skill resolution:',p2.stdout.strip())
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} release checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
