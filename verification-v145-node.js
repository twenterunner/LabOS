const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=__dirname;
function load(includeRepo=false){
  const ctx={console,Date,Math,Intl,setTimeout,clearTimeout,indexedDB:undefined};ctx.window=ctx;vm.createContext(ctx);
  for(const f of ['core.js','demo-data.js','services.js',...(includeRepo?['repository.js']:[])])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
  return ctx.ProtoLab;
}
const P=load(true);let pass=0,fail=0,rows=[];
function ok(name,fn){try{const v=fn();if(v&&typeof v.then==='function')throw new Error('async test passed to sync runner');assert.ok(v===undefined?true:v);rows.push({name,ok:true});pass++;}catch(e){rows.push({name,ok:false,error:e.message});fail++;}}
async function oka(name,fn){try{const v=await fn();if(v!==undefined)assert.ok(v);rows.push({name,ok:true});pass++;}catch(e){rows.push({name,ok:false,error:e.message});fail++;}}
function rejects(name,fn,re){try{fn();throw new Error('accepted unexpectedly');}catch(e){if(e.message==='accepted unexpectedly'){rows.push({name,ok:false,error:e.message});fail++;return}try{assert.match(String(e.message),re);rows.push({name,ok:true});pass++;}catch(a){rows.push({name,ok:false,error:`wrong rejection: ${e.message}`});fail++;}}}
function state(){return P.createDemoState()}
function role(s,id){const u=(s.users||[]).find(x=>x.role===id)||{id:'X',name:'Test',role:id};s.identity={userId:u.id,name:u.name,role:id}}
function create(s,extra={}){const product=s.products[0];return new P.RequestService(s).create({title:'V145',productId:product.id,quantity:3,requiredDate:'2026-12-10',objective:'verification',engineeringTeam:'Advanced Engineering',assuranceProfile:'rapid',materialOwnership:'Engineering supplied',...extra})}
function executeAll(s,r){const ser=new P.SerialService(s);ser.allocateRequested(r.id);const route=s.routes.find(x=>x.requestId===r.id);for(const sm of s.serials.filter(x=>x.requestId===r.id))for(const st of route.steps.filter(x=>!x.optional)){sm.processHistory=sm.processHistory||[];sm.processHistory.push({stepId:st.id,completedAt:P.now(),operator:'Test'});}return {samples:s.serials.filter(x=>x.requestId===r.id),route};}

ok('Version is REV 1.0.45 / schema 21',()=>P.VERSION==='1.0.45-poc'&&P.SCHEMA_VERSION===21);
ok('Seed invariants clean',()=>P.validateInvariants(state()).length===0);

// S1/S2: Request validation and IDs
rejects('Unknown product is rejected',()=>create(state(),{productId:'NO-PRODUCT'}),/unknown product/i);
rejects('Negative quantity is rejected at create',()=>create(state(),{quantity:-1}),/positive whole/i);
rejects('Zero quantity is rejected at create',()=>create(state(),{quantity:0}),/positive whole/i);
rejects('Fractional quantity is rejected at create',()=>create(state(),{quantity:1.5}),/positive whole/i);
rejects('Invalid required date is rejected at create',()=>create(state(),{requiredDate:'nonsense'}),/valid required date/i);
ok('Request ID stays unique after deletion',()=>{const s=state(),deleted=s.requests.shift(),r=create(s);return s.requests.filter(x=>x.id===r.id).length===1&&r.id!==deleted.id;});
ok('Burst-created route IDs are collision-safe',()=>{const s=state(),ids=[];for(let i=0;i<200;i++)ids.push(create(s,{title:'burst'+i}).routeId);return new Set(ids).size===ids.length;});
rejects('CLOSED request cannot be resubmitted',()=>{const s=state(),r=s.requests.find(x=>x.status==='CLOSED');return new P.RequestService(s).submit(r.id)},/only DRAFT REQUEST|cannot submit/i);

// S1/S2: release/quality governance
rejects('Fresh DRAFT rapid build cannot be released',()=>{const s=state();role(s,'quality');const r=create(s);new P.QualityService(s).releaseRequest(r.id)},/lifecycle|execute/i);
rejects('Fresh DRAFT validation build cannot be released',()=>{const s=state();role(s,'quality');const r=create(s,{assuranceProfile:'validation'});new P.QualityService(s).releaseRequest(r.id)},/lifecycle|execute/i);
rejects('Technician cannot invoke release service',()=>{const s=state();role(s,'technician');const r=create(s);r.status=r.currentGate='CHARACTERISATION';executeAll(s,r);new P.QualityService(s).releaseRequest(r.id)},/not authorised/i);
rejects('Technician cannot close quality case service',()=>{const s=state();role(s,'technician');const d=s.deviations.find(x=>x.status!=='CLOSED');P.ensureQualityCase(d);d.containment='Contained';d.rootCause='Cause';d.actions.forEach(a=>a.closed=true);d.disposition='Rework';d.justification='Evidence';d.verificationEvidence='Verified';new P.QualityService(s).closeDeviation(d.id)},/not authorised/i);
rejects('Failed measurement needs its specifically linked disposition',()=>{const s=state();role(s,'quality');const r=create(s);r.status=r.currentGate='CHARACTERISATION';const {samples}=executeAll(s,r);const m={id:'FAIL-145',requestId:r.id,serial:samples[0].serial,characteristic:'Critical X',value:12,lsl:0,usl:10,pass:false,compliant:false};s.measurements.push(m);s.deviations.push({id:'UNRELATED',requestId:r.id,serial:samples[0].serial,measurement:'Other issue',status:'CLOSED',releaseHold:false,containment:'Done',rootCause:'Known',actions:[],disposition:'Use-as-is',justification:'Other',verificationEvidence:'Done'});new P.QualityService(s).releaseRequest(r.id)},/specifically linked|failed measurement/i);
ok('Specifically linked closed disposition clears that failure check',()=>{const s=state();role(s,'quality');const r=create(s);r.status=r.currentGate='CHARACTERISATION';const {samples}=executeAll(s,r);const m={id:'FAIL-LINKED',requestId:r.id,serial:samples[0].serial,characteristic:'Critical X',value:12,lsl:0,usl:10,pass:false,compliant:false};s.measurements.push(m);s.deviations.push({id:'LINKED',requestId:r.id,sourceMeasurementId:m.id,serial:m.serial,measurement:m.characteristic,status:'CLOSED',releaseHold:false,containment:'Done',rootCause:'Known',actions:[],disposition:'Use-as-is',justification:'Engineering evidence',verificationEvidence:'Retest/analysis verified'});new P.QualityService(s).releaseRequest(r.id);return r.status==='RELEASED';});
rejects('Requested sample population required for release',()=>{const s=state();role(s,'quality');const r=create(s);r.status=r.currentGate='CHARACTERISATION';new P.QualityService(s).releaseRequest(r.id)},/sample record/i);
rejects('Route execution required for release',()=>{const s=state();role(s,'quality');const r=create(s);r.status=r.currentGate='CHARACTERISATION';new P.SerialService(s).allocateRequested(r.id);new P.QualityService(s).releaseRequest(r.id)},/route execution is incomplete/i);

// Lifecycle service domain guardrails
ok('Lifecycle service is exported',()=>typeof P.LifecycleService==='function');
rejects('Lifecycle service blocks status/currentGate mismatch',()=>{const s=state();role(s,'administrator');const r=create(s);r.status='SUBMITTED';r.currentGate='FEASIBILITY';new P.LifecycleService(s).advance(r.id,{evidence:'Evidence'})},/inconsistent/i);
rejects('Lifecycle service enforces gate-specific role',()=>{const s=state();role(s,'technician');const r=create(s);r.status=r.currentGate='QUALITY REVIEW';new P.LifecycleService(s).advance(r.id,{evidence:'Evidence'})},/not authorised/i);
rejects('Lifecycle service blocks incomplete process execution',()=>{const s=state();role(s,'technician');const r=create(s);r.status=r.currentGate='BUILD IN PROGRESS';new P.SerialService(s).allocateRequested(r.id);new P.LifecycleService(s).advance(r.id,{evidence:'Claimed done'})},/execution is incomplete/i);
rejects('Lifecycle service requires objective evidence',()=>{const s=state();role(s,'lab_planner');const r=create(s);r.status=r.currentGate='SUBMITTED';new P.LifecycleService(s).advance(r.id,{evidence:''})},/requires objective review evidence/i);

// Control Plan governance
rejects('Draft Control Plan cannot be approved before review request',()=>{const s=state();role(s,'approver');const cp=s.controlPlans.find(x=>x.status==='Review requested');cp.status='Draft';cp.owner='Someone else';new P.ControlPlanService(s).approve(cp.id)},/submitted for review/i);
ok('Control Plan Z revision rolls to AA',()=>{const s=state();const cp=s.controlPlans.find(x=>x.status==='Review requested');cp.revision='Z';return new P.ControlPlanService(s).revise(cp.id).revision==='AA';});

// Invariants/import/planner
ok('Invariant checker detects duplicate request IDs',()=>{const s=state();s.requests[1].id=s.requests[0].id;return P.validateInvariants(s).some(x=>/Request IDs are not unique/i.test(x));});
ok('Invariant checker detects duplicate route IDs',()=>{const s=state();s.routes[1].id=s.routes[0].id;return P.validateInvariants(s).some(x=>/Route IDs are not unique/i.test(x));});
ok('Invariant checker detects gate/status mismatch',()=>{const s=state();s.requests[0].status='SUBMITTED';s.requests[0].currentGate='FEASIBILITY';return P.validateInvariants(s).some(x=>/status.*gate|gate.*status/i.test(x));});
ok('Unexpected portfolio planner exception is not reported ok=true',()=>{const s=state(),pl=new P.PlannerService();pl.autoPlan=()=>{throw new Error('synthetic planner fault')};const res=pl.autoPlanPortfolio(s);return res.length>0&&res.every(x=>x.ok===false&&x.code==='PLANNER_UNEXPECTED');});

// Static code/UI checks for S1/S2 and requested enhancements
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),svc=fs.readFileSync(path.join(root,'services.js'),'utf8'),repo=fs.readFileSync(path.join(root,'repository.js'),'utf8'),css=fs.readFileSync(path.join(root,'styles.css'),'utf8'),index=fs.readFileSync(path.join(root,'index.html'),'utf8'),manual=fs.readFileSync(path.join(root,'USER_MANUAL.html'),'utf8');
ok('Administrator renderer exists',()=>/function renderAdmin\(\)/.test(app));
ok('Closeout document/audit/lesson renderers exist',()=>['workspaceDocuments','workspaceAudit','workspaceLessons'].every(x=>app.includes(`function ${x}(`)));
ok('Guided disposition captures root cause and effectiveness verification evidence',()=>/id="dispRoot"/.test(app)&&/id="dispVerification"/.test(app)&&/verificationEvidence=\$\('#dispVerification'\)/.test(app));
ok('New quality case can link exact failed measurement',()=>/id="qnSourceMeasurement"/.test(app)&&/sourceMeasurementId:src\?\.id/.test(app));
ok('Build quality issue modal can link exact failed measurement',()=>/id="nSourceMeasurement"/.test(app)&&/sourceMeasurementId:src\?\.id/.test(app));
ok('Control Plan UI has explicit submit-for-review action',()=>/data-request-cp-review/.test(app)&&/Submit for independent review/.test(app));
ok('Lifecycle UI delegates gate change to domain LifecycleService',()=>/new P\.LifecycleService\(App\.state\)\.advance/.test(app));
ok('JSON import validates invariants before save',()=>/issues=P\.validateInvariants\(migrated\).*if\(issues\.length\).*await this\.save\(migrated\)/s.test(repo));
ok('User manual and shell identify REV 1.0.45',()=>/REV 1\.0\.45/.test(index)&&/REV 1\.0\.45/.test(manual)&&/styles\.css\?v=1\.0\.45/.test(index));

// Screenshot-requested readiness resolution
ok('Equipment blocker no longer routes to obsolete resource-assurance/dashboard target',()=>!app.includes("nav('resource-assurance')")&&!app.includes('data-nav="resource-assurance"'));
ok('Readiness blocker opens contextual resolver',()=>/function readinessBlockerModal/.test(app)&&/Why Step 6 is blocked/.test(app)&&/Understand/.test(app)&&/Recheck/.test(app));
ok('Equipment resolver shows capability, assigned equipment and calibration/maintenance evidence',()=>/Required capability/.test(app)&&/Calibration/.test(app)&&/maintenance/i.test(app)&&/Open Resource Assurance/.test(app));

// Screenshot-requested multi-sample execution/data matrix
ok('Execution chooser supports multiple samples',()=>/type="checkbox" name="execSample"/.test(app)&&/data-exec-select-all/.test(app)&&/data-exec-clear/.test(app));
ok('Execution start uses all selected samples',()=>/input\[name="execSample"\]:checked/.test(app)&&/Started .*sample/.test(app));
ok('Process data has explicit setup + sample matrix flow',()=>/Process data matrix/.test(app)&&/MACHINE \/ SETUP/.test(app)&&/SAMPLE DATA MATRIX/.test(app));
ok('Process data distinguishes machine/setup from sample measurement',()=>/Machine setting/.test(app)&&/Setup \/ batch setting/.test(app)&&/Sample characteristic \/ measurement/.test(app));
ok('Matrix includes every active sample row',()=>/samples\.map\(sm=>`<tr>/.test(app)&&/class="data-table process-matrix"/.test(app));
ok('Every sample field offers same-value bulk fill',()=>/Same value for all samples/.test(app)&&/data-pd-fill-all/.test(app)&&/Apply to all \$\{samples\.length\}/.test(app));
ok('Matrix/bulk UI has responsive styling',()=>/\.process-matrix/.test(css)&&/\.process-data-fill-row/.test(css)&&/\.process-data-flow/.test(css));

// Plot/statistics improvements
ok('Capability plot uses 50 bins for larger samples',()=>/bins=50/.test(app)&&/50-bin histogram/.test(app));
ok('Small prototype data uses individual sample scatter',()=>/useHist=vals\.length>=40/.test(app)&&/Individual sample scatter/.test(app)&&/cap-scatter-dot/.test(app));
ok('Fitted normal distribution curve is rendered',()=>/cap-normal-curve/.test(app)&&/fitted normal curve/.test(app));
ok('Anderson-Darling normality test with p-value is included',()=>/function andersonDarlingNormality/.test(app)&&/Anderson–Darling normality p=/.test(app)&&/AD p/.test(app));

// Improvement closed loop
ok('Accept starts implementation rather than silently closing action',()=>/Accept & start implementation/.test(app)&&/improvementImplementationModal/.test(app));
ok('Improvement has four-step implementation rail',()=>/Confirm the problem and scope/.test(app)&&/Implement the controlled change/.test(app)&&/Recalculate \/ check downstream impact/.test(app)&&/Verify effectiveness/.test(app));
ok('Accepted improvements remain open until Verified',()=>/implementation\?\.status!=='Verified'/.test(app)&&/actionStillOpen/.test(app));
ok('Implementation requires evidence at each step',()=>/Record objective evidence/.test(app)&&/stepEvidence/.test(app)&&/verificationEvidence/.test(app));

// Service source checks
ok('Release service checks route execution and failed-result linkage',()=>/route execution is incomplete/.test(svc)&&/specifically linked, closed disposition/.test(svc));
ok('Quality closure service enforces role + verification evidence',()=>/not authorised to close\/disposition/.test(svc)&&/effectiveness verification evidence is required/.test(svc));
ok('Control Plan service requires Review requested',()=>/cp\.status!==\'Review requested\'/.test(svc));
ok('Planner unexpected failures are marked Planning blocked',()=>/PLANNER_UNEXPECTED/.test(svc)&&/Planning blocked/.test(svc));

(async()=>{
 await oka('Invalid JSON import is rejected before persistence',async()=>{const s=state(),repoObj=new P.IndexedDBStorageRepository();repoObj.memoryFallback=P.deepClone(s);let saved=false;repoObj.save=async()=>{saved=true};const bad=P.deepClone(s);bad.requests[1].id=bad.requests[0].id;let rejected=false;try{await repoObj.importJSON(JSON.stringify({state:bad}))}catch(e){rejected=/Import rejected/.test(e.message)}return rejected&&!saved;});
 await oka('Valid JSON import still persists',async()=>{const s=state(),repoObj=new P.IndexedDBStorageRepository();repoObj.memoryFallback=P.deepClone(s);let saved=false;repoObj.save=async()=>{saved=true};await repoObj.importJSON(JSON.stringify({state:s}));return saved;});
 for(const r of rows)console.log(`${r.ok?'PASS':'FAIL'} | ${r.name}${r.error?' | '+r.error:''}`);
 console.log(`\nRESULT: ${pass} passed, ${fail} failed, ${pass+fail} total`);
 fs.writeFileSync(path.join(root,'VERIFICATION_RESULTS_v1.0.45.json'),JSON.stringify({version:P.VERSION,passed:pass,failed:fail,total:pass+fail,rows},null,2));
 process.exitCode=fail?1:0;
})();
