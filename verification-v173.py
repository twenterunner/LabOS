from pathlib import Path
import subprocess, sys, json
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
services=(root/'services.js').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.73', "ProtoLab.VERSION = '1.0.73-poc'" in core)
check('header version 1.0.73', 'REV 1.0.73' in index)
check('cache busting 1.0.73', index.count('?v=1.0.73') >= 6)
check('batch engineering material receipt UI', 'Receive all engineering material' in app and 'Receive all & continue' in app)
check('completed material rows explicitly green', 'v1073-material-complete' in app and '.material-req.v1073-material-complete' in css)
check('material completion exposes next guided action', 'NEXT GUIDED ACTION' in app and 'nextIncompleteGuidedStepV1073' in app)
check('material guided step uses physical build readiness', "m.done=!!a.buildReady" in app)
check('yellow receive/next actions', '[data-v1073-receive-all]' in css and '.material-next-v1073 .button' in css)
check('single consolidated method sheet', 'One controlled sheet — one completion action' in app and 'methodReleaseSheetModalV1073' in app)
check('PE self release, non-PE PE signoff rule', 'Process Engineer self-release rule' in app and 'Process Engineer sign-off required' in app)
check('process development actions route to consolidated sheet', "actionResolutionModel(a)?.kind==='process-development'" in app)
check('request submit is a handoff and yellow', 'Submitting a build request is a hand-off, not an approval' in app and '[data-submit-request]' in css)
check('release approvals deferred until engineering review', "releaseGate=ProtoLab.GATES.indexOf('ENGINEERING REVIEW')" in core)
check('readiness approvals deferred until readiness gate', "readinessGate=ProtoLab.GATES.indexOf('BUILD READINESS REVIEW')" in core)
check('test capability inference present', 'inferPlanningCapabilityFromName' in core and 'inferPlanningSkillFromName' in core)
check('planner can train staff rather than false zero-skill blocker', 'const associated=all.filter' in services and 'return associated.length?associated:all' in services)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)

# Domain regression: no request/release approval required in draft/submitted; material completion; portfolio plan;
# deliberately erase qualifications to prove optimizer schedules training rather than returning a false infeasibility.
js=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');
const P=ProtoLab;
let s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);
let r=s.requests.find(x=>x.status==='DRAFT REQUEST')||s.requests[0];
r.status=r.currentGate='DRAFT REQUEST';P.ensureApprovalRecords(s,r);
const premDraft=s.approvals.filter(a=>a.requestId===r.id&&a.status==='Pending'&&['Product Safety','Build Readiness','Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type));
r.status=r.currentGate='SUBMITTED';P.ensureApprovalRecords(s,r);
const premSubmitted=s.approvals.filter(a=>a.requestId===r.id&&a.status==='Pending'&&['Product Safety','Build Readiness','Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type));
// Engineering supplied material becomes fully ready on exact issued BOM quantities without requiring a prior promise.
r.materialOwnership='Engineering supplied';r.materialSupply=null;P.ensureMaterialRequirements(s,r);s.allocations=(s.allocations||[]).filter(a=>a.requestId!==r.id);
for(const q of r.materialRequirements){const m={id:P.uid('MAT'),partNumber:q.partNumber,revision:q.revision,description:q.description,lot:'TEST-'+q.id,quantity:0,status:'Consumed / issued'};s.materials.push(m);s.allocations.push({id:P.uid('ALLOC'),requestId:r.id,requirementId:q.id,materialId:m.id,lot:m.lot,qty:Number(q.requiredQty),status:'Issued'});}
const mat=P.materialPlanningAssessment(s,r);
// Clean full portfolio planning.
s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);
const plan=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});
const fail=plan.filter(x=>!x.ok);const inv=P.validateInvariants(s);
let mismatches=0;for(const b of s.bookings||[]){if(!b.equipmentId)continue;const eq=s.equipment.find(e=>e.id===b.equipmentId);const route=s.routes.find(x=>x.requestId===b.requestId);const st=route?.steps?.find(x=>x.id===b.stepId);const proc=st&&s.processes.find(x=>x.id===st.processId);const tr=(s.requests.find(x=>x.id===b.requestId)?.testRequirements||[]).find(x=>x.id===b.stepId);const need=tr?.equipmentCapability||(proc?P.planningCapabilityForProcess(s,s.requests.find(x=>x.id===b.requestId),proc):null);const got=P.equipmentPlanningCapability(eq);if(need&&got!==need)mismatches++;}
// Deliberately remove all current competency associations and certificates. Planner must create training prerequisites.
let s2=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s2);P.ensurePlanningModel(s2);for(const st of s2.staff||[])st.competencies=[];s2.trainingCertificates=[];const plan2=new P.PlannerService().autoPlanPortfolio(s2,{includePotential:false});const fail2=plan2.filter(x=>!x.ok);const training=(s2.resourceCareBookings||[]).filter(x=>x.type==='Training'&&x.autoGenerated).length;
console.log(JSON.stringify({prematureDraft:premDraft.length,prematureSubmitted:premSubmitted.length,materialPlanningReady:mat.planningReady,materialBuildReady:mat.buildReady,portfolioPlans:plan.length,portfolioFailed:fail.length,equipmentMismatches:mismatches,invariants:inv.length,noSkillFailed:fail2.length,autoTraining:training}));
if(premDraft.length||premSubmitted.length||!mat.planningReady||!mat.buildReady||fail.length||mismatches||inv.length||fail2.length||training<1)process.exit(7);'''
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True)
check('domain regression: approvals/material/auto-plan/training',p.returncode==0)
if p.stdout.strip(): print('Domain:',p.stdout.strip())
if p.stderr.strip(): print('Domain stderr:',p.stderr.strip())

# Process Engineer can release a complete method without duplicate approval; non-PE cannot release without PE approval.
js2=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab;
function prep(role){const s=P.createDemoState();s.identity.role=role;s.identity.name=(s.users||[]).find(u=>u.role===role)?.name||role;const d=(s.processDevelopments||[])[0];for(const k of ['need','plan','trial','parameters','risk','measurement','capability','controlPlan','workInstruction'])d.gates[k]=true;d.gates.approval=false;d.gates.release=false;d.status='PROCESS ENGINEER REVIEW';d.parameters=d.parameters?.length?d.parameters:[{name:'Parameter',target:'1',unit:'unit'}];d.workInstructionDraft=d.workInstructionDraft||{steps:['Perform controlled method'],requiredEvidence:['Execution record']};d.measurementConclusion='Pass';d.fitConclusion='Fit';d.permittedEnvelope=d.permittedEnvelope||'Defined envelope';return {s,d};}
let a=prep('process_engineer');let peOk=true;try{new P.ProcessService(a.s).releaseDevelopment(a.d.id);}catch(e){peOk=false;}
let b=prep('lab_manager');let nonPeBlocked=false;try{new P.ProcessService(b.s).releaseDevelopment(b.d.id);}catch(e){nonPeBlocked=/approval/i.test(e.message);}
console.log(JSON.stringify({peSelfRelease:peOk,nonPeBlockedUntilPE:nonPeBlocked}));if(!peOk||!nonPeBlocked)process.exit(8);'''
p2=subprocess.run(['node','-e',js2],cwd=root,capture_output=True,text=True)
check('method release authority regression',p2.returncode==0)
if p2.stdout.strip(): print('Method:',p2.stdout.strip())

failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
