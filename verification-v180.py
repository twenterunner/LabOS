from pathlib import Path
import json, subprocess, sys, zipfile, tempfile, textwrap
ROOT=Path(__file__).resolve().parent
checks=[]
def check(name, cond, detail=''):
    checks.append((name,bool(cond),detail))
    print(('PASS' if cond else 'FAIL')+f' | {name}'+(f' | {detail}' if detail else ''))

def txt(name): return (ROOT/name).read_text(encoding='utf-8')
core=txt('core.js'); app=txt('app.js'); svc=txt('services.js'); css=txt('styles.css'); idx=txt('index.html'); sw=txt('service-worker.js')
check('Version is REV 1.0.80', "ProtoLab.VERSION = '1.0.80-poc'" in core and 'REV 1.0.80' in idx)
check('All main assets cache-busted to 1.0.80', idx.count('?v=1.0.80') >= 5)
check('Service-worker reset identity updated', 'LabOS 1.0.80 cache reset worker' in sw)
check('Three manual tiers are explicit', all(x in app for x in ['Green · least disruptive','Yellow · controlled local change','Red · portfolio impact']))
check('Manual planning uses prevalidated move options', 'validatedMoveOptionsV1071(b,10)' in app and 'v1080ShowManualOptions' in app)
check('Manual plan is staged before live save', 'manualPlanningDraftV1080' in app and 'sourceFingerprint:planningFingerprintV1070(App.state)' in app)
check('Manual save has stale live-plan guard', "planningFingerprintV1070(App.state)!==draft.sourceFingerprint" in app)
check('Manual save scans conflicts before commit', 'v1080ManualBookingIssues(draft.state,b)' in app and 'Manual plan not applied' in app)
check('Red tier requires explicit review', 'v1080ReviewManualRed' in app and 'Stage Tier 3 option' in app)
check('Month shown in swimlane header', 'swim-month-v1080' in app and "month:'short'" in app)
check('Calendar week shown in swimlane header', 'swim-cw-v1080' in app and 'CW${isoWeekV1080(d)}' in app)
check('Weekend shading is conditional on weekend setting', 'weekendBands=!v1072WeekendsEnabled()' in app and '.swim-weekend-band-v1080' in css)
check('Hard planning situations invalidate infeasible locks', 'b.locked&&!eventBlocksBooking(b)' in svc and 'b.locked&&!blockedLocked(b)' in svc)
check('Feasible locks are preserved without duplicate task bookings', 'lockedIndex=bookings.findIndex' in svc and "status:'Locked'" in svc and 'bookings.splice(lockedIndex,1)' in svc)
check('Residual lab-closure conflicts block proposal', 'LAB_CLOSURE_RESIDUAL' in app and 'v1080LabClosureConflicts(proposed)' in app)
check('Existing saved closure overlaps reconcile on load', 'v1080ReconcileResidualClosuresOnLoad' in app and 'closureRepairV1080=v1080ReconcileResidualClosuresOnLoad()' in app)

# JavaScript syntax checks
for js in ['core.js','demo-data.js','repository.js','services.js','app.js']:
    r=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
    check(f'JavaScript syntax: {js}', r.returncode==0, (r.stderr.strip() or 'OK')[:180])

# Runtime regression for locked booking inside a hard whole-lab closure.
node_test=r'''
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab,s=P.createDemoState(),openIds=new Set(s.requests.filter(r=>!['DELIVERED','CLOSED','RELEASED'].includes(r.status)).map(r=>r.id));
let b=s.bookings.find(x=>openIds.has(x.requestId));
if(!b){const r=s.requests.find(x=>openIds.has(x.id));new P.PlannerService().autoPlan(s,r.id);b=s.bookings.find(x=>x.requestId===r.id)}
if(!b)throw new Error('No open build booking available for closure regression.');
b.locked=true;const st=new Date(b.start);st.setHours(0,0,0,0);const en=new Date(st);en.setDate(en.getDate()+1);en.setHours(0,0,0,0);
s.planningEvents=[...(s.planningEvents||[]),{id:'VERIFY-CLOSURE',type:'Lab closure',scope:'lab',start:st.toISOString(),end:en.toISOString(),reason:'verification',active:true}];
const ov=x=>new Date(x.start)<en&&new Date(x.end)>st;
const before=s.bookings.filter(x=>openIds.has(x.requestId)&&ov(x)).length;
const result=new P.PlannerService().autoPlanPortfolio(s);
const after=s.bookings.filter(x=>openIds.has(x.requestId)&&ov(x)).length,fail=result.filter(x=>!x.ok),inv=P.validateInvariants(s);
console.log(JSON.stringify({before,after,planned:result.length,failed:fail.length,invariants:inv.length,lockedBookingRemoved:!s.bookings.some(x=>x.id===b.id)}));
if(before<1||after!==0||fail.length||inv.length||s.bookings.some(x=>x.id===b.id))process.exit(2);
'''
r=subprocess.run(['node','-e',node_test,str(ROOT)],capture_output=True,text=True)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-300:],'stderr':r.stderr[-300:]}
check('Runtime: closure replans locked open-build work with zero residual overlap', r.returncode==0, json.dumps(detail,separators=(',',':'))[:260])

# Runtime regression: a feasible lock is retained once and not duplicated by AUTO-PLAN.
node_lock=r"""
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab,s=P.createDemoState(),r=s.requests.find(x=>!['DELIVERED','CLOSED','RELEASED'].includes(x.status)&&(s.bookings||[]).some(b=>b.requestId===x.id));
const bs=s.bookings.filter(b=>b.requestId===r.id).sort((a,b)=>new Date(a.start)-new Date(b.start)),lock=bs[Math.min(2,bs.length-1)];lock.locked=true;const id=lock.id,step=lock.stepId;
new P.PlannerService().autoPlan(s,r.id);const rows=s.bookings.filter(b=>b.requestId===r.id&&b.stepId===step),inv=P.validateInvariants(s);
console.log(JSON.stringify({lockId:id,stepId:step,sameStepCount:rows.length,lockedPreserved:rows.some(b=>b.id===id&&b.locked),invariants:inv.length}));
if(rows.length!==1||!rows.some(b=>b.id===id&&b.locked)||inv.length)process.exit(2);
"""
r=subprocess.run(['node','-e',node_lock,str(ROOT)],capture_output=True,text=True)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-300:],'stderr':r.stderr[-300:]}
check('Runtime: feasible locked task is preserved exactly once', r.returncode==0, json.dumps(detail,separators=(',',':'))[:260])

# Flat release package expectations (source directory itself, before zip creation).
required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js','README.md','CHANGELOG_v1.0.80.md','VERIFICATION_v1.0.80.md','verification-v180.py']
check('Required release files present', all((ROOT/x).exists() for x in required), ', '.join(x for x in required if not (ROOT/x).exists()) or 'all present')

failed=[x for x in checks if not x[1]]
print(f'\nSUMMARY | {len(checks)-len(failed)}/{len(checks)} passed | {len(failed)} failed')
sys.exit(1 if failed else 0)
