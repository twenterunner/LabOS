(function(){
'use strict';
const P=window.ProtoLab;
class StorageRepository{async init(){} async load(){} async save(){} async reset(){} async exportJSON(){} async importJSON(){} }
class IndexedDBStorageRepository extends StorageRepository{
 constructor(){super();this.dbName='ProtoLabOS';this.store='app';this.key='state';this.db=null;this.memoryFallback=null;}
 async init(){
  try{this.db=await new Promise((resolve,reject)=>{const req=indexedDB.open(this.dbName,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(this.store))db.createObjectStore(this.store);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return true;}
  catch(e){console.warn('IndexedDB unavailable, using in-memory fallback',e);this.memoryFallback=P.createDemoState();return false;}
 }
 async load(){ if(!this.db)return this.memoryFallback||P.createDemoState(); return new Promise((resolve,reject)=>{const tx=this.db.transaction(this.store,'readonly');const req=tx.objectStore(this.store).get(this.key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);}); }
 async save(state){ if(!this.db){this.memoryFallback=P.deepClone(state);return true;} return new Promise((resolve,reject)=>{const tx=this.db.transaction(this.store,'readwrite');tx.objectStore(this.store).put(P.deepClone(state),this.key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);}); }
 async reset(){const state=P.createDemoState();await this.save(state);return state;}
 async exportJSON(state){return JSON.stringify({schemaVersion:P.SCHEMA_VERSION,exportedAt:P.now(),appVersion:P.VERSION,state},null,2);}
 async importJSON(text){const parsed=JSON.parse(text);const state=parsed.state||parsed;if(!state.schemaVersion)throw new Error('Missing schemaVersion');const migrated=MigrationService.migrate(state),issues=P.validateInvariants(migrated);if(issues.length)throw new Error(`Import rejected: ${issues.slice(0,5).join(' | ')}${issues.length>5?' | …':''}`);await this.save(migrated);return migrated;}
}
class MigrationService{
 static migrate(state){
  let s=P.deepClone(state);if(s.schemaVersion>P.SCHEMA_VERSION)throw new Error('This data was created by a newer schema.');
  while(s.schemaVersion<P.SCHEMA_VERSION){
   if(s.schemaVersion===0){s.settings=s.settings||{};s.schemaVersion=1;continue;}
   if(s.schemaVersion===1){
    P.ensureMaterialModel(s);
    (s.requests||[]).forEach(r=>{
      P.ensureMaterialRequirements(s,r);P.ensureApprovalRecords(s,r);
      let route=(s.routes||[]).find(x=>x.requestId===r.id);
      if(!route){route={id:r.routeId||P.uid('ROUTE'),requestId:r.id,revision:'A',steps:[],reworkLoops:[]};s.routes.push(route);r.routeId=route.id;}
      if(!route.steps?.length){route.proposed=true;route.confirmed=false;route.steps=P.getDefaultRoute(r.productId).map((pid,i)=>{const proc=(s.processes||[]).find(p=>p.id===pid);return {id:P.uid('STEP'),order:i+1,processId:pid,name:proc?.name||pid,processRevision:proc?.revision||'A',type:'standard',owner:'Unassigned',planned:null,status:'Proposed',readiness:'pending',parallelGroup:null,optional:false};});}
    });
    s.dataVersion=s.dataVersion||'migrated';s.schemaVersion=2;continue;
   }
   if(s.schemaVersion===2){
    const seed=P.createDemoState?P.createDemoState():null;
    if(!(s.standardTests||[]).length&&seed)s.standardTests=P.deepClone(seed.standardTests||[]);if(!(s.competencies||[]).length&&seed)s.competencies=P.deepClone(seed.competencies||[]);if(!(s.buildHistory||[]).length&&seed)s.buildHistory=P.deepClone(seed.buildHistory||[]);
    P.ensurePlanningModel(s);
    (s.requests||[]).forEach(r=>{r.materialOwnership=P.normaliseMaterialSource(r.materialOwnership);if(r.materialOwnership==='Engineering supplied'){r.materialSupply=r.materialSupply||{owner:r.requester||'Engineering Requester',expectedDate:r.requiredDate||P.todayISO(),reference:'Migrated supply plan'};}P.ensureTestRequirements(s,r);const route=(s.routes||[]).find(x=>x.requestId===r.id);if(route&&route.confirmed===undefined){route.confirmed=P.GATES.indexOf(r.status)>=P.GATES.indexOf('PROCESS DEFINITION');route.proposed=!route.confirmed;}});
    (s.processDevelopments||[]).forEach(d=>{if(!Number(d.planningEstimateHours))d.planningEstimateHours=d.status==='RELEASED'?0:8;});
    s.dataVersion='2026.09-demo-5';s.schemaVersion=3;continue;
   }
   if(s.schemaVersion===3){P.ensureEnterpriseModel(s);s.dataVersion='2026.09-demo-6';s.schemaVersion=4;continue;}
   if(s.schemaVersion===4){P.ensureEnterpriseModel(s);const demoCerts=(s.trainingCertificates||[]).filter(c=>String(c.id||'').startsWith('CERT-U')).slice(0,4);demoCerts.forEach((c,i)=>{const d=new Date();d.setDate(d.getDate()+[45,90,150,240][i]);c.expiresAt=d.toISOString().slice(0,10);});s.dataVersion='2026.09-demo-7';s.schemaVersion=5;continue;}
   if(s.schemaVersion===5){(s.requests||[]).forEach(r=>P.ensureAssuranceProfile(r));s.dataVersion='2026.09-demo-8';s.schemaVersion=6;continue;}
   if(s.schemaVersion===6){(s.deviations||[]).forEach(d=>{if(d.type==='NCR')d.type='Nonconformance';P.ensureQualityCase(d);});(s.calibrationCertificates||[]).forEach(c=>{c.documentUploaded=!!(c.documentUploaded||c.fileData);});s.dataVersion='2026.09-demo-10';s.schemaVersion=7;continue;}
   if(s.schemaVersion===7){
    const byRequest={};(s.serials||[]).forEach(x=>(byRequest[x.requestId]||(byRequest[x.requestId]=[])).push(x));
    for(const [requestId,list] of Object.entries(byRequest)){const r=(s.requests||[]).find(x=>x.id===requestId),profile=r?P.ensureAssuranceProfile(r):null;list.forEach((sample,i)=>{sample.sampleId=sample.sampleId||sample.serial;sample.sampleNumber=sample.sampleNumber||String(i+1).padStart(2,'0');sample.serialNumber=sample.serialNumber??(profile?.requires?.serialisation?sample.serial:'');sample.processHistory=sample.processHistory||[];sample.status=sample.status||'Active';});}
    (s.routes||[]).forEach(route=>(route.steps||[]).forEach(step=>{step.executionRuns=step.executionRuns||[];}));
    (s.measurements||[]).forEach(m=>{if(!m.measurementType)m.measurementType='legacy';});
    s.dataVersion='2026.09-demo-11';s.schemaVersion=8;continue;
   }
   if(s.schemaVersion===8){
    P.ensureEnterpriseModel(s);
    (s.requests||[]).forEach(r=>{r.archived=!!(r.archived||r.status==='CLOSED');r.archivedAt=r.archivedAt||(r.archived?(r.closedAt||r.deliveredAt||r.submittedAt||P.now()):null);r.consumablesEnabled=!!r.consumablesEnabled;r.buildConsumables=Array.isArray(r.buildConsumables)?r.buildConsumables:[];r.costingEnabled=r.costingEnabled!==false;});
    s.dataVersion='2026.09-demo-12';s.schemaVersion=9;continue;
   }
   if(s.schemaVersion===9){
    P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    s.planningEvents=Array.isArray(s.planningEvents)?s.planningEvents:[];
    (s.requests||[]).forEach(r=>{
      r.originalRequestedDate=r.originalRequestedDate||r.requiredDate||null;
      r.commitmentHistory=Array.isArray(r.commitmentHistory)?r.commitmentHistory:[];
      if(!r.originalCommitmentDate&&r.triage?.status==='Committed'&&r.triage?.forecastDate){
        r.originalCommitmentDate=r.triage.forecastDate;r.currentCommitmentDate=r.triage.forecastDate;
        r.commitmentHistory.push({seq:1,type:'initial',at:r.triage.committedAt||r.submittedAt||P.now(),oldDate:null,newDate:r.triage.forecastDate,deltaDays:0,cumulativeDays:0,reasonCategory:'Initial commitment',reason:'Migrated committed timing',eventId:null,actor:'Migration'});
      }
      r.currentCommitmentDate=r.currentCommitmentDate||r.originalCommitmentDate||null;
      r.actualDeliveryDate=r.actualDeliveryDate||null;r.pendingReplanContext=r.pendingReplanContext||null;
    });
    s.dataVersion='2026.09-demo-13';s.schemaVersion=10;continue;
   }
   if(s.schemaVersion===10){
    const wasDemo=String(s.dataVersion||'').startsWith('2026.09-demo');
    P.ensureEnterpriseModel(s);
    // Upgrade existing POC/demo browsers with the new archived examples without polluting imported/non-demo datasets.
    if(wasDemo&&P.createDemoState){
      const seed=P.createDemoState(),closedIds=new Set(seed.requests.filter(r=>r.status==='CLOSED').map(r=>r.id));
      const merge=(key,match)=>{s[key]=Array.isArray(s[key])?s[key]:[];for(const x of seed[key]||[]){if(!match(x))continue;if(!s[key].some(y=>y.id===x.id))s[key].push(P.deepClone(x));}};
      merge('requests',x=>closedIds.has(x.id));merge('routes',x=>closedIds.has(x.requestId));merge('serials',x=>closedIds.has(x.requestId));merge('measurements',x=>closedIds.has(x.requestId));merge('deviations',x=>closedIds.has(x.requestId));merge('approvals',x=>closedIds.has(x.requestId));merge('documents',x=>closedIds.has(x.requestId));merge('allocations',x=>closedIds.has(x.requestId));
    }
    s.dailyOperationsReviews=Array.isArray(s.dailyOperationsReviews)?s.dailyOperationsReviews:[];
    s.settings=s.settings||{};s.settings.lastOperationsReviewDate=s.settings.lastOperationsReviewDate||null;
    (s.requests||[]).forEach(r=>P.ensureBuildReportApproval(s,r));
    s.dataVersion='2026.09-demo-14';s.schemaVersion=11;continue;
   }
   if(s.schemaVersion===11){
    (s.serials||[]).forEach(sample=>P.ensureSampleEvidence(sample));
    s.dataVersion=String(s.dataVersion||'').startsWith('2026.09-demo')?'2026.09-demo-15':(s.dataVersion||'migrated');
    s.schemaVersion=12;continue;
   }
   if(s.schemaVersion===12){
    const wasDemo=P.isDemoDataset(s);s.settings=s.settings||{};if(wasDemo)s.settings.demoDataset=true;
    // Repair any duplicate permanent Lab Sample IDs created by older archive/demo merges before adding anything new.
    P.repairDuplicateSamples(s);
    // Ensure the three completed archive examples exist in every recognised POC demo, even if an older dataVersion marker was lost.
    if(wasDemo&&P.createDemoState){
      const seed=P.createDemoState(),closed=seed.requests.filter(r=>r.status==='CLOSED'),closedIds=new Set(closed.map(r=>r.id));
      const add=(key,x,natural)=>{s[key]=Array.isArray(s[key])?s[key]:[];if(!s[key].some(y=>natural(y,x)))s[key].push(P.deepClone(x));};
      for(const r of closed){const existing=(s.requests||[]).find(x=>x.id===r.id);if(!existing)s.requests.push(P.deepClone(r));else if(String(existing.title||'').toLowerCase()===String(r.title||'').toLowerCase()){existing.status='CLOSED';existing.currentGate='CLOSED';existing.archived=true;existing.archivedAt=existing.archivedAt||r.archivedAt||r.closedAt;existing.closedAt=existing.closedAt||r.closedAt;existing.actualDeliveryDate=existing.actualDeliveryDate||r.actualDeliveryDate;}}
      for(const x of seed.routes||[])if(closedIds.has(x.requestId))add('routes',x,(a,b)=>a.id===b.id||a.requestId===b.requestId);
      for(const x of seed.serials||[])if(closedIds.has(x.requestId))add('serials',x,(a,b)=>String(a.serial||a.sampleId)===String(b.serial||b.sampleId));
      for(const x of seed.measurements||[])if(closedIds.has(x.requestId))add('measurements',x,(a,b)=>a.id===b.id);
      for(const x of seed.deviations||[])if(closedIds.has(x.requestId))add('deviations',x,(a,b)=>a.id===b.id);
      for(const x of seed.approvals||[])if(closedIds.has(x.requestId))add('approvals',x,(a,b)=>a.requestId===b.requestId&&a.type===b.type&&String(a.stage||'')===String(b.stage||''));
      for(const x of seed.documents||[])if(closedIds.has(x.requestId))add('documents',x,(a,b)=>a.requestId===b.requestId&&a.type===b.type&&String(a.revision||'A')===String(b.revision||'A'));
      for(const x of seed.allocations||[])if(closedIds.has(x.requestId))add('allocations',x,(a,b)=>a.requestId===b.requestId&&a.requirementId===b.requirementId&&a.lot===b.lot&&a.status===b.status);
      P.repairDuplicateSamples(s);
    }
    s.dataVersion=wasDemo?'2026.09-demo-16':(s.dataVersion||'migrated');s.schemaVersion=13;continue;
   }
   if(s.schemaVersion===13){
    const wasDemo=P.isDemoDataset(s);
    if(wasDemo){s.settings=s.settings||{};s.settings.demoDataset=true;P.ensureDemoArchivedExamples(s);}
    P.repairDuplicateSamples(s);
    s.dataVersion=wasDemo?'2026.09-demo-17':(s.dataVersion||'migrated');s.schemaVersion=14;continue;
   }
   if(s.schemaVersion===14){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);
    if(wasDemo)(s.requests||[]).forEach(r=>{if(!(r.batchDataRequirements||[]).length)r.batchDataRequirements=[{id:'BATCH-fixture-setup-id',label:'Fixture / setup ID',unit:'',required:true,includeInBuildReport:true},{id:'BATCH-batch-build-observation',label:'Batch build observation',unit:'',required:false,includeInBuildReport:true}];if(!(r.sampleDataRequirements||[]).length)r.sampleDataRequirements=[{id:'SAMPLE-final-mass',label:'Final mass',unit:'g',required:false,includeInBuildReport:true},{id:'SAMPLE-visual-condition',label:'Visual condition',unit:'',required:true,includeInBuildReport:true}];if(!(r.photoEvidenceRequirements||[]).length)r.photoEvidenceRequirements=[{id:'PHOTO-overall-sample',label:'Overall sample',unit:'',required:true,includeInBuildReport:true},{id:'PHOTO-label-serial-identification',label:'Label / serial identification',unit:'',required:false,includeInBuildReport:true},...(r.productSafety?[{id:'PHOTO-special-characteristic-evidence',label:'Special-characteristic evidence',unit:'',required:true,includeInBuildReport:true}]:[])]});
    (s.requests||[]).forEach(r=>P.syncRequestFlowdown(s,r));
    s.dataVersion=wasDemo?'2026.09-demo-18':(s.dataVersion||'migrated');s.schemaVersion=15;continue;
   }
   if(s.schemaVersion===15){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    if(wasDemo&&P.createDemoState){
      s.settings=s.settings||{};s.settings.demoDataset=true;const seed=P.createDemoState(),src=seed.requests.find(r=>r.title==='Archived pressure DV batch'),dst=(s.requests||[]).find(r=>r.id===src?.id)||s.requests.find(r=>r.title===src?.title);
      if(src&&dst){
        for(const k of ['assuranceProfile','productSafety','purpose','maturity','specialCharacteristics','characterisation','controlPlanId','buildReportRevision','batchEvidence','lessons','capturePlan','batchDataRequirements','sampleDataRequirements','photoEvidenceRequirements','buildReportApprovedAt','buildReportApprovedBy','reportExample'])dst[k]=P.deepClone(src[k]);
        const replaceReqRows=key=>{s[key]=Array.isArray(s[key])?s[key]:[];s[key]=s[key].filter(x=>x.requestId!==dst.id);s[key].push(...P.deepClone((seed[key]||[]).filter(x=>x.requestId===src.id)));};
        replaceReqRows('routes');replaceReqRows('pfmea');replaceReqRows('measurements');replaceReqRows('deviations');replaceReqRows('approvals');replaceReqRows('documents');
        s.controlPlans=(s.controlPlans||[]).filter(x=>x.id!=='CP-ARCH-001');const cp=(seed.controlPlans||[]).find(x=>x.id==='CP-ARCH-001');if(cp)s.controlPlans.push(P.deepClone(cp));
        s.serials=Array.isArray(s.serials)?s.serials:[];for(const ss of (seed.serials||[]).filter(x=>x.requestId===src.id)){let ds=s.serials.find(x=>x.requestId===dst.id&&(x.serial===ss.serial||x.sampleNumber===ss.sampleNumber));if(!ds){s.serials.push(P.deepClone(ss));continue}for(const k of ['sampleId','sampleNumber','serialNumber','status','releaseState','description','dataFields','evidencePhotos','delivery','materials','processHistory'])ds[k]=P.deepClone(ss[k]);}
        P.syncRequestFlowdown(s,dst);P.ensureApprovalRecords(s,dst);P.repairDuplicateSamples(s);P.audit(s,'Comprehensive archived report example installed','Demo data','Prototype Build Report',dst.id,'Basic archived report','Full process / Control Plan / critical-characteristic dossier','REV 1.0.30 report migration');
      }
    }
    s.dataVersion=wasDemo?'2026.09-demo-19':(s.dataVersion||'migrated');s.schemaVersion=16;continue;
   }
   if(s.schemaVersion===16){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    let released=0;(s.resourceCareBookings||[]).forEach(b=>{if(b.autoGenerated===true&&b.status==='Scheduled'&&!b.locked){b.status='Cancelled';b.cancelReason='REV 1.0.31 changed readiness scheduling to proposal-first user control.';released++;}});
    (s.equipment||[]).forEach(e=>{e.equipmentType=e.equipmentType||String(e.name||'Equipment').replace(/\s+(?:[A-Z]|\d+)$/,'').replace(/\s+\d+$/,'').trim();});
    s.settings=s.settings||{};s.settings.resourceAssurance=s.settings.resourceAssurance||{proposalFirst:true,defaultHorizonWeeks:26,warningDays:{Calibration:30,Maintenance:45,Training:60}};
    if(released)P.audit(s,'Legacy AUTO readiness reservations released','Resource assurance','Portfolio',`${released} AUTO-generated scheduled slot(s)`,'Proposal-first scheduling', 'REV 1.0.31 resource-assurance migration');
    s.dataVersion=wasDemo?'2026.09-demo-20':(s.dataVersion||'migrated');s.schemaVersion=17;continue;
   }
   if(s.schemaVersion===17){
    const wasDemo=P.isDemoDataset(s);(s.deviations||[]).forEach(d=>P.ensureQualityCase(d));
    P.audit(s,'Quality Workbench case model enabled','Quality','Portfolio','Legacy guided quality cards','Controlled action / Control Plan / trend workbench','REV 1.0.32 quality-workbench migration');
    s.dataVersion=wasDemo?'2026.09-demo-21':(s.dataVersion||'migrated');s.schemaVersion=18;continue;
   }
   if(s.schemaVersion===18){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    // REV 1.0.33: keep customer data untouched, but enrich the controlled archived demo dossier with the unified report's end-characterisation evidence.
    if(wasDemo&&P.createDemoState){
      s.settings=s.settings||{};s.settings.demoDataset=true;const seed=P.createDemoState(),src=seed.requests.find(r=>r.title==='Archived pressure DV batch'),dst=(s.requests||[]).find(r=>r.id===src?.id)||s.requests.find(r=>r.title===src?.title);
      if(src&&dst){dst.characterisation=P.deepClone(src.characterisation||[]);dst.testRequirements=P.deepClone(src.testRequirements||[]);dst.specialCharacteristics=P.deepClone(src.specialCharacteristics||[]);const sourceEnd=(seed.measurements||[]).filter(m=>m.requestId===src.id&&m.measurementType==='end-characterisation');s.measurements=(s.measurements||[]).filter(m=>!(m.requestId===dst.id&&m.measurementType==='end-characterisation'));s.measurements.push(...P.deepClone(sourceEnd));P.syncRequestFlowdown(s,dst);P.invalidateBuildReport(s,dst,'Unified Build Report end-characterisation evidence installed for demo exemplar');const ba=P.ensureBuildReportApproval(s,dst);ba.status='Approved';ba.person='Sofia Bakker';ba.role='Quality Engineer';ba.roleId='quality';ba.timestamp=dst.closedAt||P.now();ba.comment='Unified Build Report example reviewed including end-characterisation, critical distributions/Cpk, Control Plan and photographic evidence.';dst.buildReportApprovedAt=ba.timestamp;dst.buildReportApprovedBy=ba.person;P.audit(s,'Unified Build Report exemplar enriched','Demo data','Prototype Build Report',dst.id,'Control Plan-only critical data','Critical data + complete specified end-characterisation','REV 1.0.33 report/CSV migration');}
    }
    s.dataVersion=wasDemo?'2026.09-demo-22':(s.dataVersion||'migrated');s.schemaVersion=19;continue;
   }
   if(s.schemaVersion===19){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    (s.requests||[]).forEach(r=>{
      const a=P.ensureBuildReportApproval(s,r);r.buildReportEvidenceVersion=Number(r.buildReportEvidenceVersion||1);
      if(a.status==='Approved'){
        r.buildReportApprovedEvidenceVersion=r.buildReportEvidenceVersion;
        r.buildReportApprovedMeasurementFingerprint=P.measurementEvidenceFingerprint(s,r.id);
        const doc=(s.documents||[]).find(d=>d.requestId===r.id&&d.type==='Prototype Build Report'&&d.status==='Approved'&&String(d.revision||'A')===String(r.buildReportRevision||'A'));
        if(doc){doc.evidenceVersion=r.buildReportApprovedEvidenceVersion;doc.measurementFingerprint=r.buildReportApprovedMeasurementFingerprint;doc.approvedAt=a.timestamp||doc.approvedAt||P.now();}
      }
    });
    s.dataVersion=wasDemo?'2026.09-demo-23':(s.dataVersion||'migrated');s.schemaVersion=20;continue;
   }
   if(s.schemaVersion===20){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    (s.requests||[]).forEach(r=>{P.ensureReusePackage(r);const route=(s.routes||[]).find(x=>x.requestId===r.id),cp=(s.controlPlans||[]).find(x=>x.id===r.controlPlanId),risks=(s.pfmea||[]).filter(x=>x.requestId===r.id);if(route?.confirmed&&P.routeStandardReady(s,route)&&r.reusePackage.route.mode==='none')r.reusePackage.route={mode:'reused',source:'Existing released route',revision:route.revision||'A'};if(cp?.status==='Approved'&&!cp.buildSpecific&&r.reusePackage.controlPlan.mode==='none')r.reusePackage.controlPlan={mode:'reused',baselineId:cp.id,revision:cp.revision,source:cp.name};if(risks.length&&risks.every(x=>x.status!=='Open high risk')&&r.reusePackage.pfmea.mode==='none')r.reusePackage.pfmea={mode:'reused',sourceRequestId:r.id,count:risks.length};});
    P.audit(s,'Reuse-first workflow enabled','System','Controlled information','Repeat setup per build','Approved route / Control Plan inheritance with delta reviews','REV 1.0.35 reuse-first migration');
    s.dataVersion=wasDemo?'2026.09-demo-24':(s.dataVersion||'migrated');s.schemaVersion=21;continue;
   }
   if(s.schemaVersion===21){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    s.settings=s.settings||{};s.settings.auditProfile=s.settings.auditProfile||{organisation:'',site:'',scopeStatement:'',auditOwner:'',exclusions:'',controlledReference:'',recordsRetentionReference:'',internalAuditReference:''};
    // REV 1.0.47: PFMEA is no longer an owned LabOS workflow. Keep legacy records for historical compatibility only.
    (s.trainingCertificates||[]).forEach(c=>{c.documentUploaded=!!(c.documentUploaded||c.fileData);});
    P.audit(s,'Audit UX and resource scheduling model upgraded','System','Governance','Duplicated risk-analysis workflow / partial audit exports','Control Plan + external risk-reference model / guided audit findings / printable resource schedules','REV 1.0.47 migration');
    s.dataVersion=wasDemo?'2026.09-demo-25':(s.dataVersion||'migrated');s.schemaVersion=22;continue;
   }
   if(s.schemaVersion===22){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    // REV 1.0.48: execution evidence is governed by the released process plus the linked Control Plan.
    // Repair only known demo placeholders; never overwrite customer-created controlled process fields.
    if(wasDemo&&typeof P.createDemoState==='function'){
      const seed=P.createDemoState(),seedProc=new Map((seed.processes||[]).map(x=>[x.id,x])),seedCp=new Map((seed.controlPlans||[]).map(x=>[x.id,x]));
      (s.processes||[]).forEach(proc=>{const generic=(proc.params||[]).length===2&&String(proc.params[0]?.name||'')==='Primary setpoint'&&String(proc.params[1]?.name||'')==='Tolerance';if(generic&&seedProc.has(proc.id))proc.params=P.deepClone(seedProc.get(proc.id).params||[])});
      (s.controlPlans||[]).forEach(cp=>{const scp=seedCp.get(cp.id);if(!scp)return;const byId=new Map((scp.characteristics||[]).map(x=>[x.id,x]));(cp.characteristics||[]).forEach(c=>{const src=byId.get(c.id);if(!src)return;if(!c.processStepId){c.processId=src.processId;c.processStepName=src.processStepName;c.processStep=src.processStep}if(/^(100%|1\s*\/\s*unit)$/i.test(String(c.sampleSize||''))){c.sampleSize=src.sampleSize;c.frequency=src.frequency}})});
    }
    P.audit(s,'Process execution model upgraded','System','Build execution','Generic step forms / ambiguous CP linkage','Released-process data + explicit CP sampling matrix','REV 1.0.48 execution migration');
    s.dataVersion=wasDemo?'2026.09-demo-26':(s.dataVersion||'migrated');s.schemaVersion=23;continue;
   }
   if(s.schemaVersion===23){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    // REV 1.0.49: actionable recommendations must be executable end-to-end. Withdraw
    // legacy accepted/guided improvements that could leave the user in manual replanning.
    const unresolved=new Set((s.actions||[]).filter(a=>a.improvementProposalId&&a.implementation?.status!=='Implemented & verified'&&a.implementation?.status!=='Verified').map(a=>a.improvementProposalId));
    s.actions=(s.actions||[]).filter(a=>!a.improvementProposalId||!unresolved.has(a.improvementProposalId));
    (s.improvementDecisions||[]).forEach(d=>{if(d.decision==='Accepted'&&unresolved.has(d.proposalId)){d.decision='Withdrawn';d.withdrawnAt=P.now();d.withdrawnReason='REV 1.0.49 executable-only proposal contract: legacy proposal could not guarantee end-to-end implementation.';}});
    s.dailyOperationsReviews=[];s.settings=s.settings||{};s.settings.lastOperationsReviewDate='';
    P.audit(s,'Executable-only guided-workflow contract enabled','System','Operations','Advisory proposals could be accepted before full resolution was guaranteed','Only prevalidated proposals can be accepted; accepted proposals apply atomically or are withdrawn','REV 1.0.49 workflow migration');
    s.dataVersion=wasDemo?'2026.09-demo-27':(s.dataVersion||'migrated');s.schemaVersion=24;continue;
   }
   if(s.schemaVersion===24){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    s.settings=s.settings||{};s.settings.auditEquipmentScopes=s.settings.auditEquipmentScopes||{};
    const groups={};
    (s.equipment||[]).forEach(e=>{const key=String(e.scopeCategory||e.capability||e.equipmentType||'Other equipment').trim()||'Other equipment';(groups[key]||(groups[key]=[])).push(e)});
    Object.entries(groups).forEach(([key,items])=>{
      if(s.settings.auditEquipmentScopes[key])return;
      const defined=items.map(e=>e.scopeSpecification||{}).find(x=>x.activity||x.range||x.method)||{};
      s.settings.auditEquipmentScopes[key]={category:key,activity:defined.activity||'',range:defined.range||'',resolution:defined.resolution||'',uncertainty:defined.uncertainty||'',method:defined.method||'',note:defined.note||''};
    });
    P.audit(s,'UX master-data model upgraded','System','LabOS','Per-asset scope / fixed test families / duplicated execution navigation','Category capability scope / configurable test families / integrated route navigation / 5S zone model','REV 1.0.50 migration');
    s.dataVersion=wasDemo?'2026.09-demo-28':(s.dataVersion||'migrated');s.schemaVersion=25;continue;
   }
   if(s.schemaVersion===25){
    const wasDemo=P.isDemoDataset(s);P.ensureMaterialModel(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    (s.requests||[]).forEach(r=>{const lim=P.materialOutputLimit(s,r),anyIssued=(s.allocations||[]).some(a=>a.requestId===r.id&&a.status==='Issued'&&Number(a.qty||0)>0);r.materialOutputLimit=lim.limited&&anyIssued?{maxBuildQty:lim.maxBuildQty,requestedQty:lim.requestedQty,updatedAt:P.now(),reason:'Issued material quantity'}:null;r.planningPreferences=r.planningPreferences||{staffByTask:{},staffByTaskName:{},staffBySkill:{}};});
    P.audit(s,'Guided resolution and mobile workflow model upgraded','System','LabOS','Stale readiness state / unforced staff reassignment / fixed receipt quantity / modal overflow risk','Live readiness reconciliation / prevalidated staff choices / partial-material output limiter / viewport-safe modal layout','REV 1.0.53 migration');
    s.dataVersion=wasDemo?'2026.09-demo-29':(s.dataVersion||'migrated');s.schemaVersion=26;continue;
   }
   if(s.schemaVersion===26){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    s.settings=s.settings||{};s.settings.labSetup=s.settings.labSetup||{};
    // REV 1.0.54: green setup ticks are explicit reviewed milestones, never inferred from pre-existing data.
    s.settings.labSetup.completedSteps=[];delete s.settings.labSetup.completedAt;delete s.settings.labSetup.completedBy;
    s.lessonDecisions=Array.isArray(s.lessonDecisions)?s.lessonDecisions:[];s.lessons=Array.isArray(s.lessons)?s.lessons:[];
    P.audit(s,'Hard-gated workflow and learning model enabled','System','LabOS','Data-presence ticks / implicit closeout learning','Explicit reviewed setup milestones / evidence-based lessons proposals / concise report terminology','REV 1.0.54 migration');
    s.dataVersion=wasDemo?'2026.09-demo-30':(s.dataVersion||'migrated');s.schemaVersion=27;continue;
   }
   if(s.schemaVersion===27){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    s.gageRRStudies=Array.isArray(s.gageRRStudies)?s.gageRRStudies:[];s.adminExceptions=Array.isArray(s.adminExceptions)?s.adminExceptions:[];s.processSkipApprovals=Array.isArray(s.processSkipApprovals)?s.processSkipApprovals:[];
    P.audit(s,'Measurement assurance and controlled exception model enabled','System','LabOS','Ungoverned setup/calibration evidence / no MSA object / hard dead ends','Controlled EHS/commissioning dossiers / formal calibration-certificate approval / Gage R&R / auditable administrator exceptions / approved process-step skip','REV 1.0.56 migration');
    s.dataVersion=wasDemo?'2026.09-demo-31':(s.dataVersion||'migrated');s.schemaVersion=28;continue;
   }
   if(s.schemaVersion===28){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);
    s.gageRRStudies=Array.isArray(s.gageRRStudies)?s.gageRRStudies:[];
    s.gageRRStudies.forEach(study=>{study.standardTestId=study.standardTestId||'';study.studyDate=study.studyDate||String(study.createdAt||P.now()).slice(0,10);study.sourceType=study.sourceType||'LabOS calculated';study.conclusion=study.conclusion||(study.result?.valid&&Number(study.result?.studyPct)<10?'Acceptable':study.result?.valid&&Number(study.result?.studyPct)<=30?'Conditionally acceptable':study.result?.valid?'Not acceptable':'Review required');study.documentUploaded=!!(study.documentUploaded||study.fileData);});
    P.audit(s,'Measurement assurance workflow refined','System','LabOS','MSA hidden from process/test context / separate capability workspace / manual-only daily refresh','Process/test/equipment-linked MSA / upload-or-run guided GRR / daily automatic operations check / simplified quality workspace','REV 1.0.57 migration');
    s.dataVersion=wasDemo?'2026.09-demo-32':(s.dataVersion||'migrated');s.schemaVersion=29;continue;
   }
   if(s.schemaVersion===29){
    const wasDemo=P.isDemoDataset(s);if(wasDemo&&typeof P.createDemoState==='function'){
      const priorIdentity=P.deepClone(s.identity||{}),weekends=!!s.settings?.includeWeekendsForBuilds,seed=P.createDemoState();
      s=seed;s.identity=priorIdentity?.role?priorIdentity:s.identity;s.settings=s.settings||{};s.settings.includeWeekendsForBuilds=weekends;
      P.audit(s,'Demo portfolio replaced','System','Demo dataset','Previous demo build/request records','Fresh 24-request power-tool prototype portfolio','REV 1.0.79 intentionally replaces prior demo build data while preserving identity and weekend-planning preference');
    }else{P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);(s.requests||[]).forEach(r=>P.ensureAssuranceProfile(r));s.schemaVersion=30;}
    s.dataVersion=wasDemo?'2026.09-demo-33-power-tools':(s.dataVersion||'migrated');s.schemaVersion=30;continue;
   }
   if(s.schemaVersion===30){
    const wasDemo=P.isDemoDataset(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);s.settings=s.settings||{};
    const repair=wasDemo&&P.repairSeedPlanningIntegrityV1081?P.repairSeedPlanningIntegrityV1081(s):{changed:false,reason:'repair-service-not-loaded'};
    if(wasDemo&&!repair.changed&&repair.reason==='repair-service-not-loaded')delete s.settings.seedPlanningIntegrityVersion;
    P.audit(s,'Planning integrity model upgraded','System','Planning','REV 1.0.80 schedule state','REV 1.0.81 resource-valid schedule state',repair.changed?`Legacy demo seed repaired: ${repair.moved||0} active booking(s) replanned; ${repair.removedFinal||0} obsolete final-state booking(s) removed.`:'Planning integrity validation enabled; no legacy seed repair required at migration time.');
    s.dataVersion=wasDemo?'2026.09-demo-34-planning-integrity':(s.dataVersion||'migrated');s.schemaVersion=31;continue;
   }
   throw new Error(`No migration available from schema ${s.schemaVersion}`);
  }
  P.ensureMaterialModel(s);P.ensurePlanningModel(s);P.ensureEnterpriseModel(s);(s.requests||[]).forEach(r=>P.syncRequestFlowdown(s,r));(s.serials||[]).forEach(sample=>P.ensureSampleEvidence(sample));P.repairDuplicateSamples(s);(s.deviations||[]).forEach(d=>{if(d.type==='NCR')d.type='Nonconformance';P.ensureQualityCase(d);});(s.requests||[]).forEach(r=>P.ensureApprovalRecords(s,r));return s;
 }
}

class BrowserDocumentStore{download(name,text,type='application/json'){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);} readFile(file){return file.text();}}
class DemoIdentityProvider{constructor(state){this.state=state;} currentUser(){return this.state.identity;} switchRole(role){const user=this.state.users.find(u=>u.role===role)||this.state.users[0];this.state.identity={userId:user.id,name:user.name,role};return this.state.identity;}}
P.StorageRepository=StorageRepository;P.IndexedDBStorageRepository=IndexedDBStorageRepository;P.MigrationService=MigrationService;P.BrowserDocumentStore=BrowserDocumentStore;P.DemoIdentityProvider=DemoIdentityProvider;
})();
