(function(){
  'use strict';
  const ProtoLab = window.ProtoLab = window.ProtoLab || {};
  ProtoLab.VERSION = '1.0.182-poc';
  ProtoLab.SCHEMA_VERSION = 38;
  // REV 1.0.109 boundary guards. Keep prototype demand within a browser-safe
  // operational envelope and validate ISO dates without JavaScript's rollover
  // semantics (e.g. 2026-02-30 must never normalize into March).
  ProtoLab.MAX_PROTOTYPE_QUANTITY = 5000;
  ProtoLab.prototypeQuantityLimit = state => {
    const configured=Number(state?.settings?.maxPrototypeQuantity);
    return Number.isInteger(configured)&&configured>0?configured:ProtoLab.MAX_PROTOTYPE_QUANTITY;
  };
  ProtoLab.isStrictISODate = value => {
    const s=String(value||'');const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return false;
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);if(mo<1||mo>12||d<1||d>31)return false;
    const t=new Date(Date.UTC(y,mo-1,d));return t.getUTCFullYear()===y&&t.getUTCMonth()===mo-1&&t.getUTCDate()===d;
  };
  ProtoLab.now = () => new Date().toISOString();
  ProtoLab.todayISO = () => new Date().toISOString().slice(0,10);
  ProtoLab.uid = (prefix='ID') => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  ProtoLab.deepClone = obj => JSON.parse(JSON.stringify(obj));
  // Resolve the exact process revision recorded on a governed route. A later library
  // revision must never invalidate a build that still references a previously
  // released revision, and an unavailable historical revision must never silently
  // fall forward to the live definition.
  ProtoLab.processRevisionDefinition = (state,step) => {
    const live=(state?.processes||[]).find(p=>p.id===step?.processId);
    if(!live)return null;
    const wanted=String(step?.processRevision??'').trim();
    if(!wanted||String(live.revision??'').trim()===wanted)return live;
    const hist=[...(live.revisionHistory||[])].reverse().find(h=>String(h.rev??h.revision??'').trim()===wanted&&h.snapshot);
    return hist?.snapshot||null;
  };
  ProtoLab.processRevisionReleaseAssessment = (state,requestId,route) => {
    const rows=(route?.steps||[]).map((step,index)=>{
      if(step.type==='standard'){
        const definition=ProtoLab.processRevisionDefinition(state,step);
        const wanted=String(step.processRevision??'').trim()||'unspecified revision';
        const live=(state?.processes||[]).find(p=>p.id===step.processId);
        const ok=!!definition&&definition.status==='Released';
        let detail='';
        if(!definition)detail=`${step.name||step.processId||`Step ${index+1}`} · routed ${wanted} is not available in the controlled revision history${live?.revision?`; current library revision is ${live.revision} (${live.status||'status unknown'})`:''}.`;
        else if(!ok)detail=`${step.name||step.processId||`Step ${index+1}`} · routed ${wanted} is ${definition.status||'not released'}.`;
        return {step,ok,type:'standard',definition,detail};
      }
      const dev=(state?.processDevelopments||[]).find(d=>d.requestId===requestId&&(d.libraryCandidate===step.processId||String(d.name||'').includes(step.name||'')));
      const ok=dev?.status==='RELEASED';
      return {step,ok,type:'development',definition:dev,detail:ok?'':`${step.name||step.processId||`Step ${index+1}`} · development method has not been released.`};
    });
    return {rows,ready:!!(route?.steps?.length)&&rows.every(x=>x.ok),unresolved:rows.filter(x=>!x.ok)};
  };
  ProtoLab.escape = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  ProtoLab.formatDate = iso => { if(!iso) return '—'; const d=new Date(iso); return Number.isNaN(d.getTime())?iso:d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}); };
  ProtoLab.formatDateTime = iso => { if(!iso) return '—'; const d=new Date(iso); return Number.isNaN(d.getTime())?iso:d.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}); };
  ProtoLab.daysBetween = (a,b) => Math.ceil((new Date(b)-new Date(a))/86400000);
  ProtoLab.clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  ProtoLab.currency=n=>new Intl.NumberFormat(undefined,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n||0));

  ProtoLab.GATES = ['DRAFT REQUEST','SUBMITTED','FEASIBILITY','PROCESS DEFINITION','LAB TRIAGE','BUILD READINESS REVIEW','READY TO BUILD','BUILD IN PROGRESS','CHARACTERISATION','QUALITY REVIEW','ENGINEERING REVIEW','RELEASE APPROVAL','RELEASED','DELIVERED','CLOSED'];
  ProtoLab.ASSURANCE_PROFILES = {
    rapid:{id:'rapid',code:'Internal experimental',label:'Internal experimental',tagline:'Minimum controlled evidence for preliminary experimental work',description:'Internal LabOS profile for pre-A samples and early exploratory engineering only. Keep the flow deliberately lean: identify the item, intended experiment, material/source, route or test intent, responsible person and objective evidence sufficient to reproduce the learning. It is not for formal project conclusions, customer evidence or production-representative claims.',formalLevel:0,requires:{processRelease:false,testRelease:false,controlPlan:false,independentControlPlanApproval:false,formalReadiness:false,releaseApproval:false,customerApprovals:false,serialisation:false,fullGenealogy:false}},
    controlled:{id:'controlled',code:'A-samples',label:'A-samples',tagline:'Repeatable experiments used for engineering project conclusions',description:'Internal LabOS profile for A-samples and structured engineering experiments whose results will support project decisions. Requires an explicitly reviewed route/test intent, controlled key settings, traceable material/source and sufficient measurement evidence for the stated conclusion; released methods are preferred but controlled provisional engineering methods remain possible.',formalLevel:1,requires:{processRelease:false,testRelease:false,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:false,customerApprovals:false,serialisation:false,fullGenealogy:false}},
    validation:{id:'validation',code:'B-samples',label:'B-samples',tagline:'Formal controlled evidence for B-sample verification and validation',description:'Internal LabOS profile for B-samples and formal verification/validation. Requires released or formally released-for-use methods, controlled risks and characteristics, traceable measurements, qualified people, capable resources, full sample traceability and formal review/release as applicable.',formalLevel:2,requires:{processRelease:true,testRelease:true,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:true,customerApprovals:true,serialisation:true,fullGenealogy:true}},
    production:{id:'production',code:'C-samples',label:'C-samples',tagline:'Highest prototype governance for C-sample / production-intent builds',description:'Internal LabOS profile for C-samples, production-intent, PPAP-supporting or equivalent representative builds. Applies the strongest configured prototype controls, customer-specific requirements, full genealogy, approved methods, capable measurement resources and formal release.',formalLevel:3,requires:{processRelease:true,testRelease:true,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:true,customerApprovals:true,serialisation:true,fullGenealogy:true}}
  };
  ProtoLab.profile = r => ProtoLab.ASSURANCE_PROFILES[r?.assuranceProfile]||ProtoLab.ASSURANCE_PROFILES.controlled;
  ProtoLab.recommendAssuranceProfile = data => {
    const purpose=String(data?.purpose||'').toLowerCase(),maturity=String(data?.maturity||'').toLowerCase();
    if(/c-sample|c sample/.test(maturity)||/production|ppap|safe launch|production intent/.test(purpose))return 'production';
    if(data?.productSafety||/b-sample|b sample/.test(maturity)||/customer|design validation|dv|pv|formal validation|verification|validation/.test(purpose))return 'validation';
    if(/a-sample|a sample/.test(maturity)||/correlation|structured experiment|design learning|project conclusion|engineering prototype/.test(purpose))return 'controlled';
    if(/pre-a|pre a|concept|exploratory/.test(maturity)||/quick|preliminary|experiment|process learning|troubleshoot|debug|feasibility/.test(purpose))return 'rapid';
    return 'controlled';
  };
  ProtoLab.ensureAssuranceProfile = r => { if(!r.assuranceProfile)r.assuranceProfile=ProtoLab.recommendAssuranceProfile(r); if(r.productSafety&&ProtoLab.profile(r).formalLevel<2)r.assuranceProfile='validation'; return ProtoLab.profile(r); };
  ProtoLab.assuranceRequires = (r,key) => {const v=ProtoLab.ensureAssuranceProfile(r).requires[key];return v===true||v==='high-risk'||v==='special-only';};
  ProtoLab.isEngineeringOnly = r => ProtoLab.ensureAssuranceProfile(r).formalLevel<2;
  ProtoLab.ROLES = [
    ['engineering_requester','Engineering Requester'],['engineering_lead','Engineering Project Lead'],['lab_planner','Prototype Lab Coordinator / Planner'],['process_engineer','Process Engineer'],['technician','Prototype Technician'],['quality','Quality Engineer'],['metrology','Metrology / Measurement Owner'],['product_safety','Product Safety Representative'],['lab_manager','Lab Manager'],['approver','Approver / Reviewer'],['auditor','Auditor / Read-only'],['administrator','Administrator']
  ].map(([id,label])=>({id,label}));
  ProtoLab.PERMISSIONS = {
    engineering_requester:['request:create','request:view','product:view','delivery:ack','report:view'], engineering_lead:['request:view','request:clarify','request:approve','approval:perform','product:view','product:manage','report:view'],
    lab_planner:['request:view','triage','plan','route:edit','materials:allocate','materials:receive','product:view','report:view','improvement:review'], process_engineer:['request:view','route:edit','process:develop','process:release','workinstruction:edit','product:view','report:view'],
    technician:['request:view','execution:run','evidence:add','measurement:add','report:view'], quality:['request:view','controlplan:edit','controlplan:approve','quality:disposition','release:review','approval:perform','report:approve','audit:view'],
    metrology:['request:view','equipment:manage','measurement:review','calibration:manage','maintenance:manage'], product_safety:['request:view','productsafety:approve','approval:perform'], lab_manager:['request:view','plan','process:develop','product:view','planning:standards','finance:manage','skills:manage','equipment:manage','calibration:manage','maintenance:manage','improvement:review','priority:change','override:approve','release:approve','approval:perform','dashboard:management','audit:view'],
    approver:['request:view','approval:perform','controlplan:approve','report:view'], auditor:['request:view','audit:view','report:view'], administrator:['*']
  };
  ProtoLab.can = (role,perm) => { const p=ProtoLab.PERMISSIONS[role]||[]; return p.includes('*')||p.includes(perm); };
  ProtoLab.statusClass = s => {
    const v=String(s||'').toLowerCase();
    if(/released|approved|delivered|closed|complete|ready|available|pass|verified|valid|satisfied/.test(v)) return 'good';
    if(/fail|blocked|hold|scrap|expired|missing|overdue|rejected|required|unmatched/.test(v)) return 'bad';
    if(/risk|pending|review|progress|development|warning|await|draft|triage|provisional/.test(v)) return 'warn';
    if(/character|plan|submitted|scheduled|committed/.test(v)) return 'info';
    return 'neutral';
  };
  ProtoLab.status = s => `<span class="status ${ProtoLab.statusClass(s)}">${ProtoLab.escape(s)}</span>`;
  ProtoLab.buildReportApprover = r => {
    const profile=ProtoLab.ensureAssuranceProfile(r);
    return profile.formalLevel>=2
      ? {role:'quality',roleLabel:'Quality Engineer'}
      : {role:'engineering_lead',roleLabel:'Engineering Project Lead'};
  };
  ProtoLab.ensureBuildReportApproval = (state,r) => {
    state.approvals=state.approvals||[];
    const spec=ProtoLab.buildReportApprover(r);
    let a=state.approvals.find(x=>x.requestId===r.id&&x.type==='Build Report Approval');
    const assigned=(state.users||[]).find(u=>u.role===spec.role)?.name||spec.roleLabel;
    if(!a){
      a={id:ProtoLab.uid('APR'),requestId:r.id,type:'Build Report Approval',role:spec.roleLabel,roleId:spec.role,person:assigned,status:'Draft',timestamp:null,stage:'report',comment:'Build report becomes FINAL only after controlled approval.'};
      state.approvals.push(a);
    }else{
      a.roleId=a.roleId||spec.role;
      a.role=a.role||spec.roleLabel;
      a.person=a.person||assigned;
      a.stage='report';
      a.status=a.status||'Draft';
    }
    r.buildReportRevision=r.buildReportRevision||'A';
    r.buildReportEvidenceVersion=Number(r.buildReportEvidenceVersion||1);
    return a;
  };
  ProtoLab.audit = (state, action, objectType, objectId, previousState, newState, reason='') => {
    state.auditTrail.unshift({id:ProtoLab.uid('AUD'),timestamp:ProtoLab.now(),user:state.identity.name,role:state.identity.role,action,objectType,objectId,previousState,newState,reason});
  };
  ProtoLab.ensureSampleEvidence = sample => {
    if(!sample) return sample;
    sample.description = sample.description || '';
    sample.dataFields = Array.isArray(sample.dataFields) ? sample.dataFields : [];
    sample.evidencePhotos = Array.isArray(sample.evidencePhotos) ? sample.evidencePhotos : [];
    sample.includeDescriptionInBuildReport = sample.includeDescriptionInBuildReport !== false;
    sample.dataFields.forEach(x=>{x.id=x.id||ProtoLab.uid('SDATA');x.label=x.label||'';x.value=x.value??'';x.unit=x.unit||'';x.description=x.description||'';x.includeInBuildReport=x.includeInBuildReport!==false;});
    sample.evidencePhotos.forEach(x=>{x.id=x.id||ProtoLab.uid('PHOTO');x.caption=x.caption||x.fileName||'Sample photo';x.description=x.description||'';x.includeInBuildReport=x.includeInBuildReport!==false;x.capturedAt=x.capturedAt||ProtoLab.now();x.capturedBy=x.capturedBy||'';});
    return sample;
  };
  ProtoLab.QUALITY_CAUSE_CATEGORIES=['Process parameter','Material / supplier','Equipment / tooling','Measurement system','Method / work instruction','Human / competency','Design / requirement','Environment','Unknown / investigating','Other'];
  ProtoLab.ensureQualityCase = d => {
    if(!d)return d;
    d.detectedAt=d.detectedAt||ProtoLab.now();
    d.owner=d.owner||d.approver||'Quality Engineer';
    if(!d.dueDate){const x=new Date();x.setDate(x.getDate()+5);d.dueDate=x.toISOString().slice(0,10);}
    d.causeCategory=d.causeCategory||'';
    d.rootCause=d.rootCause||(((d.status==='CLOSED'||(d.disposition&&d.disposition!=='Pending'))&&d.investigation&&d.investigation!=='Pending')?d.investigation:'');
    d.investigationEvidence=d.investigationEvidence||'';
    d.verificationEvidence=d.verificationEvidence||'';
    d.effectiveness=d.effectiveness||(d.status==='CLOSED'?'Verified':'Pending');
    d.verifiedBy=d.verifiedBy||'';d.verifiedAt=d.verifiedAt||null;
    d.relatedRiskIds=Array.isArray(d.relatedRiskIds)?d.relatedRiskIds:[];
    d.actions=Array.isArray(d.actions)?d.actions:[];
    d.actions.forEach((a,i)=>{a.id=a.id||`${d.id}-ACT-${i+1}`;a.owner=a.owner||d.owner||'Quality Engineer';if(!a.dueDate){const x=new Date(d.dueDate||Date.now());x.setDate(x.getDate()+2);a.dueDate=x.toISOString().slice(0,10);}a.closed=!!a.closed;a.closedAt=a.closed? (a.closedAt||d.verifiedAt||ProtoLab.now()):null;});
    return d;
  };
  ProtoLab.qualityCaseStage = d => {
    ProtoLab.ensureQualityCase(d);
    if(d.status==='CLOSED')return 'Closed';
    if(!d.containment||/pending/i.test(d.containment))return 'Contain';
    if(!d.rootCause||d.investigation==='Pending')return 'Investigate';
    if(!d.disposition||d.disposition==='Pending')return 'Disposition';
    if((d.actions||[]).some(a=>a.mandatory&&!a.closed))return 'Action';
    if(!d.verificationEvidence||d.effectiveness==='Pending')return 'Verify';
    return 'Close';
  };
  ProtoLab.captureRequirementKey = value => String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||ProtoLab.uid('REQ').toLowerCase();
  ProtoLab.parseCaptureRequirementLines = (text,prefix='REQ') => String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map((line,i)=>{
    const bits=line.split('|').map(x=>x.trim()),label=bits[0]||`Field ${i+1}`,unit=bits[1]||'';return {id:`${prefix}-${ProtoLab.captureRequirementKey(label)}`,label,unit,required:true,includeInBuildReport:true};
  });
  ProtoLab.ensureCapturePlan = (state,r) => {
    if(!r)return null;
    r.batchDataRequirements=Array.isArray(r.batchDataRequirements)?r.batchDataRequirements:[];
    r.sampleDataRequirements=Array.isArray(r.sampleDataRequirements)?r.sampleDataRequirements:[];
    r.photoEvidenceRequirements=Array.isArray(r.photoEvidenceRequirements)?r.photoEvidenceRequirements:[];
    const norm=(arr,prefix)=>arr.map((x,i)=>typeof x==='string'?{id:`${prefix}-${ProtoLab.captureRequirementKey(x)}`,label:x,unit:'',required:true,includeInBuildReport:true}:{id:x.id||`${prefix}-${ProtoLab.captureRequirementKey(x.label||i)}`,label:x.label||`Field ${i+1}`,unit:x.unit||'',required:x.required!==false,includeInBuildReport:x.includeInBuildReport!==false});
    r.batchDataRequirements=norm(r.batchDataRequirements,'BATCH');r.sampleDataRequirements=norm(r.sampleDataRequirements,'SAMPLE');r.photoEvidenceRequirements=norm(r.photoEvidenceRequirements,'PHOTO');
    r.batchEvidence=r.batchEvidence&&typeof r.batchEvidence==='object'?r.batchEvidence:{description:'',dataFields:[]};r.batchEvidence.dataFields=Array.isArray(r.batchEvidence.dataFields)?r.batchEvidence.dataFields:[];
    for(const def of r.batchDataRequirements){let row=r.batchEvidence.dataFields.find(x=>x.definitionId===def.id);if(!row){row={id:ProtoLab.uid('BDATA'),definitionId:def.id,label:def.label,value:'',unit:def.unit,description:'',includeInBuildReport:def.includeInBuildReport!==false};r.batchEvidence.dataFields.push(row);}row.label=def.label;row.unit=def.unit;row.required=def.required!==false;}
    r.capturePlan=r.capturePlan||{revision:1};r.capturePlan.revision=Number(r.capturePlan.revision||1);r.capturePlan.flowdown={buildMaturity:r.maturity||'',configuration:r.configuration||'',bomRef:r.bomRef||'',materialSource:ProtoLab.normaliseMaterialSource(r.materialOwnership),productSafety:!!r.productSafety,characterisation:[...(r.characterisation||[])],specialCharacteristics:[...(r.specialCharacteristics||[])]};r.capturePlan.batchFields=ProtoLab.deepClone(r.batchDataRequirements);r.capturePlan.sampleFields=ProtoLab.deepClone(r.sampleDataRequirements);r.capturePlan.photoSlots=ProtoLab.deepClone(r.photoEvidenceRequirements);r.capturePlan.updatedAt=r.capturePlan.updatedAt||ProtoLab.now();
    return r.capturePlan;
  };
  ProtoLab.ensureSampleCaptureFields = (sample,r) => {
    ProtoLab.ensureSampleEvidence(sample);ProtoLab.ensureCapturePlan(null,r);
    const active=new Set((r.sampleDataRequirements||[]).map(x=>x.id));
    for(const def of r.sampleDataRequirements||[]){let row=sample.dataFields.find(x=>x.definitionId===def.id);if(!row){row={id:ProtoLab.uid('SDATA'),definitionId:def.id,label:def.label,value:'',unit:def.unit,description:'',includeInBuildReport:def.includeInBuildReport!==false,required:def.required!==false};sample.dataFields.push(row);}row.label=def.label;row.unit=def.unit;row.required=def.required!==false;row.definitionActive=true;}
    sample.dataFields.forEach(x=>{if(x.definitionId&&!active.has(x.definitionId))x.definitionActive=false;});return sample;
  };
  ProtoLab.syncRequestFlowdown = (state,r,{incrementRevision=false}={}) => {
    if(!state||!r)return null;ProtoLab.ensureTestRequirements(state,r);const plan=ProtoLab.ensureCapturePlan(state,r);if(incrementRevision){plan.revision=Number(plan.revision||1)+1;plan.updatedAt=ProtoLab.now();}
    const route=(state.routes||[]).find(x=>x.requestId===r.id);if(route){route.flowdown=ProtoLab.deepClone({revision:plan.revision,...plan.flowdown,batchFields:plan.batchFields,sampleFields:plan.sampleFields,photoSlots:plan.photoSlots});route.flowdown.updatedAt=ProtoLab.now();}
    (state.serials||[]).filter(x=>x.requestId===r.id).forEach(sample=>{sample.configuration=r.configuration||sample.configuration||'';ProtoLab.ensureSampleCaptureFields(sample,r);});
    return plan;
  };
  ProtoLab.nextReportRevision = rev => {
    const src=String(rev||'A').toUpperCase().replace(/[^A-Z]/g,'')||'A';let n=0;for(const ch of src)n=n*26+(ch.charCodeAt(0)-64);n++;let out='';while(n){n--;out=String.fromCharCode(65+n%26)+out;n=Math.floor(n/26);}return out;
  };
  ProtoLab.measurementEvidenceFingerprint = (state,requestId) => {
    const rows=(state?.measurements||[]).filter(m=>m.requestId===requestId).map(m=>({
      id:m.id||'',serial:m.serial||'',measurementType:m.measurementType||'',routeStepId:m.routeStepId||'',testRequirementId:m.testRequirementId||'',characteristicId:m.characteristicId||'',characteristic:m.characteristic||'',
      value:m.value??null,unit:m.unit||'',lsl:m.lsl??null,usl:m.usl??null,target:m.target??null,method:m.method||'',equipment:m.equipment||'',calibrationCertificateId:m.calibrationCertificateId||'',equipmentCalibrationStatus:m.equipmentCalibrationStatus||'',pass:m.pass!==false,compliant:m.compliant!==false,evidence:m.evidence||'',timestamp:m.timestamp||''
    })).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
    const text=JSON.stringify(rows);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');
  };
  ProtoLab.invalidateBuildReport = (state,r,reason='Controlled report content changed') => {
    if(!state||!r)return false;const a=ProtoLab.ensureBuildReportApproval(state,r),prev=a.status,now=ProtoLab.now();
    r.buildReportEvidenceVersion=Number(r.buildReportEvidenceVersion||1)+1;r.buildReportLastChangedAt=now;r.buildReportLastChangedBy=state.identity?.name||'System';r.buildReportLastChangeReason=reason;
    if(!['Approved','Pending'].includes(prev))return false;
    if(prev==='Approved'){
      const oldRev=r.buildReportRevision||'A',next=ProtoLab.nextReportRevision(oldRev);r.buildReportRevision=next;
      state.documents=state.documents||[];const doc=state.documents.find(d=>d.requestId===r.id&&d.type==='Prototype Build Report'&&d.status==='Approved'&&String(d.revision||'A')===String(oldRev));
      if(doc){doc.status='Superseded';doc.supersededBy=next;doc.supersededAt=now;doc.supersededReason=reason;}
    }else if(prev==='Pending'){
      a.withdrawnAt=now;a.withdrawnBy=state.identity?.name||'System';a.withdrawnReason=reason;
    }
    a.status='Draft';a.timestamp=null;a.approvedAt=null;a.requestedAt=null;a.requestedBy=null;a.comment=`Re-approval required: ${reason}`;
    r.buildReportApprovedAt=null;r.buildReportApprovedBy=null;r.buildReportApprovedMeasurementFingerprint=null;r.buildReportApprovedEvidenceVersion=null;
    ProtoLab.audit(state,'Build report approval invalidated','Request',r.id,prev,'Draft',`${reason}; current report revision ${r.buildReportRevision||'A'} · evidence set v${r.buildReportEvidenceVersion}`);return true;
  };
  ProtoLab.reconcileBuildReportApproval = (state,r) => {
    if(!state||!r)return false;const a=ProtoLab.ensureBuildReportApproval(state,r),current=ProtoLab.measurementEvidenceFingerprint(state,r.id);
    r.buildReportEvidenceVersion=Number(r.buildReportEvidenceVersion||1);
    if(a.status!=='Approved')return false;
    if(!r.buildReportApprovedMeasurementFingerprint){r.buildReportApprovedMeasurementFingerprint=current;r.buildReportApprovedEvidenceVersion=r.buildReportEvidenceVersion;return false;}
    if(r.buildReportApprovedMeasurementFingerprint!==current)return ProtoLab.invalidateBuildReport(state,r,'Measurement evidence changed after Build Report approval');
    return false;
  };

  // REV 1.0.36 · reuse-first governance. Approved standard information is inherited; only build-specific deltas trigger review.
  ProtoLab.ensureReusePackage = r => {
    r.reusePackage=r.reusePackage&&typeof r.reusePackage==='object'?r.reusePackage:{};
    r.reusePackage.route=r.reusePackage.route||{mode:'none'};
    r.reusePackage.controlPlan=r.reusePackage.controlPlan||{mode:'none'};
    r.reusePackage.pfmea=r.reusePackage.pfmea||{mode:'none'};
    r.reusePackage.deltas=Array.isArray(r.reusePackage.deltas)?r.reusePackage.deltas:[];
    return r.reusePackage;
  };
  ProtoLab.sameProductRequests = (state,r) => (state.requests||[]).filter(x=>x.id!==r.id&&x.productId===r.productId&&String(x.productRevision||'')===String(r.productRevision||''));
  ProtoLab.routeStandardReady = (state,route) => !!(route?.steps?.length&&route.steps.every(s=>{if(s.type!=='standard')return false;const p=(state.processes||[]).find(x=>x.id===s.processId);return !!p&&p.status==='Released'&&String(p.revision)===String(s.processRevision);}));
  ProtoLab.findReusableRouteSource = (state,r) => ProtoLab.sameProductRequests(state,r).map(x=>({request:x,route:(state.routes||[]).find(q=>q.requestId===x.id)})).find(x=>x.route?.confirmed===true&&ProtoLab.routeStandardReady(state,x.route))||null;
  ProtoLab.findReusableControlPlan = (state,r) => {
    const current=(state.controlPlans||[]).find(x=>x.id===r.controlPlanId);
    if(current?.status==='Approved'&&!current.buildSpecific)return current;
    const compatible=new Set(ProtoLab.sameProductRequests(state,r).map(x=>x.id));
    return (state.controlPlans||[]).find(cp=>cp.status==='Approved'&&!cp.buildSpecific&&(cp.requestIds||[]).some(id=>compatible.has(id)))||null;
  };
  ProtoLab.findReusablePfmeaSource = (state,r) => {
    for(const prev of ProtoLab.sameProductRequests(state,r)){
      const items=(state.pfmea||[]).filter(x=>x.requestId===prev.id);
      if(items.length&&items.every(x=>x.status!=='Open high risk'))return {request:prev,items};
    }
    return null;
  };
  ProtoLab.applyReusePackage = (state,r,{actor='System'}={}) => {
    if(!state||!r)return null;const pack=ProtoLab.ensureReusePackage(r),route=(state.routes||[]).find(x=>x.requestId===r.id);
    if(route&&route.confirmed!==true&&pack.route.mode!=='modified'){
      if(ProtoLab.routeStandardReady(state,route)){route.confirmed=true;route.proposed=false;route.assessedAt=ProtoLab.now();route.source={...(route.source||{}),mode:'product-standard-reused'};route.steps.forEach(s=>{if(s.status==='Proposed')s.status='Planned'});pack.route={mode:'reused',source:'Product standard route',revision:route.revision||'A'};}
      else {const src=ProtoLab.findReusableRouteSource(state,r);if(src){route.steps=ProtoLab.deepClone(src.route.steps).map((s,i)=>({...s,id:ProtoLab.uid('STEP'),order:i+1,status:'Planned',readiness:'pending',planned:null,executionRuns:[]}));route.confirmed=true;route.proposed=false;route.source={mode:'previous-reused',requestId:src.request.id,revision:src.route.revision};pack.route={mode:'reused',source:`${src.request.id} released route`,revision:src.route.revision||'A'};}}
    }else if(route?.confirmed===true&&ProtoLab.routeStandardReady(state,route)&&pack.route.mode==='none')pack.route={mode:'reused',source:'Released confirmed route',revision:route.revision||'A'};
    const cp=ProtoLab.findReusableControlPlan(state,r);if(cp&&!r.controlPlanId){r.controlPlanId=cp.id;cp.requestIds=Array.isArray(cp.requestIds)?cp.requestIds:[];if(!cp.requestIds.includes(r.id))cp.requestIds.push(r.id);pack.controlPlan={mode:'reused',baselineId:cp.id,revision:cp.revision,source:cp.name};}else if(cp&&r.controlPlanId===cp.id&&pack.controlPlan.mode==='none')pack.controlPlan={mode:'reused',baselineId:cp.id,revision:cp.revision,source:cp.name};
    const currentRisks=(state.pfmea||[]).filter(x=>x.requestId===r.id);if(!currentRisks.length){const src=ProtoLab.findReusablePfmeaSource(state,r);if(src){const srcRoute=(state.routes||[]).find(x=>x.requestId===src.request.id),dstRoute=(state.routes||[]).find(x=>x.requestId===r.id);for(const old of src.items){const oldStep=srcRoute?.steps?.find(x=>x.id===old.stepId);const dstStep=dstRoute?.steps?.find(x=>x.processId===oldStep?.processId)||dstRoute?.steps?.[Math.max(0,(oldStep?.order||1)-1)];const clone=ProtoLab.deepClone(old);clone.id=ProtoLab.uid('RISK');clone.requestId=r.id;clone.stepId=dstStep?.id||null;clone.reuseSourceRequestId=src.request.id;clone.reuseSourceRiskId=old.id;clone.lockedBaseline=true;(state.pfmea||[]).push(clone);}pack.pfmea={mode:'reused',sourceRequestId:src.request.id,count:src.items.length};}}
    else if(pack.pfmea.mode==='none'&&currentRisks.every(x=>x.status!=='Open high risk'))pack.pfmea={mode:'reused',sourceRequestId:currentRisks[0]?.reuseSourceRequestId||r.id,count:currentRisks.length};
    pack.appliedAt=pack.appliedAt||ProtoLab.now();pack.appliedBy=pack.appliedBy||actor;return pack;
  };
  ProtoLab.buildChangeReviewRoles = r => ['Process Engineer','Quality Engineer',...(r?.productSafety?['Product Safety Representative']:[])];
  ProtoLab.ensureBuildChangeApprovals = (state,r,area,reason='Build-specific change to reused controlled information') => {
    state.approvals=state.approvals||[];const roles=ProtoLab.buildChangeReviewRoles(r),roleIds={'Process Engineer':'process_engineer','Quality Engineer':'quality','Product Safety Representative':'product_safety'};
    for(const role of roles){let a=state.approvals.find(x=>x.requestId===r.id&&x.stage==='build-change'&&x.changeArea===area&&x.role===role&&x.status!=='Superseded');if(!a){const person=(state.users||[]).find(u=>u.role===roleIds[role])?.name||role;a={id:ProtoLab.uid('APR'),requestId:r.id,type:`Build-specific ${area} review`,role,roleId:roleIds[role],person,status:'Pending',timestamp:null,stage:'build-change',changeArea:area,comment:reason};state.approvals.push(a);}}
    return state.approvals.filter(x=>x.requestId===r.id&&x.stage==='build-change'&&x.changeArea===area&&x.status!=='Superseded');
  };
  ProtoLab.buildChangeApprovalsComplete = (state,r,area=null) => {
    const rows=(state.approvals||[]).filter(x=>x.requestId===r.id&&x.stage==='build-change'&&x.status!=='Superseded'&&(!area||x.changeArea===area));return !rows.length||rows.every(x=>x.status==='Approved');
  };
  ProtoLab.markBuildSpecificDelta = (state,r,area,reason) => {
    if(!state||!r)return;const pack=ProtoLab.ensureReusePackage(r);const asset=area==='Control Plan'?'controlPlan':area==='PFMEA'?'pfmea':'route';if(pack[asset])pack[asset].mode='modified';
    if(!pack.deltas.some(x=>x.area===area&&x.status==='Open'))pack.deltas.push({id:ProtoLab.uid('DELTA'),area,reason:reason||'Build-specific adaptation',status:'Open',createdAt:ProtoLab.now(),createdBy:state.identity?.name||'System'});
    ProtoLab.ensureBuildChangeApprovals(state,r,area,reason);ProtoLab.audit(state,'Reused baseline changed for current build','Request',r.id,'Approved/released baseline reused',`Build-specific ${area}`,reason||'Controlled build-specific adaptation');
  };
  ProtoLab.beginBuildSpecificControlPlanRevision = (state,r,cp,reason='Build-specific Control Plan adaptation') => {
    if(!state||!r||!cp)throw new Error('Request and Control Plan are required.');if(cp.buildSpecific&&cp.buildRequestId===r.id&&cp.status!=='Approved')return cp;
    const clone=ProtoLab.deepClone(cp),revMatch=String(cp.revision||'A').match(/^(.*)\.B(\d+)$/);clone.id=ProtoLab.uid('CP');clone.revision=revMatch?`${revMatch[1]}.B${Number(revMatch[2])+1}`:`${cp.revision}.B1`;clone.status='Draft';clone.approvedBy=null;clone.approvedAt=null;clone.baselineId=cp.id;clone.baselineRevision=cp.revision;clone.buildSpecific=true;clone.buildRequestId=r.id;clone.requestIds=[r.id];clone.name=`${cp.name} · ${r.id} adaptation`;state.controlPlans.push(clone);r.controlPlanId=clone.id;r.controlPlanDeferred=false;const pack=ProtoLab.ensureReusePackage(r);pack.controlPlan={mode:'modified',baselineId:cp.id,revision:cp.revision,buildSpecificId:clone.id};ProtoLab.markBuildSpecificDelta(state,r,'Control Plan',reason);return clone;
  };
  // REV 1.0.93 — approval is content-dependent. Any Control Plan content edit after
  // review/sign-off activity invalidates that approval round and creates a fresh one.
  // Historical signatures are retained as Superseded rather than silently overwritten.
  ProtoLab.invalidateControlPlanApproval = (state,cp,reason='Control Plan content edited') => {
    if(!state||!cp)return {reset:false};
    const previousStatus=cp.status||'Draft',r=cp.buildRequestId?(state.requests||[]).find(x=>x.id===cp.buildRequestId):null;
    const active=(state.approvals||[]).filter(a=>r&&a.requestId===r.id&&a.stage==='build-change'&&a.changeArea==='Control Plan'&&a.status!=='Superseded');
    const hadApprovalActivity=previousStatus==='Review requested'||previousStatus==='Approved'||!!cp.reviewRequestedAt||!!cp.approvedAt||active.some(a=>a.status==='Approved');
    cp.status='Draft';cp.reviewRequestedAt=null;cp.reviewRequestedBy=null;cp.approvedAt=null;cp.approvedBy=null;cp.approvalInvalidatedAt=ProtoLab.now();cp.approvalInvalidatedBy=state.identity?.name||'System';cp.approvalInvalidatedReason=reason;
    if(r&&cp.buildSpecific){
      if(hadApprovalActivity){for(const a of active){a.status='Superseded';a.supersededAt=ProtoLab.now();a.supersededBy=state.identity?.name||'System';a.supersededReason=reason}const pack=ProtoLab.ensureReusePackage(r);for(const d of pack.deltas||[]){if(d.area==='Control Plan'&&d.status==='Open'){d.status='Superseded';d.supersededAt=ProtoLab.now();d.supersededReason=reason}}}
      ProtoLab.markBuildSpecificDelta(state,r,'Control Plan',reason);
    }
    ProtoLab.audit(state,'Control Plan approval reset after edit','Control Plan',cp.id,previousStatus,'Draft',`${reason}${hadApprovalActivity?' · previous approval/sign-off round superseded':' · approval remains incomplete'}`);
    return {reset:true,previousStatus,hadApprovalActivity};
  };
  ProtoLab.DEFAULT_BOMS = {
    'PRD-001':[['BPS-HSG-3200','Pressure sensor housing','D'],['BPS-PCB-3200','Pressure sensor PCB','C'],['BPS-CON-3200','Connector insert','B']],
    'PRD-002':[['BCS-HSG-0810','Current sensor housing','B'],['BCS-PCB-0810','Current sensor PCB','B'],['BCS-BAR-0810','Busbar assembly','A']],
    'PRD-003':[['CPS-HSG-0220','Coolant sensor housing','C'],['CPS-PCB-0220','Coolant sensor PCB','B'],['CPS-SEAL-0220','Pressure seal','A']],
    'PRD-004':[['PPM-HSG-0700','Pedal module housing','A'],['PPM-PCB-0700','Pedal module PCB','A'],['PPM-MAG-0700','Magnet carrier','A']],
    'PRD-005':[['HLS-HSG-0900','Hydrogen sensor housing','B'],['HLS-PCB-0900','Hydrogen sensor PCB','B'],['HLS-MEM-0900','Sensing membrane','A']],
    'PRD-006':[['TVC-HSG-0410','Valve controller housing','E'],['TVC-PCB-0410','Valve controller PCB','D'],['TVC-CON-0410','Power connector','C']],
    'PRD-007':[['STS-HSG-1140','Torque sensor housing','C'],['STS-PCB-1140','Torque sensor PCB','C'],['STS-ROT-1140','Rotor assembly','B']],
    'PRD-008':[['PSC-HSG-X2','Signal conditioner housing','P3'],['PSC-PCB-X2','Signal conditioner PCB','P3'],['PSC-CON-X2','Prototype connector set','P2']]
  };
  ProtoLab.DEFAULT_ROUTES = {
    'default':['PROC-001','PROC-002','PROC-003','PROC-010','PROC-014','PROC-015','PROC-017','PROC-020','PROC-021','PROC-022'],
    'PRD-005':['PROC-001','PROC-002','PROC-003','PROC-006','PROC-014','PROC-016','PROC-017','PROC-020','PROC-021','PROC-022']
  };
  ProtoLab.getDefaultBom = productId => (ProtoLab.DEFAULT_BOMS[productId]||[]).map((x,i)=>({id:`BOM-${productId}-${i+1}`,partNumber:x[0],description:x[1],revision:x[2],qtyPerUnit:1,unit:'pcs',kind:'component',unitCost:0,wastePct:0}));
  ProtoLab.getDefaultRoute = productId => ProtoLab.deepClone(ProtoLab.DEFAULT_ROUTES[productId]||ProtoLab.DEFAULT_ROUTES.default);
  ProtoLab.ensureMaterialRequirements = (state,r) => {
    const product=state.products.find(p=>p.id===r.productId); if(product&&!product.bom?.length) product.bom=ProtoLab.getDefaultBom(product.id);
    if(!Array.isArray(r.materialRequirements)||!r.materialRequirements.length){
      const bom=(product?.bom?.length?product.bom:ProtoLab.getDefaultBom(r.productId)).filter(b=>String(b.kind||'component')!=='consumable');
      r.materialRequirements=bom.map((b,i)=>({id:`MATREQ-${r.id}-${i+1}`,partNumber:b.partNumber,description:b.description,revision:b.revision,qtyPerUnit:Number(b.qtyPerUnit||1),requiredQty:Number(b.qtyPerUnit||1)*Number(r.quantity||1),unit:b.unit||'pcs'}));
    }
    return r.materialRequirements;
  };
  ProtoLab.ensureMaterialModel = state => {
    state.materials=state.materials||[]; state.allocations=state.allocations||[]; state.approvals=state.approvals||[]; state.bookings=state.bookings||[];
    (state.products||[]).forEach(p=>{if(!p.bom?.length)p.bom=ProtoLab.getDefaultBom(p.id);if(!p.defaultRoute?.length)p.defaultRoute=ProtoLab.getDefaultRoute(p.id);});
    const allParts=(state.products||[]).flatMap(p=>(p.bom||[]).filter(b=>String(b.kind||'component')!=='consumable'));
    allParts.forEach((b,i)=>{if(!state.materials.some(m=>m.partNumber===b.partNumber&&m.revision===b.revision)){state.materials.push({id:`STOCK-${b.partNumber}-A`,partNumber:b.partNumber,description:b.description,revision:b.revision,supplier:i%3===0?'Supplier Alpha':i%3===1?'Supplier Beta':'Internal Stores',lot:`LOT-${b.partNumber.replace(/[^A-Z0-9]/gi,'').slice(-8)}-A`,quantity:80,status:'Available',certificate:`COC-${b.partNumber}-A`,specialHandling:'Standard ESD',expiry:null});state.materials.push({id:`STOCK-${b.partNumber}-B`,partNumber:b.partNumber,description:b.description,revision:b.revision,supplier:'Internal Stores',lot:`LOT-${b.partNumber.replace(/[^A-Z0-9]/gi,'').slice(-8)}-B`,quantity:30,status:'Available',certificate:`COC-${b.partNumber}-B`,specialHandling:'Standard ESD',expiry:null});}});
    (state.requests||[]).forEach(r=>ProtoLab.ensureMaterialRequirements(state,r));
    (state.allocations||[]).forEach(a=>{if(!a.requirementId){const r=state.requests.find(x=>x.id===a.requestId),m=state.materials.find(x=>x.id===a.materialId),req=r?.materialRequirements?.find(q=>q.partNumber===m?.partNumber&&q.revision===m?.revision);if(req)a.requirementId=req.id;else if(a.status==='Issued')a.status='Unmatched';}});
    return state;
  };
  ProtoLab.ensureApprovalRecords = (state,r) => {
    state.approvals=state.approvals||[]; const profile=ProtoLab.ensureAssuranceProfile(r);
    const gate=ProtoLab.GATES.indexOf(r.currentGate||r.status), controlsGate=ProtoLab.GATES.indexOf('PROCESS DEFINITION'), readinessGate=ProtoLab.GATES.indexOf('BUILD READINESS REVIEW'), releaseGate=ProtoLab.GATES.indexOf('ENGINEERING REVIEW');
    state.approvals.filter(a=>a.requestId===r.id).forEach(a=>{if(a.type==='Product Safety'||a.type==='Build Readiness')a.stage=a.stage||'readiness';if(['Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type))a.stage=a.stage||'release';});
    const user=(role)=>state.users.find(u=>u.role===role);
    // Product-safety approval is part of the Controls gate, before resource planning. Create it as soon as Process Definition is reached so the guided workflow can never wait on an approval record that does not yet exist. Build Readiness approvals remain deferred until the readiness gate.
    if(gate<controlsGate){state.approvals=state.approvals.filter(a=>a.requestId!==r.id||a.status==='Approved'||a.type!=='Product Safety');}
    else if(r.productSafety&&!state.approvals.some(a=>a.requestId===r.id&&a.type==='Product Safety')){const done=gate>=ProtoLab.GATES.indexOf('RELEASED');state.approvals.push({id:ProtoLab.uid('APR'),requestId:r.id,type:'Product Safety',role:'Product Safety Representative',person:user('product_safety')?.name||'Product Safety Representative',status:done?'Approved':'Pending',timestamp:done?ProtoLab.now():null,stage:'readiness',comment:done?'Migrated/seeded evidence assumed complete for already released build.':'Review product-safety relevance, special characteristics and required evidence before resource planning / physical build readiness.'});}
    if(gate<readinessGate){state.approvals=state.approvals.filter(a=>a.requestId!==r.id||a.status==='Approved'||a.type!=='Build Readiness');}
    const customer=state.customers?.find(c=>c.id===r.customerId);
    const map={Quality:['Customer / quality gate','Quality Engineer','quality'],Engineering:['Engineering review','Engineering Project Lead','engineering_lead'],'Lab Manager':['Lab manager gate','Lab Manager','lab_manager']};
    // Release sign-off is a release decision, not a request-submission gate. Do not create or surface it until Engineering Review.
    if(gate<releaseGate){state.approvals=state.approvals.filter(a=>a.requestId!==r.id||a.status==='Approved'||!['Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type));}
    else if(profile.requires.customerApprovals)(customer?.requiredApprovals||[]).forEach(label=>{const x=map[label];if(!x)return;if(!state.approvals.some(a=>a.requestId===r.id&&a.type===x[0])){const done=gate>=ProtoLab.GATES.indexOf('RELEASED');state.approvals.push({id:ProtoLab.uid('APR'),requestId:r.id,type:x[0],role:x[1],person:user(x[2])?.name||x[1],status:done?'Approved':'Pending',timestamp:done?ProtoLab.now():null,stage:'release',comment:`Required at final release by ${profile.label} profile and customer profile ${customer?.name||r.customerId}.`});}});
    else if(gate>=releaseGate)state.approvals=state.approvals.filter(a=>a.requestId!==r.id||!['Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type));
    return state.approvals.filter(a=>a.requestId===r.id);
  };
  ProtoLab.controlCharacteristicReady = c => {
    const hasSpec=(c.target!==null&&c.target!==undefined&&String(c.target).trim()!==''&&String(c.target).trim()!=='Define target') || c.lsl!==null&&c.lsl!==undefined || c.usl!==null&&c.usl!==undefined;
    return !c.classification || (hasSpec&&!!String(c.method||'').trim()&&!!String(c.reactionPlan||'').trim()&&!!String(c.equipment||c.gauge||'').trim()&&!!String(c.evidence||'').trim());
  };
  ProtoLab.normaliseMaterialSource = value => value==='Lab stock'?'Lab supplied':value==='External supplier'?'Engineering supplied':(value||'Engineering supplied');
  ProtoLab.median = values => { const a=(values||[]).filter(Number.isFinite).sort((x,y)=>x-y); if(!a.length)return null; const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
  ProtoLab.planningStandardHours = (obj,quantity=1) => { const setup=Math.max(0,Number(obj?.setupTime||0))/60,cycle=Math.max(0,Number(obj?.cycleTime||0))/60,q=Math.max(1,Number(quantity||1)); return Math.max(.02,setup+cycle*(obj?.basis==='Batch'?1:q)); };
  ProtoLab.historicalEquivalentHours = (obj,actualHours,historyQty,currentQty) => { const actual=Math.max(0,Number(actualHours||0)),setup=Math.max(0,Number(obj?.setupTime||0))/60,hq=Math.max(1,Number(historyQty||1)),cq=Math.max(1,Number(currentQty||1)); if(obj?.basis==='Batch')return actual; const inferredCycle=Math.max(0,actual-setup)/hq; return setup+inferredCycle*cq; };
  ProtoLab.ensurePlanningModel = state => {
    state.standardTests=state.standardTests||[]; state.buildHistory=state.buildHistory||[]; state.competencies=state.competencies||[]; state.planningEvents=state.planningEvents||[];
    (state.requests||[]).forEach(r=>{
      r.materialOwnership=ProtoLab.normaliseMaterialSource(r.materialOwnership);ProtoLab.ensureAssuranceProfile(r);ProtoLab.ensureMaterialRequirements(state,r);ProtoLab.ensureTestRequirements(state,r);ProtoLab.ensureCapturePlan(state,r);
      r.originalRequestedDate=r.originalRequestedDate||r.requiredDate||null;
      r.commitmentHistory=Array.isArray(r.commitmentHistory)?r.commitmentHistory:[];
      if(!r.originalCommitmentDate&&r.triage?.status==='Committed'&&r.triage?.forecastDate){r.originalCommitmentDate=r.triage.forecastDate;r.currentCommitmentDate=r.triage.forecastDate;r.commitmentHistory.push({seq:1,type:'initial',at:r.triage.assessedAt||ProtoLab.now(),oldDate:null,newDate:r.triage.forecastDate,deltaDays:0,cumulativeDays:0,reasonCategory:'Initial commitment',reason:'Migrated from committed planning forecast.',eventId:null,actor:r.owner||'Lab Planner'});}
      if(r.originalCommitmentDate&&!r.currentCommitmentDate)r.currentCommitmentDate=r.originalCommitmentDate;
      if(['DELIVERED','CLOSED'].includes(r.status)&&!r.actualDeliveryDate){const ser=(state.serials||[]).find(x=>x.requestId===r.id&&x.delivery?.date);r.actualDeliveryDate=ser?.delivery?.date||r.closedAt?.slice?.(0,10)||r.archivedAt?.slice?.(0,10)||null;}
    });
    return state;
  };
  ProtoLab.commitmentMetrics = r => {
    const hist=Array.isArray(r?.commitmentHistory)?r.commitmentHistory:[],replans=hist.filter(x=>x.type==='replan'),original=r?.originalCommitmentDate||null,current=r?.currentCommitmentDate||original,actual=r?.actualDeliveryDate||null;
    const net=(original&&current)?ProtoLab.daysBetween(original,current):0,churn=replans.reduce((n,x)=>n+Math.abs(Number(x.deltaDays||0)),0);
    return {original,current,actual,replanCount:replans.length,netReplanDays:net,churnDays:churn,actualVsOriginalDays:(original&&actual)?ProtoLab.daysBetween(original,actual):null,actualVsFinalDays:(current&&actual)?ProtoLab.daysBetween(current,actual):null};
  };
  ProtoLab.recordCommitment = (state,r,newDate,{reasonCategory='',reason='',eventId=null}={}) => {
    if(!r||!newDate)throw new Error('A forecast date is required before commitment.');r.commitmentHistory=Array.isArray(r.commitmentHistory)?r.commitmentHistory:[];
    if(!r.originalCommitmentDate){r.originalCommitmentDate=newDate;r.currentCommitmentDate=newDate;r.commitmentHistory.push({seq:r.commitmentHistory.length+1,type:'initial',at:ProtoLab.now(),oldDate:null,newDate,deltaDays:0,cumulativeDays:0,reasonCategory:'Initial commitment',reason:'First lab timing commitment.',eventId:null,actor:state.identity?.name||'Lab Planner'});return {type:'initial',changed:true};}
    const oldDate=r.currentCommitmentDate||r.originalCommitmentDate;if(oldDate===newDate){r.currentCommitmentDate=newDate;return {type:'unchanged',changed:false};}
    if(!String(reasonCategory||'').trim()||!String(reason||'').trim())throw new Error('Every committed replan requires a reason category and explanation.');
    const deltaDays=ProtoLab.daysBetween(oldDate,newDate),cumulativeDays=ProtoLab.daysBetween(r.originalCommitmentDate,newDate);r.currentCommitmentDate=newDate;
    r.commitmentHistory.push({seq:r.commitmentHistory.length+1,type:'replan',at:ProtoLab.now(),oldDate,newDate,deltaDays,cumulativeDays,reasonCategory:String(reasonCategory).trim(),reason:String(reason).trim(),eventId:eventId||null,actor:state.identity?.name||'Lab Planner'});return {type:'replan',changed:true,deltaDays,cumulativeDays};
  };
  ProtoLab.matchStandardTest = (state,name) => {
    const q=String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); if(!q)return null;
    return (state.standardTests||[]).find(t=>{const terms=[t.name,...(t.aliases||[])].map(x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim());return terms.some(x=>x===q||x.includes(q)||q.includes(x));})||null;
  };
  ProtoLab.inferPlanningCapabilityFromName = name => {const n=String(name||'').toLowerCase();if(/leak|helium|seal/.test(n))return 'Helium Leak Test';if(/pressure/.test(n))return 'Pressure Calibration';if(/thermal|temperature|environment|soak|humidity/.test(n))return 'Environmental Chamber';if(/dimension|cmm|geometry/.test(n))return 'Dimensional Metrology';if(/optical|visual|microscope|inspection/.test(n))return 'Optical Inspection';if(/program|flash|firmware/.test(n))return 'Programming / Flashing';if(/torque|fasten/.test(n))return 'Torque / Fastening';if(/laser|weld|join/.test(n))return 'Laser Welding';if(/electr|voltage|current|resistance|functional|signal|sensitivity|calibration correlation/.test(n))return 'Electrical Test';return null;};
  ProtoLab.inferPlanningSkillFromName = name => {const n=String(name||'').toLowerCase();if(/program|flash|firmware/.test(n))return 'COMP-06';if(/laser|weld|join/.test(n))return 'COMP-02';if(/leak|helium|pressure/.test(n))return 'COMP-04';if(/dimension|cmm|optical|visual|inspection/.test(n))return 'COMP-05';if(/thermal|temperature|environment|soak|humidity|cycle/.test(n))return 'COMP-08';if(/calibrat|correlation/.test(n))return 'COMP-07';if(/electr|voltage|current|resistance|functional|signal|sensitivity/.test(n))return 'COMP-03';return 'COMP-01';};
  ProtoLab.normalisePlanningText = value => String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  ProtoLab.stablePlanningToken = value => {let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase()};
  ProtoLab.testRequirementKey = (state,name,test=null) => {test=test||ProtoLab.matchStandardTest(state,name);return test?`STD:${test.id}`:`CUSTOM:${ProtoLab.normalisePlanningText(name)}`};
  ProtoLab.testRequirementStableId = (state,r,name,test=null) => {test=test||ProtoLab.matchStandardTest(state,name);if(test)return `TESTREQ-${r.id}-${test.id}`;const clean=String(name||'test').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,28)||'CUSTOM';return `TESTREQ-${r.id}-${clean}-${ProtoLab.stablePlanningToken(ProtoLab.normalisePlanningText(name))}`};
  ProtoLab.ensureTestRequirements = (state,r) => {
    const previous=Array.isArray(r.testRequirements)?r.testRequirements:[],pools=new Map();
    for(const old of previous){const test=old.standardTestId?(state.standardTests||[]).find(t=>t.id===old.standardTestId):ProtoLab.matchStandardTest(state,old.name),key=ProtoLab.testRequirementKey(state,old.name,test);if(!pools.has(key))pools.set(key,[]);pools.get(key).push(old)}
    const seenKeys=new Set(),usedIds=new Set(),names=[];for(const raw of r.characterisation||[]){const name=String(raw||'').trim();if(!name)continue;const test=ProtoLab.matchStandardTest(state,name),key=ProtoLab.testRequirementKey(state,name,test);if(seenKeys.has(key))continue;seenKeys.add(key);names.push({name,test,key})}
    r.characterisation=names.map(x=>x.name);
    r.testRequirements=names.map(({name,test,key})=>{const pool=pools.get(key)||[],old=pool.shift()||null,inferredCap=test?ProtoLab.planningCapabilityForTest?.(test)||test.equipmentCapability:ProtoLab.inferPlanningCapabilityFromName(name),inferredSkill=test?.competency||ProtoLab.inferPlanningSkillFromName(name);let id=old?.id&&!usedIds.has(old.id)?old.id:ProtoLab.testRequirementStableId(state,r,name,test);if(usedIds.has(id)){const base=id;let n=2;while(usedIds.has(`${base}-${n}`))n++;id=`${base}-${n}`}usedIds.add(id);const base={id,name,definitionKey:key,standardTestId:test?.id||null,status:test?'Standard test':'Development required',developmentEstimateHours:test?null:2,executionEstimateHours:test?null:Math.max(1,Number(r.quantity||1)*.35),equipmentCapability:inferredCap,competency:inferredSkill,developmentCompetency:'COMP-03',owner:test?.owner||(state.users||[]).find(u=>u.role==='process_engineer')?.name||'Process Engineer'};const merged=Object.assign(base,old||{});merged.id=id;merged.name=name;merged.definitionKey=key;if(test){merged.standardTestId=test.id;merged.status='Standard test';merged.equipmentCapability=inferredCap;merged.competency=inferredSkill}else{merged.standardTestId=null;merged.equipmentCapability=old?.equipmentCapability||inferredCap;merged.competency=old?.competency||inferredSkill;merged.developmentEstimateHours=Number(old?.developmentEstimateHours)||2;merged.executionEstimateHours=Number(old?.executionEstimateHours)||Math.max(1,Number(r.quantity||1)*.35);if(merged.developmentReleased===true)merged.status='Released developed method'}return merged});
    return r.testRequirements;
  };
  ProtoLab.isHistoricalPlanningBooking = b => /complete|completed|actual|done|cancel|superseded/i.test(String(b?.status||''));
  ProtoLab.planningTasksForRequest = (state,requestOrId,{includeCompleted=false}={}) => {
    const r=typeof requestOrId==='string'?(state.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return [];ProtoLab.ensureTestRequirements(state,r);const route=(state.routes||[]).find(x=>x.requestId===r.id),tasks=[];let order=0,done=x=>!!(x?.completedAt||/complete|completed|done|skipped/i.test(String(x?.status||'')));
    for(const step of (route?.steps||[]).filter(x=>!x.optional).slice().sort((a,b)=>Number(a.order||0)-Number(b.order||0))){if(!includeCompleted&&(done(step)||ProtoLab.requestEvidenceSatisfiesRouteStepV133?.(state,r,step)))continue;const dev=(state.processDevelopments||[]).find(d=>d.requestId===r.id&&(d.stepId===step.id||d.libraryCandidate===step.processId||String(d.name||'').includes(step.name)||String(step.name||'').includes(d.name||''))),released=dev?.status==='RELEASED'||dev?.gates?.release===true,key=`PROCESS:${step.id}:${step.processId||''}:${step.processRevision||''}:${step.type||'standard'}`;if(step.type!=='standard'&&!released)tasks.push({id:`DEV-${step.id}`,name:`Develop / validate ${step.name}`,kind:'development',subkind:'process-development',order:++order,definitionKey:`DEV:${key}`,routeStepId:step.id,sourceStep:step,processDevelopmentId:dev?.id||null});tasks.push({id:step.id,name:step.name,kind:'process',order:++order,definitionKey:key,routeStepId:step.id,sourceStep:step,processDevelopmentId:dev?.id||null})}
    for(const tr of r.testRequirements||[]){if(!includeCompleted&&done(tr))continue;const key=`TEST:${tr.id}:${tr.definitionKey||ProtoLab.testRequirementKey(state,tr.name)}`;if(!tr.standardTestId&&tr.developmentReleased!==true)tasks.push({id:`DEV-${tr.id}`,name:`Develop test · ${tr.name}`,kind:'development',subkind:'test-development',order:++order,definitionKey:`DEV:${key}`,testRequirementId:tr.id,sourceTest:tr});tasks.push({id:tr.id,name:`Test · ${tr.name}`,kind:'test',order:++order,definitionKey:key,testRequirementId:tr.id,sourceTest:tr})}
    if(!['RELEASED','DELIVERED','CLOSED','ARCHIVED'].includes(String(r.status||'').toUpperCase()))tasks.push({id:`FINAL-${r.id}`,name:'Final quality review / release / handover',kind:'closeout',order:++order,definitionKey:`CLOSEOUT:${r.id}:1`});return tasks;
  };
  ProtoLab.planningTaskCompatible = (task,booking) => {if(!task||!booking||task.id!==booking.stepId)return false;if(booking.taskDefinitionKey)return booking.taskDefinitionKey===task.definitionKey;return ProtoLab.normalisePlanningText(booking.stepName)===ProtoLab.normalisePlanningText(task.name)};
  ProtoLab.reconcilePlanningBookings = (state,requestOrId,{removeObsolete=true}={}) => {
    const r=typeof requestOrId==='string'?(state.requests||[]).find(x=>x.id===requestOrId):requestOrId;
    if(!r)return {removed:[],retained:[],tasks:[],prunedTaskOverrides:[],prunedConstraints:[],supersededTransfers:[]};
    const tasks=ProtoLab.planningTasksForRequest(state,r),byId=new Map(tasks.map(t=>[t.id,t])),validTaskIds=new Set(tasks.map(t=>t.id)),removed=[],retained=[];
    state.bookings=Array.isArray(state.bookings)?state.bookings:[];
    state.bookings=state.bookings.filter(b=>{if(b.requestId!==r.id||ProtoLab.isHistoricalPlanningBooking(b))return true;const t=byId.get(b.stepId),ok=t&&ProtoLab.planningTaskCompatible(t,b);if(ok){b.taskDefinitionKey=t.definitionKey;b.taskKind=t.kind;retained.push(b);return true}if(removeObsolete){removed.push(b);return false}return true});
    const prunedTaskOverrides=[];if(r.taskSiteOverridesV1170&&typeof r.taskSiteOverridesV1170==='object')for(const id of Object.keys(r.taskSiteOverridesV1170)){if(!validTaskIds.has(id)){prunedTaskOverrides.push(id);delete r.taskSiteOverridesV1170[id]}}
    const byTask=r.planningConstraintsV1096?.byTask,prunedConstraints=[];if(byTask&&typeof byTask==='object')for(const id of Object.keys(byTask)){if(!validTaskIds.has(id)){prunedConstraints.push(id);delete byTask[id]}}
    const supersededTransfers=[],supersededTransferIds=new Set(),stamp=ProtoLab.now();
    const supersede=rec=>{if(rec?.requestId===r.id&&rec?.scope==='task'&&rec?.stepId&&!validTaskIds.has(rec.stepId)&&rec.status==='Accepted'){rec.status='Superseded';rec.supersededAt=stamp;rec.supersededReason='Controlled task definition was removed or replaced.';const key=rec.id||rec.stepId;if(!supersededTransferIds.has(key)){supersededTransferIds.add(key);supersededTransfers.push(key)}}};
    (r.taskSiteTransferHistoryV1170||[]).forEach(supersede);(state.networkTransfers||[]).forEach(supersede);
    if(removed.length){state.resourceCareBookings=(state.resourceCareBookings||[]).filter(c=>c.sourceRequestId!==r.id||c.portfolioOwned===true||ProtoLab.isHistoricalPlanningBooking(c)||!c.autoGenerated)}
    if(removed.length||prunedTaskOverrides.length||prunedConstraints.length||supersededTransfers.length){if(state.auditTrail)ProtoLab.audit(state,'Stale planning state reconciled','Request',r.id,[...removed.map(x=>x.stepName||x.stepId),...prunedTaskOverrides,...prunedConstraints].join('; ')||'Task-routing history','Removed / superseded',`Controlled planning definition changed; active bookings, task-site overrides and manual constraints were reconciled while historical evidence was retained. ${supersededTransfers.length} obsolete accepted transfer record(s) superseded.`)}
    return {removed,retained,tasks,prunedTaskOverrides,prunedConstraints,supersededTransfers};
  };
  ProtoLab.planningTaskCoverage = (state,requestOrId) => {const r=typeof requestOrId==='string'?(state.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return {ok:false,missing:[],duplicates:[],orphan:[],mismatched:[],expected:[],scheduled:[]};const tasks=ProtoLab.planningTasksForRequest(state,r),byId=new Map(tasks.map(t=>[t.id,t])),rows=(state.bookings||[]).filter(b=>b.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking(b)),groups=new Map(),orphan=[],mismatched=[];for(const b of rows){const t=byId.get(b.stepId);if(!t){orphan.push(b);continue}if(!ProtoLab.planningTaskCompatible(t,b)){mismatched.push({task:t,booking:b});continue}if(!groups.has(t.id))groups.set(t.id,[]);groups.get(t.id).push(b)}const missing=tasks.filter(t=>!(groups.get(t.id)||[]).length),duplicates=[...groups.entries()].filter(([,v])=>v.length>1).map(([id,bookings])=>({task:byId.get(id),bookings}));return {ok:missing.length===0&&duplicates.length===0&&orphan.length===0&&mismatched.length===0,missing,duplicates,orphan,mismatched,expected:tasks,scheduled:rows};};
  ProtoLab.materialOutputLimit = (state,r) => {
    ProtoLab.ensureMaterialRequirements(state,r);
    const requested=Math.max(0,Number(r?.quantity||0)),reqs=r?.materialRequirements||[],alloc=(state.allocations||[]).filter(a=>a.requestId===r.id&&a.status==='Issued');
    if(!requested||!reqs.length)return {requestedQty:requested,maxBuildQty:requested,limited:false,lines:[]};
    const lines=reqs.map(req=>{const perUnit=Math.max(0,Number(req.qtyPerUnit||0)),issued=alloc.filter(a=>a.requirementId===req.id).reduce((n,a)=>n+Number(a.qty||0),0),units=perUnit>0?Math.floor((issued+1e-9)/perUnit):requested;return {requirementId:req.id,partNumber:req.partNumber,revision:req.revision,issued,qtyPerUnit:perUnit,maxUnits:Math.min(requested,Math.max(0,units))};});
    const maxBuildQty=lines.length?Math.min(requested,...lines.map(x=>x.maxUnits)):requested;
    return {requestedQty:requested,maxBuildQty,limited:maxBuildQty<requested,lines};
  };
  ProtoLab.materialPlanningAssessment = (state,r) => {
    ProtoLab.ensureMaterialRequirements(state,r); r.materialOwnership=ProtoLab.normaliseMaterialSource(r.materialOwnership);
    const reqs=r.materialRequirements||[],alloc=(state.allocations||[]).filter(a=>a.requestId===r.id),today=ProtoLab.todayISO(),outputLimit=ProtoLab.materialOutputLimit(state,r);
    const issuedReady=reqs.every(req=>alloc.filter(a=>a.requirementId===req.id&&a.status==='Issued').reduce((n,a)=>n+Number(a.qty||0),0)>=Number(req.requiredQty||0));
    if(r.materialOwnership==='Engineering supplied'){
      const supply=r.materialSupply||{}; const planningReady=issuedReady||!!(supply.expectedDate&&supply.owner),partial=outputLimit.maxBuildQty>0&&!issuedReady;
      return {source:r.materialOwnership,planningReady,buildReady:issuedReady,earliestDate:issuedReady?(supply.receivedAt||today):(supply.expectedDate||null),owner:supply.owner||r.requester,summary:issuedReady?'Exact engineering-supplied BOM material is received and issued':partial?`Partial material is issued: current output limit ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} units`:planningReady?`Engineering supply promised for ${supply.expectedDate}`:'Engineering supply date/owner not yet defined',issues:issuedReady?[]:partial?[`Current issued material limits output to ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} requested unit(s). Receive the remaining BOM quantity to remove the limiter.`]:planningReady?[]:['Record who supplies the BOM material and its expected lab arrival date, or receive the material directly.'],outputLimit};
    }
    const replenishments=(r.materialReplenishments||[]).filter(x=>x&&!['Cancelled','Received'].includes(x.status));
    const lines=reqs.map(req=>{
      const reserved=alloc.filter(a=>a.requirementId===req.id&&['Reserved','Issued'].includes(a.status)).reduce((n,a)=>n+Number(a.qty||0),0),available=(state.materials||[]).filter(m=>m.status==='Available'&&m.partNumber===req.partNumber&&m.revision===req.revision).reduce((n,m)=>n+Number(m.quantity||0),0),incomingRows=replenishments.filter(x=>x.requirementId===req.id&&x.expectedDate&&x.owner&&Number(x.qty||0)>0),incoming=incomingRows.reduce((n,x)=>n+Number(x.qty||0),0),required=Number(req.requiredQty||0),covered=reserved+incoming>=required,expectedDate=incomingRows.length?incomingRows.map(x=>x.expectedDate).sort().at(-1):null;
      return {req,reserved,available,incoming,expectedDate,covered,ok:reserved+available+incoming>=required,uncovered:Math.max(0,required-reserved-incoming)};
    });
    const reservedReady=lines.every(x=>x.reserved>=Number(x.req.requiredQty||0)),supplyPlanReady=lines.every(x=>x.covered),partial=outputLimit.maxBuildQty>0&&!issuedReady,arrivalDates=lines.filter(x=>x.reserved<Number(x.req.requiredQty||0)&&x.expectedDate).map(x=>x.expectedDate),earliestDate=arrivalDates.length?arrivalDates.sort().at(-1):today;
    return {source:'Lab supplied',planningReady:supplyPlanReady,buildReady:issuedReady,earliestDate,owner:(state.users||[]).find(u=>u.role==='lab_planner')?.name||'Lab Planner',summary:issuedReady?'Exact BOM material is issued for the full build':partial?`Partial BOM material is issued: current output limit ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} units`:reservedReady?'Exact BOM material is reserved from lab stock':supplyPlanReady?`Incoming lab supply covers all unresolved BOM quantities; latest expected arrival ${earliestDate}`:lines.every(x=>x.ok)?'Exact BOM material can be covered by available stock and/or incoming supply but the reservation/supply plan is not complete':'One or more exact BOM items are not available or planned in sufficient quantity',issues:issuedReady?[]:partial?[`Current issued material limits output to ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} requested unit(s). Issue/receive the remaining exact BOM quantity to remove the limiter.`]:supplyPlanReady?[]:lines.filter(x=>x.uncovered>0).map(x=>`${x.req.partNumber} Rev ${x.req.revision}: need ${x.req.requiredQty}; reserved/issued ${x.reserved}, incoming ${x.incoming}, unreserved stock ${x.available}, uncovered ${x.uncovered}`),lines,outputLimit,replenishments};
  };
  ProtoLab.processPlanningAssessment = (state,r) => {
    const profile=ProtoLab.ensureAssuranceProfile(r), route=(state.routes||[]).find(x=>x.requestId===r.id); ProtoLab.ensureTestRequirements(state,r); const issues=[];
    const testOnlyRapid=profile.formalLevel===0&&(!route?.steps?.length)&&(r.testRequirements||[]).length>0;
    if(!route?.steps?.length&&!testOnlyRapid)issues.push('Define the process route, or use a Rapid Engineering test-only request.'); else if(route?.steps?.length&&route.confirmed!==true)issues.push(profile.formalLevel===0?'Lab/Process Engineering must acknowledge the intended engineering route before planning.':'Process Engineer must confirm the proposed route.');
    (route?.steps||[]).forEach(s=>{
      const live=(state.processes||[]).find(p=>p.id===s.processId),proc=ProtoLab.processRevisionDefinition?ProtoLab.processRevisionDefinition(state,s):live;
      if(s.type==='standard'){
        if(!proc){
          const wanted=String(s.processRevision||'').trim()||'unspecified';
          issues.push(`${s.name}: routed process revision ${wanted} is not available in the controlled process history.`);
        }else{
          if(profile.requires.processRelease&&proc.status!=='Released')issues.push(`${s.name}: ${profile.label} requires a released process revision.`);
          if(!Number.isFinite(Number(proc.setupTime))||!Number.isFinite(Number(proc.cycleTime)))issues.push(`${s.name}: planning setup/cycle time missing.`);
          if(!ProtoLab.planningCapabilityForProcess(state,r,proc)&&proc?.equipmentRequired!==false&&!/material receipt|cleaning|surface preparation|assembly|packaging|manual bench/i.test(s.name||''))issues.push(`${s.name}: equipment capability could not be inferred or defined.`);
          if(!ProtoLab.planningSkillForProcess(proc))issues.push(`${s.name}: required competency could not be inferred or defined.`);
        }
      }else{
        const dev=(state.processDevelopments||[]).find(d=>d.requestId===r.id&&(d.libraryCandidate===s.processId||String(d.name).includes(s.name)));
        if(!dev||!Number(dev.planningEstimateHours))issues.push(`${s.name}: define a Process Engineer-owned development/planning allowance before scheduling.`);
      }
    });
    (r.testRequirements||[]).forEach(tr=>{if(tr.standardTestId){const test=(state.standardTests||[]).find(x=>x.id===tr.standardTestId);if(!test)issues.push(`${tr.name}: standard test definition is missing.`);else{if(profile.requires.testRelease&&test.status!=='Released')issues.push(`${tr.name}: ${profile.label} requires a released standard test.`);if(!ProtoLab.planningCapabilityForTest(test)||!test.competency||!Number.isFinite(Number(test.setupTime))||!Number.isFinite(Number(test.cycleTime)))issues.push(`${tr.name}: standard test planning data incomplete.`);}}else if(!Number(tr.developmentEstimateHours)||!Number(tr.executionEstimateHours)||!tr.competency)issues.push(`${tr.name}: provisional planning data could not be inferred.`);});
    return {ready:issues.length===0,issues,route,testRequirements:r.testRequirements||[],profile};
  };
  ProtoLab.isDemoDataset = state => {
    if(state?.settings?.demoDataset===true)return true;
    if(String(state?.dataVersion||'').startsWith('2026.09-demo'))return true;
    const reqIds=new Set((state?.requests||[]).map(r=>r.id)),prodIds=new Set((state?.products||[]).map(p=>p.id));
    return ['P26-0042','P26-0043','P26-0055'].every(id=>reqIds.has(id)) && ['PRD-001','PRD-002','PRD-003'].every(id=>prodIds.has(id));
  };
  ProtoLab.ensureDemoArchivedExamples = state => {
    if(!state||!ProtoLab.createDemoState||!ProtoLab.isDemoDataset(state))return {changed:false,added:0,normalized:0,archived:0};
    state.settings=state.settings||{};state.settings.demoDataset=true;
    const seed=ProtoLab.createDemoState(),closed=(seed.requests||[]).filter(r=>r.status==='CLOSED'),closedIds=new Set(closed.map(r=>r.id));
    let added=0,normalized=0;
    state.requests=Array.isArray(state.requests)?state.requests:[];
    const sameTitle=(a,b)=>String(a?.title||'').trim().toLowerCase()===String(b?.title||'').trim().toLowerCase();
    for(const src of closed){
      let dst=state.requests.find(r=>sameTitle(r,src))||state.requests.find(r=>r.id===src.id);
      if(!dst){state.requests.push(ProtoLab.deepClone(src));added++;continue;}
      const before=[dst.status,dst.archived,dst.closedAt,dst.actualDeliveryDate].join('|');
      dst.status='CLOSED';dst.currentGate='CLOSED';dst.archived=true;dst.closedAt=dst.closedAt||src.closedAt||src.actualDeliveryDate||ProtoLab.now();dst.archivedAt=dst.archivedAt||src.archivedAt||dst.closedAt;dst.actualDeliveryDate=dst.actualDeliveryDate||src.actualDeliveryDate;dst.originalCommitmentDate=dst.originalCommitmentDate||src.originalCommitmentDate;dst.currentCommitmentDate=dst.currentCommitmentDate||src.currentCommitmentDate;dst.commitmentHistory=(dst.commitmentHistory&&dst.commitmentHistory.length)?dst.commitmentHistory:ProtoLab.deepClone(src.commitmentHistory||[]);
      if(before!==[dst.status,dst.archived,dst.closedAt,dst.actualDeliveryDate].join('|'))normalized++;
    }
    const addRows=(key,filter,natural)=>{state[key]=Array.isArray(state[key])?state[key]:[];for(const src of seed[key]||[]){if(!filter(src))continue;if(!state[key].some(dst=>natural(dst,src)))state[key].push(ProtoLab.deepClone(src));}};
    addRows('routes',x=>closedIds.has(x.requestId),(a,b)=>a.id===b.id||a.requestId===b.requestId);
    addRows('serials',x=>closedIds.has(x.requestId),(a,b)=>String(a.serial||a.sampleId||'')===String(b.serial||b.sampleId||''));
    addRows('measurements',x=>closedIds.has(x.requestId),(a,b)=>a.id===b.id);
    addRows('deviations',x=>closedIds.has(x.requestId),(a,b)=>a.id===b.id);
    addRows('approvals',x=>closedIds.has(x.requestId),(a,b)=>a.requestId===b.requestId&&a.type===b.type&&String(a.stage||'')===String(b.stage||''));
    addRows('documents',x=>closedIds.has(x.requestId),(a,b)=>a.requestId===b.requestId&&a.type===b.type&&String(a.revision||'A')===String(b.revision||'A'));
    addRows('allocations',x=>closedIds.has(x.requestId),(a,b)=>a.requestId===b.requestId&&a.requirementId===b.requirementId&&a.lot===b.lot&&a.status===b.status);
    addRows('auditTrail',x=>closedIds.has(x.objectId),(a,b)=>a.id===b.id);
    ProtoLab.repairDuplicateSamples(state);
    (state.requests||[]).filter(r=>r.status==='CLOSED').forEach(r=>{r.archived=true;r.archivedAt=r.archivedAt||r.closedAt||r.actualDeliveryDate||ProtoLab.now();ProtoLab.ensureBuildReportApproval(state,r);});
    const archived=(state.requests||[]).filter(r=>r.status==='CLOSED'&&r.archived).length;
    if((added||normalized)&&state.auditTrail)ProtoLab.audit(state,'Archived demo examples installed/repaired','Demo data','Prototype Requests',`${added} added / ${normalized} normalized`,`${archived} archived build(s)`,'REV 1.0.28 archive migration');
    return {changed:!!(added||normalized),added,normalized,archived};
  };
  ProtoLab.repairDuplicateSamples = state => {
    state.serials=Array.isArray(state.serials)?state.serials:[];
    const groups=new Map();for(const sample of state.serials){const key=String(sample.serial||sample.sampleId||'').trim();if(!key)continue;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(sample);}
    let merged=0,renamed=0;const remove=new Set(),used=new Set(state.serials.map(s=>String(s.serial||'')).filter(Boolean));
    const uniq=(arr,keyFn)=>{const out=[],seen=new Set();for(const x of arr||[]){const k=keyFn(x);if(seen.has(k))continue;seen.add(k);out.push(x)}return out};
    const mergeInto=(keep,dup)=>{
      ProtoLab.ensureSampleEvidence?.(keep);ProtoLab.ensureSampleEvidence?.(dup);
      keep.sampleId=keep.sampleId||keep.serial;keep.sampleNumber=keep.sampleNumber||dup.sampleNumber;keep.serialNumber=keep.serialNumber||dup.serialNumber;keep.description=(String(dup.description||'').length>String(keep.description||'').length)?dup.description:keep.description;
      keep.materials=uniq([...(keep.materials||[]),...(dup.materials||[])],x=>String(x));
      keep.processHistory=uniq([...(keep.processHistory||[]),...(dup.processHistory||[])],x=>[x.stepId,x.processId,x.date,x.operator,x.equipment].join('|'));
      keep.dataFields=uniq([...(keep.dataFields||[]),...(dup.dataFields||[])],x=>x.id||[x.label,x.value,x.unit,x.description].join('|'));
      keep.evidencePhotos=uniq([...(keep.evidencePhotos||[]),...(dup.evidencePhotos||[])],x=>x.id||[x.caption,x.dataUrl].join('|'));
      if(!keep.delivery&&dup.delivery)keep.delivery=ProtoLab.deepClone(dup.delivery);
      const rank={Scrapped:6,Hold:5,Reworked:4,Delivered:3,Released:2,Active:1};if((rank[dup.status]||0)>(rank[keep.status]||0))keep.status=dup.status;if((rank[dup.releaseState]||0)>(rank[keep.releaseState]||0))keep.releaseState=dup.releaseState;
    };
    const updateRefs=(requestId,oldRef,newRef)=>{
      for(const key of ['measurements','deviations','actions'])for(const row of state[key]||[])if(row.requestId===requestId&&row.serial===oldRef)row.serial=newRef;
      for(const route of state.routes||[])if(route.requestId===requestId)for(const step of route.steps||[])for(const run of step.executionRuns||[])if(Array.isArray(run.sampleIds))run.sampleIds=run.sampleIds.map(x=>x===oldRef?newRef:x);
    };
    for(const [key,list] of groups){if(list.length<2)continue;const byRequest=new Map();for(const x of list){if(!byRequest.has(x.requestId))byRequest.set(x.requestId,[]);byRequest.get(x.requestId).push(x)}
      for(const same of byRequest.values())if(same.length>1){const keep=same.slice().sort((a,b)=>((b.dataFields||[]).length+(b.evidencePhotos||[]).length+(b.processHistory||[]).length)-((a.dataFields||[]).length+(a.evidencePhotos||[]).length+(a.processHistory||[]).length))[0];for(const dup of same){if(dup===keep)continue;mergeInto(keep,dup);remove.add(dup);merged++;}}
      const survivors=list.filter(x=>!remove.has(x));if(survivors.length>1){const keep=survivors[0];for(const sample of survivors.slice(1)){let base=`${sample.requestId||'SAMPLE'}-S${String(sample.sampleNumber||'001').padStart(3,'0')}`,candidate=base,n=1;while(used.has(candidate))candidate=`${base}-${++n}`;const old=sample.serial;used.add(candidate);sample.serial=candidate;sample.sampleId=candidate;updateRefs(sample.requestId,old,candidate);renamed++;}}
    }
    if(remove.size)state.serials=state.serials.filter(x=>!remove.has(x));
    if((merged||renamed)&&state.auditTrail)ProtoLab.audit(state,'Duplicate sample trace IDs repaired','Data integrity','Sample register',`${merged+renamed} conflict(s)`,'Unique permanent Lab Sample IDs',`${merged} duplicate row(s) merged; ${renamed} cross-request conflict(s) reassigned with references preserved`);
    return {merged,renamed};
  };

  ProtoLab.validateInvariants = state => {
    const errors=[],duplicates=(rows,label)=>{const vals=(rows||[]).map(x=>String(x||'').trim()).filter(Boolean),seen=new Set(),dup=new Set();for(const v of vals){if(seen.has(v))dup.add(v);seen.add(v)}if(dup.size)errors.push(`${label} are not unique: ${[...dup].slice(0,5).join(', ')}${dup.size>5?' …':''}.`);};
    duplicates((state.serials||[]).map(s=>s.serial),'Lab Sample IDs');
    duplicates((state.serials||[]).map(s=>s.serialNumber),'Formal serial numbers');
    duplicates((state.requests||[]).map(r=>r.id),'Request IDs');
    duplicates((state.routes||[]).map(r=>r.id),'Route IDs');
    const requestIds=new Set((state.requests||[]).map(r=>r.id));
    (state.routes||[]).forEach(rt=>{if(rt.requestId&&!requestIds.has(rt.requestId))errors.push(`${rt.id} points to unknown request ${rt.requestId}.`)});
    (state.requests||[]).forEach(r=>{
      if(r.status&&r.currentGate&&r.status!==r.currentGate)errors.push(`${r.id} lifecycle mismatch: status ${r.status} but currentGate ${r.currentGate}.`);
      const qty=Number(r.quantity);if(!Number.isInteger(qty)||qty<=0)errors.push(`${r.id} has invalid quantity ${r.quantity}.`);
      if(r.requiredDate&&Number.isNaN(new Date(`${r.requiredDate}T12:00:00`).getTime()))errors.push(`${r.id} has invalid required date ${r.requiredDate}.`);
      if(!['Engineering supplied','Lab supplied'].includes(ProtoLab.normaliseMaterialSource(r.materialOwnership))) errors.push(`${r.id} has unsupported material source.`);
      if(['RELEASED','DELIVERED','CLOSED'].includes(r.status)){
        const holds=(state.deviations||[]).filter(d=>d.requestId===r.id && d.releaseHold && d.status!=='CLOSED'); if(holds.length) errors.push(`${r.id} released with unresolved release hold.`);
      }
      const reqs=r.materialRequirements||[]; const alloc=(state.allocations||[]).filter(a=>a.requestId===r.id&&a.status==='Issued');
      alloc.forEach(a=>{if(a.requirementId&&!reqs.some(q=>q.id===a.requirementId))errors.push(`${r.id} has material allocation to an unknown requirement.`);});
    });
    (state.processes||[]).filter(p=>p.status==='Released').forEach(p=>{if(!p.workInstruction||p.workInstruction.status!=='Released'||!(p.workInstruction.steps||[]).length)errors.push(`${p.id} released without a released work instruction.`);});
    (state.controlPlans||[]).filter(c=>c.status==='Approved').forEach(c=>{ if(!c.revision) errors.push(`${c.id} approved without revision.`); });
    (state.measurements||[]).filter(m=>m.calibrationRequired).forEach(m=>{ if(m.equipmentCalibrationStatus==='Invalid' && m.compliant===true) errors.push(`${m.id} claims compliant measurement with invalid calibration.`); });
    (state.deviations||[]).filter(d=>d.status==='CLOSED').forEach(d=>{if((d.actions||[]).some(a=>a.mandatory&&!a.closed)) errors.push(`${d.id} closed with mandatory open action.`)});
    return [...new Set(errors)];
  };


  ProtoLab.pipelineProjectCost = (state,project) => {
    if(!project)return 0;
    const product=(state.products||[]).find(p=>p.id===project.productId),qty=Math.max(1,Number(project.quantity||1)),finance=state.settings?.finance||{},techRate=Number(finance.roleRates?.technician||58),contPct=Number(finance.contingencyPct||0);
    let bom=0,process=0,labour=0,equipment=0;
    for(const b of product?.bom||[]){
      const unitCost=Number(b.unitCost||0),factor=String(b.kind||'component')==='consumable'?(1+Number(b.wastePct||0)/100):1;
      bom+=unitCost*Number(b.qtyPerUnit||1)*qty*factor;
    }
    const route=product?.defaultRoute?.length?product.defaultRoute:ProtoLab.getDefaultRoute(project.productId);
    for(const pid of route||[]){
      const p=(state.processes||[]).find(x=>x.id===pid);if(!p)continue;
      const units=p.basis==='Batch'?1:qty,hours=Math.max(.25,(Number(p.setupTime||0)+Number(p.cycleTime||0)*units)/60);
      process+=Number(p.fixedCharge||0)+Number(p.consumableCost||0)*units;
      labour+=hours*techRate;
      const need=ProtoLab.canonicalPlanningCapability?ProtoLab.canonicalPlanningCapability(p.planningCapability||p.equipmentCapability):p.equipmentCapability,eq=(state.equipment||[]).find(e=>ProtoLab.equipmentSupportsCapability(e,need));equipment+=hours*Number(eq?.hourlyCost||0);
    }
    const subtotal=bom+process+labour+equipment;
    return subtotal*(1+contPct/100);
  };

  ProtoLab.ensureEnterpriseModel = state => {
    state.settings=state.settings||{};
    state.settings.finance=state.settings.finance||{
      currency:'EUR', contingencyPct:8,
      roleRates:{lab_planner:68,process_engineer:92,technician:58,quality:82,metrology:84,product_safety:95,lab_manager:105,approver:95},
      defaultExternalService:0
    };
    state.trainingCertificates=state.trainingCertificates||[];
    state.maintenanceRecords=state.maintenanceRecords||[];
    state.calibrationCertificates=state.calibrationCertificates||[];
    state.resourceCareBookings=state.resourceCareBookings||[];
    state.capacityAcquisitions=state.capacityAcquisitions||[];
    state.pipelineProjects=state.pipelineProjects||[];
    state.planningEvents=state.planningEvents||[];
    state.settings.capacity=state.settings.capacity||{productiveStaffHoursPerWeek:32,equipmentHoursPerWeek:60};
    state.settings.resourceAssurance=state.settings.resourceAssurance||{proposalFirst:true,defaultHorizonWeeks:26,warningDays:{Calibration:30,Maintenance:45,Training:60}};
    state.settings.auditProfile=state.settings.auditProfile||{organisation:'',site:'',scopeStatement:'',auditOwner:'',exclusions:'',controlledReference:'',recordsRetentionReference:'',internalAuditReference:''};
    state.settings.auditEquipmentScopes=state.settings.auditEquipmentScopes||{};
    state.testFamilies=Array.isArray(state.testFamilies)?state.testFamilies:[];
    if(!state.testFamilies.length){
      const defaults=[
        ['TF-DIM','Dimensional / metrology','Dimensional measurement, geometry and metrology'],
        ['TF-ELEC','Electrical','Electrical performance and electrical verification'],
        ['TF-FUNC','Functional','Functional verification and end-of-line checks'],
        ['TF-ENV','Environmental / durability','Environmental exposure, durability and life testing'],
        ['TF-LEAK','Leak / pressure','Leak, pressure and sealing verification'],
        ['TF-OTHER','Other','Other controlled laboratory tests']
      ];
      state.testFamilies=defaults.map(x=>({id:x[0],name:x[1],description:x[2],status:'Active'}));
    }
    const inferTestFamily=t=>{
      const s=`${t?.name||''} ${t?.output||''} ${t?.equipmentCapability||''}`.toLowerCase();
      if(/dimension|cmm|metrolog|geometry/.test(s))return 'TF-DIM';
      if(/electr|current|voltage|resistance/.test(s))return 'TF-ELEC';
      if(/thermal|temperature|humidity|vibration|shock|durab|environment|cycle/.test(s))return 'TF-ENV';
      if(/leak|pressure|helium|seal/.test(s))return 'TF-LEAK';
      if(/functional|function|verification/.test(s))return 'TF-FUNC';
      return 'TF-OTHER';
    };
    (state.standardTests||[]).forEach(t=>{t.familyId=t.familyId||inferTestFamily(t)});
    state.fiveSZones=Array.isArray(state.fiveSZones)?state.fiveSZones:[];
    state.fiveSAudits=Array.isArray(state.fiveSAudits)?state.fiveSAudits:[];
    if(!state.fiveSZones.length && (state.staff||[]).length){
      const owner=(state.staff||[]).find(x=>x.available!==false)?.name||(state.identity?.name||'Lab Manager');
      state.fiveSZones=[
        {id:'5S-ZONE-PROTOTYPE',name:'Prototype build area',area:'Prototype lab',owner,status:'Active'},
        {id:'5S-ZONE-METROLOGY',name:'Measurement & metrology area',area:'Metrology',owner,status:'Active'}
      ];
    }
    state.improvementProposals=state.improvementProposals||[];
    state.lessonDecisions=Array.isArray(state.lessonDecisions)?state.lessonDecisions:[];
    state.lessons=Array.isArray(state.lessons)?state.lessons:[];
    state.settings.labSetup=state.settings.labSetup||{};
    state.settings.labSetup.completedSteps=Array.isArray(state.settings.labSetup.completedSteps)?state.settings.labSetup.completedSteps:[];
    (state.actions||[]).forEach(a=>{
      const owner=String(a.owner||'').trim();if(!owner)return;
      const role=ProtoLab.ROLES.find(r=>r.id===owner||r.label===owner);
      if(role){const u=(state.users||[]).find(x=>x.role===role.id);if(u?.name)a.owner=u.name}
    });
    state.dailyOperationsReviews=Array.isArray(state.dailyOperationsReviews)?state.dailyOperationsReviews:[];
    state.settings.lastOperationsReviewDate=state.settings.lastOperationsReviewDate||null;
    (state.products||[]).forEach((p,pi)=>{p.bom=p.bom||[];(p.bom||[]).forEach((b,bi)=>{b.kind=b.kind||'component';b.unitCost=Number(b.unitCost??0);b.wastePct=Number(b.wastePct??0);});});
    (state.requests||[]).forEach(r=>{r.archived=r.archived===true||r.status==='CLOSED';if(r.archived&&!r.archivedAt)r.archivedAt=r.closedAt||r.updatedAt||r.requiredDate||ProtoLab.todayISO();r.consumablesEnabled=!!r.consumablesEnabled;r.buildConsumables=Array.isArray(r.buildConsumables)?r.buildConsumables:[];r.costingEnabled=r.costingEnabled!==false;r.originalRequestedDate=r.originalRequestedDate||r.requiredDate||null;r.commitmentHistory=Array.isArray(r.commitmentHistory)?r.commitmentHistory:[];if(r.originalCommitmentDate&&!r.currentCommitmentDate)r.currentCommitmentDate=r.originalCommitmentDate;ProtoLab.ensureBuildReportApproval(state,r);});
    (state.competencies||[]).forEach((c,i)=>{c.status=c.status||'Released';c.requiredCertificate=c.requiredCertificate||`${c.id}-CERT`;c.validMonths=Number(c.validMonths||24);c.trainingDurationHours=Number(c.trainingDurationHours||4);c.owner=c.owner||'Lab Manager';});
    const today=new Date();
    (state.staff||[]).forEach((person,pi)=>{
      person.trainingCertificates=person.trainingCertificates||[];
      (person.competencies||[]).forEach((skillId,si)=>{
        if(!state.trainingCertificates.some(x=>x.staffId===person.id&&x.skillId===skillId)){
          const cert={id:`CERT-${person.id}-${skillId}`,staffId:person.id,skillId,certificateNo:`TR-${person.id}-${skillId}-${String(si+1).padStart(2,'0')}`,issuer:(state.competencies||[]).find(c=>c.id===skillId)?.owner||'Lab Manager',issuedAt:new Date(today.getTime()-(90+pi*8)*86400000).toISOString().slice(0,10),expiresAt:new Date(today.getTime()+(75+pi*28+si*35)*86400000).toISOString().slice(0,10),status:'Valid',evidence:`Training certificate ${skillId}`};
          cert.fileName=cert.fileName||`${cert.certificateNo}-demo.txt`;cert.fileType=cert.fileType||'text/plain';cert.fileData=cert.fileData||'data:text/plain;base64,REVNTyBUUkFJTklORyBDRVJUSUZJQ0FURSAtIExhYk9T';cert.documentUploaded=!!cert.fileData;state.trainingCertificates.push(cert); person.trainingCertificates.push(cert.id);
        }
      });
    });
    (state.processes||[]).forEach((x,i)=>{x.workInstruction=x.workInstruction||{id:`WI-${x.id}`,revision:x.revision||'A',title:`Work instruction · ${x.name}`,status:x.status==='Released'?'Released':'Draft',steps:[`Verify material/configuration for ${x.name}`,`Perform ${x.name} using controlled parameters`,`Record required evidence in the guided build execution`]};x.fixedCharge=Number(x.fixedCharge??(8+(i%5)*4));x.consumableCost=Number(x.consumableCost??(3+(i%4)*2));});
    (state.standardTests||[]).forEach((x,i)=>{x.fixedCharge=Number(x.fixedCharge??(18+(i%4)*6));x.consumableCost=Number(x.consumableCost??(4+(i%3)*3));x.workInstruction=x.workInstruction||{id:`WI-${x.id}`,revision:x.revision||'A',title:`Test instruction · ${x.name}`,status:'Released',steps:[`Prepare ${x.name} setup`,`Execute controlled method`,`Retain raw results and disposition`]};const e=x.externalSourcing&&typeof x.externalSourcing==='object'?x.externalSourcing:{};x.externalSourcing={enabled:e.enabled===true,supplier:String(e.supplier||''),currency:String(e.currency||'EUR'),pricingBasis:['fixed','unit','batch'].includes(String(e.pricingBasis||''))?String(e.pricingBasis):'fixed',price:Number(e.price||0),setupFee:Number(e.setupFee||0),transportCost:Number(e.transportCost||0),leadDays:Number(e.leadDays||0),reference:String(e.reference||''),evidenceType:['Quote','Invoice','Other'].includes(String(e.evidenceType||''))?String(e.evidenceType):'Quote',validFrom:e.validFrom||null,validUntil:e.validUntil||null,fileName:e.fileName||null,fileType:e.fileType||null,fileSize:Number(e.fileSize||0),fileData:e.fileData||null,evidenceUploadedAt:e.evidenceUploadedAt||null,evidenceUploadedBy:e.evidenceUploadedBy||null,lastUpdatedAt:e.lastUpdatedAt||null,lastUpdatedBy:e.lastUpdatedBy||null};x.externalSourcingHistory=Array.isArray(x.externalSourcingHistory)?x.externalSourcingHistory:[];});
    // REV 1.0.128 — preserve commercial evidence provenance when benchmark terms change.
    ProtoLab.externalSourcingCommercialSignatureV124 = ProtoLab.externalSourcingCommercialSignatureV124 || (e=>JSON.stringify(['enabled','supplier','currency','pricingBasis','price','setupFee','transportCost','leadDays','reference','evidenceType','validFrom','validUntil'].map(k=>e?.[k]??null)));
    ProtoLab.archiveExternalSourcingRevisionV124 = ProtoLab.archiveExternalSourcingRevisionV124 || ((test,previous,{actor='System',reason='Commercial benchmark changed'}={})=>{if(!test||!previous||typeof previous!=='object'||!Object.keys(previous).length)return null;test.externalSourcingHistory=Array.isArray(test.externalSourcingHistory)?test.externalSourcingHistory:[];const rec={...ProtoLab.deepClone(previous),historyId:ProtoLab.uid('EXTSRCREV'),supersededAt:ProtoLab.now(),supersededBy:actor,supersededReason:reason};test.externalSourcingHistory.unshift(rec);return rec;});
    (state.materials||[]).forEach((m,i)=>{m.unitCost=Number(m.unitCost??(6+(i%7)*4));});
    (state.calibrationCertificates||[]).forEach(c=>{if(!c.fileData&&String(c.evidence||'').startsWith('Demo calibration certificate')){c.fileName=c.fileName||`${c.certificateNo||c.id}-demo.txt`;c.fileType='text/plain';c.fileData='data:text/plain;base64,REVNTyBDQUxJQlJBVElPTiBDRVJUSUZJQ0FURSAtIFBST1RPTEFCIE9T';c.documentUploaded=true;}});
    (state.equipment||[]).forEach((e,i)=>{
      e.equipmentType=e.equipmentType||String(e.name||'Equipment').replace(/\s+(?:[A-Z]|\d+)$/,'').replace(/\s+\d+$/,'').trim();
      e.hourlyCost=Number(e.hourlyCost||55);
      e.lastMaintenance=e.lastMaintenance||new Date(today.getTime()-(30+(i%5)*14)*86400000).toISOString().slice(0,10);
      e.maintenanceDue=e.maintenanceDue||new Date(today.getTime()+(20+(i%5)*25)*86400000).toISOString().slice(0,10);
      e.maintenanceStatus=e.maintenanceStatus||'Valid';
      e.calibrationStatus=e.calibrationStatus||'Valid';
      e.calibrationDurationHours=Number(e.calibrationDurationHours||4);
      e.maintenanceDurationHours=Number(e.maintenanceDurationHours||4);
      if(state.settings?.demoDataset && e.calibrationRequired!==false && !state.calibrationCertificates.some(c=>c.equipmentId===e.id)){
        const due=new Date(`${e.calibrationDue||ProtoLab.todayISO()}T12:00:00`);const completed=new Date(due.getTime()-180*86400000);
        state.calibrationCertificates.push({id:`CALCERT-${e.id}-SEED`,equipmentId:e.id,certificateNo:`CAL-${e.id}-2026`,issuer:'Accredited Calibration Lab (Demo)',referenceStandard:'Traceable reference standard',completedAt:completed.toISOString().slice(0,10),nextDue:e.calibrationDue,result:'Pass',status:'Valid',evidence:`Demo calibration certificate ${e.id}`,person:'Daan Mulder',fileName:`CAL-${e.id}-2026-demo.txt`,fileType:'text/plain',fileData:'data:text/plain;base64,REVNTyBDQUxJQlJBVElPTiBDRVJUSUZJQ0FURSAtIFBST1RPTEFCIE9T',documentUploaded:true});
      }
      e.calibrationCertificateValid=!!ProtoLab.validCalibrationCertificate(state,e.id,ProtoLab.todayISO());
    });
    (state.buildHistory||[]).forEach((h,i)=>{
      const q=Math.max(1,Number(h.quantity||1)), base=900+q*185+(i%6)*65;
      h.estimatedCost=Number(h.estimatedCost??base);
      h.actualCost=Number(h.actualCost??(h.estimatedCost*(0.93+(i%7)*0.025)));
      h.costOfPoorQuality=Number(h.costOfPoorQuality??(Number(h.reworkHours||0)*Number(state.settings.finance.roleRates.technician||58)+Number(h.scrapRate||0)*q*150));
      h.costPerUnit=Number(h.costPerUnit??(h.actualCost/q));
    });
    if(!state.pipelineProjects.length){
      const ids=(state.products||[]).map(p=>p.id); state.pipelineProjects=[
        {id:'PIPE-001',name:'Next-gen brake sensor DV',productId:ids[0],probability:0.85,startDate:new Date(today.getTime()+45*86400000).toISOString().slice(0,10),quantity:30,programme:'Platform X refresh',owner:'Mila Jansen'},
        {id:'PIPE-002',name:'48V current sensing concept',productId:ids[1],probability:0.60,startDate:new Date(today.getTime()+80*86400000).toISOString().slice(0,10),quantity:24,programme:'Electrification study',owner:'Jonas Meijer'},
        {id:'PIPE-003',name:'Hydrogen sensing customer trial',productId:ids[4],probability:0.45,startDate:new Date(today.getTime()+110*86400000).toISOString().slice(0,10),quantity:18,programme:'H2 demonstrator',owner:'Eva de Vries'},
        {id:'PIPE-004',name:'Steering torque sample refresh',productId:ids[6],probability:0.70,startDate:new Date(today.getTime()+65*86400000).toISOString().slice(0,10),quantity:20,programme:'Chassis update',owner:'Mila Jansen'}
      ];
    }
    (state.pipelineProjects||[]).forEach(p=>{p.owner=p.owner||'Unassigned';const auto=ProtoLab.pipelineProjectCost(state,p);if(!Number.isFinite(Number(p.estimatedCost))||Number(p.estimatedCost)<=0){p.estimatedCost=Number(auto.toFixed(2));p.costSource='auto';}else p.estimatedCost=Number(p.estimatedCost);p.costSource=p.costSource||'auto';});
    return state;
  };
  ProtoLab.staffQualification = (state,staff,skillId,onDate=ProtoLab.todayISO()) => {
    if(!staff||!skillId)return {valid:!!staff,reason:staff?'No skill required':'No staff'};
    // REV 1.0.88: a certificate is not usable before its effective/completion date.
    // Previously a future-dated Valid certificate could make a person appear qualified today.
    const cert=(state.trainingCertificates||[]).find(c=>{if(c.staffId!==staff.id||c.skillId!==skillId||c.status!=='Valid')return false;const effective=String(c.validFrom||c.completedAt||c.issuedAt||'').slice(0,10);return (!effective||effective<=onDate)&&(!c.expiresAt||c.expiresAt>=onDate)});
    return {valid:!!cert,certificate:cert,reason:cert?`Certificate ${cert.certificateNo||cert.id} valid ${String(cert.validFrom||cert.completedAt||cert.issuedAt||'').slice(0,10)||'from issue'} to ${cert.expiresAt||'no stated expiry'}`:`No effective valid training certificate for ${skillId} on ${onDate}`};
  };
  ProtoLab.validCalibrationCertificate = (state,equipmentId,onDate=ProtoLab.todayISO()) => {
    const certs=(state?.calibrationCertificates||[]).filter(c=>c.equipmentId===equipmentId&&c.result==='Pass'&&c.status==='Valid'&&(c.fileData||c.documentUploaded===true)&&c.completedAt&&c.completedAt<=onDate&&c.nextDue&&c.nextDue>=onDate);
    certs.sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)));
    return certs[0]||null;
  };
  ProtoLab.equipmentReady = (e,onDate=ProtoLab.todayISO(),state=null) => {
    if(!e)return false;
    const certOk=state?!!ProtoLab.validCalibrationCertificate(state,e.id,onDate):e.calibrationCertificateValid===true;
    return certOk && e.calibrationStatus==='Valid' && (!e.calibrationDue||e.calibrationDue>=onDate) && e.maintenanceStatus!=='Overdue' && (!e.maintenanceDue||e.maintenanceDue>=onDate);
  };

  ProtoLab.projectedEquipmentReady = (state,e,onDate=ProtoLab.todayISO()) => {
    if(!e)return false; if(ProtoLab.equipmentReady(e,onDate,state))return true;
    const t=new Date(onDate); const care=(state.resourceCareBookings||[]).filter(x=>x.status==='Scheduled'&&x.equipmentId===e.id);
    const calOk=e.calibrationStatus==='Valid'&&(!e.calibrationDue||e.calibrationDue>=onDate) || care.some(x=>x.type==='Calibration'&&new Date(x.start)<=t&&(!x.projectedNextDue||x.projectedNextDue>=onDate));
    const mntOk=e.maintenanceStatus!=='Overdue'&&(!e.maintenanceDue||e.maintenanceDue>=onDate) || care.some(x=>x.type==='Maintenance'&&new Date(x.start)<=t&&(!x.projectedNextDue||x.projectedNextDue>=onDate));
    return calOk&&mntOk;
  };
  ProtoLab.projectedStaffQualification = (state,staff,skillId,onDate=ProtoLab.todayISO()) => {
    const q=ProtoLab.staffQualification(state,staff,skillId,onDate); if(q.valid)return q;
    const b=(state.resourceCareBookings||[]).find(x=>x.status==='Scheduled'&&x.type==='Training'&&x.staffId===staff?.id&&x.skillId===skillId&&x.start<=`${onDate}T23:59:59`&&(!x.projectedNextDue||x.projectedNextDue>=onDate));
    return {valid:!!b,planned:b||null,reason:b?`Renewal training scheduled ${b.start.slice(0,10)}; projected valid to ${b.projectedNextDue}`:`No valid or scheduled qualification for ${skillId}`};
  };


  // REV 1.0.56 — governed setup dossiers, calibration approval, MSA and controlled exceptions.
  const _ensureEnterpriseModel1055 = ProtoLab.ensureEnterpriseModel;
  ProtoLab.ensureEnterpriseModel = state => {
    state=_ensureEnterpriseModel1055(state);
    state.gageRRStudies=Array.isArray(state.gageRRStudies)?state.gageRRStudies:[];
    state.gageRRStudies.forEach(study=>{study.standardTestId=study.standardTestId||'';study.studyDate=study.studyDate||String(study.createdAt||ProtoLab.now()).slice(0,10);study.sourceType=study.sourceType||'LabOS calculated';study.conclusion=study.conclusion||(study.result?.valid&&Number(study.result?.studyPct)<10?'Acceptable':study.result?.valid&&Number(study.result?.studyPct)<=30?'Conditionally acceptable':study.result?.valid?'Not acceptable':'Review required');study.documentUploaded=!!(study.documentUploaded||study.fileData);});
    state.adminExceptions=Array.isArray(state.adminExceptions)?state.adminExceptions:[];
    state.processSkipApprovals=Array.isArray(state.processSkipApprovals)?state.processSkipApprovals:[];
    const legacyDoc=(id,title,approved=true)=>({id,title,revision:'A',status:approved?'Approved':'Draft',reference:approved?`${id}-LEGACY-RELEASE`:'',description:approved?'Migrated from a previously released/commissioned controlled definition.':'',approvedBy:approved?'Migration / prior release evidence':'',approvedAt:approved?ProtoLab.now():null,fileName:'',fileData:null,documentUploaded:false});
    const ensureDoc=(obj,key,id,title,approved)=>{if(!obj[key])obj[key]=legacyDoc(id,title,approved);else{const d=obj[key];d.id=d.id||id;d.title=d.title||title;d.revision=d.revision||'A';d.status=d.status||((approved&&d.reference)?'Approved':'Draft');d.reference=d.reference||'';d.description=d.description||'';d.fileName=d.fileName||'';d.documentUploaded=!!(d.documentUploaded||d.fileData);if(d.status==='Approved'){d.approvedBy=d.approvedBy||'Migration / prior release evidence';d.approvedAt=d.approvedAt||ProtoLab.now();}}return obj[key];};
    const seedProcessDocs=proc=>{
      const approved=proc.status==='Released';
      ensureDoc(proc,'ehsRiskAssessment',`EHS-${proc.id||'PROCESS'}`,`EHS risk assessment · ${proc.name||proc.id||'process'}`,approved);
      ensureDoc(proc,'commissioningDocument',`COMM-${proc.id||'PROCESS'}`,`Process release / commissioning · ${proc.name||proc.id||'process'}`,approved);
      if(proc.workInstruction&&typeof proc.workInstruction==='object'){proc.workInstruction.status=proc.workInstruction.status||(approved?'Released':'Draft');proc.workInstruction.revision=proc.workInstruction.revision||'A';}
      (proc.revisionHistory||[]).forEach(h=>{if(h?.snapshot){const snap=h.snapshot,ok=snap.status==='Released'||h.status==='Released';ensureDoc(snap,'ehsRiskAssessment',`EHS-${snap.id||proc.id}-${h.rev||h.revision||'HIST'}`,`EHS risk assessment · ${snap.name||proc.name||proc.id}`,ok);ensureDoc(snap,'commissioningDocument',`COMM-${snap.id||proc.id}-${h.rev||h.revision||'HIST'}`,`Process release / commissioning · ${snap.name||proc.name||proc.id}`,ok);}});
    };
    (state.processes||[]).forEach(seedProcessDocs);
    (state.standardTests||[]).forEach(test=>{const approved=test.status==='Released';ensureDoc(test,'ehsRiskAssessment',`EHS-${test.id}`,`EHS risk assessment · ${test.name}`,approved);ensureDoc(test,'commissioningDocument',`COMM-${test.id}`,`Test setup release / commissioning · ${test.name}`,approved);if(test.workInstruction&&typeof test.workInstruction==='object'){test.workInstruction.status=test.workInstruction.status||(approved?'Released':'Draft');test.workInstruction.revision=test.workInstruction.revision||'A';}});
    (state.equipment||[]).forEach(e=>{
      const commissioned=!['Commissioning','Out of service'].includes(e.status);
      ensureDoc(e,'ehsRiskAssessment',`EHS-${e.id}`,`EHS / setup risk assessment · ${e.name}`,commissioned);
      ensureDoc(e,'commissioningDocument',`COMM-${e.id}`,`Equipment setup release / commissioning · ${e.name}`,commissioned);
      e.calibrationMode=e.calibrationMode||'External';
      if(!e.calibrationProcedure)e.calibrationProcedure=legacyDoc(`CALPROC-${e.id}`,`Calibration procedure · ${e.name}`,e.calibrationMode!=='In-house');
      if(e.calibrationMode==='In-house'&&e.calibrationProcedure.status==='Approved'&&!e.calibrationProcedure.description&&!e.calibrationProcedure.reference&&!e.calibrationProcedure.fileData){e.calibrationProcedure.status='Draft';e.calibrationProcedure.approvedBy='';e.calibrationProcedure.approvedAt=null;}
    });
    (state.calibrationCertificates||[]).forEach(c=>{
      c.documentUploaded=!!(c.documentUploaded||c.fileData);
      if(!c.sourceType)c.sourceType='Legacy / imported';
      // Existing valid certificates were already accepted in previous controlled revisions. New certificates are always pending approval.
      if(!c.approvalStatus){c.approvalStatus=c.status==='Valid'?'Approved':'Pending approval';if(c.approvalStatus==='Approved'){c.approvedBy=c.approvedBy||'Migration / prior certificate review';c.approvedAt=c.approvedAt||c.completedAt||ProtoLab.now();c.approvalRationale=c.approvalRationale||'Grandfathered prior controlled certificate acceptance.';}}
    });
    (state.routes||[]).forEach(route=>(route.steps||[]).forEach(step=>{step.skipStatus=step.skipStatus||null;step.skipApprovalId=step.skipApprovalId||null;}));
    return state;
  };
  ProtoLab.controlledDocumentApproved = d => !!d && d.status==='Approved' && !!(String(d.reference||'').trim() || d.fileData || d.documentUploaded===true || String(d.description||'').trim()) && !!d.approvedBy;
  ProtoLab.processGovernanceAssessment = proc => {
    if(!proc)return {ready:false,issues:['Process definition not found']};
    const issues=[];
    const wi=proc.workInstruction;
    if(!(wi && (wi.status==='Released'||wi.status==='Approved') && Array.isArray(wi.steps) && wi.steps.length))issues.push('Released work instruction');
    if(!ProtoLab.controlledDocumentApproved(proc.ehsRiskAssessment))issues.push('Approved EHS risk assessment');
    if(!ProtoLab.controlledDocumentApproved(proc.commissioningDocument))issues.push('Approved process release / commissioning evidence');
    return {ready:issues.length===0,issues};
  };
  ProtoLab.equipmentGovernanceAssessment = e => {
    if(!e)return {ready:false,issues:['Equipment not found']};
    const issues=[];
    if(!ProtoLab.controlledDocumentApproved(e.ehsRiskAssessment))issues.push('Approved EHS / setup risk assessment');
    if(!ProtoLab.controlledDocumentApproved(e.commissioningDocument))issues.push('Approved equipment setup release / commissioning evidence');
    if(e.calibrationMode==='In-house'&&!ProtoLab.controlledDocumentApproved(e.calibrationProcedure))issues.push('Approved in-house calibration procedure');
    return {ready:issues.length===0,issues};
  };
  ProtoLab.activeAdminException = (state,scopeType,scopeId,condition='') => (state?.adminExceptions||[]).find(x=>x.status==='Active'&&String(x.scopeType||'').toLowerCase()===String(scopeType||'').toLowerCase()&&x.scopeId===scopeId&&(!x.expiresAt||x.expiresAt>=ProtoLab.todayISO())&&(!condition||!x.condition||x.condition===condition));
  const _processRevisionReleaseAssessment1055=ProtoLab.processRevisionReleaseAssessment;
  ProtoLab.processRevisionReleaseAssessment=(state,requestId,route)=>{
    const out=_processRevisionReleaseAssessment1055(state,requestId,route);
    out.rows=out.rows.map(row=>{
      if(!row.ok||row.type!=='standard')return row;
      const gov=ProtoLab.processGovernanceAssessment(row.definition),exception=ProtoLab.activeAdminException(state,'Process',row.step?.processId,'Process governance');
      if(gov.ready||exception)return {...row,governance:gov,exception,ok:true};
      return {...row,governance:gov,ok:false,detail:`${row.step?.name||row.step?.processId||'Process'} · routed revision lacks ${gov.issues.join(', ')}.`};
    });
    out.unresolved=out.rows.filter(x=>!x.ok);out.ready=!!(route?.steps?.length)&&out.rows.every(x=>x.ok);return out;
  };
  ProtoLab.validCalibrationCertificate = (state,equipmentId,onDate=ProtoLab.todayISO()) => {
    const certs=(state?.calibrationCertificates||[]).filter(c=>c.equipmentId===equipmentId&&c.result==='Pass'&&c.status==='Valid'&&c.approvalStatus==='Approved'&&!!c.approvedBy&&(c.fileData||c.documentUploaded===true)&&c.completedAt&&c.completedAt<=onDate&&c.nextDue&&c.nextDue>=onDate);
    certs.sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)));return certs[0]||null;
  };
  ProtoLab.equipmentReady = (e,onDate=ProtoLab.todayISO(),state=null) => {
    if(!e)return false;
    const governanceOk=state?ProtoLab.equipmentGovernanceAssessment(e).ready:true;
    const certOk=state?!!ProtoLab.validCalibrationCertificate(state,e.id,onDate):e.calibrationCertificateValid===true;
    return governanceOk && certOk && e.calibrationStatus==='Valid' && (!e.calibrationDue||e.calibrationDue>=onDate) && e.maintenanceStatus!=='Overdue' && (!e.maintenanceDue||e.maintenanceDue>=onDate);
  };
  const _projectedEquipmentReady1056=ProtoLab.projectedEquipmentReady;
  ProtoLab.projectedEquipmentReady = (state,e,onDate=ProtoLab.todayISO()) => {
    if(!e)return false;
    const governance=ProtoLab.equipmentGovernanceAssessment(e),exception=ProtoLab.activeAdminException(state,'Equipment',e.id,'Equipment governance');
    if(!governance.ready&&!exception)return false;
    return _projectedEquipmentReady1056(state,e,onDate);
  };


  /* REV 1.0.68 — planning resource semantics. Planning uses an explicit
     capability layer so a process is only scheduled on a technically
     suitable setup rather than any resource in a broad demo category. */
  ProtoLab.equipmentPlanningCapability = e => e?.planningCapability || e?.capability || null;
  ProtoLab.equipmentOperationalForPlanning = e => !!e&&!/(out\s*of\s*service|broken|failed|unavailable|retired|decommissioned|quarantine|scrap)/i.test(String(e.status||'Available'));
  ProtoLab.planningSkillForProcess = proc => proc?.planningCompetency || proc?.competency || null;
  ProtoLab.planningCapabilityForTest = test => test?.planningCapability || test?.equipmentCapability || null;
  ProtoLab.planningCapabilityForProcess = (state,r,proc) => {
    if(!proc)return null;
    if(proc.planningCapability!==undefined)return proc.planningCapability;
    const n=String(proc.name||'').toLowerCase(),product=String(r?.productFamily||state?.products?.find(p=>p.id===r?.productId)?.family||'').toLowerCase();
    if(/material receipt|cleaning$|surface preparation|mechanical assembly|packaging|soldering|ultrasonic cleaning|conformal coat/.test(n))return null;
    if(/incoming inspection|optical inspection|final inspection|x-ray/.test(n))return 'Optical Inspection';
    if(/adhesive dispense|potting/.test(n))return 'Potting / Dispense';
    if(/laser welding|resistance welding/.test(n))return 'Laser Welding';
    if(/fastening|torque/.test(n))return 'Torque / Fastening';
    if(/cure|thermal soak/.test(n))return 'Environmental Chamber';
    if(/programming|flashing/.test(n))return 'Programming / Flashing';
    if(/leak testing/.test(n))return 'Helium Leak Test';
    if(/electrical test|functional verification/.test(n))return 'Electrical Test';
    if(/dimensional inspection/.test(n))return 'Dimensional Metrology';
    if(/pressure cycling/.test(n))return 'Pressure Calibration';
    if(/^calibration$/.test(n)){
      if(/pressure|coolant|thermal valve/.test(product))return 'Pressure Calibration';
      if(/torque/.test(product))return 'Torque / Fastening';
      if(/hydrogen|leak/.test(product))return 'Helium Leak Test';
      return 'Electrical Test';
    }
    return proc.equipmentCapability||null;
  };
  ProtoLab.ensurePlanningCapabilityModelV1068 = state => {
    if(!state)return {changed:false,bookingsRepaired:0,resourceMismatches:0};
    let changed=false,repaired=0,mismatches=0;
    const equip={
      'EQ-001':'Laser Welding','EQ-002':'Laser Welding','EQ-003':'Helium Leak Test','EQ-004':'Pressure Calibration',
      'EQ-005':'Torque / Fastening','EQ-006':'Dimensional Metrology','EQ-007':'Electrical Test','EQ-008':'Electrical Test',
      'EQ-009':'Environmental Chamber','EQ-010':'Programming / Flashing','EQ-011':'Optical Inspection','EQ-012':'Potting / Dispense'
    };
    const procSkill={
      'PROC-001':'COMP-01','PROC-002':'COMP-05','PROC-003':'COMP-01','PROC-004':'COMP-01','PROC-005':'COMP-01','PROC-006':'COMP-02','PROC-007':'COMP-02','PROC-008':'COMP-01','PROC-009':'COMP-01','PROC-010':'COMP-01','PROC-011':'COMP-01','PROC-012':'COMP-01','PROC-013':'COMP-08','PROC-014':'COMP-06','PROC-015':'COMP-07','PROC-016':'COMP-04','PROC-017':'COMP-03','PROC-018':'COMP-05','PROC-019':'COMP-05','PROC-020':'COMP-03','PROC-021':'COMP-05','PROC-022':'COMP-01','PROC-023':'COMP-01','PROC-024':'COMP-01','PROC-025':'COMP-08','PROC-026':'COMP-08','PROC-027':'COMP-01','PROC-028':'COMP-05'
    };
    const testCaps={'TST-001':'Electrical Test','TST-002':'Dimensional Metrology','TST-003':'Helium Leak Test','TST-004':'Electrical Test','TST-005':'Electrical Test','TST-006':'Electrical Test','TST-007':'Pressure Calibration','TST-008':'Environmental Chamber'};
    const isDemo=ProtoLab.isDemoDataset?ProtoLab.isDemoDataset(state):state?.settings?.demoDataset===true;
    if(isDemo){
      for(const e of state.equipment||[]){const v=equip[e.id];if(v&&e.planningCapability!==v){e.planningCapability=v;changed=true}}
      for(const p of state.processes||[]){const sk=procSkill[p.id];if(sk&&p.planningCompetency!==sk){p.planningCompetency=sk;changed=true}}
      for(const t of state.standardTests||[]){const v=testCaps[t.id];if(v&&t.planningCapability!==v){t.planningCapability=v;changed=true}}
    }
    const expected = b => {
      const r=(state.requests||[]).find(x=>x.id===b.requestId),route=(state.routes||[]).find(x=>x.requestId===b.requestId),step=route?.steps?.find(x=>x.id===b.stepId);
      if(step){const proc=(state.processes||[]).find(x=>x.id===step.processId);return {cap:ProtoLab.planningCapabilityForProcess(state,r,proc),skill:ProtoLab.planningSkillForProcess(proc),step};}
      const tr=(r?.testRequirements||[]).find(x=>x.id===b.stepId);if(tr){const test=(state.standardTests||[]).find(x=>x.id===tr.standardTestId);return {cap:ProtoLab.planningCapabilityForTest(test),skill:test?.competency||tr.competency||b.skillId||null,step:null};}
      return {cap:b.equipmentCapability||b.capability||null,skill:b.skillId||null,step:null};
    };
    const overlaps=(a,b,c,d)=>new Date(a)<new Date(d)&&new Date(b)>new Date(c);
    const freeEq=(id,b)=>!(state.bookings||[]).some(x=>x.id!==b.id&&x.equipmentId===id&&overlaps(b.start,b.end,x.start,x.end))&&!(state.resourceCareBookings||[]).some(x=>x.status==='Scheduled'&&x.equipmentId===id&&overlaps(b.start,b.end,x.start,x.end));
    const freeStaff=(id,b)=>!(state.bookings||[]).some(x=>x.id!==b.id&&x.staffId===id&&overlaps(b.start,b.end,x.start,x.end))&&!(state.resourceCareBookings||[]).some(x=>x.status==='Scheduled'&&x.staffId===id&&overlaps(b.start,b.end,x.start,x.end));
    const exp=new Map((state.bookings||[]).map(b=>[b.id,expected(b)]));
    // First clear technically invalid legacy assignments so they cannot block a correct candidate.
    for(const b of state.bookings||[]){const x=exp.get(b.id),eq=(state.equipment||[]).find(e=>e.id===b.equipmentId),staff=(state.staff||[]).find(s=>s.id===b.staffId);if(x.cap===null&&b.equipmentId){b.equipmentId=null;changed=true;repaired++;}else if(x.cap&&(!eq||ProtoLab.equipmentPlanningCapability(eq)!==x.cap)){b.equipmentId=null;changed=true;mismatches++;}if(x.skill&&staff&&!(staff.competencies||[]).includes(x.skill)){b.staffId=null;changed=true;mismatches++;}}
    for(const b of (state.bookings||[]).slice().sort((a,c)=>new Date(a.start)-new Date(c.start))){const x=exp.get(b.id);if(x.cap&&!b.equipmentId){const candidates=(state.equipment||[]).filter(e=>ProtoLab.equipmentPlanningCapability(e)===x.cap);const chosen=candidates.find(e=>freeEq(e.id,b));if(chosen){b.equipmentId=chosen.id;changed=true;repaired++;if(x.step)x.step.equipmentId=chosen.id}else{b.status='Resource reassignment required';b.risk=true;}}
      if(x.skill&&!b.staffId){const candidates=(state.staff||[]).filter(s=>s.available!==false&&(s.competencies||[]).includes(x.skill));const chosen=candidates.find(s=>freeStaff(s.id,b));if(chosen){b.staffId=chosen.id;changed=true;repaired++;if(x.step)x.step.owner=chosen.name}else{b.status='Resource reassignment required';b.risk=true;}}
      b.planningCapability=x.cap||null;b.skillId=x.skill||b.skillId||null;
    }
    state.settings=state.settings||{};if(state.settings.planningResourceSemanticsVersion!=='1.0.68'){state.settings.planningResourceSemanticsVersion='1.0.68';changed=true}
    return {changed,bookingsRepaired:repaired,resourceMismatches:mismatches};
  };
  const _ensurePlanningModelV1068=ProtoLab.ensurePlanningModel;
  ProtoLab.ensurePlanningModel = state => {state=_ensurePlanningModelV1068(state);ProtoLab.ensurePlanningCapabilityModelV1068(state);return state;};


  /* REV 1.0.79 — time-accurate projected readiness. A care/training activity
     only makes a resource usable after that activity has actually finished,
     not merely because it occurs on the same calendar date. */
  ProtoLab.projectedEquipmentReadyAt = (state,e,useStart=ProtoLab.now()) => {
    if(!e)return false;
    const t=new Date(useStart||ProtoLab.now()),onDate=t.toISOString().slice(0,10);
    const governance=ProtoLab.equipmentGovernanceAssessment?ProtoLab.equipmentGovernanceAssessment(e):{ready:true};
    const exception=ProtoLab.activeAdminException?.(state,'Equipment',e.id,'Equipment governance');
    if(!governance.ready&&!exception)return false;
    const care=(state?.resourceCareBookings||[]).filter(x=>x.status==='Scheduled'&&x.equipmentId===e.id&&new Date(x.end||x.start)<=t);
    const cert=ProtoLab.validCalibrationCertificate?.(state,e.id,onDate);
    const calBase=e.calibrationRequired===false || (!!cert&&e.calibrationStatus==='Valid'&&(!e.calibrationDue||e.calibrationDue>=onDate));
    const calOk=calBase || care.some(x=>x.type==='Calibration'&&(!x.projectedNextDue||x.projectedNextDue>=onDate));
    const mntBase=e.maintenanceStatus!=='Overdue'&&(!e.maintenanceDue||e.maintenanceDue>=onDate);
    const mntOk=mntBase || care.some(x=>x.type==='Maintenance'&&(!x.projectedNextDue||x.projectedNextDue>=onDate));
    return !!(calOk&&mntOk);
  };
  ProtoLab.projectedStaffQualificationAt = (state,staff,skillId,useStart=ProtoLab.now()) => {
    if(!staff)return {valid:false,reason:'No staff assigned'};
    if(!skillId)return {valid:true,reason:'No specific competency required'};
    const t=new Date(useStart||ProtoLab.now()),onDate=t.toISOString().slice(0,10),q=ProtoLab.staffQualification(state,staff,skillId,onDate);
    if(q.valid)return q;
    const planned=(state?.resourceCareBookings||[]).filter(x=>x.status==='Scheduled'&&x.type==='Training'&&x.staffId===staff.id&&x.skillId===skillId&&new Date(x.end||x.start)<=t&&(!x.projectedNextDue||x.projectedNextDue>=onDate)).sort((a,b)=>String(b.end||b.start).localeCompare(String(a.end||a.start)))[0];
    return {valid:!!planned,planned:planned||null,reason:planned?`Training completed before planned use; projected valid to ${planned.projectedNextDue||'future due date'}`:`No valid qualification completed before planned use`};
  };


  /* REV 1.0.89 — requesting / engineering teams are organisation master data.
     Keep request snapshots as names for readable audit history, while stable IDs
     support renames, deactivation and user defaults without hard-coded lists. */
  ProtoLab.ensureRequestingTeamModel = state => {
    state=state||{};
    const oldNames=Array.isArray(state.teams)?state.teams.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()):[];
    const legacyDemo=['ADAS Sensors','Powertrain Electronics','Thermal Systems','Chassis Controls','Electrification','Advanced Engineering'];
    const powerToolDemo=['Power Tool Platform','Mechanical Design','Motor & Drive Systems','Electronics & Controls','Battery Systems','Advanced Engineering'];
    const isDemo=!!state.settings?.demoDataset;
    let seedNames=oldNames;
    if(isDemo && oldNames.length && oldNames.every(x=>legacyDemo.includes(x))) seedNames=powerToolDemo;
    state.requestingTeams=Array.isArray(state.requestingTeams)?state.requestingTeams:[];
    const demoMap={'ADAS Sensors':'Power Tool Platform','Powertrain Electronics':'Motor & Drive Systems','Thermal Systems':'Mechanical Design','Chassis Controls':'Mechanical Design','Electrification':'Electronics & Controls'};
    if(isDemo){
      for(const u of state.users||[]){if(demoMap[u.team])u.team=demoMap[u.team];}
      for(const r of state.requests||[]){if(demoMap[r.engineeringTeam])r.engineeringTeam=demoMap[r.engineeringTeam];}
    }
    if(!state.requestingTeams.length){
      const engUserTeams=(state.users||[]).filter(u=>['engineering_requester','engineering_lead'].includes(u.role)).map(u=>u.team);
      let used=[...new Set([...(seedNames||[]),...(state.requests||[]).map(r=>r.engineeringTeam),...engUserTeams].filter(Boolean).map(x=>String(x).trim()).filter(Boolean))];
      if(isDemo)used=used.filter(x=>!Object.prototype.hasOwnProperty.call(demoMap,x));
      const source=used.length?used:(isDemo?powerToolDemo:[]);
      state.requestingTeams=source.map((name,i)=>({id:`TEAM-${String(i+1).padStart(3,'0')}`,name,businessUnit:isDemo?'Power Tools':'',defaultSite:state.settings?.auditProfile?.site||'',teamLead:'',active:true,memberUserIds:[]}));
    }
    const seenIds=new Set(),seenNames=new Set();
    state.requestingTeams=state.requestingTeams.filter(Boolean).map((t,i)=>{
      if(typeof t==='string')t={name:t};
      let id=String(t.id||`TEAM-${String(i+1).padStart(3,'0')}`).trim(),n=2;while(seenIds.has(id)){id=`${id}-${n++}`;}seenIds.add(id);
      const name=String(t.name||`Requesting Team ${i+1}`).trim();
      const key=name.toLowerCase();if(seenNames.has(key)){let j=2,nn=name;while(seenNames.has(nn.toLowerCase()))nn=`${name} ${j++}`;t.name=nn;}else t.name=name;seenNames.add(String(t.name).toLowerCase());
      t.id=id;t.businessUnit=String(t.businessUnit||'').trim();t.defaultSite=String(t.defaultSite||'').trim();t.teamLead=String(t.teamLead||'').trim();t.active=t.active!==false;t.memberUserIds=Array.isArray(t.memberUserIds)?[...new Set(t.memberUserIds.filter(Boolean))]:[];return t;
    });
    const byId=new Map(state.requestingTeams.map(t=>[t.id,t])),byName=new Map(state.requestingTeams.map(t=>[t.name.toLowerCase(),t]));
    for(const u of state.users||[]){
      let team=(u.teamId&&byId.get(u.teamId))||byName.get(String(u.team||'').toLowerCase());
      if(team){u.teamId=team.id;u.team=team.name;if(!team.memberUserIds.includes(u.id))team.memberUserIds.push(u.id);}
    }
    for(const r of state.requests||[]){
      let team=(r.engineeringTeamId&&byId.get(r.engineeringTeamId))||byName.get(String(r.engineeringTeam||'').toLowerCase());
      if(team){r.engineeringTeamId=team.id;r.engineeringTeam=r.engineeringTeam||team.name;}
    }
    state.teams=state.requestingTeams.filter(t=>t.active!==false).map(t=>t.name);
    return state;
  };
  ProtoLab.activeRequestingTeams = state => {ProtoLab.ensureRequestingTeamModel(state);return (state.requestingTeams||[]).filter(t=>t.active!==false).slice().sort((a,b)=>String(a.name).localeCompare(String(b.name)));};
  ProtoLab.requestingTeamByIdOrName = (state,id,name='') => {ProtoLab.ensureRequestingTeamModel(state);return (state.requestingTeams||[]).find(t=>id&&t.id===id)||(state.requestingTeams||[]).find(t=>String(t.name).toLowerCase()===String(name||id||'').toLowerCase())||null;};
  const _ensureEnterpriseModelV1089=ProtoLab.ensureEnterpriseModel;
  ProtoLab.ensureEnterpriseModel=state=>{state=_ensureEnterpriseModelV1089(state);ProtoLab.ensureRequestingTeamModel(state);for(const p of state.pipelineProjects||[]){let v=Number(p.probability??0);if(v>1&&v<=100)v/=100;p.probability=Math.max(0,Math.min(1,Number.isFinite(v)?v:0));}return state;};
  const _validateInvariantsV1089=ProtoLab.validateInvariants;
  ProtoLab.validateInvariants=state=>{
    const out=_validateInvariantsV1089(state);ProtoLab.ensureRequestingTeamModel(state);
    const ids=new Set(),names=new Set();
    for(const t of state.requestingTeams||[]){if(!t.id)out.push('Requesting team missing stable ID');else if(ids.has(t.id))out.push(`Duplicate requesting team ID ${t.id}`);else ids.add(t.id);const key=String(t.name||'').trim().toLowerCase();if(!key)out.push(`Requesting team ${t.id||'unknown'} has no name`);else if(names.has(key))out.push(`Duplicate requesting team name ${t.name}`);else names.add(key);}
    for(const r of state.requests||[]){if(r.engineeringTeamId&&!ids.has(r.engineeringTeamId))out.push(`${r.id}: requesting team reference ${r.engineeringTeamId} does not exist`);}
    for(const u of state.users||[]){if(u.teamId&&!ids.has(u.teamId))out.push(`${u.id}: user team reference ${u.teamId} does not exist`);}
    return out;
  };


  /* REV 1.0.91 — explicit request completeness and Control Plan strategy. */
  ProtoLab.reusableControlPlansForRequest = (state,r) => {
    if(!state||!r)return [];
    const current=(state.controlPlans||[]).find(x=>x.id===r.controlPlanId&&x.status==='Approved'&&!x.buildSpecific);
    const compatible=new Set(ProtoLab.sameProductRequests(state,r).map(x=>x.id));
    const rows=(state.controlPlans||[]).filter(cp=>cp.status==='Approved'&&!cp.buildSpecific&&(cp.requestIds||[]).some(id=>compatible.has(id)));
    if(current&&!rows.some(x=>x.id===current.id))rows.unshift(current);
    return rows.filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);
  };
  const _applyReusePackageV1091=ProtoLab.applyReusePackage;
  ProtoLab.applyReusePackage=(state,r,opts={})=>{
    if(!state||!r)return null;
    if(r.controlPlanDeferred===true&&!r.controlPlanId){
      r.controlPlanId='__DEFERRED__';
      const pack=_applyReusePackageV1091(state,r,opts);
      r.controlPlanId=null;
      pack.controlPlan={mode:'deferred',source:'Define later in Controls workflow'};
      return pack;
    }
    const pack=_applyReusePackageV1091(state,r,opts);
    if(r.controlPlanId)r.controlPlanDeferred=false;
    return pack;
  };
  ProtoLab.requestSetupAssessment=(state,r)=>{
    ProtoLab.ensureRequestingTeamModel?.(state);
    const team=ProtoLab.requestingTeamByIdOrName?.(state,r?.engineeringTeamId,r?.engineeringTeam),product=(state?.products||[]).find(p=>p.id===r?.productId),customer=(state?.customers||[]).find(c=>c.id===r?.customerId);
    const q=Number(r?.quantity),dateOk=!!r?.requiredDate&&!Number.isNaN(new Date(`${r.requiredDate}T12:00:00`).getTime());
    const cpDecision=!!r?.controlPlanId||r?.controlPlanDeferred===true||(r?.status!=='DRAFT REQUEST'&&r?.controlPlanDeferred==null);
    const checks=[
      {key:'title',label:'Request title',done:!!String(r?.title||'').trim()},
      {key:'objective',label:'Engineering objective',done:!!String(r?.objective||'').trim()},
      {key:'product',label:'Product / device',done:!!product},
      {key:'quantity',label:'Quantity',done:Number.isInteger(q)&&q>0},
      {key:'team',label:'Requesting / engineering team',done:!!team&&team.active!==false},
      {key:'customer',label:'Customer / programme profile',done:!!customer},
      {key:'requiredDate',label:'Required delivery date',done:dateOk},
      {key:'configuration',label:'Build configuration',done:!!String(r?.configuration||'').trim()},
      {key:'bomRef',label:'BOM / configuration reference',done:!!String(r?.bomRef||'').trim()},
      {key:'purpose',label:'Build purpose & assurance level',done:!!String(r?.purpose||'').trim()&&!!r?.assuranceProfile},
      {key:'materialOwnership',label:'Material source',done:['Engineering supplied','Lab supplied'].includes(ProtoLab.normaliseMaterialSource(r?.materialOwnership))},
      {key:'controlPlanDecision',label:'Control Plan strategy',done:cpDecision}
    ];
    return {checks,missing:checks.filter(x=>!x.done),ready:checks.every(x=>x.done),team,product,customer,controlPlanDecision:cpDecision};
  };


  /* ============================================================
     LabOS REV 1.0.94 — provider-neutral Project Team authority.
     The POC still uses the local user directory, but team records
     now store stable principal keys, functional roles and explicit
     approval rights so the same model can later be hydrated from
     SSO / SCIM / an enterprise identity API without changing the
     build or approval data model.
     ============================================================ */
  ProtoLab.APPROVAL_RIGHT_OPTIONS = [
    ['controlplan:approve','Control Plan approval'],
    ['buildchange:approve','Build-specific change approval'],
    ['product-safety:approve','Product-safety approval'],
    ['readiness:approve','Build-readiness approval'],
    ['release:engineering','Engineering approval'],
    ['release:quality','Quality / customer gate approval'],
    ['release:lab','Final release approval'],
    ['report:approve','Build-report approval'],
    ['plan:commit','Planning / commitment approval']
  ].map(([id,label])=>({id,label}));
  ProtoLab.DEFAULT_APPROVAL_RIGHTS_BY_ROLE = {
    quality:['controlplan:approve','buildchange:approve','readiness:approve','release:quality','report:approve'],
    process_engineer:['buildchange:approve'],
    product_safety:['buildchange:approve','product-safety:approve','readiness:approve'],
    engineering_lead:['release:engineering','report:approve'],
    lab_manager:['readiness:approve','release:lab','plan:commit'],
    lab_planner:['plan:commit'],
    approver:['controlplan:approve','report:approve'],
    administrator:ProtoLab.APPROVAL_RIGHT_OPTIONS.map(x=>x.id)
  };
  const _ensureRequestingTeamModelV1094 = ProtoLab.ensureRequestingTeamModel;
  ProtoLab.ensureRequestingTeamModel = state => {
    state=_ensureRequestingTeamModelV1094(state);
    for(const t of state.requestingTeams||[]){
      t.identityProvider=String(t.identityProvider||'local-demo');
      t.externalGroupKey=String(t.externalGroupKey||'');
      t.roleGovernanceEnabled=t.roleGovernanceEnabled===true;
      t.projectLeadUserId=t.projectLeadUserId||null;
      t.roleBindings=Array.isArray(t.roleBindings)?t.roleBindings.filter(Boolean):[];
      // Migrate legacy team membership into provider-neutral principal bindings,
      // but do not silently enable governance for an existing team.
      for(const uid of t.memberUserIds||[]){
        if(t.roleBindings.some(b=>b.principalId===uid))continue;
        const u=(state.users||[]).find(x=>x.id===uid);if(!u)continue;
        t.roleBindings.push({id:ProtoLab.uid('TRB'),principalId:u.id,principalName:u.name,identityProvider:t.identityProvider,externalPrincipalId:'',roleIds:[u.role],approvalRights:[]});
      }
      for(const b of t.roleBindings){
        b.id=b.id||ProtoLab.uid('TRB');b.principalId=b.principalId||null;b.principalName=String(b.principalName||'');b.identityProvider=String(b.identityProvider||t.identityProvider||'local-demo');b.externalPrincipalId=String(b.externalPrincipalId||'');
        b.roleIds=Array.isArray(b.roleIds)?[...new Set(b.roleIds.filter(Boolean))]:[];
        b.approvalRights=Array.isArray(b.approvalRights)?[...new Set(b.approvalRights.filter(Boolean))]:[];
      }
    }
    for(const r of state.requests||[]){if(!r.projectTeamId&&r.engineeringTeamId)r.projectTeamId=r.engineeringTeamId;if(!r.engineeringTeamId&&r.projectTeamId)r.engineeringTeamId=r.projectTeamId;}
    return state;
  };
  ProtoLab.projectTeamForRequest = (state,r) => {
    if(!state||!r)return null;ProtoLab.ensureRequestingTeamModel(state);
    return (state.requestingTeams||[]).find(t=>t.id===(r.projectTeamId||r.engineeringTeamId))||ProtoLab.requestingTeamByIdOrName(state,r.engineeringTeamId,r.engineeringTeam)||null;
  };
  ProtoLab.projectTeamRoleBindings = (state,r) => {
    const t=ProtoLab.projectTeamForRequest(state,r);return t?.roleBindings||[];
  };
  ProtoLab.resolveProjectTeamAssignee = (state,r,roleId,right=null) => {
    const team=ProtoLab.projectTeamForRequest(state,r),users=state?.users||[];
    if(team?.roleGovernanceEnabled){
      const b=(team.roleBindings||[]).find(x=>(x.roleIds||[]).includes(roleId)&&(!right||(x.approvalRights||[]).includes(right)));
      if(!b)return null;
      const u=users.find(x=>x.id===b.principalId);return u?{...u,identityProvider:b.identityProvider||team.identityProvider,externalPrincipalId:b.externalPrincipalId||'',projectTeamId:team.id,approvalRight:right}:null;
    }
    const u=users.find(x=>x.role===roleId);return u?{...u,identityProvider:'local-demo',externalPrincipalId:'',projectTeamId:team?.id||null,approvalRight:right}:null;
  };
  ProtoLab.projectTeamUserCanApprove = (state,r,userId,roleId,right=null) => {
    const u=(state?.users||[]).find(x=>x.id===userId);if(!u)return false;if(u.role==='administrator')return true;
    const team=ProtoLab.projectTeamForRequest(state,r);
    if(!team?.roleGovernanceEnabled)return u.role===roleId||(!roleId&&!!right&&ProtoLab.can(u.role,'approval:perform'));
    return (team.roleBindings||[]).some(b=>b.principalId===userId&&(b.roleIds||[]).includes(roleId)&&(!right||(b.approvalRights||[]).includes(right)));
  };
  ProtoLab.approvalRightForRecord = a => {
    if(!a)return null;if(a.approvalRight)return a.approvalRight;
    if(a.stage==='build-change')return 'buildchange:approve';if(a.stage==='report'||a.type==='Build Report Approval')return 'report:approve';
    if(a.type==='Product Safety')return 'product-safety:approve';if(a.type==='Build Readiness')return 'readiness:approve';
    if(a.type==='Customer / quality gate')return 'release:quality';if(a.type==='Engineering review')return 'release:engineering';if(a.type==='Lab manager gate')return 'release:lab';
    return null;
  };
  const _teamGovernApprovalV1094=(state,r,a)=>{
    if(!a||!r||['Approved','Rejected','Superseded'].includes(a.status))return a;
    const roleId=a.roleId||({'Quality Engineer':'quality','Process Engineer':'process_engineer','Product Safety Representative':'product_safety','Engineering Project Lead':'engineering_lead','Lab Manager':'lab_manager','Approver / Reviewer':'approver'}[a.role]||null),right=ProtoLab.approvalRightForRecord(a),team=ProtoLab.projectTeamForRequest(state,r),u=roleId?ProtoLab.resolveProjectTeamAssignee(state,r,roleId,right):null;
    if(u){a.assignedUserId=u.id;a.person=u.name;a.identityProvider=u.identityProvider||team?.identityProvider||'local-demo';a.externalPrincipalId=u.externalPrincipalId||'';a.approvalRight=right;a.authorityMissing=false;}
    else if(team?.roleGovernanceEnabled&&roleId){a.assignedUserId=null;a.person='Unassigned — project team authority required';a.approvalRight=right;a.authorityMissing=true;}
    return a;
  };
  const _ensureBuildReportApprovalV1094=ProtoLab.ensureBuildReportApproval;
  ProtoLab.ensureBuildReportApproval=(state,r)=>{const a=_ensureBuildReportApprovalV1094(state,r);return _teamGovernApprovalV1094(state,r,a)};
  const _ensureBuildChangeApprovalsV1094=ProtoLab.ensureBuildChangeApprovals;
  ProtoLab.ensureBuildChangeApprovals=(state,r,area,reason)=>{const a=_ensureBuildChangeApprovalsV1094(state,r,area,reason);a.forEach(x=>_teamGovernApprovalV1094(state,r,x));return a};
  const _ensureApprovalRecordsV1094=ProtoLab.ensureApprovalRecords;
  ProtoLab.ensureApprovalRecords=(state,r)=>{const a=_ensureApprovalRecordsV1094(state,r);a.forEach(x=>_teamGovernApprovalV1094(state,r,x));return a};
  const _validateInvariantsV1094=ProtoLab.validateInvariants;
  ProtoLab.validateInvariants=state=>{
    const out=_validateInvariantsV1094(state);ProtoLab.ensureRequestingTeamModel(state);
    const rights=new Set(ProtoLab.APPROVAL_RIGHT_OPTIONS.map(x=>x.id)),roles=new Set(ProtoLab.ROLES.map(x=>x.id)),users=new Set((state.users||[]).map(x=>x.id));
    for(const t of state.requestingTeams||[])for(const b of t.roleBindings||[]){if(b.principalId&&!users.has(b.principalId))out.push(`${t.id}: project-team principal ${b.principalId} does not exist`);for(const r of b.roleIds||[])if(!roles.has(r))out.push(`${t.id}: unknown project-team role ${r}`);for(const a of b.approvalRights||[])if(!rights.has(a))out.push(`${t.id}: unknown approval right ${a}`);}
    return [...new Set(out)];
  };

  /* ============================================================
     LabOS REV 1.0.100 — multi-laboratory network foundation.
     Labs remain operationally independent. Product master data owns
     default routing by workstream; a request retains its home site
     and may have a separately governed execution site.
     ============================================================ */
  ProtoLab.WORKSTREAMS_V1099 = [
    {id:'prototype',label:'Prototype'},
    {id:'validation',label:'Validation / Testing'},
    {id:'failureAnalysis',label:'Failure Analysis'}
  ];
  ProtoLab.DEFAULT_LABS_V1099 = [
    {id:'LAB-NL',code:'NL-TW',name:'Twente Prototype Lab',location:'Twente, Netherlands',type:'internal',active:true,timezone:'Europe/Amsterdam',currency:'EUR',transferLeadDays:0},
    {id:'LAB-DE',code:'DE-ST',name:'Stuttgart Engineering Lab',location:'Stuttgart, Germany',type:'internal',active:true,timezone:'Europe/Berlin',currency:'EUR',transferLeadDays:1},
    {id:'LAB-US',code:'US-DT',name:'Detroit Engineering Lab',location:'Detroit, USA',type:'internal',active:true,timezone:'America/Detroit',currency:'EUR',transferLeadDays:2},
    {id:'EXT-EU',code:'EXT-EU',name:'External Specialist Facility',location:'External supplier, Europe',type:'external',active:true,timezone:'Europe/Amsterdam',currency:'EUR',transferLeadDays:5,externalLeadDays:12,externalHourlyRate:285,externalSetupFee:1750}
  ];
  ProtoLab.primaryLabIdV1099 = state => {
    ProtoLab.ensureMultiLabModelV1099?.(state);
    return state?.settings?.primaryLabId || (state?.labs||[]).find(x=>x.type==='internal'&&x.active!==false)?.id || 'LAB-NL';
  };
  ProtoLab.labByIdV1099 = (state,id) => (state?.labs||[]).find(x=>x.id===id)||null;
  ProtoLab.internalLabsV1099 = state => (state?.labs||[]).filter(x=>x.type==='internal'&&x.active!==false);
  ProtoLab.workstreamForRequestV1099 = r => {
    const raw=String(r?.workstream||r?.requestType||'').toLowerCase();
    if(raw.includes('failure'))return 'failureAnalysis';
    if(raw.includes('valid')||raw.includes('test'))return 'validation';
    return 'prototype';
  };
  ProtoLab.productDefaultSiteV1099 = (state,productId,workstream='prototype') => {
    const p=(state?.products||[]).find(x=>x.id===productId),primary=state?.settings?.primaryLabId||'LAB-NL';
    const map=p?.defaultSiteByWorkstream||{};
    return map[workstream]||map.prototype||primary;
  };
  ProtoLab.requestExecutionSiteIdV1099 = (state,r) => r?.executionSiteId||r?.homeSiteId||ProtoLab.productDefaultSiteV1099(state,r?.productId,ProtoLab.workstreamForRequestV1099(r));
  ProtoLab.assignRequestDefaultSiteV1099 = (state,r,{force=false}={}) => {
    if(!state||!r)return r;
    const workstream=ProtoLab.workstreamForRequestV1099(r),site=ProtoLab.productDefaultSiteV1099(state,r.productId,workstream);
    r.workstream=workstream;
    if(force||!r.homeSiteId)r.homeSiteId=site;
    if(force||!r.executionSiteId)r.executionSiteId=r.homeSiteId||site;
    return r;
  };
  function v1099CloneSiteAssets(state,fromSite,toSite,prefix){
    const eqMap=new Map(),staffMap=new Map(),matMap=new Map();
    const sourceEq=(state.equipment||[]).filter(e=>(e.siteId||fromSite)===fromSite&&!String(e.id).startsWith(prefix+'-'));
    for(const e of sourceEq){const id=`${prefix}-${e.id}`;eqMap.set(e.id,id);if(!(state.equipment||[]).some(x=>x.id===id)){const c=ProtoLab.deepClone(e);c.id=id;c.siteId=toSite;c.name=`${e.name} · ${ProtoLab.labByIdV1099(state,toSite)?.code||prefix}`;c.assetTag=`${prefix}-${e.assetTag||e.id}`;state.equipment.push(c);}}
    const sourceStaff=(state.staff||[]).filter(s=>(s.siteId||fromSite)===fromSite&&!String(s.id).startsWith(prefix+'-'));
    for(const st of sourceStaff){const id=`${prefix}-${st.id}`;staffMap.set(st.id,id);if(!(state.staff||[]).some(x=>x.id===id)){const c=ProtoLab.deepClone(st);c.id=id;c.siteId=toSite;c.name=`${st.name} · ${ProtoLab.labByIdV1099(state,toSite)?.code||prefix}`;state.staff.push(c);}}
    const sourceMat=(state.materials||[]).filter(m=>(m.siteId||fromSite)===fromSite&&!String(m.id).startsWith(prefix+'-'));
    for(const m of sourceMat){const id=`${prefix}-${m.id}`;matMap.set(m.id,id);if(!(state.materials||[]).some(x=>x.id===id)){const c=ProtoLab.deepClone(m);c.id=id;c.siteId=toSite;c.lot=`${m.lot||m.id}-${prefix}`;c.quantity=Math.max(Number(m.quantity||0),40);state.materials.push(c);}}
    state.trainingCertificates=state.trainingCertificates||[];
    for(const cert of [...state.trainingCertificates]){const sid=staffMap.get(cert.staffId);if(!sid)continue;const id=`${prefix}-${cert.id||ProtoLab.uid('TRN')}`;if(state.trainingCertificates.some(x=>x.id===id))continue;const c=ProtoLab.deepClone(cert);c.id=id;c.staffId=sid;c.siteId=toSite;state.trainingCertificates.push(c);}
    state.calibrationCertificates=state.calibrationCertificates||[];
    for(const cert of [...state.calibrationCertificates]){const eid=eqMap.get(cert.equipmentId);if(!eid)continue;const id=`${prefix}-${cert.id||ProtoLab.uid('CAL')}`;if(state.calibrationCertificates.some(x=>x.id===id))continue;const c=ProtoLab.deepClone(cert);c.id=id;c.equipmentId=eid;c.siteId=toSite;state.calibrationCertificates.push(c);}
    return {eqMap,staffMap,matMap};
  }
  ProtoLab.ensureMultiLabModelV1099 = state => {
    if(!state)return state;
    state.settings=state.settings||{};
    state.labs=Array.isArray(state.labs)?state.labs:[];
    for(const seed of ProtoLab.DEFAULT_LABS_V1099){const hit=state.labs.find(x=>x.id===seed.id);if(hit)Object.assign(hit,{...seed,...hit});else state.labs.push(ProtoLab.deepClone(seed));}
    state.settings.primaryLabId=state.settings.primaryLabId||'LAB-NL';
    state.settings.activeLabId=(state.labs.some(x=>x.id===state.settings.activeLabId&&x.type==='internal'&&x.active!==false)?state.settings.activeLabId:null)||state.settings.primaryLabId;
    const primary=state.settings.primaryLabId;
    for(const p of state.products||[]){p.defaultSiteByWorkstream=p.defaultSiteByWorkstream||{};p.defaultSiteByWorkstream.prototype=p.defaultSiteByWorkstream.prototype||primary;const n=(state.products||[]).indexOf(p);p.defaultSiteByWorkstream.validation=p.defaultSiteByWorkstream.validation||(['LAB-DE','LAB-NL','LAB-US'][Math.abs(n)%3]);p.defaultSiteByWorkstream.failureAnalysis=p.defaultSiteByWorkstream.failureAnalysis||(['LAB-US','LAB-NL','LAB-DE'][Math.abs(n)%3]);}
    for(const e of state.equipment||[])e.siteId=e.siteId||primary;
    for(const st of state.staff||[])st.siteId=st.siteId||primary;
    for(const m of state.materials||[])m.siteId=m.siteId||primary;
    for(const c of state.trainingCertificates||[]){if(!c.siteId)c.siteId=(state.staff||[]).find(x=>x.id===c.staffId)?.siteId||primary;}
    for(const c of state.calibrationCertificates||[]){if(!c.siteId)c.siteId=(state.equipment||[]).find(x=>x.id===c.equipmentId)?.siteId||primary;}
    for(const r of state.requests||[])ProtoLab.assignRequestDefaultSiteV1099(state,r,{force:false});
    const reqSite=new Map((state.requests||[]).map(r=>[r.id,ProtoLab.requestExecutionSiteIdV1099(state,r)]));
    for(const b of state.bookings||[])b.siteId=b.siteId||reqSite.get(b.requestId)||(state.equipment||[]).find(x=>x.id===b.equipmentId)?.siteId||(state.staff||[]).find(x=>x.id===b.staffId)?.siteId||primary;
    for(const b of state.resourceCareBookings||[])b.siteId=b.siteId||(state.equipment||[]).find(x=>x.id===b.equipmentId)?.siteId||(state.staff||[]).find(x=>x.id===b.staffId)?.siteId||reqSite.get(b.sourceRequestId)||primary;
    for(const ev of state.planningEvents||[])ev.siteId=ev.siteId||(state.equipment||[]).find(x=>x.id===ev.equipmentId)?.siteId||(state.staff||[]).find(x=>x.id===ev.staffId)?.siteId||primary;
    for(const a of state.allocations||[])a.siteId=a.siteId||(state.materials||[]).find(x=>x.id===a.materialId)?.siteId||reqSite.get(a.requestId)||primary;
    state.networkTransfers=Array.isArray(state.networkTransfers)?state.networkTransfers:[];
    if(state.settings.demoDataset&&state.settings.multiLabDemoSeededV1099!==true){
      v1099CloneSiteAssets(state,primary,'LAB-DE','DE');
      v1099CloneSiteAssets(state,primary,'LAB-US','US');
      state.settings.multiLabDemoSeededV1099=true;
    }
    return state;
  };
  // Readiness work belongs to the controlled resource, not to whichever
  // build happened to trigger it first. Preserve sourceRequestId as provenance
  // while preventing a later replan/transfer/archive from deleting readiness
  // that other accepted bookings may depend on.
  ProtoLab.ensureResourceCareOwnershipV1109 = state => {
    let changed=0;for(const c of state?.resourceCareBookings||[]){
      if(c?.autoGenerated===true&&c.portfolioOwned!==true){c.portfolioOwned=true;c.originRequestId=c.originRequestId||c.sourceRequestId||null;changed++;}
    }
    return changed;
  };
  const _ensureMultiLabModelV1099BaseV1109=ProtoLab.ensureMultiLabModelV1099;
  ProtoLab.ensureMultiLabModelV1099 = state => {const out=_ensureMultiLabModelV1099BaseV1109(state);ProtoLab.ensureResourceCareOwnershipV1109(out);return out;};

  ProtoLab.siteScopedStateV1099 = (state,siteId,{includeRequestId=null,includeNetworkTasks=false}={}) => {
    ProtoLab.ensureMultiLabModelV1099(state);
    const out=ProtoLab.deepClone(state),sid=siteId||state.settings.activeLabId||state.settings.primaryLabId;
    if(includeRequestId){const t=(out.requests||[]).find(r=>r.id===includeRequestId);if(t)t.executionSiteId=sid;}
    const homeRequestIds=new Set((out.requests||[]).filter(r=>ProtoLab.requestExecutionSiteIdV1099(out,r)===sid).map(r=>r.id));
    if(includeRequestId)homeRequestIds.add(includeRequestId);
    const incomingRequestIds=new Set();
    if(includeNetworkTasks)for(const b of out.bookings||[]){if(ProtoLab.isHistoricalPlanningBooking(b))continue;if(b.siteId===sid&&!homeRequestIds.has(b.requestId))incomingRequestIds.add(b.requestId)}
    const requestIds=new Set([...homeRequestIds,...incomingRequestIds]);
    out.requests=(out.requests||[]).filter(r=>requestIds.has(r.id));
    for(const r of out.requests||[])if(incomingRequestIds.has(r.id)&&!homeRequestIds.has(r.id))r.networkSupportOnlyV124=true;
    const eqIds=new Set((out.equipment||[]).filter(e=>e.siteId===sid).map(e=>e.id));
    const staffIds=new Set((out.staff||[]).filter(st=>st.siteId===sid).map(st=>st.id));
    const matIds=new Set((out.materials||[]).filter(m=>m.siteId===sid).map(m=>m.id));
    const visibleBookingRows=(out.bookings||[]).filter(b=>{if(!requestIds.has(b.requestId))return false;if(!includeNetworkTasks)return (!b.equipmentId||eqIds.has(b.equipmentId))&&(!b.staffId||staffIds.has(b.staffId));if(homeRequestIds.has(b.requestId))return true;return b.siteId===sid||eqIds.has(b.equipmentId)||staffIds.has(b.staffId)});
    const referencedEqIds=new Set(visibleBookingRows.map(b=>b.equipmentId).filter(Boolean)),referencedStaffIds=new Set(visibleBookingRows.map(b=>b.staffId).filter(Boolean));
    out.equipment=(out.equipment||[]).filter(e=>eqIds.has(e.id)||(includeNetworkTasks&&referencedEqIds.has(e.id)));
    out.staff=(out.staff||[]).filter(st=>staffIds.has(st.id)||(includeNetworkTasks&&referencedStaffIds.has(st.id)));
    out.materials=(out.materials||[]).filter(m=>matIds.has(m.id));
    out.routes=(out.routes||[]).filter(x=>requestIds.has(x.requestId));
    out.processDevelopments=(out.processDevelopments||[]).filter(x=>!x.requestId||requestIds.has(x.requestId));
    out.controlPlans=(out.controlPlans||[]).filter(x=>!x.buildRequestId&&!(x.requestIds||[]).length||x.buildRequestId&&requestIds.has(x.buildRequestId)||(x.requestIds||[]).some(id=>requestIds.has(id)));
    for(const key of ['pfmea','serials','measurements','deviations','approvals','actions','documents','lessons','commitmentDecisions','lessonDecisions'])if(Array.isArray(out[key]))out[key]=out[key].filter(x=>!x.requestId||requestIds.has(x.requestId));
    // Request material allocations are governed build evidence, not site-capacity master data.
    // Keep every allocation for an in-scope request even when the material was engineering-supplied,
    // externally received, or its material master row belongs to another site. Filtering by matIds here
    // previously made a material-ready build look unreceived inside the site-scoped planner.
    out.allocations=(out.allocations||[]).filter(a=>requestIds.has(a.requestId));
    out.bookings=visibleBookingRows;
    out.resourceCareBookings=(out.resourceCareBookings||[]).filter(b=>b.siteId===sid||eqIds.has(b.equipmentId)||staffIds.has(b.staffId)||homeRequestIds.has(b.sourceRequestId));
    out.trainingCertificates=(out.trainingCertificates||[]).filter(c=>staffIds.has(c.staffId)||(includeNetworkTasks&&referencedStaffIds.has(c.staffId)));
    out.calibrationCertificates=(out.calibrationCertificates||[]).filter(c=>eqIds.has(c.equipmentId)||(includeNetworkTasks&&referencedEqIds.has(c.equipmentId)));
    out.planningEvents=(out.planningEvents||[]).filter(ev=>ev.siteId===sid||eqIds.has(ev.equipmentId)||staffIds.has(ev.staffId));
    out.settings=out.settings||{};out.settings.activeLabId=sid;out.settings._planningSiteIdV1099=sid;out.settings._networkTaskViewV124=!!includeNetworkTasks;
    return out;
  };
  ProtoLab.mergeSitePlanningStateV1099 = (enterprise,scoped,siteId) => {
    const out=ProtoLab.deepClone(enterprise);ProtoLab.ensureMultiLabModelV1099(out);const sid=siteId||scoped?.settings?._planningSiteIdV1099||out.settings.activeLabId;
    const reqIds=new Set((scoped.requests||[]).map(r=>r.id));
    const replaceById=(key,rows,predicate)=>{const keep=(out[key]||[]).filter(x=>!predicate(x));out[key]=[...keep,...ProtoLab.deepClone(rows||[])];};
    replaceById('requests',scoped.requests,x=>reqIds.has(x.id));
    replaceById('routes',scoped.routes,x=>reqIds.has(x.requestId));
    replaceById('bookings',scoped.bookings,x=>reqIds.has(x.requestId));
    replaceById('resourceCareBookings',scoped.resourceCareBookings,x=>reqIds.has(x.sourceRequestId)||x.siteId===sid);
    // Readiness scheduling can update site assets/certificates; merge only this site's rows.
    replaceById('equipment',scoped.equipment,x=>x.siteId===sid);
    replaceById('staff',scoped.staff,x=>x.siteId===sid);
    replaceById('trainingCertificates',scoped.trainingCertificates,x=>x.siteId===sid||(out.staff||[]).some(s=>s.siteId===sid&&s.id===x.staffId));
    replaceById('calibrationCertificates',scoped.calibrationCertificates,x=>x.siteId===sid||(out.equipment||[]).some(e=>e.siteId===sid&&e.id===x.equipmentId));
    replaceById('planningEvents',scoped.planningEvents,x=>x.siteId===sid);
    return out;
  };

  /* REV 1.0.100 — one delivery truth for plan, health and deadline markers. */
  ProtoLab.requiredDeliveryCutoffV1100 = request => {
    const day=String(request?.requiredDate||'').slice(0,10);if(!day)return null;
    const d=new Date(`${day}T17:00:00`);return Number.isNaN(d.getTime())?null:d;
  };
  ProtoLab.requestPlanFinishV1100 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return null;
    const ends=(state?.bookings||[]).filter(b=>b.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking?.(b)&&b.end).map(b=>new Date(b.end)).filter(d=>!Number.isNaN(d.getTime()));
    if(ends.length)return new Date(Math.max(...ends.map(Number)));
    const exact=r.triage?.plannedFinish?new Date(r.triage.plannedFinish):null;if(exact&&!Number.isNaN(exact.getTime()))return exact;
    const day=String(r.forecastDate||'').slice(0,10);if(day){const d=new Date(`${day}T17:00:00`);if(!Number.isNaN(d.getTime()))return d;}
    return null;
  };
  ProtoLab.requestDeliveryHealthV1100 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return {unplanned:true,onTime:false,late:false,lateDays:0,finish:null,cutoff:null,forecastDate:null};
    const finish=ProtoLab.requestPlanFinishV1100(state,r),cutoff=ProtoLab.requiredDeliveryCutoffV1100(r),forecastDate=finish?finish.toISOString().slice(0,10):(r.forecastDate||null),unplanned=!finish;
    const late=!!(finish&&cutoff&&finish.getTime()>cutoff.getTime());
    const lateDays=late?Math.max(1,ProtoLab.daysBetween(r.requiredDate,forecastDate)):0;
    return {unplanned,onTime:!!finish&&!late,late,lateDays,finish,cutoff,forecastDate};
  };
  ProtoLab.reconcileRequestForecastV1100 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return false;
    const ends=(state?.bookings||[]).filter(b=>b.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking?.(b)&&b.end).map(b=>new Date(b.end)).filter(d=>!Number.isNaN(d.getTime()));
    if(!ends.length)return false;
    const finish=new Date(Math.max(...ends.map(Number))),forecast=finish.toISOString().slice(0,10),changed=r.forecastDate!==forecast||r.triage?.plannedFinish!==finish.toISOString();
    r.forecastDate=forecast;r.triage=r.triage||{};r.triage.forecastDate=forecast;r.triage.plannedFinish=finish.toISOString();
    if(r.requiredDate){const h=ProtoLab.requestDeliveryHealthV1100(state,r);r.triage.feasibleByRequiredDate=h.onTime;r.triage.slackDays=h.onTime?Math.max(0,ProtoLab.daysBetween(forecast,r.requiredDate)):-h.lateDays;}
    return changed;
  };
  ProtoLab.reconcileAllForecastsV1100 = state => {let changed=0;for(const r of state?.requests||[])if(ProtoLab.reconcileRequestForecastV1100(state,r))changed++;return changed;};
  ProtoLab.networkMetricsV1099 = state => {
    ProtoLab.ensureMultiLabModelV1099(state);const rows=state.networkTransfers||[],taskRows=rows.filter(x=>x.status==='Accepted'&&x.scope==='task'&&x.fromSiteId!==x.toSiteId);
    return {sisterLabBuilds:rows.filter(x=>x.status==='Accepted'&&x.scope!=='task'&&x.fromSiteId!==x.toSiteId).length,sisterLabOperations:taskRows.length,sisterLabTests:taskRows.filter(x=>String(x.taskKind||'').toLowerCase()==='test').length,sisterLabProcessSteps:taskRows.filter(x=>String(x.taskKind||'').toLowerCase()==='process').length,sisterLabDevelopmentSteps:taskRows.filter(x=>String(x.taskKind||'').toLowerCase()==='development').length,sisterLabCloseoutSteps:taskRows.filter(x=>String(x.taskKind||'').toLowerCase()==='closeout').length,internallyRetainedHours:rows.filter(x=>x.status==='Accepted').reduce((n,x)=>n+Number(x.plannedHours||0),0),outsourcingAvoided:rows.filter(x=>x.status==='Accepted').reduce((n,x)=>n+Number(x.avoidedExternalCost||0),0),externalSpend:rows.filter(x=>x.status==='External').reduce((n,x)=>n+Number(x.externalCost||0),0)};
  };
  const _validateInvariantsV1099=ProtoLab.validateInvariants;
  ProtoLab.validateInvariants=state=>{
    const out=_validateInvariantsV1099(state);ProtoLab.ensureMultiLabModelV1099(state);const labIds=new Set((state.labs||[]).map(x=>x.id));
    for(const r of state.requests||[]){if(!labIds.has(r.homeSiteId))out.push(`${r.id}: home lab ${r.homeSiteId||'missing'} does not exist`);if(!labIds.has(r.executionSiteId))out.push(`${r.id}: execution lab ${r.executionSiteId||'missing'} does not exist`);}
    const reqById=new Map((state.requests||[]).map(r=>[r.id,r])),eqById=new Map((state.equipment||[]).map(e=>[e.id,e])),stById=new Map((state.staff||[]).map(s=>[s.id,s]));
    for(const b of state.bookings||[]){const r=reqById.get(b.requestId);if(!r)continue;const home=ProtoLab.requestExecutionSiteIdV1099(state,r),taskSite=r.taskSiteOverridesV1170?.[b.stepId]||home,declared=b.siteId||taskSite,eq=b.equipmentId&&eqById.get(b.equipmentId),st=b.staffId&&stById.get(b.staffId),remoteAllowed=taskSite!==home&&declared===taskSite;if(eq&&eq.siteId!==taskSite)out.push(`${r.id}: booking ${b.id||b.stepId} uses equipment from ${eq.siteId} while controlled task site is ${taskSite}`);if(st&&st.siteId!==taskSite)out.push(`${r.id}: booking ${b.id||b.stepId} uses staff from ${st.siteId} while controlled task site is ${taskSite}`);if(declared!==taskSite)out.push(`${r.id}: booking ${b.id||b.stepId} declares site ${declared} while controlled task site is ${taskSite}`);const governedRemoteKind=String(b.taskKind||b.taskType||'').toLowerCase();if(remoteAllowed&&!['test','process','development','closeout'].includes(governedRemoteKind))out.push(`${r.id}: cross-site task ${b.id||b.stepId} is not a governed canonical planning step`);}
    return [...new Set(out)];
  };


  /* ============================================================
     LabOS REV 1.0.102 — complete-plan delivery truth + network
     routing classification. A forecast is only reliable when the
     canonical plan covers every current planning task exactly once.
     ============================================================ */
  ProtoLab.currentPlanStatusV1102 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId;
    if(!r)return {active:false,complete:false,unplanned:true,incomplete:true,late:false,onTime:false,lateDays:0,finish:null,forecastDate:null,cutoff:null,coverage:null};
    const status=String(r.status||'').toUpperCase(),active=!['CLOSED','DELIVERED','RELEASED','ARCHIVED'].includes(status);
    const coverage=ProtoLab.planningTaskCoverage(state,r),scheduled=(coverage?.scheduled||[]).filter(b=>!ProtoLab.isHistoricalPlanningBooking?.(b));
    const expected=coverage?.expected||[],ends=scheduled.filter(b=>b.end).map(b=>new Date(b.end)).filter(d=>!Number.isNaN(d.getTime()));
    const finish=ends.length?new Date(Math.max(...ends.map(Number))):null;
    const complete=!!(expected.length&&scheduled.length&&coverage?.ok&&finish),unplanned=!scheduled.length,incomplete=!complete;
    const cutoff=ProtoLab.requiredDeliveryCutoffV1100(r),forecastDate=complete&&finish?finish.toISOString().slice(0,10):null;
    const late=!!(complete&&finish&&cutoff&&finish.getTime()>cutoff.getTime()),onTime=!!(complete&&finish&&!late);
    const lateDays=late?Math.max(1,ProtoLab.daysBetween(r.requiredDate,forecastDate)):0;
    return {active,complete,unplanned,incomplete,late,onTime,lateDays,finish,forecastDate,cutoff,coverage,scheduledCount:scheduled.length,expectedCount:expected.length};
  };
  ProtoLab.networkRecoveryStatusV1102 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId,plan=ProtoLab.currentPlanStatusV1102(state,r);
    const requiresRecovery=!!(r&&plan.active&&(plan.unplanned||plan.incomplete||plan.late));
    const reason=!r?'Build not found':!plan.active?'Build is no longer active':plan.unplanned?'No current canonical plan':plan.incomplete?`Current plan incomplete · ${plan.scheduledCount}/${plan.expectedCount} canonical tasks scheduled`:plan.late?`Current complete plan is ${plan.lateDays} day${plan.lateDays===1?'':'s'} late`:'Current complete plan is on time';
    return {...plan,requiresRecovery,reason};
  };
  const _requestDeliveryHealthV1100BaseV1102=ProtoLab.requestDeliveryHealthV1100;
  ProtoLab.requestDeliveryHealthV1100 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return _requestDeliveryHealthV1100BaseV1102(state,requestOrId);
    const plan=ProtoLab.currentPlanStatusV1102(state,r);
    if(plan.active)return {unplanned:plan.unplanned,incomplete:plan.incomplete,complete:plan.complete,onTime:plan.onTime,late:plan.late,lateDays:plan.lateDays,finish:plan.finish,cutoff:plan.cutoff,forecastDate:plan.forecastDate,scheduledCount:plan.scheduledCount,expectedCount:plan.expectedCount};
    return _requestDeliveryHealthV1100BaseV1102(state,r);
  };
  const _reconcileRequestForecastV1100BaseV1102=ProtoLab.reconcileRequestForecastV1100;
  ProtoLab.reconcileRequestForecastV1100 = (state,requestOrId) => {
    const r=typeof requestOrId==='string'?(state?.requests||[]).find(x=>x.id===requestOrId):requestOrId;if(!r)return false;
    const plan=ProtoLab.currentPlanStatusV1102(state,r);
    if(plan.active&&!plan.complete){
      const had=!!(r.forecastDate||r.triage?.forecastDate||r.triage?.plannedFinish);r.forecastDate=null;r.triage=r.triage||{};r.triage.forecastDate=null;r.triage.plannedFinish=null;r.triage.feasibleByRequiredDate=false;r.triage.slackDays=null;
      if(plan.expectedCount)r.triage.planQuality=plan.unplanned?'Unplanned':`Incomplete · ${plan.scheduledCount}/${plan.expectedCount} tasks`;
      return had;
    }
    return _reconcileRequestForecastV1100BaseV1102(state,r);
  };
  ProtoLab.reconcileAllForecastsV1100 = state => {let changed=0;for(const r of state?.requests||[])if(ProtoLab.reconcileRequestForecastV1100(state,r))changed++;return changed;};
  ProtoLab.networkMetricsV1099 = state => {
    ProtoLab.ensureMultiLabModelV1099(state);const rows=state.networkTransfers||[],accepted=rows.filter(x=>x.status==='Accepted'),buildMoves=accepted.filter(x=>x.scope!=='task'&&x.fromSiteId!==x.toSiteId),taskMoves=accepted.filter(x=>x.scope==='task'&&x.fromSiteId!==x.toSiteId);
    return {sisterLabBuilds:buildMoves.length,sisterLabOperations:taskMoves.length,sisterLabTests:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='test').length,sisterLabProcessSteps:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='process').length,sisterLabDevelopmentSteps:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='development').length,sisterLabCloseoutSteps:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='closeout').length,recoveryTransfers:buildMoves.filter(x=>(x.transferMode||'recovery')==='recovery').length,electiveTransfers:buildMoves.filter(x=>x.transferMode==='elective').length,internallyRetainedHours:accepted.reduce((n,x)=>n+Number(x.plannedHours||0),0),outsourcingAvoided:accepted.reduce((n,x)=>n+Number(x.avoidedExternalCost||0),0),externalSpend:rows.filter(x=>x.status==='External').reduce((n,x)=>n+Number(x.externalCost||0),0)};
  };


  /* ============================================================
     LabOS REV 1.0.128 — controlled Business Unit master data.
     - Project Teams reference stable Business Unit IDs instead of free text;
     - legacy free-text team values migrate without data loss;
     - request snapshots preserve the Business Unit used when the request was created;
     - demo data uses realistic cross-business-unit allocation.
     ============================================================ */
  ProtoLab.BUSINESS_UNIT_DEMO_DEFAULTS = [
    {id:'BU-PRO',code:'PRO',name:'Professional Power Tools'},
    {id:'BU-DIY',code:'DIY',name:'Consumer & DIY'},
    {id:'BU-OG',code:'O&G',name:'Outdoor & Garden'},
    {id:'BU-IND',code:'IND',name:'Industrial Solutions'},
    {id:'BU-ENE',code:'ENE',name:'Battery & Energy Systems'}
  ];
  ProtoLab.ensureBusinessUnitModel = state => {
    state=state||{};state.settings=state.settings||{};
    const isDemo=!!state.settings.demoDataset;
    const legacyDemoMap={
      'Power Tools':'Professional Power Tools','Power Tools Platform':'Professional Power Tools',
      'Drive Systems':'Industrial Solutions','Mechanical Engineering':'Outdoor & Garden',
      'Electronics & Controls':'Consumer & DIY','Advanced Engineering':'Professional Power Tools',
      'Systems Engineering':'Industrial Solutions','Battery Systems':'Battery & Energy Systems'
    };
    const clean=x=>String(x||'').trim();
    const slug=x=>clean(x).toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,24)||'UNIT';
    const raw=Array.isArray(state.businessUnits)?state.businessUnits.filter(Boolean):[];
    const rows=[];const byId=new Map(),byName=new Map();
    const add=(src,preferredId='')=>{
      if(typeof src==='string')src={name:src};src=src||{};
      let name=clean(src.name||src.label);if(!name)return null;
      if(isDemo&&legacyDemoMap[name])name=legacyDemoMap[name];
      const nk=name.toLowerCase();if(byName.has(nk))return byName.get(nk);
      let id=clean(src.id||preferredId||`BU-${slug(name)}`),n=2;while(byId.has(id))id=`${clean(src.id||preferredId||`BU-${slug(name)}`)}-${n++}`;
      const row={...src,id,name,code:clean(src.code||slug(name).slice(0,8)),active:src.active!==false};
      rows.push(row);byId.set(id,row);byName.set(nk,row);return row;
    };
    raw.forEach(x=>add(x));
    if(isDemo)for(const x of ProtoLab.BUSINESS_UNIT_DEMO_DEFAULTS)add(x,x.id);
    for(const t of state.requestingTeams||[]){
      let named=clean(t.businessUnit);if(isDemo&&legacyDemoMap[named])named=legacyDemoMap[named];
      let bu=(named&&byName.get(named.toLowerCase()))||(t.businessUnitId&&byId.get(t.businessUnitId))||null;
      if(!bu&&named)bu=add({name:named});
      if(bu){t.businessUnitId=bu.id;t.businessUnit=bu.name;}
      else {t.businessUnitId=null;t.businessUnit='';}
    }
    state.businessUnits=rows;
    const teamById=new Map((state.requestingTeams||[]).map(t=>[t.id,t]));
    const teamByName=new Map((state.requestingTeams||[]).map(t=>[clean(t.name).toLowerCase(),t]));
    for(const r of state.requests||[]){
      if(r.businessUnitId&&byId.has(r.businessUnitId)){r.businessUnit=byId.get(r.businessUnitId).name;continue;}
      const named=clean(r.businessUnit);let bu=named&&byName.get((isDemo&&legacyDemoMap[named]?legacyDemoMap[named]:named).toLowerCase());
      if(!bu){const team=(r.engineeringTeamId&&teamById.get(r.engineeringTeamId))||teamByName.get(clean(r.engineeringTeam).toLowerCase());bu=team?.businessUnitId?byId.get(team.businessUnitId):null;}
      if(bu){r.businessUnitId=bu.id;r.businessUnit=bu.name;}
    }
    return state;
  };


  /* REV 1.0.128 — in-place repair for demo data upgraded from pre-BU builds.
     REV 1.0.127 introduced controlled Business Units, but an existing browser
     database was intentionally not reseeded. Its legacy free-text "Power Tools"
     value therefore migrated correctly but collapsed every pre-populated demo
     request into Professional Power Tools. Repair only that recognisable demo
     condition; never redistribute real/user-authored portfolios. */
  ProtoLab.ensureDemoBusinessUnitDiversityV128 = state => {
    state=state||{};state.settings=state.settings||{};
    if(!state.settings.demoDataset)return state;
    const demo=(state.requests||[]).filter(r=>/^P26-10(?:0[1-9]|1\d|2[0-4])$/.test(String(r.id||'')));
    if(demo.length<20){state.settings.demoBusinessUnitDistributionV128=state.settings.demoBusinessUnitDistributionV128||'not-applicable';return state;}
    const buById=new Map((state.businessUnits||[]).map(x=>[x.id,x])),buByName=new Map((state.businessUnits||[]).map(x=>[String(x.name||'').trim().toLowerCase(),x]));
    const directNames=demo.map(r=>buById.get(r.businessUnitId)?.name||r.businessUnit||'').filter(Boolean),distinct=new Set(directNames.map(x=>String(x).trim().toLowerCase()));
    // Fresh 1.0.127+ demo data is already diverse; mark it and leave it untouched.
    if(distinct.size>1){state.settings.demoBusinessUnitDistributionV128='verified-diverse';state.settings.demoDiversityVersion='1.0.128';return state;}
    const only=[...distinct][0]||'';
    const legacyCollapsed=!only||only==='professional power tools'||only==='power tools';
    if(!legacyCollapsed){state.settings.demoBusinessUnitDistributionV128='preserved-user-allocation';return state;}
    const mapping={
      'Power Tool Platform':'Professional Power Tools',
      'Motor & Drive':'Industrial Solutions','Motor & Drive Systems':'Industrial Solutions',
      'Mechanical Design':'Outdoor & Garden',
      'Electronics':'Consumer & DIY','Electronics & Controls':'Consumer & DIY',
      'Battery Systems':'Battery & Energy Systems',
      'Advanced Concepts':'Battery & Energy Systems','Advanced Engineering':'Professional Power Tools',
      'Systems Engineering':'Industrial Solutions'
    };
    const teamById=new Map((state.requestingTeams||[]).map(t=>[t.id,t])),teamByName=new Map((state.requestingTeams||[]).map(t=>[String(t.name||'').trim().toLowerCase(),t]));
    const unitForName=name=>buByName.get(String(name||'').trim().toLowerCase())||null;
    // First repair the controlled Project Team master records.
    for(const t of state.requestingTeams||[]){const target=unitForName(mapping[t.name]);if(target){t.businessUnitId=target.id;t.businessUnit=target.name;}}
    // Then repair only the known pre-populated demo requests. Keep their Project
    // Team identity and create a historical BU snapshot from that team.
    for(const r of demo){
      const team=(r.projectTeamId&&teamById.get(r.projectTeamId))||(r.engineeringTeamId&&teamById.get(r.engineeringTeamId))||teamByName.get(String(r.engineeringTeam||'').trim().toLowerCase());
      let target=team?.businessUnitId?buById.get(team.businessUnitId):unitForName(mapping[team?.name||r.engineeringTeam]);
      if(!target){const idx=Math.max(0,Number(String(r.id).slice(-2))-1),fallback=ProtoLab.BUSINESS_UNIT_DEMO_DEFAULTS[idx%ProtoLab.BUSINESS_UNIT_DEMO_DEFAULTS.length];target=unitForName(fallback.name);}
      if(target){r.businessUnitId=target.id;r.businessUnit=target.name;if(team){r.projectTeamId=team.id;r.engineeringTeamId=team.id;r.engineeringTeam=team.name;}}
    }
    state.settings.demoBusinessUnitDistributionV128='migrated-legacy-demo';state.settings.demoDiversityVersion='1.0.128';
    return state;
  };

  const _ensureBusinessUnitModelV1128=ProtoLab.ensureBusinessUnitModel;
  ProtoLab.ensureBusinessUnitModel=state=>{state=_ensureBusinessUnitModelV1128(state);ProtoLab.ensureDemoBusinessUnitDiversityV128(state);return state;};
  ProtoLab.activeBusinessUnits = state => {ProtoLab.ensureBusinessUnitModel(state);return (state.businessUnits||[]).filter(x=>x.active!==false).slice().sort((a,b)=>String(a.name).localeCompare(String(b.name)));};
  ProtoLab.businessUnitByIdOrName = (state,id,name='') => {ProtoLab.ensureBusinessUnitModel(state);return (state.businessUnits||[]).find(x=>id&&x.id===id)||(state.businessUnits||[]).find(x=>String(x.name).toLowerCase()===String(name||id||'').trim().toLowerCase())||null;};
  ProtoLab.businessUnitForTeam = (state,team) => {if(!team)return null;ProtoLab.ensureBusinessUnitModel(state);return ProtoLab.businessUnitByIdOrName(state,team.businessUnitId,team.businessUnit);};
  ProtoLab.businessUnitForRequest = (state,r) => {if(!r)return null;ProtoLab.ensureBusinessUnitModel(state);const direct=ProtoLab.businessUnitByIdOrName(state,r.businessUnitId,r.businessUnit);if(direct)return direct;const team=ProtoLab.requestingTeamByIdOrName?.(state,r.projectTeamId||r.engineeringTeamId,r.engineeringTeam);return ProtoLab.businessUnitForTeam(state,team);};

  const _ensureRequestingTeamModelV1127=ProtoLab.ensureRequestingTeamModel;
  ProtoLab.ensureRequestingTeamModel=state=>{state=_ensureRequestingTeamModelV1127(state);ProtoLab.ensureBusinessUnitModel(state);return state;};
  const _validateInvariantsV1127=ProtoLab.validateInvariants;
  ProtoLab.validateInvariants=state=>{
    const out=_validateInvariantsV1127(state);ProtoLab.ensureBusinessUnitModel(state);
    const ids=new Set(),names=new Set();
    for(const b of state.businessUnits||[]){const nk=String(b.name||'').trim().toLowerCase();if(!b.id)out.push('Business Unit missing stable ID');else if(ids.has(b.id))out.push(`Duplicate Business Unit ID ${b.id}`);else ids.add(b.id);if(!nk)out.push(`Business Unit ${b.id||'unknown'} has no name`);else if(names.has(nk))out.push(`Duplicate Business Unit name ${b.name}`);else names.add(nk);}
    for(const t of state.requestingTeams||[])if(t.businessUnitId&&!ids.has(t.businessUnitId))out.push(`${t.id}: Business Unit reference ${t.businessUnitId} does not exist`);
    for(const r of state.requests||[])if(r.businessUnitId&&!ids.has(r.businessUnitId))out.push(`${r.id}: Business Unit reference ${r.businessUnitId} does not exist`);
    return [...new Set(out)];
  };


  /* ============================================================
     LabOS REV 1.0.129 — development-time learning model.
     Development effort is retained separately from execution time.
     Only completed, measured actual engineering hours influence future
     recommendations; estimates and demo history remain fully traceable.
     ============================================================ */
  const devNormV129=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const devRoundV129=x=>Math.max(.5,Math.round(Number(x||0)*2)/2);
  const devDateV129=x=>String(x?.completedAt||x?.date||x?.createdAt||'').slice(0,10);
  ProtoLab.developmentMethodKeyV129=(kind,id,name)=>`${kind||'development'}:${id||devNormV129(name)||'unknown'}`;
  ProtoLab.developmentHistoryForTestV129=(state,testId)=>{
    ProtoLab.ensureDevelopmentLearningV129?.(state);const t=(state.standardTests||[]).find(x=>x.id===testId),nm=devNormV129(t?.name);
    return (state.developmentHistory||[]).filter(x=>x.kind==='test'&&(x.methodId===testId||(!x.methodId&&nm&&devNormV129(x.methodName)===nm))).slice().sort((a,b)=>devDateV129(a).localeCompare(devDateV129(b)));
  };
  ProtoLab.developmentRecommendationV129=(state,ctx={})=>{
    ProtoLab.ensureDevelopmentLearningV129?.(state);const kind=ctx.kind||'test',id=ctx.methodId||ctx.standardTestId||ctx.processId||null,name=ctx.name||'',family=ctx.familyId||ctx.family||'',type=ctx.developmentType||'';
    const all=(state.developmentHistory||[]).filter(x=>x.kind===kind&&Number(x.actualHours)>0&&String(x.actualSource||'Measured')==='Measured'&&x.completedAt&&String(x.outcome||'Successful')!=='Failed').slice().sort((a,b)=>devDateV129(a).localeCompare(devDateV129(b)));
    const exact=all.filter(x=>id?x.methodId===id:devNormV129(x.methodName)===devNormV129(name));
    const typed=type?exact.filter(x=>x.developmentType===type):exact;
    const exactBasis=typed.length>=2?typed:exact;
    const familyRows=family?all.filter(x=>x.familyId===family&&(!id||x.methodId!==id)):[];
    let rows=exactBasis.length?exactBasis:familyRows,source=exactBasis.length?'Exact method history':familyRows.length?'Comparable family history':'No measured history';
    const fallback=devRoundV129(ctx.fallbackHours||ctx.currentEstimate||2);
    if(!rows.length)return {hours:fallback,samples:0,exactSamples:0,familySamples:0,confidence:'Baseline',basis:`${source}; use controlled planning baseline ${fallback.toFixed(1)} h`,trendPct:null,history:[]};
    const values=rows.map(x=>Number(x.actualHours)).filter(Number.isFinite),median=ProtoLab.median(values),recent=ProtoLab.median(values.slice(-Math.min(3,values.length))),first=ProtoLab.median(values.slice(0,Math.min(3,values.length))),learned=exactBasis.length>=3?.7*recent+.3*median:exactBasis.length?median:recent;
    const hours=devRoundV129(learned),trendPct=first>0?100*(recent-first)/first:null,confidence=exactBasis.length>=5?'High':exactBasis.length>=3?'Medium':exactBasis.length?'Low':'Family';
    return {hours,samples:rows.length,exactSamples:exact.length,familySamples:familyRows.length,confidence,basis:`${source} · recent median ${Number(recent).toFixed(1)} h · n=${rows.length} · ${confidence} confidence`,trendPct:Number.isFinite(trendPct)?Number(trendPct.toFixed(1)):null,history:rows.slice()};
  };
  ProtoLab.recordDevelopmentHistoryV129=(state,rec={})=>{
    ProtoLab.ensureDevelopmentLearningV129?.(state);state.developmentHistory=state.developmentHistory||[];
    const actual=Number(rec.actualHours||0);if(!(actual>0))return null;
    const sourceRecordId=rec.sourceRecordId||null,kind=rec.kind||'test',methodId=rec.methodId||null,methodName=String(rec.methodName||'Development').trim(),requestId=rec.requestId||null;
    let row=sourceRecordId?state.developmentHistory.find(x=>x.kind===kind&&x.sourceRecordId===sourceRecordId):null;
    const payload={kind,sourceRecordId,requestId,labId:rec.labId||null,productId:rec.productId||null,methodId,methodName,familyId:rec.familyId||null,developmentType:rec.developmentType||'Adaptation',plannedHours:Number(rec.plannedHours||0)||null,recommendedHours:Number(rec.recommendedHours||0)||null,actualHours:actual,actualSource:rec.actualSource||'Measured',startedAt:rec.startedAt||null,completedAt:rec.completedAt||ProtoLab.todayISO(),trialCount:Math.max(0,Number(rec.trialCount||0)),outcome:rec.outcome||'Successful',note:String(rec.note||''),updatedAt:ProtoLab.now(),updatedBy:rec.actor||state.identity?.name||'Unknown',source:rec.source||'Development workflow'};
    if(row){Object.assign(row,payload);return row}
    row={id:ProtoLab.uid('DEVH'),createdAt:ProtoLab.now(),createdBy:rec.actor||state.identity?.name||'Unknown',...payload};state.developmentHistory.push(row);return row;
  };
  ProtoLab.ensureDevelopmentLearningV129=state=>{
    state=state||{};state.settings=state.settings||{};state.developmentHistory=Array.isArray(state.developmentHistory)?state.developmentHistory:[];
    for(const d of state.processDevelopments||[]){d.developmentType=d.developmentType||(/new process/i.test(d.conclusion||d.name||'')?'New method':'Adaptation');d.actualDevelopmentHours=Number(d.actualDevelopmentHours||0)||null;d.developmentStartedAt=d.developmentStartedAt||null;d.developmentCompletedAt=d.developmentCompletedAt||null;}
    for(const r of state.requests||[])for(const tr of r.testRequirements||[]){tr.developmentType=tr.developmentType||'Adaptation';tr.actualDevelopmentHours=Number(tr.actualDevelopmentHours||0)||null;tr.developmentStartedAt=tr.developmentStartedAt||null;tr.developmentCompletedAt=tr.developmentCompletedAt||null;}
    // Seed only the demo dataset, and only when there is no development history yet.
    // These rows are visibly marked Demo development history and never appear in a non-demo state.
    if(state.settings.demoDataset){
      const tests=state.standardTests||[],currentIds=new Set(tests.map(t=>t.id));
      // createDemoState performs several controlled demo upgrades after its first
      // ensureEnterpriseModel pass. Remove only obsolete *demo seed* rows when
      // the Standard Test catalogue was replaced; measured user-entered rows are untouched.
      state.developmentHistory=state.developmentHistory.filter(x=>!x.demoSeed||!x.methodId||currentIds.has(x.methodId));
      const labs=(state.labs||[]).filter(x=>x.type!=='external'),reqs=(state.requests||[]),dates=['2025-11-18','2026-02-12','2026-05-20','2026-08-14'];
      tests.forEach((t,i)=>{const covered=state.developmentHistory.some(x=>x.kind==='test'&&x.methodId===t.id);if(covered)return;const base=8+(i%6)*2;dates.forEach((dt,k)=>{const planned=devRoundV129(base-Math.min(2.5,k*.7)),actual=devRoundV129(Math.max(2,planned+[1.5,-.5,.5,-1][(i+k)%4]));state.developmentHistory.push({id:`DEVH-DEMO-${t.id}-${k+1}`,kind:'test',sourceRecordId:`DEMO-${t.id}-${k+1}`,requestId:reqs[(i*3+k)%Math.max(1,reqs.length)]?.id||null,labId:labs.length?labs[(i+k)%labs.length]?.id||null:null,productId:reqs[(i*3+k)%Math.max(1,reqs.length)]?.productId||null,methodId:t.id,methodName:t.name,familyId:t.familyId||null,developmentType:k===0?'New method':k===1?'Revision':'Adaptation',plannedHours:planned,recommendedHours:k?devRoundV129(base-(k-1)*.7):null,actualHours:actual,actualSource:'Measured',startedAt:dt,completedAt:dt,trialCount:1+((i+k)%3),outcome:'Successful',note:'Illustrative demo method-development evidence',createdAt:dt+'T12:00:00Z',createdBy:'Demo data',updatedAt:dt+'T12:00:00Z',updatedBy:'Demo data',source:'Demo development history',demoSeed:true});});});
      state.settings.demoDevelopmentHistorySeedV129='seeded-current-catalogue';
    }
    return state;
  };
  const _ensureEnterpriseModelV129=ProtoLab.ensureEnterpriseModel;
  ProtoLab.ensureEnterpriseModel=state=>{state=_ensureEnterpriseModelV129(state);ProtoLab.ensureDevelopmentLearningV129(state);return state;};
  const _validateInvariantsV129=ProtoLab.validateInvariants;
  ProtoLab.validateInvariants=state=>{const out=_validateInvariantsV129(state);ProtoLab.ensureDevelopmentLearningV129(state);const ids=new Set();for(const x of state.developmentHistory||[]){if(!x.id)out.push('Development history record missing ID');else if(ids.has(x.id))out.push(`Duplicate development history ID ${x.id}`);else ids.add(x.id);if(!(Number(x.actualHours)>0))out.push(`${x.id||'Development history'}: actual hours must be positive`);if(!x.kind||!['test','process'].includes(x.kind))out.push(`${x.id||'Development history'}: invalid development kind`);}return [...new Set(out)]};


  /* ============================================================
     LabOS REV 1.0.133 — prototype-flow evidence semantics.

     A governed workflow fact may satisfy a route prerequisite without
     creating a second schedulable operation.  Material receipt is the
     first such fact: once the exact BOM is actually issued for the build,
     the planner must not invent a second "Material Receipt" booking.
     ============================================================ */
  ProtoLab.isMaterialReceiptStepV133 = step => {
    const n=ProtoLab.normalisePlanningText?.(step?.name||step?.processName||'')||String(step?.name||'').toLowerCase();
    return n==='material receipt'||n==='receive material'||n==='material receiving'||n==='materials receipt';
  };
  ProtoLab.requestEvidenceSatisfiesRouteStepV133 = (state,r,step) => {
    if(!r||!step)return false;
    if(ProtoLab.isMaterialReceiptStepV133(step)){
      const mat=ProtoLab.materialPlanningAssessment?.(state,r);
      return mat?.buildReady===true;
    }
    return false;
  };

  /* Calibration readiness is deliberately split into three different facts:
     1) the calibration interval itself is still valid for the planned use;
     2) controlled certificate evidence is present/approved; and
     3) a future calibration activity may already be scheduled before use.
     Missing certificate evidence must never be mislabelled as "calibration due". */
  ProtoLab.calibrationReadinessDetailV133 = (state,e,useStart=ProtoLab.now()) => {
    if(!e)return {ready:false,renewalRequired:false,evidenceGap:false,reason:'Equipment not found'};
    const t=new Date(useStart||ProtoLab.now()),onDate=Number.isNaN(t.getTime())?ProtoLab.todayISO():t.toISOString().slice(0,10);
    if(e.calibrationRequired===false)return {ready:true,renewalRequired:false,evidenceGap:false,onDate,dueDate:null,reason:'Calibration not required'};
    const due=String(e.calibrationDue||'').slice(0,10)||null,statusValid=String(e.calibrationStatus||'')==='Valid',intervalValid=statusValid&&(!due||due>=onDate);
    const cert=ProtoLab.validCalibrationCertificate?.(state,e.id,onDate)||null;
    const planned=(state?.resourceCareBookings||[]).filter(x=>x.status==='Scheduled'&&x.type==='Calibration'&&x.equipmentId===e.id&&new Date(x.end||x.start)<=t&&(!x.projectedNextDue||String(x.projectedNextDue).slice(0,10)>=onDate)).sort((a,b)=>String(b.end||b.start).localeCompare(String(a.end||a.start)))[0]||null;
    const ready=!!(planned||(intervalValid&&cert));
    const renewalRequired=!planned&&!intervalValid;
    const evidenceGap=!planned&&intervalValid&&!cert;
    let reason=ready?(planned?`Scheduled calibration completes before planned use and projects validity to ${planned.projectedNextDue||'the use date'}`:`Approved certificate ${cert?.certificateNo||cert?.id||''} valid through ${due||cert?.nextDue||'the use date'}`):renewalRequired?`Calibration is not valid for planned use on ${onDate}${due?`; current due date is ${due}`:''}`:`Calibration interval is valid through ${due||'the use date'}, but approved certificate evidence is missing or incomplete`;
    return {ready,renewalRequired,evidenceGap,onDate,dueDate:due,certificate:cert,plannedCare:planned,status:e.calibrationStatus||'',reason};
  };

  const _projectedEquipmentReadyAtV133=ProtoLab.projectedEquipmentReadyAt;
  ProtoLab.projectedEquipmentReadyAt = (state,e,useStart=ProtoLab.now()) => {
    if(!e)return false;
    const t=new Date(useStart||ProtoLab.now()),onDate=Number.isNaN(t.getTime())?ProtoLab.todayISO():t.toISOString().slice(0,10);
    const governance=ProtoLab.equipmentGovernanceAssessment?ProtoLab.equipmentGovernanceAssessment(e):{ready:true},exception=ProtoLab.activeAdminException?.(state,'Equipment',e.id,'Equipment governance');
    if(!governance.ready&&!exception)return false;
    const cal=ProtoLab.calibrationReadinessDetailV133(state,e,useStart);
    const care=(state?.resourceCareBookings||[]).filter(x=>x.status==='Scheduled'&&x.equipmentId===e.id&&new Date(x.end||x.start)<=t);
    const mntBase=e.maintenanceStatus!=='Overdue'&&(!e.maintenanceDue||String(e.maintenanceDue).slice(0,10)>=onDate),mntOk=mntBase||care.some(x=>x.type==='Maintenance'&&(!x.projectedNextDue||String(x.projectedNextDue).slice(0,10)>=onDate));
    return !!(cal.ready&&mntOk);
  };

  /* Repair only legacy DEMO certificates that pre-date formal approval fields.
     Real/user data is never fabricated or grandfathered here. */
  ProtoLab.repairDemoCalibrationEvidenceV133 = state => {
    if(!state?.settings?.demoDataset)return {changed:false,repaired:0};
    state.calibrationCertificates=Array.isArray(state.calibrationCertificates)?state.calibrationCertificates:[];
    let repaired=0;
    for(const e of state.equipment||[]){
      if(e.calibrationRequired===false||e.calibrationStatus!=='Valid'||!e.calibrationDue)continue;
      const rows=state.calibrationCertificates.filter(c=>c.equipmentId===e.id&&c.result==='Pass'&&c.nextDue&&c.nextDue>=ProtoLab.todayISO());
      let c=rows.sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')))[0]||null;
      if(!c){const due=new Date(`${e.calibrationDue}T12:00:00`),completed=new Date(due.getTime()-180*86400000);c={id:`CALCERT-${e.id}-V133-DEMO`,equipmentId:e.id,certificateNo:`CAL-${e.id}-DEMO`,issuer:'Accredited Calibration Lab (Demo)',referenceStandard:'Traceable reference standard',completedAt:completed.toISOString().slice(0,10),nextDue:e.calibrationDue,result:'Pass',status:'Valid',sourceType:'Demo migrated evidence',evidence:`Demo calibration certificate ${e.id}`,fileName:`CAL-${e.id}-demo.txt`,fileType:'text/plain',fileData:'data:text/plain;base64,REVNTyBDQUxJQlJBVElPTiBDRVJUSUZJQ0FURSAtIExhYk9T',documentUploaded:true,person:'Demo data'};state.calibrationCertificates.push(c);repaired++;}
      const before=JSON.stringify([c.status,c.approvalStatus,c.approvedBy,c.documentUploaded,!!c.fileData,c.nextDue]);
      c.status='Valid';c.approvalStatus='Approved';c.approvedBy=c.approvedBy||'Demo migration / prior controlled review';c.approvedAt=c.approvedAt||c.completedAt||ProtoLab.now();c.approvalRationale=c.approvalRationale||'Legacy demo certificate normalized to current controlled-evidence model.';c.documentUploaded=!!(c.documentUploaded||c.fileData);c.nextDue=c.nextDue||e.calibrationDue;
      const after=JSON.stringify([c.status,c.approvalStatus,c.approvedBy,c.documentUploaded,!!c.fileData,c.nextDue]);if(before!==after)repaired++;
    }
    if(repaired)state.settings.demoCalibrationEvidenceRepairV133=ProtoLab.now();
    return {changed:repaired>0,repaired};
  };
  const _ensureEnterpriseModelV133=ProtoLab.ensureEnterpriseModel;
  ProtoLab.ensureEnterpriseModel=state=>{state=_ensureEnterpriseModelV133(state);ProtoLab.repairDemoCalibrationEvidenceV133(state);return state;};


  /* REV 1.0.137 — canonical no-dedicated-equipment process semantics. */
  ProtoLab.processRequiresDedicatedEquipmentV137=(state,r,proc,step=null)=>{
    if(proc?.equipmentRequired===false||step?.equipmentRequired===false)return false;
    const name=String(step?.name||proc?.name||'').toLowerCase();
    if(/material receipt|cleaning$|surface preparation|mechanical assembly|packaging|manual bench|ultrasonic cleaning/.test(name))return false;
    return !!ProtoLab.planningCapabilityForProcess(state,r,proc);
  };



/* ============================================================
   LabOS REV 1.0.150 — product-scoped Control Plan selection.
   Request setup may reference a same-product Draft / Review requested
   plan as a controlled candidate. Final approval remains a readiness
   gate rather than an artificial prerequisite for planning.
   ============================================================ */
(function v146ControlPlanSelectionPolicy(P){
  const allowedStatus=new Set(['Approved','Review requested','Draft']);
  P.controlPlanSelectionStatusV146=cp=>{
    if(!cp)return 'Unavailable';
    if(cp.status==='Approved')return 'Approved';
    if(cp.status==='Review requested')return 'Approval requested';
    if(cp.status==='Draft')return 'Draft · approve later';
    return cp.status||'Unknown';
  };
  P.controlPlanSelectableForRequestV146=(state,cp,r)=>{
    if(!state||!cp||!r?.productId||cp.buildSpecific||!allowedStatus.has(String(cp.status||'')))return false;
    const ids=P.controlPlanProductIdsV144?P.controlPlanProductIdsV144(state,cp):[cp.productId].filter(Boolean);
    return ids.length===1&&ids[0]===r.productId;
  };
  P.controlPlansForRequestSelectionV146=(state,r)=>{
    if(!state||!r?.productId)return [];
    const rank={'Approved':0,'Review requested':1,'Draft':2};
    return (state.controlPlans||[])
      .filter(cp=>P.controlPlanSelectableForRequestV146(state,cp,r))
      .filter((cp,i,a)=>a.findIndex(x=>x.id===cp.id)===i)
      .sort((a,b)=>(rank[a.status]??9)-(rank[b.status]??9)||String(a.name||'').localeCompare(String(b.name||''))||String(a.revision||'').localeCompare(String(b.revision||'')));
  };
})(window.ProtoLab);

/* ============================================================
   LabOS REV 1.0.164 — shared Programme model.
   Validation is a programmeType specialisation of the same LabOS
   planning/resource/evidence/audit services used by Prototype.
   ============================================================ */
(function installSharedProgrammeModelV161(P){
  if(P.ensureProgrammeModelV161)return;
  const arr=(s,k)=>s[k]=Array.isArray(s[k])?s[k]:[];
  const iso=(n=0)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
  const text=v=>String(v??'').trim();
  const norm=v=>text(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const tokens=v=>new Set(norm(v).split(/\s+/).filter(x=>x.length>2&&!['the','and','for','with','from','must','shall','test','verify','verification','requirement'].includes(x)));
  const overlap=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let hit=0;for(const x of A)if(B.has(x))hit++;return hit/Math.max(A.size,B.size)};
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const productName=(state,pid)=>{const p=byId(state.products,pid);return p?.family||p?.name||p?.partNumber||pid||'Product'};
  const testText=t=>[t?.name,t?.output,...(t?.aliases||[]),t?.acceptanceCriteria].filter(Boolean).join(' ');
  const lifecycleStatus=p=>String(p?.status||'Requirements');
  const isClosed=p=>['Closed','Archived','Complete'].includes(lifecycleStatus(p))||p?.archived===true;
  const activityTests=(state,pid)=>arr(state,'validationActivities').filter(x=>x.programmeId===pid&&x.kind==='Validation Test');

  P.validationRequirementsV161=(state,pid)=>arr(state,'validationRequirements').filter(x=>x.programmeId===pid);
  P.validationLegsV161=(state,pid)=>arr(state,'validationLegs').filter(x=>x.programmeId===pid).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  P.validationActivitiesV161=(state,pid)=>arr(state,'validationActivities').filter(x=>x.programmeId===pid).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  P.validationResultsV161=(state,pid)=>arr(state,'validationResults').filter(x=>x.programmeId===pid);
  P.validationEvidenceV161=(state,pid)=>arr(state,'validationEvidence').filter(x=>x.programmeId===pid);

  P.rankValidationTestsV161=(state,requirement,limit=6)=>{
    const q=[requirement?.description,requirement?.category,requirement?.sourceReference].filter(Boolean).join(' ');
    const explicit=[];
    const n=norm(q);
    const hints=[
      [/thermal|temperature|heat|cold|clim/,['thermal','temperature','environment']],
      [/vibrat|vibro|shock|mechanical endurance/,['vibrat','vibro','shock','endurance']],
      [/pressure|leak|seal/,['pressure','leak']],
      [/dimension|geometry|size|tolerance/,['dimension','interface']],
      [/electr|current|voltage|continuity|insulation/,['electr','current','safety']],
      [/function|performance|signal|accuracy/,['functional','performance','signal','accuracy']],
      [/endurance|durability|cycle/,['endurance','cycle','load']]
    ];
    for(const [re,keys] of hints)if(re.test(n))explicit.push(...keys);
    return (state.standardTests||[]).filter(t=>t.status==='Released').map(t=>{
      const candidate=testText(t),shortCandidate=[t?.name,...(t?.aliases||[])].filter(Boolean).join(' '),base=overlap(q,candidate),nameBase=overlap(q,shortCandidate),testName=norm(shortCandidate);
      let intent=0;if(/thermal|temperature|heat|cold|clim/.test(n)&&/thermal|temperature|environment/.test(testName))intent=Math.max(intent,.52);if(/vibrat|vibro|shock/.test(n)&&/vibrat|vibro|shock/.test(testName))intent=Math.max(intent,.56);if(/endurance|durability|cycle/.test(n)&&/endurance|durability|cycle|load/.test(testName))intent=Math.max(intent,.44);if(/dimension|geometry|tolerance|interface/.test(n)&&/dimension|interface|geometry/.test(testName))intent=Math.max(intent,.52);if(/function|performance|signal|accuracy/.test(n)&&/functional|performance|signal|accuracy/.test(testName))intent=Math.max(intent,.48);if(/electr|current|voltage|continuity|insulation/.test(n)&&/electr|current|voltage|continuity|safety/.test(testName))intent=Math.max(intent,.5);if(/pressure|leak|seal/.test(n)&&/pressure|leak|seal/.test(testName))intent=Math.max(intent,.52);
      const hint=explicit.some(h=>testName.includes(h))?.2:0;
      const prior=(state.validationActivities||[]).filter(a=>a.standardTestId===t.id&&a.status==='Complete').length;
      const cap=P.planningCapabilityForTest?.(t)||t.planningCapability||t.equipmentCapability,hasEquipment=!cap||(state.equipment||[]).some(e=>P.equipmentSupportsCapability?.(e,cap)||(norm(P.equipmentPlanningCapability?.(e)||e.planningCapability||e.capability)===norm(cap)));
      const score=Math.max(0,Math.min(.99,nameBase*.46+base*.22+intent+hint+Math.min(.08,prior*.02)+(hasEquipment?.05:-.22)));
      const missing=[];
      const checks=[[/temperature|thermal|cold|heat/i,'temperature range'],[/cycle|cycles|endurance/i,'cycle count'],[/resolution|accuracy|tolerance/i,'measurement resolution / accuracy'],[/humidity/i,'humidity range'],[/vibration|frequency|g\b/i,'vibration profile'],[/pressure/i,'pressure range'],[/duration|hour|minute/i,'exposure duration']];
      for(const [re,label] of checks)if(re.test(q)&&!re.test(candidate))missing.push(label);
      return {test:t,score,coverage:Math.max(35,Math.min(98,Math.round(score*100))),missing,priorUses:prior};
    }).sort((a,b)=>b.score-a.score||String(a.test.name).localeCompare(String(b.test.name))).slice(0,limit);
  };

  P.estimateValidationDevelopmentV161=(state,req,test=null,mode='adapt')=>{
    const history=arr(state,'validationDevelopmentHistory').filter(x=>!test||x.basisTestId===test.id).map(x=>Number(x.actualHours)).filter(Number.isFinite);
    const hist=history.length?P.median(history):null;
    const base=hist??(test?Math.max(3,P.planningStandardHours(test,1)*2.5):8);
    const q=norm(req?.description),delta=(q.match(/temperature|cycle|resolution|accuracy|fixture|software|measurement|profile|pressure|humidity|vibration/g)||[]).length;
    const factor=mode==='new'?1.55:mode==='combine'?1.25:1;
    return Math.max(2,Math.round((base+delta*1.25)*factor*2)/2);
  };

  P.mapValidationRequirementV161=(state,requirementId,{mode='reuse',testIds=[],coverage=null,actor=null}={})=>{
    const r=byId(arr(state,'validationRequirements'),requirementId);if(!r)throw new Error('Validation requirement was not found.');
    const ranked=P.rankValidationTestsV161(state,r,8),ids=testIds.filter(Boolean);
    if(mode==='new'){
      r.mapping={mode:'new',testIds:[],coverage:Number(coverage)||0,basis:'No released Standard Test fully covers the controlled requirement.',missingAspects:['new controlled method required'],decisionAt:P.now(),decisionBy:actor||state.identity?.name||'Engineer'};
      r.status='Planned';return r;
    }
    if(!ids.length&&ranked[0])ids.push(ranked[0].test.id);
    const chosen=ids.map(id=>byId(state.standardTests,id)).filter(Boolean);if(!chosen.length)throw new Error('Choose a released Standard Test or select Develop new.');
    const matched=ranked.filter(x=>ids.includes(x.test.id));
    let cov=Number(coverage);if(!Number.isFinite(cov))cov=mode==='combine'?Math.min(98,Math.max(...matched.map(x=>x.coverage),55)+12):matched[0]?.coverage||65;
    if(mode==='reuse')cov=Math.max(80,cov);
    const missing=[...new Set(matched.flatMap(x=>x.missing||[]))];
    r.mapping={mode,testIds:ids,coverage:Math.round(cov),basis:chosen.map(x=>`${x.id} · ${x.name} Rev ${x.revision||'—'}`).join(' + '),missingAspects:mode==='reuse'&&cov>=90?[]:missing,decisionAt:P.now(),decisionBy:actor||state.identity?.name||'Engineer'};
    r.status='Planned';return r;
  };

  P.validationGraphCheckV161=(state,pid)=>{
    const legs=P.validationLegsV161(state,pid),acts=P.validationActivitiesV161(state,pid),ids=new Set(acts.map(x=>x.id)),legIds=new Set(legs.map(x=>x.id)),issues=[];
    for(const a of acts){if(!legIds.has(a.legId))issues.push(`${a.id} is not attached to a programme leg.`);for(const dep of a.predecessorIds||[])if(!ids.has(dep))issues.push(`${a.id} has missing predecessor ${dep}.`)}
    const visiting=new Set(),done=new Set(),map=new Map(acts.map(x=>[x.id,x]));
    const dfs=id=>{if(done.has(id))return;if(visiting.has(id)){issues.push(`Dependency cycle at ${id}.`);return}visiting.add(id);for(const d of map.get(id)?.predecessorIds||[])dfs(d);visiting.delete(id);done.add(id)};for(const a of acts)dfs(a.id);
    return {ok:issues.length===0,issues,floating:acts.filter(a=>!a.legId).length,nodes:acts.length,legs:legs.length};
  };

  P.buildValidationProgrammeV161=(state,pid,{actor=null}={})=>{
    const p=byId(arr(state,'validationProgrammes'),pid);if(!p)throw new Error('Validation programme was not found.');
    const reqs=P.validationRequirementsV161(state,pid);if(!reqs.length)throw new Error('Add at least one controlled requirement first.');
    const unmapped=reqs.filter(r=>!r.mapping);if(unmapped.length)throw new Error(`${unmapped.length} requirement(s) still need a test-mapping decision.`);
    state.validationLegs=arr(state,'validationLegs').filter(x=>x.programmeId!==pid);state.validationActivities=arr(state,'validationActivities').filter(x=>x.programmeId!==pid);
    const categoryOrder=[];for(const r of reqs){const c=text(r.legName||r.category||'Verification')||'Verification';if(!categoryOrder.includes(c))categoryOrder.push(c)}
    categoryOrder.forEach((name,i)=>state.validationLegs.push({id:`${pid}-LEG-${i+1}`,programmeId:pid,name,order:i+1,status:'Planned'}));
    let idx=0;
    for(const leg of P.validationLegsV161(state,pid)){
      let prior=[];const legReqs=reqs.filter(r=>(text(r.legName||r.category||'Verification')||'Verification')===leg.name);
      for(const r of legReqs){
        const map=r.mapping||{},ids=map.testIds||[],candidate=ids.length?byId(state.standardTests,ids[0]):null,development=map.mode==='new'||map.mode==='adapt'||Number(map.coverage||0)<80;
        let devId=null;
        if(development){devId=`${pid}-A-${++idx}`;state.validationActivities.push({id:devId,programmeId:pid,legId:leg.id,order:idx,kind:'Test Development',name:`Develop / adapt method · ${candidate?.name||r.id}`,requirementIds:[r.id],basisTestId:candidate?.id||null,standardTestId:null,estimatedHours:P.estimateValidationDevelopmentV161(state,r,candidate,map.mode),actualHours:null,status:'Planned',predecessorIds:[...prior],planningCapability:candidate?.planningCapability||P.inferPlanningCapabilityFromName(r.description),equipmentCapability:candidate?.equipmentCapability||P.inferPlanningCapabilityFromName(r.description),competency:candidate?.competency||P.inferPlanningSkillFromName(r.description)});prior=[devId]}
        const selected=ids.length?ids:[null];
        const testActs=[];
        for(const tid of selected){const t=byId(state.standardTests,tid),aid=`${pid}-A-${++idx}`;state.validationActivities.push({id:aid,programmeId:pid,legId:leg.id,order:idx,kind:'Validation Test',name:t?.name||`Developed verification · ${r.id}`,requirementIds:[r.id],standardTestId:t?.id||null,basisTestId:t?.id||null,estimatedHours:t?P.planningStandardHours(t,p.quantity||1):Math.max(1,(p.quantity||1)*.5),actualHours:null,status:'Planned',predecessorIds:[...prior],planningCapability:t?.planningCapability||P.inferPlanningCapabilityFromName(r.description),equipmentCapability:t?.equipmentCapability||P.inferPlanningCapabilityFromName(r.description),competency:t?.competency||P.inferPlanningSkillFromName(r.description),acceptanceCriteria:r.acceptanceCriteria||t?.acceptanceCriteria||'Meet controlled requirement.'});testActs.push(aid)}
        prior=[...testActs];r.linkedActivityIds=[...(development&&devId?[devId]:[]),...testActs];r.status='Planned';
      }
    }
    p.status='Programme';p.programmeGeneratedAt=P.now();p.programmeGeneratedBy=actor||state.identity?.name||'Engineer';p.updatedAt=P.now();
    const check=P.validationGraphCheckV161(state,pid);if(!check.ok)throw new Error(check.issues[0]);
    P.audit?.(state,'Validation programme generated','Validation Programme',pid,'Requirements / mappings',`${check.legs} legs · ${check.nodes} activities`,'Shared Programme Logic generated from controlled requirements.');
    P.syncValidationActionsV161(state);return {programme:p,...check};
  };

  P.syncValidationRequirementStatusesV161=(state,pid)=>{
    const reqs=P.validationRequirementsV161(state,pid),res=P.validationResultsV161(state,pid),acts=P.validationActivitiesV161(state,pid);
    for(const r of reqs){
      if(!r.mapping){r.status='Not Covered';continue}
      const linked=(r.linkedActivityIds||[]).map(id=>byId(acts,id)).filter(a=>a?.kind==='Validation Test');
      if(!linked.length){r.status='Planned';continue}
      const rr=linked.map(a=>res.find(x=>x.activityId===a.id)).filter(Boolean);
      if(rr.some(x=>x.outcome==='Fail'))r.status='Failed';else if(rr.length===linked.length&&rr.every(x=>x.outcome==='Pass'))r.status='Verified';else if(rr.length)r.status='Partially Verified';else if(linked.some(x=>x.status==='In Progress'))r.status='In Progress';else r.status='Planned';
    }
    return reqs;
  };

  P.validationWorkflowStateV161=(state,p)=>{
    const reqs=P.syncValidationRequirementStatusesV161(state,p.id),acts=P.validationActivitiesV161(state,p.id),tests=acts.filter(a=>a.kind==='Validation Test'),bookings=(state.bookings||[]).filter(b=>b.requestId===p.id&&!P.isHistoricalPlanningBooking(b)),results=P.validationResultsV161(state,p.id),report=(state.validationReports||[]).find(x=>x.programmeId===p.id&&x.current!==false);
    const mapped=reqs.filter(r=>!!r.mapping).length,verified=reqs.filter(r=>r.status==='Verified').length,failed=reqs.filter(r=>r.status==='Failed').length;
    const states=[
      {id:'requirements',title:'Requirements',done:reqs.length>0&&mapped===reqs.length,blocked:reqs.length===0,next:reqs.length?`${mapped}/${reqs.length} mapped`:'Add or import controlled requirements'},
      {id:'programme',title:'Programme Logic',done:acts.length>0&&P.validationGraphCheckV161(state,p.id).ok,blocked:reqs.length===0||mapped<reqs.length,next:acts.length?`${P.validationLegsV161(state,p.id).length} legs · ${acts.length} activities`:'Generate from approved mappings'},
      {id:'planning',title:'Resource Plan',done:bookings.length>0,blocked:!acts.length,next:bookings.length?`${bookings.length} shared-resource bookings`:'Run the shared LabOS planner'},
      {id:'execution',title:'Execution',done:tests.length>0&&results.length>=tests.length&&!failed,blocked:!bookings.length,next:`${results.length}/${tests.length} test results captured`},
      {id:'report',title:'Report & Close',done:report?.status==='Approved'||isClosed(p),blocked:tests.length>0&&results.length<tests.length,next:`${verified}/${reqs.length} verified${failed?` · ${failed} failed`:''}`}
    ];
    let current=states.find(x=>!x.done&&!x.blocked)||states.find(x=>!x.done)||states.at(-1);return {states,current:current?.id||'report',reqs,mapped,verified,failed,activities:acts,tests,bookings,results,report};
  };

  P.validationSyntheticRequestV161=(state,p)=>{
    const acts=P.validationActivitiesV161(state,p.id),tests=acts.filter(a=>a.kind==='Validation Test'),names=tests.map(a=>a.name),r={id:p.id,title:p.title,requester:p.requester||p.owner,engineeringTeam:p.businessUnit||'Validation',customerId:p.customerId||'CUST-VALIDATION',programme:p.project||p.programme||p.id,vehicleProgramme:p.project||'',productId:p.productId,productFamily:p.productFamily||productName(state,p.productId),productRevision:p.productRevision||byId(state.products,p.productId)?.revision||'A',hardwareRevision:p.hardwareRevision||byId(state.products,p.productId)?.hw||'—',softwareRevision:p.softwareRevision||byId(state.products,p.productId)?.sw||'—',maturity:p.maturity||'B-sample',purpose:'Design validation',assuranceProfile:'rapid',quantity:Math.max(1,Number(p.quantity||1)),requiredDate:p.requiredDate||iso(21),forecastDate:p.forecastDate||null,priority:p.priority||'High',deliveryLocation:p.deliveryLocation||'Validation Lab',objective:`Validation programme ${p.id}`,configuration:p.configuration||`${productName(state,p.productId)} validation`,bomRef:null,materialOwnership:'Engineering supplied',materialRequirements:[],materialSupply:{owner:p.owner||state.identity?.name||'Engineering',expectedDate:p.dutAvailableDate||p.prototypeReleaseDate||P.todayISO(),reference:`Validation DUT availability · ${p.id}`,receivedAt:p.dutReceivedAt||null},specialHandling:'Controlled validation samples',specialCharacteristics:[],productSafety:false,characterisation:names,status:'SUBMITTED',currentGate:'SUBMITTED',risk:'Medium',owner:p.owner||state.identity?.name||'Lab Planner',submittedAt:p.createdAt||P.now(),createdAt:p.createdAt||P.now(),notes:'Synthetic shared-planner projection for controlled Validation programme.',routeId:null,controlPlanId:null,programmeType:'validation',executionSiteId:p.executionSiteId||p.homeSiteId||state.settings?.activeLabId||state.settings?.primaryLabId,homeSiteId:p.homeSiteId||state.settings?.activeLabId||state.settings?.primaryLabId,planningNotBefore:p.planningNotBefore||p.dutAvailableDate||null};
    P.ensureTestRequirements(state,r);
    for(const tr of r.testRequirements||[]){const a=tests.find(x=>norm(x.name)===norm(tr.name));if(!a)continue;tr.standardTestId=a.standardTestId||null;tr.equipmentCapability=a.equipmentCapability||a.planningCapability||tr.equipmentCapability;tr.competency=a.competency||tr.competency;tr.executionEstimateHours=Math.max(.25,Number(a.estimatedHours||tr.executionEstimateHours||1));const dev=acts.find(x=>x.kind==='Test Development'&&(x.requirementIds||[]).some(id=>(a.requirementIds||[]).includes(id)));if(dev){tr.standardTestId=null;tr.developmentEstimateHours=Math.max(1,Number(dev.estimatedHours||4));tr.status='Development required'}}
    return r;
  };

  P.planValidationV161=(state,pid,{siteId=null,notBefore=null,commit=true}={})=>{
    // REV 1.0.182+: Validation uses the same canonical programme planning API as Prototype.
    // The legacy body below remains only as a bootstrap fallback for environments that
    // deliberately load core without the planning module.
    if(P.planProgrammeV181){
      const r=P.planProgrammeV181(state,pid,{siteId,notBefore,commit,action:'Validation resource plan committed',reason:'Shared canonical PlanningEngine'});
      return {proposal:{success:true,bookings:r.bookingCount||r.bookings?.length||0,forecastDate:r.forecastDate||null,quality:'Best feasible'},bookings:r.bookings||[],forecastDate:r.forecastDate||null,siteId:r.siteId||siteId};
    }
    const p=byId(arr(state,'validationProgrammes'),pid);if(!p)throw new Error('Validation programme was not found.');
    if(!P.validationActivitiesV161(state,pid).length)throw new Error('Generate the Validation programme before resource planning.');
    const clone=P.deepClone(state),cp=byId(clone.validationProgrammes,pid);if(siteId)cp.executionSiteId=siteId;if(notBefore)cp.planningNotBefore=notBefore;
    const synthetic=P.validationSyntheticRequestV161(clone,cp);clone.requests=arr(clone,'requests').filter(x=>x.id!==pid);clone.requests.push(synthetic);P.ensurePlanningModel(clone);
    // Re-apply the Validation activity planning semantics after normalisation.
    const acts=P.validationActivitiesV161(clone,pid),tests=acts.filter(a=>a.kind==='Validation Test');
    for(const tr of synthetic.testRequirements||[]){const a=tests.find(x=>norm(x.name)===norm(tr.name));if(a){tr.standardTestId=a.standardTestId||null;tr.equipmentCapability=a.equipmentCapability||a.planningCapability||tr.equipmentCapability;tr.competency=a.competency||tr.competency;tr.executionEstimateHours=Math.max(.25,Number(a.estimatedHours||tr.executionEstimateHours||1));const dev=acts.find(x=>x.kind==='Test Development'&&(x.requirementIds||[]).some(id=>(a.requirementIds||[]).includes(id)));if(dev){tr.standardTestId=null;tr.developmentEstimateHours=Math.max(1,Number(dev.estimatedHours||4));tr.status='Development required'}}}
    const planner=new P.PlannerService(),changes=planner.autoPlan(clone,pid),proposal={success:true,bookings:Array.isArray(changes)?changes.length:0,forecastDate:synthetic.forecastDate||synthetic.triage?.forecastDate||null,quality:synthetic.triage?.planQuality||'Best feasible'};
    const generated=(clone.bookings||[]).filter(b=>b.requestId===pid&&!P.isHistoricalPlanningBooking(b)).map(b=>({...b,domain:'Validation',programmeType:'validation',validationProgrammeId:pid}));
    if(!commit)return {proposal,bookings:generated,forecastDate:proposal.forecastDate||synthetic.forecastDate||synthetic.triage?.forecastDate||null,siteId:cp.executionSiteId};
    state.bookings=arr(state,'bookings').filter(b=>b.requestId!==pid||P.isHistoricalPlanningBooking(b));state.bookings.push(...generated);
    state.resourceCareBookings=arr(state,'resourceCareBookings').filter(c=>c.sourceRequestId!==pid||c.portfolioOwned===true||P.isHistoricalPlanningBooking(c));state.resourceCareBookings.push(...(clone.resourceCareBookings||[]).filter(c=>c.sourceRequestId===pid).map(c=>({...c,domain:'Validation',programmeType:'validation'})));
    const forecast=proposal.forecastDate||synthetic.forecastDate||synthetic.triage?.forecastDate||generated.map(x=>x.end||x.start).filter(Boolean).sort().at(-1)?.slice(0,10)||null;
    p.executionSiteId=cp.executionSiteId;p.forecastDate=forecast;p.planningNotBefore=notBefore||p.planningNotBefore||null;p.status='Planned';p.lastPlannedAt=P.now();p.lastPlannedBy=state.identity?.name||'Lab Planner';
    const bookByName=n=>generated.find(b=>norm(b.stepName).includes(norm(n))||norm(n).includes(norm(String(b.stepName||'').replace(/^test\s*·\s*/i,''))));
    for(const a of P.validationActivitiesV161(state,pid)){const b=bookByName(a.name);if(b){a.plannedStart=b.start;a.plannedEnd=b.end;a.equipmentId=b.equipmentId||null;a.staffId=b.staffId||null;a.siteId=b.siteId||p.executionSiteId}}
    P.audit?.(state,'Validation resource plan committed','Validation Programme',pid,'Unplanned',forecast||'Planned',`Shared constrained planner · ${generated.length} bookings · ${p.executionSiteId||'home lab'}`);P.syncValidationActionsV161(state);return {proposal,bookings:generated,forecastDate:forecast,siteId:p.executionSiteId};
  };

  P.validationSiteOptionsV161=(state,pid)=>{
    if(P.compareProgrammeLabsV181)return P.compareProgrammeLabsV181(state,pid).rows.map(x=>({siteId:x.siteId,name:x.name,feasible:!!x.ok,forecastDate:x.forecastDate||null,bookings:x.bookingCount||x.bookings?.length||0,reason:x.ok?null:x.reason,code:x.code||null}));
    P.ensureMultiLabModelV1099?.(state);const labs=(state.labs||state.sites||[]).filter(x=>x.status!=='Inactive');return labs.map(l=>{try{const r=P.planValidationV161(state,pid,{siteId:l.id,commit:false});return {siteId:l.id,name:l.name||l.id,feasible:true,forecastDate:r.forecastDate,bookings:r.bookings.length}}catch(e){return {siteId:l.id,name:l.name||l.id,feasible:false,reason:e.message}}});
  };

  P.validationKpisV161=(state,{siteId=null,from=null,to=null}={})=>{
    const programmes=arr(state,'validationProgrammes').filter(p=>!siteId||p.executionSiteId===siteId||p.homeSiteId===siteId),inRange=d=>(!from||String(d||'')>=from)&&(!to||String(d||'')<=to),scope=programmes.filter(p=>inRange(p.createdAt?.slice?.(0,10)||p.requiredDate));
    const ids=new Set(scope.map(p=>p.id)),bookings=(state.bookings||[]).filter(b=>ids.has(b.requestId)&&inRange(String(b.start||'').slice(0,10))),results=arr(state,'validationResults').filter(r=>ids.has(r.programmeId)&&inRange(String(r.at||'').slice(0,10))),dev=arr(state,'validationDevelopmentHistory').filter(x=>ids.has(x.programmeId)),late=scope.filter(p=>p.forecastDate&&p.requiredDate&&p.forecastDate>p.requiredDate),completed=scope.filter(p=>isClosed(p)||P.validationWorkflowStateV161(state,p).states.find(x=>x.id==='execution')?.done),onTime=completed.filter(p=>!p.actualCompletionDate||!p.requiredDate||p.actualCompletionDate<=p.requiredDate),network=scope.filter(p=>p.executionSiteId&&p.homeSiteId&&p.executionSiteId!==p.homeSiteId);
    return {programmes:scope.length,bookedHours:bookings.reduce((n,b)=>n+Number(b.durationHours||0),0),completed:completed.length,onTimePct:completed.length?Math.round(onTime.length/completed.length*100):null,late:late.length,daysLate:late.reduce((n,p)=>n+Math.max(0,P.daysBetween(p.requiredDate,p.forecastDate)),0),passPct:results.length?Math.round(results.filter(r=>r.outcome==='Pass').length/results.length*100):null,sisterLab:network.length,externalTests:arr(state,'validationActivities').filter(a=>ids.has(a.programmeId)&&a.executionMode==='External').length,developmentHours:dev.reduce((n,x)=>n+Number(x.actualHours||x.estimatedHours||0),0),developmentEstimateAccuracy:dev.length?Math.round(100-dev.reduce((n,x)=>n+Math.abs(Number(x.actualHours||0)-Number(x.estimatedHours||0))/Math.max(1,Number(x.estimatedHours||1)),0)/dev.length*100):null};
  };

  P.validationReportV161=(state,pid,{persist=false}={})=>{
    const p=byId(arr(state,'validationProgrammes'),pid);if(!p)throw new Error('Validation programme was not found.');P.syncValidationRequirementStatusesV161(state,pid);
    const reqs=P.validationRequirementsV161(state,pid),acts=P.validationActivitiesV161(state,pid),res=P.validationResultsV161(state,pid),evidence=P.validationEvidenceV161(state,pid),bookings=(state.bookings||[]).filter(b=>b.requestId===pid),aud=(state.auditTrail||[]).filter(a=>String(a.entityId||a.entity||a.requestId||'')===pid||String(a.target||'')===pid);
    const failed=reqs.filter(r=>r.status==='Failed'),verified=reqs.filter(r=>r.status==='Verified'),report={id:`VR-${pid}`,programmeId:pid,current:true,revision:p.reportRevision||'A',generatedAt:P.now(),generatedBy:state.identity?.name||'LabOS',status:failed.length?'Draft · failed requirements require disposition':verified.length===reqs.length&&reqs.length?'Ready for approval':'Draft',programme:{id:p.id,title:p.title,product:productName(state,p.productId),revision:p.productRevision||byId(state.products,p.productId)?.revision||'—',project:p.project||p.programme||'—',owner:p.owner,homeSiteId:p.homeSiteId,executionSiteId:p.executionSiteId,requiredDate:p.requiredDate,forecastDate:p.forecastDate,linkedPrototypeId:p.linkedPrototypeId||null},requirements:reqs.map(r=>({id:r.id,source:r.source,sourceReference:r.sourceReference,description:r.description,category:r.category,status:r.status,mapping:r.mapping,linkedActivityIds:r.linkedActivityIds||[]})),activities:acts.map(a=>({id:a.id,legId:a.legId,kind:a.kind,name:a.name,standardTestId:a.standardTestId,status:a.status,plannedStart:a.plannedStart,plannedEnd:a.plannedEnd,equipmentId:a.equipmentId,staffId:a.staffId,estimatedHours:a.estimatedHours,actualHours:a.actualHours})),results:res,evidence,bookings:bookings.map(b=>({step:b.stepName,start:b.start,end:b.end,equipmentId:b.equipmentId,staffId:b.staffId,siteId:b.siteId})),traceability:reqs.map(r=>({requirementId:r.id,testActivities:(r.linkedActivityIds||[]).filter(id=>acts.some(a=>a.id===id&&a.kind==='Validation Test')),resultStatus:r.status,evidence:res.filter(x=>(r.linkedActivityIds||[]).includes(x.activityId)).flatMap(x=>x.evidenceIds||[])})),lessons:{relevant:P.validationRelevantLessonsV161?.(state,pid,{limit:8})||[],captured:P.validationLessonCandidatesV161?.(state,pid)||[],applications:arr(state,'lessonApplicationsV161').filter(x=>x.programmeId===pid)},auditCount:aud.length,conclusion:failed.length?`${failed.length} requirement(s) failed and require controlled disposition.`:verified.length===reqs.length&&reqs.length?'All controlled requirements verified by recorded evidence.':'Validation execution is not yet complete.'};
    if(persist){state.validationReports=arr(state,'validationReports');for(const x of state.validationReports)if(x.programmeId===pid)x.current=false;state.validationReports.push(report);p.reportRevision=report.revision;P.audit?.(state,'Validation report generated','Validation Programme',pid,'Current evidence',`${report.status} · Rev ${report.revision}`,'Automatic controlled report generated from LabOS data.');}
    return report;
  };

  P.validationRelevantLessonsV161=(state,pid,{limit=6}={})=>{
    const p=byId(arr(state,'validationProgrammes'),pid);if(!p)return [];
    const reqText=P.validationRequirementsV161(state,pid).map(r=>`${r.description||''} ${r.category||''}`).join(' '),acts=P.validationActivitiesV161(state,pid),testIds=new Set(acts.map(a=>a.standardTestId||a.basisTestId).filter(Boolean));
    const currentIds=new Set([pid,p.linkedPrototypeId].filter(Boolean)),lessonText=l=>[l.title,l.lesson,l.observation,l.recommendation,l.action,l.cause,l.category].filter(Boolean).join(' ');
    return (state.lessons||[]).filter(l=>String(l.status||'Accepted').toLowerCase()!=='rejected'&&!currentIds.has(l.requestId)&&!currentIds.has(l.programmeId)).map(l=>{
      const srcProto=byId(state.requests,l.requestId),srcVal=byId(arr(state,'validationProgrammes'),l.programmeId||l.requestId),productId=l.productId||srcProto?.productId||srcVal?.productId||null,sourceType=l.sourceProgrammeType||(srcVal?'Validation':'Prototype');let score=0,reasons=[];
      if(productId&&p.productId&&productId===p.productId){score+=.62;reasons.push('same product')}
      const lTests=new Set([...(l.standardTestIds||[]),l.standardTestId,l.basisTestId].filter(Boolean));if([...lTests].some(x=>testIds.has(x))){score+=.34;reasons.push('same test/method')}
      const semantic=overlap(reqText,lessonText(l));if(semantic>.05){score+=Math.min(.42,semantic*.7);reasons.push('similar requirement / issue')}
      if(l.effectiveness==='Positive'){score+=.06;reasons.push('positive measured outcome')}
      return {lesson:l,score,sourceType,sourceId:l.programmeId||l.requestId||'—',reasons};
    }).filter(x=>x.score>=.18).sort((a,b)=>b.score-a.score||String(b.lesson.createdAt||b.lesson.date||'').localeCompare(String(a.lesson.createdAt||a.lesson.date||''))).slice(0,limit);
  };

  P.captureValidationLessonsV161=(state,pid)=>{
    const p=byId(arr(state,'validationProgrammes'),pid);if(!p)return [];
    const store=arr(state,'validationLessonCandidates'),existing=new Set(store.map(x=>x.id)),acts=P.validationActivitiesV161(state,pid),res=P.validationResultsV161(state,pid),added=[];
    const add=(key,title,lesson,action,category,extra={})=>{const id=`${pid}-LC-${String(key).replace(/[^A-Za-z0-9_-]/g,'-')}`;if(existing.has(id))return;const row={id,programmeId:pid,productId:p.productId,status:'Proposed',title,lesson,action,category,cause:category,createdAt:P.now(),sourceProgrammeType:'Validation',...extra};store.push(row);existing.add(id);added.push(row)};
    for(const a of acts.filter(x=>x.kind==='Test Development'&&Number(x.actualHours)>0&&Number(x.estimatedHours)>0)){const variance=Number(a.actualHours)-Number(a.estimatedHours);if(variance>Math.max(1.5,Number(a.estimatedHours)*.25))add(`DEV-${a.id}`,'Development estimate exceeded',`${a.name} required ${a.actualHours} h versus ${a.estimatedHours} h estimated.`,a.basisTestId?'Use the measured delta when estimating future adaptations from this method.':'Use the measured actual as a learning basis for comparable new-method development.','Method development',{activityId:a.id,basisTestId:a.basisTestId||null,standardTestIds:[a.basisTestId].filter(Boolean),evidence:`Estimate ${a.estimatedHours} h · actual ${a.actualHours} h`})}
    for(const r of res.filter(x=>x.outcome==='Fail')){const a=byId(acts,r.activityId);add(`FAIL-${r.activityId}`,'Validation failure learning',`${a?.name||r.activityId} failed during controlled Validation execution${r.comment?`: ${r.comment}`:'.'}`,'Review the failure mechanism, disposition and verification method before reusing the same design or method.','Validation failure',{activityId:r.activityId,standardTestIds:[a?.standardTestId].filter(Boolean),evidence:(r.evidenceIds||[]).join(', ')||r.value||r.comment||'Controlled failed result'})}
    for(const r of res){const a=byId(acts,r.activityId);if(a&&Number(r.actualHours)>0&&Number(a.estimatedHours)>0&&Number(r.actualHours)>Math.max(Number(a.estimatedHours)*1.35,Number(a.estimatedHours)+1.5))add(`TIME-${r.activityId}`,'Verification duration exceeded plan',`${a.name} required ${r.actualHours} h versus ${a.estimatedHours} h planned.`,`Use the measured duration and recorded setup conditions when planning the next comparable ${a.name} execution.`,'Execution duration',{activityId:r.activityId,standardTestIds:[a.standardTestId].filter(Boolean),evidence:`Plan ${a.estimatedHours} h · actual ${r.actualHours} h`})}
    const impact=p.prototypeImpact;if(impact&&impact.oldDutAvailableDate&&impact.newDutAvailableDate&&impact.oldDutAvailableDate!==impact.newDutAvailableDate)add('PROTO-LINK','Prototype-to-Validation dependency learning',`Linked Prototype timing moved Validation DUT availability from ${impact.oldDutAvailableDate} to ${impact.newDutAvailableDate}.`,impact.autoReplanned?'Retain the linked dependency so future Prototype movement automatically propagates into Validation planning.':'Review recovery options immediately when the upstream Prototype commitment moves.','Programme dependency',{evidence:`Prototype ${p.linkedPrototypeId||'—'} · ${impact.oldDutAvailableDate} → ${impact.newDutAvailableDate}`});
    if(p.homeSiteId&&p.executionSiteId&&p.homeSiteId!==p.executionSiteId&&p.forecastDate&&(!p.requiredDate||p.forecastDate<=p.requiredDate))add('SISTER-LAB','Sister-lab recovery learning',`Validation was routed from ${p.homeSiteId} to ${p.executionSiteId} and retained a forecast of ${p.forecastDate}.`,'Consider this sister-lab route early for comparable demand when the home laboratory cannot meet the required date.','Network recovery',{evidence:`${p.homeSiteId} → ${p.executionSiteId} · forecast ${p.forecastDate}`});
    return added;
  };

  P.validationLessonCandidatesV161=(state,pid)=>{P.captureValidationLessonsV161(state,pid);return arr(state,'validationLessonCandidates').filter(x=>x.programmeId===pid)};
  P.validationLessonDecisionV161=(state,candidateId,decision,rationale='',actor=null)=>{
    const c=byId(arr(state,'validationLessonCandidates'),candidateId);if(!c)throw new Error('Validation lesson candidate was not found.');if(!['Accepted','Dismissed','Converted'].includes(decision))throw new Error('Unsupported lesson decision.');
    c.status=decision;c.decisionAt=P.now();c.decisionBy=actor||state.identity?.name||'Engineer';c.decisionRationale=rationale||'';
    if(['Accepted','Converted'].includes(decision)&&!(state.lessons||[]).some(l=>l.sourceCandidateId===c.id)){arr(state,'lessons').push({id:P.uid('LESSON'),requestId:c.programmeId,programmeId:c.programmeId,productId:c.productId,status:'Accepted',sourceProgrammeType:'Validation',sourceCandidateId:c.id,title:c.title,lesson:c.lesson,observation:c.lesson,recommendation:c.action,action:c.action,category:c.category,cause:c.cause,evidence:c.evidence||'',standardTestIds:c.standardTestIds||[],createdAt:P.now(),createdBy:c.decisionBy,effectiveness:'Monitoring'})}
    if(decision==='Converted'){const prop={id:P.uid('LIMP'),programmeId:c.programmeId,lessonCandidateId:c.id,title:`Improvement · ${c.title}`,description:c.action||c.lesson,status:'Open',owner:c.decisionBy,createdAt:P.now()};arr(state,'lessonImprovementProposalsV161').push(prop);arr(state,'actions').push({id:`LIMP-ACT-${prop.id}`,requestId:c.programmeId,category:'Validation',title:prop.title,why:c.lesson,impact:'Convert accepted learning into a controlled Standard Test / process improvement.',owner:prop.owner,due:iso(14),severity:'Medium',resolve:'validation',source:'validation-learning-v161',lessonImprovementId:prop.id})}
    P.audit?.(state,`Validation lesson ${decision.toLowerCase()}`,'Validation Programme',c.programmeId,'Proposed',decision,`${c.title}${rationale?` · ${rationale}`:''}`);return c;
  };
  P.applyValidationPriorLessonV161=(state,pid,lessonId,decision='Applied',rationale='',actor=null)=>{
    const p=byId(arr(state,'validationProgrammes'),pid),l=byId(state.lessons,lessonId);if(!p||!l)throw new Error('Programme or lesson was not found.');if(!['Applied','Acknowledged','Dismissed','Converted'].includes(decision))throw new Error('Unsupported prior-lesson decision.');
    const rows=arr(state,'lessonApplicationsV161'),existing=rows.find(x=>x.programmeId===pid&&x.lessonId===lessonId);const row=existing||{id:P.uid('LAPP'),programmeId:pid,lessonId,createdAt:P.now()};Object.assign(row,{decision,rationale,decidedAt:P.now(),decidedBy:actor||state.identity?.name||'Engineer'});if(!existing)rows.push(row);
    p.appliedLessonIds=Array.isArray(p.appliedLessonIds)?p.appliedLessonIds:[];if(decision==='Applied'&&!p.appliedLessonIds.includes(lessonId))p.appliedLessonIds.push(lessonId);
    if(decision==='Converted'){const prop={id:P.uid('LIMP'),programmeId:pid,sourceLessonId:lessonId,title:`Improvement · ${l.title||l.lesson||'Lesson'}`,description:l.action||l.recommendation||l.lesson,status:'Open',owner:row.decidedBy,createdAt:P.now()};arr(state,'lessonImprovementProposalsV161').push(prop);arr(state,'actions').push({id:`LIMP-ACT-${prop.id}`,requestId:pid,category:'Validation',title:prop.title,why:l.lesson||l.observation||l.title,impact:'Convert historical learning into a controlled Standard Test / process improvement.',owner:prop.owner,due:iso(14),severity:'Medium',resolve:'validation',source:'validation-learning-v161',lessonImprovementId:prop.id})}
    P.audit?.(state,`Historical lesson ${decision.toLowerCase()}`,'Validation Programme',pid,'Suggested',decision,`${l.title||l.lesson||lessonId}${rationale?` · ${rationale}`:''}`);return row;
  };

  P.syncValidationActionsV161=state=>{
    state.actions=arr(state,'actions').filter(a=>a.source!=='validation-v161');
    for(const p of arr(state,'validationProgrammes').filter(x=>!isClosed(x))){const wf=P.validationWorkflowStateV161(state,p),due=p.requiredDate||iso(14),owner=p.owner||state.identity?.name||'Lab Planner';let title='',why='',severity='Medium';
      if(wf.current==='requirements'){title=wf.reqs.length?'Map Validation requirements to controlled tests':'Add Validation requirements';why=wf.reqs.length?`${wf.reqs.length-wf.mapped} requirement(s) still need an engineering mapping decision.`:'Validation cannot be designed without controlled requirements.'}
      else if(wf.current==='programme'){title='Generate / review Validation Programme Logic';why='Mapped requirements need controlled test legs and dependencies.'}
      else if(wf.current==='planning'){title='Create Validation resource plan';why='Validation work must compete for shared people and equipment before execution.'}
      else if(wf.current==='execution'){title='Execute Validation tests and record evidence';why=`${wf.results.length}/${wf.tests.length} test result(s) are recorded.`}
      else {title='Review Validation report and close';why=wf.failed?`${wf.failed} requirement(s) failed and need disposition.`:'Execution evidence is ready for report review.';severity=wf.failed?'High':'Medium'}
      state.actions.push({id:`V161-ACT-${p.id}`,source:'validation-v161',requestId:p.id,category:'Validation',title,why,impact:`Programme ${p.id} · ${p.title}`,owner,due,severity,resolve:'validation'});
    }
    return state.actions;
  };

  P.ensureProgrammeModelV161=(state,{seedDemo=false}={})=>{
    if(!state)return {changed:false,linkedChanged:[]};let changed=false;const linkedChanged=[];for(const k of ['validationProgrammes','validationRequirements','validationLegs','validationActivities','validationResults','validationEvidence','validationReports','validationDevelopmentHistory','validationLessonCandidates','lessonApplicationsV161','lessonImprovementProposalsV161'])if(!Array.isArray(state[k])){state[k]=[];changed=true}
    for(const r of state.requests||[])if(!r.programmeType){r.programmeType='prototype';changed=true}
    const demo=seedDemo||P.isDemoDataset?.(state);
    if(demo&&!state.validationProgrammes.length){
      const products=(state.products||[]).slice(0,4),owner=(state.users||[]).find(u=>u.role==='lab_planner')?.name||state.identity?.name||'Lab Planner',sites=(state.labs||state.sites||[]),home=state.settings?.primaryLabId||state.settings?.activeLabId||sites[0]?.id||'LAB-NL';
      const srcReqs=(state.requests||[]).filter(r=>!r.archived).slice(0,4);
      products.forEach((prod,i)=>{const id=`V26-${String(101+i).padStart(4,'0')}`,proto=srcReqs[i]||null,due=iso(18+i*9),p={id,programmeType:'validation',title:`${prod.family||prod.name||prod.partNumber} · ${['B-sample DV','environmental verification','durability verification','customer validation'][i]}`,productId:prod.id,productFamily:prod.family||prod.name||prod.partNumber,productRevision:prod.revision||'A',project:`VAL-${301+i}`,businessUnit:['Power Tool Platform','Motor & Drive','Mechanical Design','Electronics'][i%4],owner,requester:proto?.requester||owner,customerId:proto?.customerId||'CUST-VALIDATION',priority:i===2?'Critical':'High',quantity:[6,8,5,10][i],requiredDate:due,dutAvailableDate:proto?.forecastDate||iso(2+i),homeSiteId:home,executionSiteId:i===1&&sites[1]?sites[1].id:i===3&&sites[2]?sites[2].id:home,linkedPrototypeId:i<3?proto?.id||null:null,status:'Requirements',createdAt:new Date(Date.now()-(i+3)*86400000).toISOString(),updatedAt:P.now(),archived:false};state.validationProgrammes.push(p);
        const definitionSets=[
          [
            ['ENV','Environmental durability',`Product shall remain functional after thermal exposure from -30 °C to 85 °C for 20 cycles.`,'Environmental'],
            ['FUNC','Functional performance',`Product shall meet specified functional output and signal accuracy after environmental conditioning.`,'Environmental'],
            ['DIM','Interface integrity',`Critical interface dimensions shall remain within drawing tolerance after validation exposure.`,'Mechanical']
          ],
          [
            ['MECH','Mechanical durability',`Product shall withstand high-speed vibration without structural or functional degradation.`,'Mechanical'],
            ['FUNC','Functional performance',`Product shall meet specified functional output after vibration exposure.`,'Mechanical'],
            ['DIM','Interface integrity',`Critical interface dimensions shall remain within drawing tolerance after vibration exposure.`,'Mechanical']
          ],
          [
            ['END','Durability endurance',`Product shall complete 50000 load endurance cycles without loss of function.`,'Durability'],
            ['ELEC','Electrical integrity',`Electrical safety and operating current shall remain within the controlled specification.`,'Electrical'],
            ['DIM','Interface integrity',`Critical interface dimensions shall remain within drawing tolerance after endurance testing.`,'Mechanical'],
            ['FUNC','Functional performance',`Product shall meet specified functional output after endurance testing.`,'Functional']
          ],
          [
            ['ENV','Environmental durability',`Product shall remain functional after thermal exposure from -30 °C to 85 °C.`,'Environmental'],
            ['ELEC','Electrical integrity',`Electrical safety screening shall meet the controlled product specification.`,'Electrical'],
            ['FUNC','Functional performance',`Product shall meet specified functional output and signal accuracy.`,'Functional'],
            ['DIM','Interface integrity',`Critical interface dimensions shall remain within drawing tolerance.`,'Mechanical']
          ]
        ],definitions=definitionSets[i]||definitionSets[0];
        definitions.forEach((d,j)=>state.validationRequirements.push({id:`${id}-REQ-${String(j+1).padStart(3,'0')}`,programmeId:id,source:'Customer / Product Specification',sourceDocument:`SPEC-${prod.partNumber||prod.id}`,sourceReference:`${d[0]}-${j+1}`,description:d[2],category:d[3],legName:d[3],revision:'A',priority:j===0?'Critical':'High',acceptanceCriteria:j===0?'No functional degradation; meet defined thermal limits.':'Meet controlled product specification.',status:'Not Covered',comments:'',createdAt:P.now()}));
        for(const r of P.validationRequirementsV161(state,id)){const ranked=P.rankValidationTestsV161(state,r,3);if(ranked[0]&&ranked[0].coverage>=45)P.mapValidationRequirementV161(state,r.id,{mode:ranked[0].coverage>=80?'reuse':'adapt',testIds:[ranked[0].test.id],coverage:ranked[0].coverage,actor:'Demo seed'});else P.mapValidationRequirementV161(state,r.id,{mode:'new',actor:'Demo seed'})}
        P.buildValidationProgrammeV161(state,id,{actor:'Demo seed'});if(i===0){p.status='Programme'}
      });changed=true;
    }
    // Keep linked Validation DUT availability synchronized with Prototype timing unless manually overridden.
    for(const p of state.validationProgrammes){if(p.linkedPrototypeId&&!p.dutAvailabilityLocked){const r=byId(state.requests,p.linkedPrototypeId),date=r?.forecastDate||r?.currentCommitmentDate||r?.requiredDate;if(date&&p.dutAvailableDate!==date){const old=p.dutAvailableDate;p.dutAvailableDate=date;p.prototypeImpact={at:P.now(),oldDutAvailableDate:old||null,newDutAvailableDate:date,sourcePrototypeId:p.linkedPrototypeId};linkedChanged.push(p.id);changed=true}}}
    P.syncValidationActionsV161(state);return {changed,linkedChanged};
  };
})(ProtoLab);

})();

/* ============================================================
   LabOS REV 1.0.144 — product-scoped Control Plan reuse + explicit
   material timing gate.
   - Approved Control Plans may only be offered/reused when their
     controlled product identity matches the requested product.
   - Engineering-supplied material needs an accountable owner and a
     valid expected-lab-arrival date before the request can be submitted.
   - Physical receipt/issue remains a later Build Readiness gate.
   ============================================================ */
(function v144CorePolicy(P){
  function cpProductIds(state,cp){
    const ids=new Set();
    if(cp?.productId)ids.add(cp.productId);
    const refs=[...(Array.isArray(cp?.requestIds)?cp.requestIds:[]),...(cp?.buildRequestId?[cp.buildRequestId]:[])];
    for(const id of refs){const r=(state?.requests||[]).find(x=>x.id===id);if(r?.productId)ids.add(r.productId)}
    return ids;
  }
  P.controlPlanProductIdsV144=(state,cp)=>[...cpProductIds(state,cp)];
  P.controlPlanMatchesProductV144=(state,cp,requestOrProduct)=>{
    const productId=typeof requestOrProduct==='string'?requestOrProduct:requestOrProduct?.productId;
    if(!productId||!cp||cp.status!=='Approved'||cp.buildSpecific)return false;
    const ids=cpProductIds(state,cp);
    // Unknown/multi-product provenance is deliberately not reusable. A controlled
    // baseline has to be explicitly attributable to one product before reuse.
    return ids.size===1&&ids.has(productId);
  };
  P.reusableControlPlansForRequest=(state,r)=>{
    if(!state||!r?.productId)return [];
    return (state.controlPlans||[])
      .filter(cp=>P.controlPlanMatchesProductV144(state,cp,r))
      .filter((cp,i,a)=>a.findIndex(x=>x.id===cp.id)===i)
      .sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''))||String(a.revision||'').localeCompare(String(b.revision||'')));
  };
  P.findReusableControlPlan=(state,r)=>{
    const rows=P.reusableControlPlansForRequest(state,r);
    const current=rows.find(x=>x.id===r?.controlPlanId);
    return current||rows[0]||null;
  };

  const baseAssessment=P.requestSetupAssessment;
  P.requestSetupAssessment=(state,r)=>{
    const out=baseAssessment(state,r),source=P.normaliseMaterialSource(r?.materialOwnership),s=r?.materialSupply||{};
    if(source==='Engineering supplied'){
      const owner=!!String(s.owner||'').trim(),eta=!!s.expectedDate&&!!P.isStrictISODate?.(s.expectedDate),alreadyIssued=!!P.materialPlanningAssessment?.(state,r)?.buildReady,done=alreadyIssued||(owner&&eta);
      const row={key:'materialTiming',label:'Engineering material owner + expected lab arrival',done};
      const ix=out.checks.findIndex(x=>x.key==='materialOwnership');
      out.checks.splice(ix>=0?ix+1:out.checks.length,0,row);
    }
    out.missing=out.checks.filter(x=>!x.done);out.ready=out.checks.every(x=>x.done);
    return out;
  };
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.150 — resilient equipment planning capability.
   Older/imported databases may only carry a human-readable resource
   category (for example "Precision bench"). Planning derives the
   controlled technical capability from explicit planningCapability
   first, then from the equipment identity/scope. This prevents a
   valid microscope/optical setup being treated as missing simply
   because a legacy record predates the planningCapability field.
   ============================================================ */
(function v146EquipmentCapabilityCompatibility(P){
  const canonical=[
    [/optical|microscope|visual inspection|magnification|camera inspection/i,'Optical Inspection'],
    [/laser weld|laser welding/i,'Laser Welding'],
    [/helium|leak station|leak test/i,'Helium Leak Test'],
    [/pressure calibr|pressure bench|pressure test/i,'Pressure Calibration'],
    [/torque|fasten/i,'Torque / Fastening'],
    [/\bcmm\b|dimensional|metrology/i,'Dimensional Metrology'],
    [/electrical|functional test|daq|multimeter/i,'Electrical Test'],
    [/thermal chamber|environmental chamber|temperature chamber|climatic/i,'Environmental Chamber'],
    [/programming|flashing|flash rig/i,'Programming / Flashing'],
    [/potting|dispens/i,'Potting / Dispense']
  ];
  P.inferEquipmentPlanningCapabilityV146=e=>{
    if(!e)return null;
    if(String(e.planningCapability||'').trim())return String(e.planningCapability).trim();
    const text=[e.name,e.description,e.scope,e.scopeStatement,e.method,e.activity,e.notes,e.category,e.capability].map(v=>typeof v==='string'?v:JSON.stringify(v||'')).join(' ');
    for(const [rx,cap] of canonical)if(rx.test(text))return cap;
    return e.capability||null;
  };
  P.equipmentPlanningCapability=e=>P.inferEquipmentPlanningCapabilityV146(e);
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.150 — canonical resource semantics.
   Business logic must never compare the legacy human-readable
   equipment.category/capability field directly.  All planning,
   execution, balancing and costing paths use one canonical technical
   capability resolver and one execution-readiness assessment.
   ============================================================ */
(function v148CanonicalResourceSemantics(P){
  const aliases=[
    [/^optical( inspection)?$|microscop|visual inspection|camera inspection|magnification/i,'Optical Inspection'],
    [/laser weld|laser welding|resistance welding/i,'Laser Welding'],
    [/helium|leak test/i,'Helium Leak Test'],
    [/pressure calibr|pressure test/i,'Pressure Calibration'],
    [/torque|fasten/i,'Torque / Fastening'],
    [/\bcmm\b|dimensional|metrology/i,'Dimensional Metrology'],
    [/electrical|functional test|daq|multimeter/i,'Electrical Test'],
    [/thermal|environmental|temperature|climatic/i,'Environmental Chamber'],
    [/programming|flashing|flash rig/i,'Programming / Flashing'],
    [/potting|dispens/i,'Potting / Dispense']
  ];
  P.canonicalPlanningCapability=value=>{
    const v=String(value??'').trim(); if(!v)return null;
    for(const [rx,canonical] of aliases)if(rx.test(v))return canonical;
    return v;
  };
  const prior=P.inferEquipmentPlanningCapabilityV146||P.equipmentPlanningCapability;
  P.equipmentPlanningCapability=e=>{
    if(!e)return null;
    const inferred=prior?prior(e):(e.planningCapability||e.capability||null);
    return P.canonicalPlanningCapability(inferred);
  };
  P.equipmentSupportsCapability=(e,required)=>{
    const need=P.canonicalPlanningCapability(required);
    return !need || (!!e&&P.equipmentPlanningCapability(e)===need);
  };
  P.equipmentEquivalent=(a,b)=>!!a&&!!b&&P.equipmentPlanningCapability(a)===P.equipmentPlanningCapability(b);
  P.equipmentExecutionReadiness=(state,e,required,onDate=P.todayISO())=>{
    const reasons=[],need=P.canonicalPlanningCapability(required),actual=P.equipmentPlanningCapability(e);
    if(!e)reasons.push('No equipment selected.');
    else{
      if(need&&actual!==need)reasons.push(`${e.name||e.id} provides ${actual||'no controlled planning capability'}, not ${need}.`);
      if(P.equipmentOperationalForPlanning&&!P.equipmentOperationalForPlanning(e))reasons.push(`${e.name||e.id} is ${e.status||'unavailable'}.`);
      if(!P.equipmentReady(e,onDate,state))reasons.push(`${e.name||e.id} is not calibration / maintenance / governance ready on ${onDate}.`);
    }
    return {ok:reasons.length===0,reasons,required:need,actual};
  };
  P.equipmentExecutionReady=(state,e,required,onDate=P.todayISO())=>P.equipmentExecutionReadiness(state,e,required,onDate).ok;
})(window.ProtoLab);


/* REV 1.0.150 — migrate legacy resource semantics at the model boundary.
   Preserve the human-facing legacy capability/category field, but materialise a
   canonical planningCapability so every downstream consumer sees the same fact. */
(function v148ResourceSemanticMigration(P){
  P.migrateLegacyResourceSemanticsV148=state=>{
    const stats={equipment:0,processes:0,tests:0,bookings:0,steps:0};
    for(const e of state?.equipment||[]){
      const canonical=P.equipmentPlanningCapability(e);
      if(canonical&&e.planningCapability!==canonical){e.planningCapability=canonical;stats.equipment++;}
    }
    for(const proc of state?.processes||[]){
      const current=proc.planningCapability!==undefined?proc.planningCapability:proc.equipmentCapability;
      const canonical=P.canonicalPlanningCapability(current);
      if(canonical&&proc.planningCapability!==canonical){proc.planningCapability=canonical;stats.processes++;}
    }
    for(const test of state?.standardTests||[]){
      const canonical=P.canonicalPlanningCapability(test.planningCapability||test.equipmentCapability);
      if(canonical&&test.planningCapability!==canonical){test.planningCapability=canonical;stats.tests++;}
    }
    for(const b of state?.bookings||[]){
      const canonical=P.canonicalPlanningCapability(b.planningCapability||b.equipmentCapability||null);
      if(canonical&&b.planningCapability!==canonical){b.planningCapability=canonical;stats.bookings++;}
    }
    for(const route of state?.routes||[])for(const step of route.steps||[]){
      if(step.equipmentCapability){const canonical=P.canonicalPlanningCapability(step.equipmentCapability);if(canonical!==step.equipmentCapability){step.equipmentCapability=canonical;stats.steps++;}}
    }
    return stats;
  };
  P.resourceSemanticAuditV148=state=>{
    const issues=[];
    for(const e of state?.equipment||[]){const cap=P.equipmentPlanningCapability(e);if(!cap&&e.status!=='Retired')issues.push({type:'equipment-capability',id:e.id,detail:`${e.name||e.id} has no canonical planning capability.`});}
    for(const b of state?.bookings||[]){
      const e=(state.equipment||[]).find(x=>x.id===b.equipmentId),need=P.canonicalPlanningCapability(b.planningCapability||b.equipmentCapability||null);
      if(need&&b.equipmentId&&!e)issues.push({type:'missing-equipment',id:b.id,detail:`Assigned equipment ${b.equipmentId} no longer exists.`});
      else if(need&&e&&!P.equipmentSupportsCapability(e,need))issues.push({type:'booking-capability',id:b.id,detail:`${e.name||e.id} does not provide ${need}.`});
    }
    return issues;
  };
  const base=P.ensureEnterpriseModel;
  P.ensureEnterpriseModel=state=>{const out=base?base(state):state;P.migrateLegacyResourceSemanticsV148(out);return out;};
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.150 — repair broad legacy resource descriptors.
   REV 1.0.150 exposed a migration defect where historical display/location
   descriptors such as "Joining cell" and "Precision bench" could be
   materialised as technical planning capabilities.  These helpers keep
   descriptive resource taxonomy separate from controlled technical
   compatibility and repair already-migrated states without deleting data.
   ============================================================ */
(function v150ResourceSemanticRepair(P){
  const broadRx=/^(joining cell|measurement station|precision bench|assembly station|proto lab|prototype lab|lab|bench|cell|station)$/i;
  const canonicalKnown=new Set(['Optical Inspection','Laser Welding','Helium Leak Test','Pressure Calibration','Torque / Fastening','Dimensional Metrology','Electrical Test','Environmental Chamber','Programming / Flashing','Potting / Dispense']);
  P.isBroadResourceDescriptorV150=value=>{
    const v=String(value??'').trim();
    return !!v&&broadRx.test(v);
  };
  P.inferTechnicalCapabilityFromWorkNameV150=(name,product='')=>{
    const n=String(name||'').toLowerCase(),p=String(product||'').toLowerCase();
    if(/material receipt|cleaning$|surface preparation|mechanical assembly|packaging|manual bench/.test(n))return null;
    if(/incoming inspection|optical inspection|final inspection|visual inspection|microscop|x-ray/.test(n))return 'Optical Inspection';
    if(/adhesive dispense|potting|dispens/.test(n))return 'Potting / Dispense';
    if(/laser weld|resistance weld/.test(n))return 'Laser Welding';
    if(/fastening|torque/.test(n))return 'Torque / Fastening';
    if(/thermal|cure|environmental|temperature|climatic/.test(n))return 'Environmental Chamber';
    if(/programming|flashing|flash/.test(n))return 'Programming / Flashing';
    if(/helium|leak/.test(n))return 'Helium Leak Test';
    if(/electrical|functional|sensitivity|calibration correlation/.test(n))return 'Electrical Test';
    if(/dimensional|cmm|metrology/.test(n))return 'Dimensional Metrology';
    if(/pressure/.test(n))return 'Pressure Calibration';
    if(/^calibration$/.test(n)){
      if(/pressure|coolant|thermal valve/.test(p))return 'Pressure Calibration';
      if(/torque/.test(p))return 'Torque / Fastening';
      if(/hydrogen|leak/.test(p))return 'Helium Leak Test';
      return 'Electrical Test';
    }
    return null;
  };
  const priorEquipment=P.equipmentPlanningCapability;
  P.equipmentPlanningCapability=e=>{
    if(!e)return null;
    const explicit=P.canonicalPlanningCapability?.(e.planningCapability);
    if(explicit&&!P.isBroadResourceDescriptorV150(explicit))return explicit;
    const identity=[e.name,e.description,e.scope,e.scopeStatement,e.method,e.activity,e.notes,e.category].filter(Boolean).join(' ');
    const inferred=P.inferTechnicalCapabilityFromWorkNameV150(identity);
    if(inferred)return inferred;
    const legacy=P.canonicalPlanningCapability?.(e.capability);
    if(legacy&&!P.isBroadResourceDescriptorV150(legacy))return legacy;
    const prior=priorEquipment?P.canonicalPlanningCapability?.(priorEquipment(e)):null;
    return prior&&!P.isBroadResourceDescriptorV150(prior)?prior:null;
  };
  P.planningCapabilityForProcess=(state,r,proc)=>{
    if(!proc)return null;
    const explicit=P.canonicalPlanningCapability?.(proc.planningCapability);
    if(explicit&&!P.isBroadResourceDescriptorV150(explicit))return explicit;
    const product=String(r?.productFamily||state?.products?.find?.(p=>p.id===r?.productId)?.family||'');
    const inferred=P.inferTechnicalCapabilityFromWorkNameV150(proc.name,product);
    if(inferred)return inferred;
    const legacy=P.canonicalPlanningCapability?.(proc.equipmentCapability);
    return legacy&&!P.isBroadResourceDescriptorV150(legacy)?legacy:null;
  };
  P.planningCapabilityForTest=test=>{
    if(!test)return null;
    const explicit=P.canonicalPlanningCapability?.(test.planningCapability);
    if(explicit&&!P.isBroadResourceDescriptorV150(explicit))return explicit;
    const inferred=P.inferTechnicalCapabilityFromWorkNameV150([test.name,...(test.aliases||[])].join(' '));
    if(inferred)return inferred;
    const legacy=P.canonicalPlanningCapability?.(test.equipmentCapability);
    return legacy&&!P.isBroadResourceDescriptorV150(legacy)?legacy:null;
  };
  P.repairPollutedResourceSemanticsV150=state=>{
    const stats={equipment:0,processes:0,tests:0,bookings:0,steps:0,reassigned:0};
    if(!state)return stats;
    for(const e of state.equipment||[]){
      const desired=P.equipmentPlanningCapability(e);
      if((e.planningCapability||null)!==(desired||null)){e.planningCapability=desired||null;stats.equipment++;}
    }
    for(const proc of state.processes||[]){
      const desired=P.planningCapabilityForProcess(state,null,proc);
      if((proc.planningCapability||null)!==(desired||null)){proc.planningCapability=desired||null;stats.processes++;}
    }
    for(const test of state.standardTests||[]){
      const desired=P.planningCapabilityForTest(test);
      if((test.planningCapability||null)!==(desired||null)){test.planningCapability=desired||null;stats.tests++;}
    }
    const reqById=new Map((state.requests||[]).map(r=>[r.id,r]));
    const routeByReq=new Map((state.routes||[]).map(r=>[r.requestId,r]));
    for(const route of state.routes||[])for(const step of route.steps||[]){
      const proc=(state.processes||[]).find(p=>p.id===step.processId),req=reqById.get(route.requestId);
      if(!proc)continue;
      const desired=P.planningCapabilityForProcess(state,req,proc);
      if((step.equipmentCapability||null)!==(desired||null)){step.equipmentCapability=desired||null;stats.steps++;}
    }
    for(const b of state.bookings||[]){
      const req=reqById.get(b.requestId),route=routeByReq.get(b.requestId),step=route?.steps?.find(s=>s.id===b.stepId);
      let desired=null;
      if(step){const proc=(state.processes||[]).find(p=>p.id===step.processId);desired=P.planningCapabilityForProcess(state,req,proc);}
      else{
        const tr=(req?.testRequirements||[]).find(t=>t.id===b.stepId),test=(state.standardTests||[]).find(t=>t.id===tr?.standardTestId);
        desired=test?P.planningCapabilityForTest(test):P.canonicalPlanningCapability?.(tr?.planningCapability||tr?.equipmentCapability||null);
        if(P.isBroadResourceDescriptorV150(desired))desired=P.inferTechnicalCapabilityFromWorkNameV150(tr?.name)||null;
      }
      if((b.planningCapability||null)!==(desired||null)){b.planningCapability=desired||null;stats.bookings++;}
      if(b.equipmentId&&desired){
        const eq=(state.equipment||[]).find(e=>e.id===b.equipmentId);
        if(!eq||!P.equipmentSupportsCapability(eq,desired)){b.equipmentId=null;stats.reassigned++;}
      }else if(!desired&&b.equipmentId){b.equipmentId=null;stats.reassigned++;}
    }
    // Re-use the established planner repair only after semantic truth is clean.
    const repaired=P.ensurePlanningCapabilityModelV1068?.(state);
    if(repaired?.bookingsRepaired)stats.reassigned+=repaired.bookingsRepaired;
    state.settings=state.settings||{};
    state.settings.resourceSemanticRepairVersion='1.0.150';
    return stats;
  };
  // Replace the unsafe 1.0.150 materialiser with the repaired boundary function.
  P.migrateLegacyResourceSemanticsV148=state=>P.repairPollutedResourceSemanticsV150(state);
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.164 — enterprise KPI definition + event model.
   Raw operational facts -> reusable aggregation -> KPI definitions -> UI.
   Prototype is active today; Validation and Failure Analysis definitions are
   registered now and stay dormant until those workflows produce real facts.
   ============================================================ */
(function(P){
  'use strict';
  if(!P||P.KPI_DEFINITIONS_V151)return;
  const commonFilters=['period','lab','domain','businessUnit','product','programme','project','family','equipmentCategory','priority'];
  const def=(id,name,domain,unit,aggregation,direction,target,chart,extra={})=>({
    id,name,description:extra.description||name,domain:Array.isArray(domain)?domain:[domain],unit,aggregation,
    favourableDirection:direction,target,warningThreshold:extra.warningThreshold??null,criticalThreshold:extra.criticalThreshold??null,
    selectedPeriodApplicable:extra.selectedPeriodApplicable!==false,currentStatusKpi:!!extra.currentStatusKpi,
    numeratorDefinition:extra.numeratorDefinition||'',denominatorDefinition:extra.denominatorDefinition||'',
    drilldownEntity:extra.drilldownEntity||'work item',applicableFilters:extra.applicableFilters||commonFilters,
    chartRecommendation:chart||'card',businessTarget:true,enabled:extra.enabled!==false
  });
  const D=[
    def('otd_requested','On-Time Delivery','common','%','ratio','higher',95,'line',{numeratorDefinition:'Items completed on/before requested date',denominatorDefinition:'Items completed in period with requested date',drilldownEntity:'delivery'}),
    def('commitment_reliability','Commitment Reliability','common','%','ratio','higher',95,'line',{numeratorDefinition:'Items completed on/before the accepted committed date',denominatorDefinition:'Items completed in period with accepted commitment',drilldownEntity:'delivery'}),
    def('total_days_late','Total Days Late','common','days','sum','lower',0,'bar',{drilldownEntity:'delivery'}),
    def('median_lead_time','Median Lead Time','common','days','median','lower',14,'line',{drilldownEntity:'delivery'}),
    def('request_to_commit','Request-to-Commit Time','common','days','median','lower',3,'line'),
    def('right_first_time','Right-First-Time','common','%','weighted-ratio','higher',95,'line',{drilldownEntity:'quality result'}),
    def('lab_repeat_rate','Lab-Caused Repeat Rate','common','%','ratio','lower',2,'pareto',{drilldownEntity:'quality result'}),
    def('invalid_test_rate','Invalid Test Rate','common','%','ratio','lower',2,'pareto'),
    def('verification_coverage','Requirement Verification Coverage',['validation','prototype'],'%','ratio','higher',100,'line'),
    def('completion_rate','Test / Build Completion Rate','common','%','ratio','higher',95,'line'),
    def('traceability_completeness','Traceability Completeness','common','%','ratio','higher',100,'line'),
    def('actual_lab_cost','Actual Lab Cost','common','EUR','sum','lower',null,'line',{drilldownEntity:'cost record'}),
    def('cost_vs_plan','Cost vs Plan','common','%','ratio','lower',0,'line',{drilldownEntity:'cost record'}),
    def('external_testing_cost','External Testing Cost','common','EUR','sum','lower',null,'line'),
    def('sister_lab_transfer_cost','Sister-Lab Transfer Cost','common','EUR','sum','lower',null,'line'),
    def('outsourcing_avoided','Outsourcing Avoided','common','EUR','sum','higher',null,'line',{drilldownEntity:'network transfer'}),
    def('development_cost','Development Cost','common','EUR','sum','lower',null,'line'),
    def('critical_capacity_load','Critical Capacity Load','common','%','peak','lower',85,'line',{drilldownEntity:'capacity constraint'}),
    def('qualified_capacity_coverage','Qualified Capacity Coverage','common','%','ratio','higher',95,'heatmap'),
    def('backlog_load','Backlog Load','common','hours','sum','lower',null,'line'),
    def('flow_efficiency','Flow Efficiency','common','%','ratio','higher',70,'line'),
    def('equipment_availability','Equipment Availability','common','%','ratio','higher',95,'line'),
    def('forecast_capacity_risk','Forecast Capacity Risk','common','count','sum','lower',0,'bar'),
    def('network_capture','Internal Network Capture','common','%','ratio','higher',null,'stacked',{drilldownEntity:'network transfer'}),
    def('programme_days_lost','Programme Days Lost','common','days','sum','lower',0,'pareto',{drilldownEntity:'delay event'}),
    def('programme_days_recovered','Programme Days Recovered','common','days','sum','higher',null,'pareto',{drilldownEntity:'recovery event'}),
    def('development_estimate_accuracy','Development Estimate Accuracy','common','% absolute error','mean','lower',15,'line',{drilldownEntity:'development activity'}),
    def('accepted_lessons','Accepted Lessons Learned','common','count','sum','higher',null,'bar'),
    def('rejected_lessons','Rejected Proposed Lessons','common','count','sum','context',null,'bar'),
    def('repeat_issue_rate','Repeat Issue Rate','common','%','ratio','lower',10,'line'),
    def('lesson_effectiveness','Lesson Effectiveness','common','%','ratio','higher',70,'line'),
    def('recurring_delay_cause','Recurring Delay Cause','common','count','mode','lower',null,'pareto'),
    def('recurring_failure_cause','Recurring Failure Cause','common','count','mode','lower',null,'pareto'),
    def('unplanned_downtime','Unplanned Downtime','common','hours','sum','lower',0,'pareto'),
    def('breakdown_hours','Breakdown Hours','common','hours','sum','lower',0,'pareto'),
    def('maintenance_compliance','Planned Maintenance Compliance','common','%','ratio','higher',95,'line'),
    def('calibration_compliance','Calibration Compliance','common','%','ratio','higher',100,'line'),
    def('calibration_lost_days','Calibration-Related Lost Days','common','days','sum','lower',0,'pareto'),
    def('critical_skill_coverage','Critical Skill Coverage','common','%','ratio','higher',95,'heatmap'),
    def('single_point_skill_risk','Single-Point Skill Risk','common','count','sum','lower',0,'heatmap',{currentStatusKpi:true,selectedPeriodApplicable:false}),
    def('qualification_compliance','Qualification Compliance','common','%','ratio','higher',100,'line'),
    def('training_demand','Training Demand','common','hours','sum','lower',null,'bar'),
    def('skill_gap_lost_days','Skill-gap Lost Days','common','days','sum','lower',0,'pareto'),
    // Prototype layer
    def('proto_request_build_lead','Request-to-Build Lead Time','prototype','days','median','lower',14,'line'),
    def('proto_build_otd','Build OTD','prototype','%','ratio','higher',95,'line'),
    def('proto_first_time_build','First-Time Build Success','prototype','%','ratio','higher',95,'line'),
    def('proto_process_rft','Process-Step RFT','prototype','%','ratio','higher',95,'line'),
    def('proto_material_readiness','Material Readiness','prototype','%','ratio','higher',98,'line'),
    def('proto_change_churn','Engineering Change Churn','prototype','count','sum','lower',null,'line'),
    def('proto_cost','Prototype Cost','prototype','EUR','sum','lower',null,'line'),
    def('proto_development_hours','Development Hours','prototype','hours','sum','lower',null,'line'),
    def('proto_rebuild_cause','Rebuild Cause','prototype','count','sum','lower',null,'pareto'),
    def('proto_plan_completion','Build Plan Completion','prototype','%','ratio','higher',95,'line'),
    // Validation layer — definitions are live, values remain empty until real validation records exist.
    def('val_otd','Validation OTD','validation','%','ratio','higher',95,'line'),
    def('val_plan_completion','DV/PV Test Plan Completion','validation','%','ratio','higher',95,'line'),
    def('val_verification_coverage','Requirement Verification Coverage','validation','%','ratio','higher',100,'line'),
    def('val_valid_first_time','Valid Test First Time','validation','%','ratio','higher',98,'line'),
    def('val_rerun_rate','Lab-Caused Rerun Rate','validation','%','ratio','lower',2,'pareto'),
    def('val_method_readiness','Method Readiness','validation','%','ratio','higher',100,'line'),
    def('val_equipment_readiness','Equipment Readiness','validation','%','ratio','higher',100,'line'),
    def('val_msa_readiness','MSA / GRR Readiness','validation','%','ratio','higher',100,'line'),
    def('val_report_closure','Report Closure Time','validation','days','median','lower',5,'line'),
    def('val_failure_disposition','Failure Disposition Time','validation','days','median','lower',5,'line'),
    def('val_cost','Validation Cost','validation','EUR','sum','lower',null,'line'),
    def('val_lead_time','Validation Lead Time','validation','days','median','lower',30,'line'),
    // Failure Analysis layer — definitions are live, values remain empty until real FA records exist.
    def('fa_otd','FA Case OTD','failure_analysis','%','ratio','higher',95,'line'),
    def('fa_lead_time','FA Lead Time','failure_analysis','days','median','lower',10,'line'),
    def('fa_initial_containment','Time to Initial Containment','failure_analysis','hours','median','lower',24,'line'),
    def('fa_root_cause_time','Time to Root Cause','failure_analysis','days','median','lower',7,'line'),
    def('fa_root_cause_identified','Root Cause Identified','failure_analysis','%','ratio','higher',95,'line'),
    def('fa_nff_rate','No-Fault-Found Rate','failure_analysis','%','ratio','lower',null,'line'),
    def('fa_repeat_failure','Repeat Failure Rate','failure_analysis','%','ratio','lower',5,'line'),
    def('fa_reopen_rate','Investigation Reopen Rate','failure_analysis','%','ratio','lower',2,'line'),
    def('fa_evidence_completeness','Evidence Completeness','failure_analysis','%','ratio','higher',100,'line'),
    def('fa_ca_closure','Corrective Action Closure Time','failure_analysis','days','median','lower',30,'line'),
    def('fa_cost','FA Cost','failure_analysis','EUR','sum','lower',null,'line'),
    def('fa_failure_mode_pareto','Failure Mode Pareto','failure_analysis','count','sum','lower',null,'pareto'),
    def('fa_product_failure_trend','Product Failure Trend','failure_analysis','count','sum','lower',null,'line')
  ];
  P.KPI_DEFINITIONS_V151=Object.freeze(Object.fromEntries(D.map(x=>[x.id,Object.freeze(x)])));
  P.KPI_DOMAINS_V151=Object.freeze({all:{id:'all',name:'All domains'},prototype:{id:'prototype',name:'Prototype'},validation:{id:'validation',name:'Validation / DV / PV'},failure_analysis:{id:'failure_analysis',name:'Failure Analysis / FA'}});
  P.kpiDefinitionV151=(state,id)=>{const base=P.KPI_DEFINITIONS_V151[id];if(!base)return null;const ov=state?.settings?.kpiTargetsV151?.[id];return ov==null?base:{...base,target:Number.isFinite(Number(ov))?Number(ov):base.target};};
  P.kpiDefinitionsV151=(state,domain='all')=>Object.values(P.KPI_DEFINITIONS_V151).map(x=>P.kpiDefinitionV151(state,x.id)).filter(x=>domain==='all'?x.domain.includes('common'):x.domain.includes('common')||x.domain.includes(domain));
  P.ensureKpiModelV151=state=>{
    if(!state)return state;state.settings=state.settings||{};state.settings.kpiTargetsV151=state.settings.kpiTargetsV151||{};
    state.kpiFactsV151=state.kpiFactsV151&&typeof state.kpiFactsV151==='object'?state.kpiFactsV151:{};
    for(const k of ['delays','quality','capacity','downtime'])state.kpiFactsV151[k]=Array.isArray(state.kpiFactsV151[k])?state.kpiFactsV151[k]:[];
    return state;
  };
  const day=(iso,delta)=>{const d=new Date((iso||P.todayISO())+'T12:00:00');d.setDate(d.getDate()+delta);return d.toISOString().slice(0,10)};
  P.seedKpiDemoFactsV151=state=>{
    P.ensureKpiModelV151(state);if(!P.isDemoDataset?.(state)||state.settings?.kpiDemoSeedV151)return {changed:false};
    const labs=(state.labs||[]).filter(x=>x.type!=='external'),bus=(state.businessUnits||[]).filter(x=>x.active!==false),reqs=state.requests||[],hist=state.buildHistory||[],today=P.todayISO();
    // Enrich historical operational records with explicit facts needed for explainable KPI calculations.
    hist.forEach((h,i)=>{const r=reqs.find(x=>x.productId===h.productId)||reqs[i%Math.max(1,reqs.length)]||{};const bu=bus.find(x=>x.id===r.businessUnitId)||bus[i%Math.max(1,bus.length)];h.domain=h.domain||'prototype';h.requestId=h.requestId||r.id||`HIST-${i+1}`;h.labId=h.labId||labs[i%Math.max(1,labs.length)]?.id||state.settings.primaryLabId;h.businessUnitId=h.businessUnitId||bu?.id||null;h.businessUnit=h.businessUnit||bu?.name||r.businessUnit||'Unassigned';h.priority=h.priority||['Normal','High','Critical'][i%3];h.programme=h.programme||r.programme||`DEMO-${1+(i%5)}`;h.project=h.project||r.title||h.requestId;h.requestedDate=h.requestedDate||day(h.originalCommitmentDate||h.actualDeliveryDate,-(1+(i%4)));h.acceptedCommitmentDate=h.acceptedCommitmentDate||day(h.requestedDate,4+(i%3));h.currentForecastDate=h.currentForecastDate||h.finalCommitmentDate||h.actualDeliveryDate;h.requestSubmittedAt=h.requestSubmittedAt||day(h.requestedDate,-(6+(i%12)));h.hours=Number(h.hours||Math.max(8,(Number(h.quantity||1)*4.5)+(i%9)*2));if(!h.costComponents&&Number(h.actualCost)>0){const a=Number(h.actualCost);h.costComponents={labour:+(a*.46).toFixed(2),equipment:+(a*.24).toFixed(2),consumables:+(a*.12).toFixed(2),material:+(a*.18).toFixed(2)};}h.traceabilityComplete=h.traceabilityComplete??(i%9!==0);h.materialReady=h.materialReady??(i%7!==0);h.planComplete=h.planComplete??(i%8!==0);h.engineeringChanges=h.engineeringChanges??(i%5);});
    const causes=['Material','Equipment contention','Equipment breakdown','Calibration','Skill / resource shortage','Test development','Business priority change','Customer / design change','Failure / retest','External facility lead time','Supplier','Awaiting engineering decision'];
    state.kpiFactsV151.delays=[];hist.slice(0,Math.min(34,hist.length)).forEach((h,i)=>{const days=1+(i%6),cause=causes[i%causes.length],recover=(i%3===0)?Math.min(days,1+(i%3)):0;state.kpiFactsV151.delays.push({id:`KDELAY-${i+1}`,date:h.actualDeliveryDate||h.completedAt,requestId:h.requestId,domain:'prototype',labId:h.labId,businessUnitId:h.businessUnitId,productId:h.productId,programme:h.programme,project:h.project,priority:h.priority,cause,daysLost:days,daysRecovered:recover,recoveryMethod:recover?['Sister-lab routing','Alternative equipment','Priority optimisation','Additional staffing'][i%4]:null,equipmentCategory:['Electrical','Mechanical','Measurement','Environmental'][i%4],familyId:['TF-ELEC','TF-OTHER','TF-MECH','TF-ENV'][i%4]});});
    const qcauses=['Operator / setup','Equipment','Method','Sample','Software / data acquisition','Fixture','Calibration','Unclear instruction','Environmental'];
    state.kpiFactsV151.quality=[];hist.forEach((h,i)=>{const n=1+(i%3);for(let j=0;j<n;j++){state.kpiFactsV151.quality.push({id:`KQUAL-${i+1}-${j+1}`,date:h.actualDeliveryDate||h.completedAt,requestId:h.requestId,domain:'prototype',labId:h.labId,businessUnitId:h.businessUnitId,productId:h.productId,programme:h.programme,project:h.project,priority:h.priority,result:(i+j)%11===0?'invalid':(i+j)%7===0?'product_failure':'valid',labCaused:(i+j)%11===0||((i+j)%13===0),repeat:(i+j)%13===0,cause:qcauses[(i+j)%qcauses.length],familyId:['TF-ELEC','TF-MECH','TF-ENV','TF-OTHER'][(i+j)%4]});}});
    // Weekly raw capacity facts: available, committed and productive hours per constrained category.
    state.kpiFactsV151.capacity=[];const cats=['Electrical Test','Torque / Fastening','Optical Inspection','Environmental / Thermal'],skills=['COMP-03','COMP-01','COMP-05','COMP-08'];for(let w=0;w<28;w++){const date=day(today,-7*w);for(let li=0;li<labs.length;li++){for(let ci=0;ci<cats.length;ci++){const labId=labs[li].id,cap=cats[ci],skillId=skills[ci],eq=(state.equipment||[]).find(e=>e.siteId===labId&&P.equipmentPlanningCapability?.(e)===cap)||(state.equipment||[]).find(e=>e.siteId===labId),person=(state.staff||[]).find(s=>s.siteId===labId&&(s.competencies||[]).includes(skillId))||(state.staff||[]).find(s=>s.siteId===labId),available=80+(ci%2)*16,load=.64+((w+ci+li)%7)*.082,committed=Math.round(available*Math.min(1.18,load)*10)/10,productive=Math.round(committed*(.74+((w+ci)%4)*.05)*10)/10,impact=Math.max(0,Math.round((committed-available)*.45*10)/10);state.kpiFactsV151.capacity.push({id:`KCAP-${w}-${li}-${ci}`,date,domain:'prototype',labId,equipmentCategory:cap,equipmentId:eq?.id||null,skillId,personId:person?.id||null,availableHours:available,committedHours:committed,productiveHours:productive,constrainedDemandHours:Math.max(0,committed-available),programmeDaysImpacted:impact,familyId:['TF-ELEC','TF-MECH','TF-OTHER','TF-ENV'][ci]});}}}
    state.kpiFactsV151.downtime=[];for(let i=0;i<18;i++){const lab=labs[i%labs.length],eq=(state.equipment||[]).find(e=>e.siteId===lab?.id)||state.equipment?.[i%Math.max(1,state.equipment.length)],cause=['Breakdown','Corrective maintenance','Fixture repair','Utilities / facility'][i%4],planned=i%5===0,sourceReference=`RA-${day(today,-(i*9+2)).replace(/-/g,'')}-${String(i+1).padStart(2,'0')}`;state.kpiFactsV151.downtime.push({id:`KDOWN-${i+1}`,date:day(today,-(i*9+2)),domain:'prototype',labId:lab?.id||state.settings.primaryLabId,equipmentId:eq?.id||null,equipmentCategory:['Electrical','Measurement','Mechanical','Environmental'][i%4],cause,hours:2+(i%7)*1.5,planned,sourceType:planned?'planned_maintenance_event':'equipment_downtime_event',sourceSystem:'LabOS Resource Assurance',sourceReference,evidenceLabel:planned?'Planned maintenance work order':'Equipment downtime / breakdown log'});}
    // Network decisions contain explicit counterfactual evidence. Only evidence-backed rows count as outsourcing avoidance.
    state.networkTransfers=Array.isArray(state.networkTransfers)?state.networkTransfers:[];
    if(!state.networkTransfers.some(x=>x.demoKpiV151))for(let i=0;i<12;i++){const h=hist[i%Math.max(1,hist.length)]||{},sister=labs[(i+1)%Math.max(1,labs.length)],external=i%5===4,extRef=external?`EXT-Q-${202600+i+1}`:null,altRef=!external&&i%2===0?`ALT-Q-${202600+i+1}`:null;state.networkTransfers.push({id:`KNET-${i+1}`,requestId:h.requestId||reqs[i%reqs.length]?.id,status:external?'External':'Accepted',transferType:i%3===0?'task':'build',stepId:i%3===0?`STEP-${i+1}`:null,acceptedAt:day(today,-(8+i*10))+'T10:00:00Z',createdAt:day(today,-(9+i*10))+'T10:00:00Z',sourceSiteId:h.labId||labs[0]?.id,targetSiteId:external?'EXT-EU':sister?.id,plannedHours:8+(i%5)*6,transferCost:external?0:150+(i%4)*80,externalCost:external?2400+(i%4)*900:0,externalSupplier:external?'External Specialist Facility (Demo)':null,externalEvidenceType:external?(i%2?'Invoice':'Quote'):null,externalReference:extRef,externalEvidenceLabel:external?'Controlled external test commercial evidence':null,externalAlternativeEvidence:altRef?'Quote / documented external alternative':null,externalAlternativeReference:altRef,avoidedExternalCost:altRef?2800+(i%5)*1100:0,programmeDaysRecovered:!external?1+(i%5):0,homeCouldMeetRequirement:external?false:i%4===0,demoKpiV151:true});}
    // Lesson decisions provide both accepted and rejected populations without fabricating production integration.
    state.lessonDecisions=Array.isArray(state.lessonDecisions)?state.lessonDecisions:[];if(!state.lessonDecisions.some(x=>x.demoKpiV151))for(let i=0;i<10;i++)state.lessonDecisions.push({id:`KLESS-${i+1}`,date:day(today,-(i*14+4)),status:i%4===0?'Rejected':'Accepted',cause:causes[i%causes.length],effectiveness:i%4===0?'Not implemented':i%3===0?'Positive':'Monitoring',beforeRate:12+(i%4)*3,afterRate:i%4===0?null:5+(i%3)*2,demoKpiV151:true});
    // Planning instability demo facts: controlled categories plus retained free-text rationale. These are raw events, not derived KPI results.
    const replanCauses=['Business priority change','Equipment contention','Material','Equipment breakdown','Skill / resource shortage','Customer / design change'];
    const replanKinds=['priority-driven replan','blocker-driven replan','manual replan','system auto-replan','optimisation replan'];
    reqs.slice(0,Math.min(12,reqs.length)).forEach((r,i)=>{r.planningReplanHistory=Array.isArray(r.planningReplanHistory)?r.planningReplanHistory:[];if(!r.planningReplanHistory.some(x=>x.demoKpiV151)){const at=day(today,-(6+i*7)),from=day(at,-(2+(i%3))),to=day(from,1+(i%6));r.planningReplanHistory.push({id:`KREPLAN-${i+1}`,at:at+'T09:30:00Z',fromStart:from,toStart:to,reasonCategory:replanCauses[i%replanCauses.length],moveKind:replanKinds[i%replanKinds.length],reason:`Demo rationale: ${replanCauses[i%replanCauses.length].toLowerCase()} required schedule review`,rationale:`Schedule moved ${1+(i%6)} day${1+(i%6)===1?'':'s'} after impact review.`,actor:['Lab Planner','Lab Manager','System optimiser'][i%3],demoKpiV151:true});}});
    state.settings.kpiDemoSeedV151='1.0.164';state.settings.kpiModelVersion='1.0.164';return {changed:true,history:hist.length,delays:state.kpiFactsV151.delays.length,quality:state.kpiFactsV151.quality.length,capacity:state.kpiFactsV151.capacity.length};
  };
})(window.ProtoLab);

/* ============================================================
   LabOS REV 1.0.164 — unified visual Programme Builder model.
   One canonical builder structure and mutation grammar is used by
   Prototype and Validation. Native domain records stay synchronized
   so the existing planning / execution / evidence services continue
   to operate without data loss.
   ============================================================ */
(function installProgrammeBuilderV162(P){
  'use strict';
  if(!P || P.ensureProgrammeBuilderV162) return;

  const arr=(s,k)=>s[k]=Array.isArray(s[k])?s[k]:[];
  const clone=v=>P.deepClone?P.deepClone(v):JSON.parse(JSON.stringify(v));
  const now=()=>P.now?P.now():new Date().toISOString();
  const uid=p=>P.uid?P.uid(p):`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const clean=v=>String(v??'').trim();
  const key=(type,id)=>`${type}:${id}`;
  const nextRev=r=>{const s=clean(r||'A');if(/^\d+(?:\.\d+)*$/.test(s)){const parts=s.split('.').map(Number);parts[parts.length-1]++;return parts.join('.')}if(/^[A-Z]$/.test(s))return String.fromCharCode(Math.min(90,s.charCodeAt(0)+1));return `${s||'A'}+`};

  function entityFor(state,type,id){
    return type==='validation'?byId(state.validationProgrammes,id):byId(state.requests,id);
  }
  function quantityFor(state,type,id){return Math.max(0,num(entityFor(state,type,id)?.quantity,0))}
  function mainLaneId(type,id){return `${type==='validation'?'VAL':'PRO'}-${id}-MAIN`}

  function nativePrototype(state,id){
    const r=byId(state.requests,id),route=(state.routes||[]).find(x=>x.requestId===id);
    if(!r||!route)return null;
    const steps=(route.steps||[]).slice().sort((a,b)=>num(a.order)-num(b.order));
    const names=[];for(const s of steps){const n=clean(s.parallelGroup)||'Main flow';if(!names.includes(n))names.push(n)}
    const lanes=names.map((name,i)=>({id:name==='Main flow'?mainLaneId('prototype',id):`PRO-${id}-LEG-${i}`,name,order:i,parentLaneId:null,anchorAfterId:null,mergeBeforeId:null,collapsed:false,allocation:null}));
    const laneByName=new Map(lanes.map(l=>[l.name,l.id]));
    const activities=steps.map((s,i)=>({
      id:s.id,sourceId:s.processId||null,sourceType:'process',name:s.name||s.processId||`Process ${i+1}`,
      kind:s.type==='new'?'New process development':s.type==='modified'?'Adapted process':'Process step',laneId:laneByName.get(clean(s.parallelGroup)||'Main flow')||lanes[0]?.id,
      order:num(s.order,i+1),durationHours:num(s.actualDurationHours||s.estimatedHours||s.durationHours,0),quantity:num(s.quantity,r.quantity),
      status:s.status||'Planned',readiness:s.readiness||'pending',labId:s.siteId||r.executionSiteId||null,predecessorIds:Array.isArray(s.predecessorIds)?s.predecessorIds.slice():[],
      requirementIds:[],destructive:!!s.destructive,sameDutContinuation:s.sameDutContinuation!==false,retainedSamples:num(s.retainedSamples,0),external:/external/i.test(String(s.type||'')),sisterLab:!!s.sisterLab,
      metadata:{processRevision:s.processRevision||null,optional:!!s.optional}
    }));
    // Give migrated non-main lanes safe split/merge anchors from the surrounding main route.
    const main=activities.filter(a=>a.laneId===lanes[0]?.id).sort((a,b)=>a.order-b.order);
    for(const l of lanes.slice(1)){
      const items=activities.filter(a=>a.laneId===l.id).sort((a,b)=>a.order-b.order);if(!items.length)continue;
      const min=Math.min(...items.map(a=>a.order)),max=Math.max(...items.map(a=>a.order));
      l.anchorAfterId=[...main].reverse().find(a=>a.order<min)?.id||null;l.mergeBeforeId=main.find(a=>a.order>max)?.id||null;
    }
    return {entity:r,route,lanes,activities};
  }

  function nativeValidation(state,id){
    const p=byId(state.validationProgrammes,id);if(!p)return null;
    const nlegs=P.validationLegsV161?P.validationLegsV161(state,id):(state.validationLegs||[]).filter(x=>x.programmeId===id).sort((a,b)=>num(a.order)-num(b.order));
    const nacts=P.validationActivitiesV161?P.validationActivitiesV161(state,id):(state.validationActivities||[]).filter(x=>x.programmeId===id).sort((a,b)=>num(a.order)-num(b.order));
    let lanes=nlegs.map((l,i)=>({id:l.id,name:l.name||`Leg ${i+1}`,order:num(l.order,i),parentLaneId:l.parentLaneId||null,anchorAfterId:l.anchorAfterId||null,mergeBeforeId:l.mergeBeforeId||null,collapsed:!!l.collapsed,allocation:l.allocation?clone(l.allocation):null}));
    if(!lanes.length&&nacts.length)lanes=[{id:mainLaneId('validation',id),name:'Main flow',order:0,parentLaneId:null,anchorAfterId:null,mergeBeforeId:null,collapsed:false,allocation:null}];
    const fallback=lanes[0]?.id||mainLaneId('validation',id);
    const activities=nacts.map((a,i)=>({
      id:a.id,sourceId:a.standardTestId||a.basisTestId||null,sourceType:a.standardTestId?'standard-test':a.kind==='Test Development'?'development':'validation-activity',name:a.name||`Validation activity ${i+1}`,
      kind:a.kind||'Validation Test',laneId:a.legId||fallback,order:num(a.order,i+1),durationHours:num(a.estimatedHours||a.durationHours,0),quantity:num(a.quantity,p.quantity),
      status:a.status||'Planned',readiness:a.readiness||'pending',labId:a.siteId||p.executionSiteId||null,predecessorIds:Array.isArray(a.predecessorIds)?a.predecessorIds.slice():[],
      requirementIds:Array.isArray(a.requirementIds)?a.requirementIds.slice():[],destructive:!!a.destructive,sameDutContinuation:a.sameDutContinuation!==false,retainedSamples:num(a.retainedSamples,0),external:!!a.external||/external/i.test(String(a.kind||'')),sisterLab:!!a.sisterLab||/sister/i.test(String(a.kind||'')),
      metadata:{coverage:a.coverage??null,basisTestId:a.basisTestId||null,standardTestId:a.standardTestId||null}
    }));
    return {entity:p,lanes,activities};
  }

  function migrate(state,type,id){
    const src=type==='validation'?nativeValidation(state,id):nativePrototype(state,id);if(!src)return null;
    const structure={id:key(type,id),programmeType:type,entityId:id,modelVersion:'1.0.164',createdAt:now(),updatedAt:now(),layoutDirection:'LR',overlay:'structure',lanes:clone(src.lanes),activities:clone(src.activities),templatesUsed:[],revisionHistory:[]};
    if(!structure.lanes.length)structure.lanes.push({id:mainLaneId(type,id),name:'Main flow',order:0,parentLaneId:null,anchorAfterId:null,mergeBeforeId:null,collapsed:false,allocation:null});
    if(!structure.lanes.some(l=>l.name==='Main flow'))structure.lanes.unshift({id:mainLaneId(type,id),name:'Main flow',order:-1,parentLaneId:null,anchorAfterId:null,mergeBeforeId:null,collapsed:false,allocation:null});
    structure.lanes.sort((a,b)=>num(a.order)-num(b.order)).forEach((l,i)=>l.order=i);
    rebuildDependencies(structure);
    return structure;
  }

  function refreshNonStructural(state,s){
    const src=s.programmeType==='validation'?nativeValidation(state,s.entityId):nativePrototype(state,s.entityId);if(!src)return s;
    const nativeIds=new Set(src.activities.map(a=>a.id)),structureIds=new Set((s.activities||[]).map(a=>a.id));
    const structuralDrift=nativeIds.size!==structureIds.size||[...nativeIds].some(id=>!structureIds.has(id));
    if(structuralDrift){const fresh=migrate(state,s.programmeType,s.entityId);if(fresh){s.lanes=fresh.lanes;s.activities=fresh.activities;s.updatedAt=now();s.lastExternalSyncAt=now();}return s;}
    const nativeMap=new Map(src.activities.map(a=>[a.id,a]));
    for(const a of s.activities||[]){const n=nativeMap.get(a.id);if(!n)continue;a.status=n.status;a.readiness=n.readiness;a.labId=n.labId;a.durationHours=n.durationHours||a.durationHours;a.metadata={...(a.metadata||{}),...(n.metadata||{})};}
    return s;
  }

  function rebuildDependencies(s){
    const activities=s.activities||[],lanes=(s.lanes||[]).slice().sort((a,b)=>num(a.order)-num(b.order)),map=new Map(activities.map(a=>[a.id,a]));
    for(const a of activities)a.predecessorIds=Array.isArray(a.extraPredecessorIds)?a.extraPredecessorIds.filter(id=>map.has(id)):[];
    const main=lanes.find(l=>l.name==='Main flow')||lanes[0];
    const mainItems=activities.filter(a=>a.laneId===main?.id).sort((a,b)=>num(a.order)-num(b.order));
    for(let i=1;i<mainItems.length;i++)if(!mainItems[i].predecessorIds.includes(mainItems[i-1].id))mainItems[i].predecessorIds.push(mainItems[i-1].id);
    for(const lane of lanes.filter(l=>l.id!==main?.id)){
      const items=activities.filter(a=>a.laneId===lane.id).sort((a,b)=>num(a.order)-num(b.order));if(!items.length)continue;
      if(lane.anchorAfterId&&map.has(lane.anchorAfterId)&&!items[0].predecessorIds.includes(lane.anchorAfterId))items[0].predecessorIds.push(lane.anchorAfterId);
      for(let i=1;i<items.length;i++)if(!items[i].predecessorIds.includes(items[i-1].id))items[i].predecessorIds.push(items[i-1].id);
      if(lane.mergeBeforeId&&map.has(lane.mergeBeforeId)){const merge=map.get(lane.mergeBeforeId),last=items[items.length-1];if(!merge.predecessorIds.includes(last.id))merge.predecessorIds.push(last.id)}
    }
    return s;
  }
  P.rebuildProgrammeDependenciesV162=rebuildDependencies;

  P.ensureProgrammeBuilderV162=(state,{type=null,id=null}={})=>{
    if(!state)return {changed:false};arr(state,'programmeStructuresV162');arr(state,'programmeTemplatesV162');let changed=false;
    if(!state.programmeTemplatesV162.length){
      state.programmeTemplatesV162.push(
        {id:'TPL-PROTOTYPE-MOULD',programmeType:'prototype',name:'Mould → Cure → Trim → Inspect',activities:[{name:'Mould',kind:'Process step'},{name:'Cure',kind:'Process step'},{name:'Trim',kind:'Process step'},{name:'Final Inspection',kind:'Inspection'}],createdAt:now()},
        {id:'TPL-VALIDATION-CONDITION',programmeType:'validation',name:'Precondition → Thermal Cycle → Functional Test → Visual Inspection',activities:[{name:'Precondition',kind:'Hold / conditioning'},{name:'Thermal Cycling',kind:'Validation Test'},{name:'Functional Test',kind:'Validation Test'},{name:'Visual Inspection',kind:'Inspection'}],createdAt:now()}
      );changed=true;
    }
    const targets=[];
    if(type&&id)targets.push([type,id]);else{
      for(const r of state.requests||[])if(!r.archived)targets.push(['prototype',r.id]);
      for(const p of state.validationProgrammes||[])if(!p.archived)targets.push(['validation',p.id]);
    }
    for(const [t,eid] of targets){const k=key(t,eid),existing=state.programmeStructuresV162.find(x=>x.id===k);if(!existing){const s=migrate(state,t,eid);if(s){state.programmeStructuresV162.push(s);changed=true}}else refreshNonStructural(state,existing)}
    state.settings=state.settings||{};if(!state.settings.programmeBuilderV162){state.settings.programmeBuilderV162={modelVersion:'1.0.164',migratedAt:now()};changed=true}
    return {changed};
  };

  P.programmeStructureV162=(state,type,id)=>{P.ensureProgrammeBuilderV162(state,{type,id});return (state.programmeStructuresV162||[]).find(x=>x.id===key(type,id))||null};

  P.programmeTotalQuantityV162=quantityFor;

  P.programmeHealthV162=(state,type,id)=>{
    const s=P.programmeStructureV162(state,type,id),issues=[],warnings=[];if(!s)return {level:'red',issues:[{code:'MISSING',message:'Programme structure is missing.'}],warnings:[],valid:false};
    const lanes=s.lanes||[],acts=s.activities||[],laneIds=new Set(lanes.map(l=>l.id)),ids=new Set(acts.map(a=>a.id));
    if(!lanes.length)issues.push({code:'NO_LEG',message:'Programme has no flow/leg.'});
    if(!acts.length)warnings.push({code:'EMPTY',message:'Add the first programme activity.'});
    for(const a of acts){if(!laneIds.has(a.laneId))issues.push({code:'FLOATING',activityId:a.id,message:`${a.name} is not attached to a programme leg.`});for(const d of a.predecessorIds||[])if(!ids.has(d))issues.push({code:'ORPHAN_DEP',activityId:a.id,message:`${a.name} has a missing dependency.`})}
    const visiting=new Set(),done=new Set(),map=new Map(acts.map(a=>[a.id,a]));
    const dfs=id2=>{if(done.has(id2))return;if(visiting.has(id2)){issues.push({code:'LOOP',activityId:id2,message:'Dependency loop detected.'});return}visiting.add(id2);for(const d of map.get(id2)?.predecessorIds||[])dfs(d);visiting.delete(id2);done.add(id2)};for(const a of acts)dfs(a.id);
    const total=quantityFor(state,type,id),parallel=lanes.filter(l=>l.name!=='Main flow'&&l.allocation);
    const consumed=parallel.filter(l=>!l.allocation?.sameDut).reduce((sum,l)=>{const a=l.allocation||{};return sum+(a.mode==='percentage'?total*num(a.value)/100:num(a.value))},0);
    if(total&&consumed>total+1e-9)issues.push({code:'OVERALLOCATED',message:`Parallel legs allocate ${consumed.toFixed(1)} of ${total} available ${type==='validation'?'DUTs':'samples'}.`});
    for(const l of parallel){const a=l.allocation||{};if(a.destructive&&l.mergeBeforeId)issues.push({code:'DESTRUCTIVE_MERGE',laneId:l.id,message:`${l.name} is destructive and cannot rejoin downstream flow.`});if(a.retained!=null&&num(a.retained)<0)issues.push({code:'RETAINED_NEG',laneId:l.id,message:`${l.name} has invalid retained-sample quantity.`})}
    if(type==='validation'){
      const reqs=P.validationRequirementsV161?P.validationRequirementsV161(state,id):(state.validationRequirements||[]).filter(r=>r.programmeId===id),linked=new Set(acts.flatMap(a=>a.requirementIds||[]));
      for(const r of reqs)if(!r.mapping)warnings.push({code:'REQ_UNMAPPED',requirementId:r.id,message:`${r.id} is not mapped to a verification method.`});else if(!(r.linkedActivityIds||[]).some(x=>ids.has(x))&&!linked.has(r.id))warnings.push({code:'REQ_UNLINKED',requirementId:r.id,message:`${r.id} is mapped but has no activity on the programme.`});
      for(const a of acts.filter(x=>x.sourceId&&x.sourceType==='standard-test')){const t=byId(state.standardTests,a.sourceId),cap=t&&(P.planningCapabilityForTest?.(t)||t.planningCapability||t.equipmentCapability);if(cap&&!((state.equipment||[]).some(e=>P.equipmentSupportsCapability?.(e,cap))))warnings.push({code:'NO_EQUIPMENT',activityId:a.id,message:`${a.name} has no currently registered equipment capability.`})}
    }
    for(const a of acts)if(/blocked|fail/i.test(String(a.readiness||a.status||'')))warnings.push({code:'READINESS',activityId:a.id,message:`${a.name} has a readiness blocker.`});
    const all=[...issues,...warnings];return {level:issues.length?'red':warnings.length?'yellow':'green',issues,warnings,all,valid:issues.length===0,nodes:acts.length,legs:lanes.length,totalQuantity:total};
  };

  function syncValidation(state,s){
    const pid=s.entityId,p=byId(state.validationProgrammes,pid);if(!p)return;
    const oldLegs=(state.validationLegs||[]).filter(x=>x.programmeId===pid),oldActs=(state.validationActivities||[]).filter(x=>x.programmeId===pid),legMap=new Map(oldLegs.map(x=>[x.id,x])),actMap=new Map(oldActs.map(x=>[x.id,x]));
    state.validationLegs=(state.validationLegs||[]).filter(x=>x.programmeId!==pid);
    for(const [i,l] of (s.lanes||[]).sort((a,b)=>num(a.order)-num(b.order)).entries()){const old=legMap.get(l.id)||{};state.validationLegs.push({...old,id:l.id,programmeId:pid,name:l.name,order:i+1,status:old.status||'Planned',parentLaneId:l.parentLaneId||null,anchorAfterId:l.anchorAfterId||null,mergeBeforeId:l.mergeBeforeId||null,collapsed:!!l.collapsed,allocation:l.allocation?clone(l.allocation):null,builderModel:'1.0.164'})}
    state.validationActivities=(state.validationActivities||[]).filter(x=>x.programmeId!==pid);
    const laneOrder=new Map(s.lanes.map((l,i)=>[l.id,i]));
    const acts=(s.activities||[]).slice().sort((a,b)=>(laneOrder.get(a.laneId)??999)-(laneOrder.get(b.laneId)??999)||num(a.order)-num(b.order));
    for(const a of acts){const old=actMap.get(a.id)||{},native={...old,id:a.id,programmeId:pid,legId:a.laneId,order:num(a.order,1),kind:a.kind||old.kind||'Validation Test',name:a.name,estimatedHours:num(a.durationHours,old.estimatedHours||1),quantity:num(a.quantity,p.quantity),status:a.status||old.status||'Planned',readiness:a.readiness||old.readiness||'pending',siteId:a.labId||old.siteId||p.executionSiteId||null,predecessorIds:(a.predecessorIds||[]).slice(),requirementIds:(a.requirementIds||[]).slice(),destructive:!!a.destructive,sameDutContinuation:a.sameDutContinuation!==false,retainedSamples:num(a.retainedSamples,0),external:!!a.external,sisterLab:!!a.sisterLab,builderModel:'1.0.164'};
      if(a.sourceType==='standard-test'||a.metadata?.standardTestId)native.standardTestId=a.sourceId||a.metadata?.standardTestId;if(a.sourceType==='development'||a.metadata?.basisTestId)native.basisTestId=a.sourceId||a.metadata?.basisTestId;state.validationActivities.push(native)
    }
    for(const r of (state.validationRequirements||[]).filter(x=>x.programmeId===pid)){const linked=acts.filter(a=>(a.requirementIds||[]).includes(r.id)).map(a=>a.id);if(linked.length)r.linkedActivityIds=[...new Set([...(r.linkedActivityIds||[]).filter(id=>acts.some(a=>a.id===id)),...linked])];else r.linkedActivityIds=(r.linkedActivityIds||[]).filter(id=>acts.some(a=>a.id===id));}
  }

  function syncPrototype(state,s){
    const rid=s.entityId,r=byId(state.requests,rid),route=(state.routes||[]).find(x=>x.requestId===rid);if(!r||!route)return;
    const oldMap=new Map((route.steps||[]).map(x=>[x.id,x])),main=(s.lanes||[]).find(l=>l.name==='Main flow')||s.lanes?.[0],laneMap=new Map((s.lanes||[]).map(l=>[l.id,l]));
    const laneOrder=new Map((s.lanes||[]).map((l,i)=>[l.id,i]));
    route.steps=(s.activities||[]).slice().sort((a,b)=>(laneOrder.get(a.laneId)??999)-(laneOrder.get(b.laneId)??999)||num(a.order)-num(b.order)).map((a,i)=>{const old=oldMap.get(a.id)||{},lane=laneMap.get(a.laneId),type=a.kind==='New process development'?'new':a.kind==='Adapted process'?'modified':a.external?'external':'standard';return {...old,id:a.id,order:i+1,processId:a.sourceId||old.processId||'',name:a.name,processRevision:a.metadata?.processRevision||old.processRevision||'A',type,status:a.status||old.status||'Planned',readiness:a.readiness||old.readiness||'pending',parallelGroup:lane?.id===main?.id?null:(lane?.name||lane?.id),predecessorIds:(a.predecessorIds||[]).slice(),quantity:num(a.quantity,r.quantity),destructive:!!a.destructive,sameDutContinuation:a.sameDutContinuation!==false,retainedSamples:num(a.retainedSamples,0),siteId:a.labId||old.siteId||null,sisterLab:!!a.sisterLab,builderModel:'1.0.164'};});
    route.builderLanesV162=(s.lanes||[]).map(l=>({id:l.id,name:l.name,order:l.order,parentLaneId:l.parentLaneId||null,anchorAfterId:l.anchorAfterId||null,mergeBeforeId:l.mergeBeforeId||null,allocation:l.allocation?clone(l.allocation):null,collapsed:!!l.collapsed}));
  }

  P.syncProgrammeStructureV162=(state,type,id)=>{let s=(state.programmeStructuresV162||[]).find(x=>x.id===key(type,id))||null;if(!s){P.ensureProgrammeBuilderV162(state,{type,id});s=(state.programmeStructuresV162||[]).find(x=>x.id===key(type,id))||null}if(!s)return null;rebuildDependencies(s);s.updatedAt=now();if(type==='validation')syncValidation(state,s);else syncPrototype(state,s);return s};

  P.programmeEditControlV162=(state,type,id)=>{
    const entity=entityFor(state,type,id);if(!entity)return {editable:false,reason:'Programme not found.'};
    const route=type==='prototype'?(state.routes||[]).find(x=>x.requestId===id):null,status=String(entity.status||'');
    const superseded=/superseded/i.test(status),underReview=/under[ _-]?review/i.test(status)||!!route?.proposed&&!route?.confirmed;
    const released=type==='validation'?/released|closed|complete/i.test(status):!!route?.confirmed||/released|delivered|closed|complete/i.test(status);
    const stateLabel=superseded?'Superseded':released?'Released':underReview?'Under Review':'Draft';
    return {editable:!superseded,requiresRevision:released,state:stateLabel,reason:superseded?'Superseded programmes are read-only. Create a controlled successor revision to edit structure.':null};
  };

  P.beginProgrammeRevisionV162=(state,type,id,rationale,actor=null)=>{
    const s=P.programmeStructureV162(state,type,id),entity=entityFor(state,type,id);if(!s||!entity)throw new Error('Programme not found.');if(!clean(rationale))throw new Error('Record a rationale for the controlled structural revision.');
    const old=type==='validation'?(entity.revision||'A'):((state.routes||[]).find(x=>x.requestId===id)?.revision||'A'),next=nextRev(old),row={id:uid('PREV'),at:now(),actor:actor||state.identity?.name||'User',fromRevision:old,toRevision:next,rationale};
    s.revisionHistory=Array.isArray(s.revisionHistory)?s.revisionHistory:[];s.revisionHistory.push(row);
    if(type==='validation'){entity.revision=next;entity.status='Under Review'}else{const route=(state.routes||[]).find(x=>x.requestId===id);if(route){route.revision=next;route.confirmed=false;route.proposed=true;route.builderRevisionRationale=rationale}}
    P.audit?.(state,'Programme structural revision started',type==='validation'?'Validation Programme':'Prototype Build',id,old,next,rationale);return row;
  };

  P.programmeLibraryV162=(state,type,id,query='')=>{
    const q=clean(query).toLowerCase(),out=[];
    if(type==='prototype'){
      for(const p of state.processes||[]){if(p.status&&p.status!=='Released')continue;out.push({id:p.id,sourceType:'process',name:p.name||p.id,kind:'Process step',durationHours:num(p.standardHours||p.durationHours||p.estimatedHours,1),category:p.category||p.capability||'Standard processes',favorite:!!p.favorite})}
      out.push(
        {id:'V162-P-START',sourceType:'generic',name:'Start',kind:'Start',durationHours:0,category:'Relevant activities'},
        {id:'V162-P-PREP',sourceType:'generic',name:'Preparation',kind:'Material preparation',durationHours:1,category:'Relevant activities'},
        {id:'V162-P-MEASURE',sourceType:'generic',name:'Measurement',kind:'Measurement',durationHours:1,category:'Relevant activities'},
        {id:'V162-P-ASSEMBLY',sourceType:'generic',name:'Assembly',kind:'Assembly',durationHours:2,category:'Relevant activities'},
        {id:'V162-P-SPECIAL',sourceType:'generic',name:'Special process',kind:'Special process',durationHours:2,category:'Relevant activities'},
        {id:'V162-P-TEST',sourceType:'generic',name:'Test',kind:'Test',durationHours:1,category:'Relevant activities'},
        {id:'V162-P-HOLD',sourceType:'generic',name:'Hold / wait',kind:'Hold / wait',durationHours:1,category:'Relevant activities'},
        {id:'V162-P-INSPECT',sourceType:'generic',name:'Inspection',kind:'Inspection',durationHours:1,category:'Relevant activities'},
        {id:'V162-P-EXTERNAL',sourceType:'generic',name:'External activity',kind:'External activity',durationHours:8,category:'External / Sister Lab',external:true},
        {id:'V162-P-SISTER',sourceType:'generic',name:'Sister-lab activity',kind:'Sister-lab activity',durationHours:8,category:'External / Sister Lab',sisterLab:true}
      );
    }else{
      const reqs=P.validationRequirementsV161?P.validationRequirementsV161(state,id):[];const rankedIds=[];for(const r of reqs){for(const x of (P.rankValidationTestsV161?.(state,r,4)||[]))if(!rankedIds.includes(x.test.id))rankedIds.push(x.test.id)}
      for(const t of state.standardTests||[]){if(t.status!=='Released')continue;out.push({id:t.id,sourceType:'standard-test',name:t.name||t.id,kind:'Standard test',durationHours:num(P.planningStandardHours?.(t,1)||t.standardHours||t.durationHours,1),category:rankedIds.includes(t.id)?'Relevant activities':'Standard processes/tests',relevantRank:rankedIds.indexOf(t.id),favorite:!!t.favorite})}
      out.push(
        {id:'V162-V-START',sourceType:'generic',name:'Start',kind:'Start',durationHours:0,category:'Relevant activities'},
        {id:'V162-V-PREP',sourceType:'generic',name:'Preparation',kind:'Preparation',durationHours:1,category:'Relevant activities'},
        {id:'V162-V-THERMAL',sourceType:'generic',name:'Thermal Cycling',kind:'Validation Test',durationHours:8,category:'Relevant activities'},
        {id:'V162-V-VIBRATION',sourceType:'generic',name:'Vibration',kind:'Validation Test',durationHours:8,category:'Relevant activities'},
        {id:'V162-V-SALT',sourceType:'generic',name:'Salt Spray',kind:'Validation Test',durationHours:8,category:'Relevant activities'},
        {id:'V162-V-FUNCTIONAL',sourceType:'generic',name:'Functional Test',kind:'Validation Test',durationHours:2,category:'Relevant activities'},
        {id:'V162-V-FINAL-INSPECT',sourceType:'generic',name:'Final Inspection',kind:'Inspection',durationHours:1,category:'Relevant activities'},
        {id:'V162-V-DEV',sourceType:'development',name:'New test development',kind:'New test development',durationHours:8,category:'Development'},
        {id:'V162-V-HOLD',sourceType:'generic',name:'Hold / conditioning',kind:'Hold / conditioning',durationHours:4,category:'Relevant activities'},
        {id:'V162-V-INSPECT',sourceType:'generic',name:'Inspection',kind:'Inspection',durationHours:1,category:'Relevant activities'},
        {id:'V162-V-MEASURE',sourceType:'generic',name:'Measurement',kind:'Measurement',durationHours:1,category:'Relevant activities'},
        {id:'V162-V-ANALYSIS',sourceType:'generic',name:'Analysis',kind:'Analysis',durationHours:2,category:'Relevant activities'},
        {id:'V162-V-REPORT',sourceType:'generic',name:'Report / review',kind:'Report / review',durationHours:2,category:'Relevant activities'},
        {id:'V162-V-EXTERNAL',sourceType:'generic',name:'External test',kind:'External test',durationHours:8,category:'External / Sister Lab',external:true},
        {id:'V162-V-SISTER',sourceType:'generic',name:'Sister-lab test',kind:'Sister-lab test',durationHours:8,category:'External / Sister Lab',sisterLab:true}
      );
    }
    const templates=(state.programmeTemplatesV162||[]).filter(t=>t.programmeType===type).map(t=>({id:t.id,sourceType:'template',name:t.name,kind:'Reusable template',durationHours:0,category:'Templates',template:t}));
    const rows=[...templates,...out];return rows.filter(x=>!q||`${x.name} ${x.kind} ${x.category}`.toLowerCase().includes(q)).sort((a,b)=>(a.category==='Relevant activities'?-2:a.category==='Templates'?-1:0)-(b.category==='Relevant activities'?-2:b.category==='Templates'?-1:0)||(a.relevantRank??999)-(b.relevantRank??999)||String(a.name).localeCompare(String(b.name)));
  };

  P.makeProgrammeActivityV162=(state,type,id,item,{laneId=null,requirementIds=[]}={})=>{
    let s=(state.programmeStructuresV162||[]).find(x=>x.id===key(type,id))||null;if(!s){P.ensureProgrammeBuilderV162(state,{type,id});s=(state.programmeStructuresV162||[]).find(x=>x.id===key(type,id))||null}const entity=entityFor(state,type,id);if(!s||!entity)throw new Error('Programme not found.');const lane=laneId||s.lanes[0]?.id;
    let source=item;if(typeof item==='string')source=P.programmeLibraryV162(state,type,id).find(x=>x.id===item);if(!source)throw new Error('Activity source was not found.');
    const a={id:uid(type==='validation'?'VA':'PS'),sourceId:/^V162-/.test(source.id)?null:source.id,sourceType:source.sourceType||'generic',name:source.name,kind:source.kind,durationHours:num(source.durationHours,1),quantity:num(entity.quantity,1),laneId:lane,order:1,status:'Planned',readiness:'pending',labId:entity.executionSiteId||entity.homeSiteId||null,predecessorIds:[],requirementIds:[...new Set(requirementIds)],destructive:false,sameDutContinuation:true,retainedSamples:0,external:!!source.external,sisterLab:!!source.sisterLab,metadata:{standardTestId:source.sourceType==='standard-test'?source.id:null}};
    return a;
  };

  P.programmeDeleteImpactV162=(state,type,id,activityIds)=>{
    const s=P.programmeStructureV162(state,type,id),ids=new Set(activityIds||[]),impacts=[];if(!s)return impacts;
    const downstream=(s.activities||[]).filter(a=>(a.predecessorIds||[]).some(d=>ids.has(d)));if(downstream.length)impacts.push(`${downstream.length} downstream dependency link${downstream.length===1?'':'s'} will be repaired.`);
    if(type==='validation'){const reqs=(state.validationRequirements||[]).filter(r=>r.programmeId===id&&(r.linkedActivityIds||[]).some(x=>ids.has(x)));if(reqs.length)impacts.push(`${reqs.length} validation requirement link${reqs.length===1?'':'s'} will be removed.`)}
    const bookings=(state.bookings||[]).filter(b=>b.requestId===id&&ids.has(b.stepId));if(bookings.length)impacts.push(`${bookings.length} planning booking${bookings.length===1?'':'s'} reference the selected work.`);
    const results=type==='validation'?(state.validationResults||[]).filter(r=>r.programmeId===id&&ids.has(r.activityId)) : [] ;if(results.length)impacts.push(`${results.length} recorded result${results.length===1?'':'s'} reference the selected work.`);
    if(P.programmeEditControlV162(state,type,id).requiresRevision)impacts.push('The released programme requires a controlled revision.');return impacts;
  };

  P.checkProgrammeFeasibilityV162=(state,type,id)=>{
    const health=P.programmeHealthV162(state,type,id);if(!health.valid)return {ok:false,health,error:health.issues[0]?.message||'Programme structure is not valid.'};
    try{
      if(type==='validation'){const probe=clone(state),plan=P.planValidationV161?.(probe,id,{commit:false});return {ok:!!plan,health,forecast:plan?.forecast||plan?.forecastDate||byId(probe.validationProgrammes,id)?.forecastDate||null,details:plan||null}}
      const probe=clone(state),planner=P.PlannerService?new P.PlannerService():null;if(!planner)return {ok:true,health,forecast:null,details:{message:'Structure is valid. Open Resource Plan for constrained scheduling.'}};planner.autoPlan(probe,id);const r=byId(probe.requests,id);return {ok:true,health,forecast:r?.forecastDate||r?.triage?.forecastDate||null,details:{planQuality:r?.triage?.planQuality||'Best feasible'}};
    }catch(e){return {ok:false,health,error:e.message,code:e.code||'PLANNING_BLOCKED',details:{taskName:e.taskName||null,equipmentId:e.equipmentId||null,staffId:e.staffId||null}}}
  };

  P.programmeBuilderInvariantV162=(state,type,id)=>{
    const s=P.programmeStructureV162(state,type,id),h=P.programmeHealthV162(state,type,id),ids=new Set((s?.activities||[]).map(a=>a.id)),nativeIds=type==='validation'?new Set((state.validationActivities||[]).filter(a=>a.programmeId===id).map(a=>a.id)):new Set(((state.routes||[]).find(r=>r.requestId===id)?.steps||[]).map(a=>a.id));
    return {ok:!!s&&h.valid&&[...ids].every(x=>nativeIds.has(x))&&[...nativeIds].every(x=>ids.has(x)),health:h,structure:s};
  };
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.164 — integrated Validation planning + automatic
   product learning. Prototype retains its established process-flow
   model; these services are domain-neutral and do not require the
   visual Programme Builder for Prototype.
   ============================================================ */
(function installV163IntegratedPlanningAndLearning(P){
  if(!P || P.ensureLessonsV163)return;
  const rows=(s,k)=>s[k]=Array.isArray(s[k])?s[k]:[];
  const byId=(a,id)=>(a||[]).find(x=>x.id===id)||null;
  const text=x=>String(x??'').trim();
  const norm=x=>text(x).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const closedPrototype=r=>!!r&&(['RELEASED','DELIVERED','CLOSED'].includes(String(r.status||'').toUpperCase())||!!r.actualDeliveryDate);
  const closedValidation=p=>!!p&&(['CLOSED','COMPLETE','ARCHIVED'].includes(String(p.status||'').toUpperCase())||!!p.actualCompletionDate||!!p.closedAt);
  const productLabel=(state,pid)=>{const p=byId(state.products,pid);return p?.family||p?.name||p?.partNumber||pid||'Unknown product'};
  const median=a=>{const x=a.filter(Number.isFinite).sort((m,n)=>m-n);if(!x.length)return null;const i=Math.floor(x.length/2);return x.length%2?x[i]:(x[i-1]+x[i])/2};
  const uniq=a=>[...new Set(a.filter(Boolean))];
  const overlap=(a,b)=>{const A=new Set(a||[]),B=new Set(b||[]);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(A.size,B.size)};
  function addAcceptedMirror(state,lesson){
    state.lessons=Array.isArray(state.lessons)?state.lessons:[];
    if(state.lessons.some(x=>x.sourceAutoLessonV163===lesson.id))return;
    state.lessons.push({id:P.uid('LESSON'),requestId:lesson.domain==='Prototype'?lesson.sourceId:null,programmeId:lesson.domain==='Validation'?lesson.sourceId:null,productId:lesson.productId,status:'Accepted',sourceProgrammeType:lesson.domain,sourceAutoLessonV163:lesson.id,title:lesson.title,observation:lesson.summary,lesson:lesson.summary,recommendation:(lesson.recommendations||[])[0]||'Review this evidence before similar work.',action:(lesson.recommendations||[])[0]||'Review this evidence before similar work.',category:'Automatic closeout learning',cause:'Automatic evidence capture',evidence:(lesson.evidence||[]).join(' · '),standardTestIds:lesson.standardTestIds||[],createdAt:lesson.capturedAt,createdBy:'LabOS automatic learning',effectiveness:'Monitoring',autoCaptured:true});
  }
  function capturePrototype(state,r){
    const store=rows(state,'autoLessonsV163');if(store.some(x=>x.domain==='Prototype'&&x.sourceId===r.id))return null;
    const route=(state.routes||[]).find(x=>x.requestId===r.id),devs=(state.deviations||[]).filter(x=>x.requestId===r.id),meas=(state.measurements||[]).filter(x=>x.requestId===r.id),serials=(state.serials||[]).filter(x=>x.requestId===r.id),bookings=(state.bookings||[]).filter(x=>x.requestId===r.id&&!P.isHistoricalPlanningBooking?.(x));
    const routeSteps=(route?.steps||[]).slice().sort((a,b)=>Number(a.order||0)-Number(b.order||0)),actuals=routeSteps.map(s=>Number(s.actualDurationHours)).filter(Number.isFinite),overruns=routeSteps.filter(s=>Number(s.actualDurationHours)>Math.max(1.25*Number(s.estimatedHours||s.executionEstimateHours||0),Number(s.estimatedHours||s.executionEstimateHours||0)+1));
    const failed=meas.filter(m=>m.pass===false||m.compliant===false),scrapped=serials.filter(s=>s.status==='Scrapped'),replans=(r.commitmentHistory||[]).filter(x=>x.type==='replan'),issueLabels=uniq(devs.map(d=>d.rootCause||d.measurement||d.type||d.title));
    const rec=[];if(issueLabels.length)rec.push(`Review recurring build issue${issueLabels.length===1?'':'s'} before release: ${issueLabels.slice(0,3).join('; ')}.`);if(replans.length)rec.push(`Review the ${replans.length} commitment replan${replans.length===1?'':'s'} and protect the dominant capacity/material driver earlier.`);if(overruns.length)rec.push(`Update planning standards for ${overruns.slice(0,3).map(x=>x.name).join(', ')} using measured actual duration.`);if(failed.length)rec.push(`Carry forward the disposition/effectiveness evidence for ${failed.length} failed measurement${failed.length===1?'':'s'}.`);if(!rec.length)rec.push('No material exception was detected; retain the released route and current planning assumptions as the preferred starting point.');
    const lesson={id:`AUTO-LESSON-P-${r.id}`,domain:'Prototype',sourceId:r.id,productId:r.productId,product:productLabel(state,r.productId),productRevision:r.productRevision||r.hardwareRevision||'',project:r.programme||r.title||r.id,capturedAt:r.actualDeliveryDate||r.closedAt||P.now(),title:`${r.id} · automatic Prototype closeout learning`,summary:`${r.quantity||serials.length||0} unit build · ${devs.length} quality exception${devs.length===1?'':'s'} · ${failed.length} failed measurement${failed.length===1?'':'s'} · ${replans.length} replan${replans.length===1?'':'s'}.`,recommendations:rec,evidence:[`${routeSteps.length} route step(s)`,`${bookings.length} planning booking(s)`,`${devs.length} deviation/quality case(s)`,`${scrapped.length} scrapped sample(s)`],signals:{quantity:Number(r.quantity||0),qualityExceptions:devs.length,failedMeasurements:failed.length,scrappedSamples:scrapped.length,replans:replans.length,medianActualStepHours:median(actuals),durationOverruns:overruns.length},methodKeys:uniq(routeSteps.map(s=>s.processId)),standardTestIds:uniq((r.testRequirements||[]).map(t=>t.standardTestId)),createdBy:'LabOS automatic learning',autoCaptured:true};
    store.push(lesson);addAcceptedMirror(state,lesson);P.audit?.(state,'Automatic lessons captured','Prototype Build',r.id,'Execution evidence','Product learning record',`${lesson.summary} ${rec[0]}`);return lesson;
  }
  function captureValidation(state,p){
    const store=rows(state,'autoLessonsV163');if(store.some(x=>x.domain==='Validation'&&x.sourceId===p.id))return null;
    const acts=(state.validationActivities||[]).filter(x=>x.programmeId===p.id),res=(state.validationResults||[]).filter(x=>x.programmeId===p.id),reqs=(state.validationRequirements||[]).filter(x=>x.programmeId===p.id),bookings=(state.bookings||[]).filter(x=>x.requestId===p.id&&!P.isHistoricalPlanningBooking?.(x)),fails=res.filter(x=>x.outcome==='Fail'),devs=acts.filter(x=>x.kind==='Test Development'||x.developmentRequired===true),overruns=acts.filter(a=>Number(a.actualHours)>Math.max(1.25*Number(a.estimatedHours||0),Number(a.estimatedHours||0)+1));
    const rec=[];if(fails.length)rec.push(`Review failure mechanism and disposition for ${fails.length} failed Validation result${fails.length===1?'':'s'} before reusing the same design or test sequence.`);if(devs.length)rec.push(`Reuse measured development effort from ${devs.slice(0,3).map(x=>x.name).join(', ')} when estimating the next comparable method adaptation.`);if(overruns.length)rec.push(`Update planning duration for ${overruns.slice(0,3).map(x=>x.name).join(', ')} from measured execution.`);if(p.prototypeImpact?.oldDutAvailableDate&&p.prototypeImpact?.oldDutAvailableDate!==p.prototypeImpact?.newDutAvailableDate)rec.push('Retain the Prototype-to-Validation timing dependency and surface its impact at programme start.');if(p.homeSiteId&&p.executionSiteId&&p.homeSiteId!==p.executionSiteId)rec.push(`Consider ${p.executionSiteId} early as a proven network route for comparable demand.`);if(!rec.length)rec.push('No material exception was detected; retain the released test sequence, resource assumptions and requirement mappings as the preferred starting point.');
    const lesson={id:`AUTO-LESSON-V-${p.id}`,domain:'Validation',sourceId:p.id,productId:p.productId,product:productLabel(state,p.productId),productRevision:p.productRevision||'',project:p.project||p.title||p.id,capturedAt:p.actualCompletionDate||p.closedAt||P.now(),title:`${p.id} · automatic Validation closeout learning`,summary:`${reqs.length} requirement${reqs.length===1?'':'s'} · ${acts.filter(a=>a.kind==='Validation Test').length} validation test${acts.filter(a=>a.kind==='Validation Test').length===1?'':'s'} · ${fails.length} failed result${fails.length===1?'':'s'} · ${devs.length} method-development activit${devs.length===1?'y':'ies'}.`,recommendations:rec,evidence:[`${bookings.length} shared-resource booking(s)`,`${res.length} recorded result(s)`,`${reqs.filter(r=>r.status==='Verified').length}/${reqs.length} verified requirement(s)`],signals:{requirements:reqs.length,verifiedRequirements:reqs.filter(r=>r.status==='Verified').length,failedResults:fails.length,developmentActivities:devs.length,durationOverruns:overruns.length},methodKeys:uniq(acts.map(a=>a.standardTestId||a.basisTestId)),standardTestIds:uniq(acts.map(a=>a.standardTestId||a.basisTestId)),createdBy:'LabOS automatic learning',autoCaptured:true};
    store.push(lesson);addAcceptedMirror(state,lesson);P.audit?.(state,'Automatic lessons captured','Validation Programme',p.id,'Execution evidence','Product learning record',`${lesson.summary} ${rec[0]}`);return lesson;
  }
  P.ensureLessonsV163=state=>{
    rows(state,'autoLessonsV163');rows(state,'lessonAcknowledgementsV163');
    const added=[];for(const r of state.requests||[])if(closedPrototype(r)){const x=capturePrototype(state,r);if(x)added.push(x)}for(const p of state.validationProgrammes||[])if(closedValidation(p)){const x=captureValidation(state,p);if(x)added.push(x)}return {added,total:state.autoLessonsV163.length};
  };
  P.similarLessonsV163=(state,{domain=null,productId=null,sourceId=null,methodKeys=[],limit=8}={})=>{
    P.ensureLessonsV163(state);const methods=uniq(methodKeys);return (state.autoLessonsV163||[]).filter(l=>l.sourceId!==sourceId).map(l=>{let score=0,reasons=[];if(productId&&l.productId===productId){score+=.72;reasons.push('same product')}if(domain&&l.domain===domain){score+=.08;reasons.push(`same ${domain.toLowerCase()} work type`)}const mo=overlap(methods,l.methodKeys||[]);if(mo){score+=Math.min(.18,mo*.22);reasons.push('overlapping methods/processes')}return {...l,similarity:Math.round(Math.min(.99,score)*100),matchReasons:reasons}}).filter(x=>x.similarity>=50).sort((a,b)=>b.similarity-a.similarity||String(b.capturedAt).localeCompare(String(a.capturedAt))).slice(0,limit);
  };
  P.acknowledgeLessonV163=(state,sourceType,sourceId,lessonId,decision='Reviewed',note='')=>{const a=rows(state,'lessonAcknowledgementsV163'),who=state.identity?.name||'User',existing=a.find(x=>x.sourceType===sourceType&&x.sourceId===sourceId&&x.lessonId===lessonId);const row=existing||{id:P.uid('LACK'),sourceType,sourceId,lessonId,createdAt:P.now()};Object.assign(row,{decision,note,reviewedAt:P.now(),reviewedBy:who});if(!existing)a.push(row);P.audit?.(state,'Prior lesson reviewed',sourceType,sourceId,'Suggested',decision,`${lessonId}${note?` · ${note}`:''}`);return row};
  P.productLessonReportV163=(state,productId)=>{
    P.ensureLessonsV163(state);const product=byId(state.products,productId),auto=(state.autoLessonsV163||[]).filter(x=>x.productId===productId).sort((a,b)=>String(b.capturedAt).localeCompare(String(a.capturedAt))),proto=auto.filter(x=>x.domain==='Prototype'),val=auto.filter(x=>x.domain==='Validation'),recs={},signals={qualityExceptions:0,failedMeasurements:0,replans:0,failedResults:0,developmentActivities:0,durationOverruns:0};for(const l of auto){for(const r of l.recommendations||[])recs[r]=(recs[r]||0)+1;for(const k of Object.keys(signals))signals[k]+=Number(l.signals?.[k]||0)}return {productId,product:product?.family||product?.name||product?.partNumber||productId,revision:product?.revision||'',lessons:auto,prototype:proto,validation:val,signals,topRecommendations:Object.entries(recs).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([text,count])=>({text,count})),generatedAt:P.now()};
  };
  P.validationPlanningSummaryV163=state=>{const active=(state.validationProgrammes||[]).filter(p=>!p.archived&&!['CLOSED','COMPLETE','ARCHIVED'].includes(String(p.status||'').toUpperCase())),planned=active.filter(p=>(state.bookings||[]).some(b=>b.requestId===p.id&&!P.isHistoricalPlanningBooking?.(b))),unplanned=active.filter(p=>(state.validationActivities||[]).some(a=>a.programmeId===p.id)&&!(state.bookings||[]).some(b=>b.requestId===p.id&&!P.isHistoricalPlanningBooking?.(b))),late=planned.filter(p=>p.requiredDate&&p.forecastDate&&String(p.forecastDate)>String(p.requiredDate));return {active,planned,unplanned,late,bookings:(state.bookings||[]).filter(b=>active.some(p=>p.id===b.requestId)&&!P.isHistoricalPlanningBooking?.(b))}};
  P.planValidationPortfolioV163=(state,{commit=false}={})=>{
    const target=commit?state:P.deepClone(state);P.ensureProgrammeModelV161?.(target,{seedDemo:false});const rank={Critical:0,High:1,Normal:2,Low:3},programmes=(target.validationProgrammes||[]).filter(p=>!p.archived&&!['CLOSED','COMPLETE','ARCHIVED'].includes(String(p.status||'').toUpperCase())&&(target.validationActivities||[]).some(a=>a.programmeId===p.id)).sort((a,b)=>(rank[a.priority]??2)-(rank[b.priority]??2)||String(a.requiredDate||'9999').localeCompare(String(b.requiredDate||'9999'))||String(a.id).localeCompare(String(b.id))),out=[];
    for(const p of programmes){try{const r=P.planValidationV161(target,p.id,{notBefore:p.dutAvailableDate||p.planningNotBefore||null,commit:true});out.push({id:p.id,title:p.title,product:p.productFamily||productLabel(target,p.productId),ok:true,forecastDate:r.forecastDate||p.forecastDate||null,requiredDate:p.requiredDate,bookings:r.bookings?.length||0,siteId:p.executionSiteId})}catch(e){out.push({id:p.id,title:p.title,product:p.productFamily||productLabel(target,p.productId),ok:false,requiredDate:p.requiredDate,error:e.message,code:e.code||'PLANNING_BLOCKED'})}}
    return {state:target,rows:out,ok:out.every(x=>x.ok),planned:out.filter(x=>x.ok).length,blocked:out.filter(x=>!x.ok).length};
  };
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.164 — Validation flow-first builder, adaptive
   method-development learning, and preventive lessons learned.
   ============================================================ */
(function installV164(P){
  'use strict';
  if(!P || P.ensureValidationFlowV164) return;
  const arr=(s,k)=>s[k]=Array.isArray(s[k])?s[k]:[];
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const now=()=>P.now?P.now():new Date().toISOString();
  const uid=p=>P.uid?P.uid(p):`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const clone=v=>P.deepClone?P.deepClone(v):JSON.parse(JSON.stringify(v));
  const norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const tokens=v=>new Set(norm(v).split(/\s+/).filter(x=>x.length>2&&!['the','and','for','with','from','test','method','shall','must','validation','verify','verification'].includes(x)));
  const similarity=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let hit=0;for(const x of A)if(B.has(x))hit++;return hit/Math.max(A.size,B.size)};
  const median=xs=>{const a=xs.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
  const standardText=t=>[t?.id,t?.name,t?.category,t?.output,t?.acceptanceCriteria,...(t?.aliases||[])].filter(Boolean).join(' ');
  const productLabel=(state,pid)=>{const p=byId(state.products,pid);return p?.family||p?.name||p?.partNumber||pid||'Product'};

  function activity(state,id){return byId(state.validationActivities,id)}
  function programme(state,pid){return byId(state.validationProgrammes,pid)}
  function leg(state,id){return byId(state.validationLegs,id)}
  function newLeg(state,p,index){const id=`${p.id}-LEG-${String(index+1).padStart(2,'0')}-${Math.random().toString(36).slice(2,6)}`;const l={id,programmeId:p.id,name:`Test Leg ${index+1}`,order:index+1,status:'Planned',flowV164:true};arr(state,'validationLegs').push(l);return l}

  function walkNodes(nodes,fn,ctx={}){for(let i=0;i<(nodes||[]).length;i++){const n=nodes[i];fn(n,{...ctx,index:i,nodes});if(n?.kind==='split')for(const b of n.branches||[])walkNodes(b.nodes||[],fn,{...ctx,branch:b,split:n})}}
  function seqById(flow,seqId){for(const l of flow.legs||[]){if(l.sequenceId===seqId)return l.nodes;let out=null;walkNodes(l.nodes,n=>{if(n.kind==='split')for(const b of n.branches||[])if(b.sequenceId===seqId)out=b.nodes});if(out)return out}return null}
  function locateActivity(flow,activityId){let found=null;for(const l of flow.legs||[]){walkNodes(l.nodes,(n,ctx)=>{if(!found&&n.kind==='activity'&&n.activityId===activityId)found={leg:l,node:n,sequence:ctx.nodes,index:ctx.index,branch:ctx.branch||null,split:ctx.split||null}})}return found}
  function locateSplit(flow,splitId){let found=null;for(const l of flow.legs||[]){walkNodes(l.nodes,(n,ctx)=>{if(!found&&n.kind==='split'&&n.id===splitId)found={leg:l,node:n,sequence:ctx.nodes,index:ctx.index,branch:ctx.branch||null}})}return found}

  P.ensureValidationFlowV164=(state,pid)=>{
    const p=programme(state,pid);if(!p)return null;
    let flow=p.validationFlowV164;
    if(!flow||!Array.isArray(flow.legs)){
      let legs=P.validationLegsV161?.(state,pid)||[];
      if(!legs.length)legs=[newLeg(state,p,0)];
      const acts=P.validationActivitiesV161?.(state,pid)||[];
      flow={version:'1.0.164',createdAt:now(),updatedAt:now(),legs:legs.map((l,i)=>({id:l.id,sequenceId:`SEQ-${l.id}`,name:l.name||`Test Leg ${i+1}`,nodes:acts.filter(a=>a.legId===l.id&&!a.hiddenInFlow).sort((a,b)=>Number(a.order||0)-Number(b.order||0)).map(a=>({kind:'activity',activityId:a.id}))}))};
      p.validationFlowV164=flow;
    }
    // Keep top-level leg records synchronized without destroying controlled data.
    flow.legs.forEach((fl,i)=>{let l=leg(state,fl.id);if(!l){l={id:fl.id,programmeId:pid,name:fl.name||`Test Leg ${i+1}`,order:i+1,status:'Planned',flowV164:true};arr(state,'validationLegs').push(l)}l.name=fl.name||l.name||`Test Leg ${i+1}`;l.order=i+1});
    if(!flow.legs.length){const l=newLeg(state,p,0);flow.legs.push({id:l.id,sequenceId:`SEQ-${l.id}`,name:l.name,nodes:[]})}
    return flow;
  };
  P.validationFlowSequenceV164=(state,pid,seqId)=>seqById(P.ensureValidationFlowV164(state,pid),seqId);
  P.validationFlowLocateV164=(state,pid,activityId)=>locateActivity(P.ensureValidationFlowV164(state,pid),activityId);

  P.syncValidationFlowV164=(state,pid)=>{
    const p=programme(state,pid),flow=P.ensureValidationFlowV164(state,pid);if(!p||!flow)return null;
    const used=new Set(),allActs=arr(state,'validationActivities'),actMap=new Map(allActs.filter(a=>a.programmeId===pid).map(a=>[a.id,a]));let order=0;
    const runSeq=(nodes,legId,incoming=[],path='')=>{let preds=[...incoming];for(const n of nodes||[]){if(n.kind==='activity'){const a=actMap.get(n.activityId);if(!a)continue;used.add(a.id);a.legId=legId;a.order=++order;a.flowPathV164=path;a.predecessorIds=[...new Set(preds)].filter(Boolean);a.flowModel='1.0.164';preds=[a.id]}else if(n.kind==='split'){const tails=[];for(const b of n.branches||[]){const t=runSeq(b.nodes||[],legId,preds,`${path}${b.key}`);if(t.length)tails.push(...t)}preds=[...new Set(tails.length?tails:preds)];n.tailIds=[...preds]}}return preds};
    flow.legs.forEach((l,i)=>{const native=leg(state,l.id);if(native){native.name=l.name||native.name;native.order=i+1;native.flowV164=true}runSeq(l.nodes,l.id,[],String(i+1))});
    // Do not delete historical results/evidence. Only remove orphaned, unexecuted design activities.
    state.validationActivities=allActs.filter(a=>a.programmeId!==pid||used.has(a.id)||a.status==='Complete'||a.actualHours!=null||a.hiddenInFlow===true);
    flow.updatedAt=now();p.updatedAt=now();p.status=(state.validationActivities||[]).some(a=>a.programmeId===pid)?(p.status==='Requirements'?'Programme':p.status):p.status;
    return P.validationGraphCheckV161?.(state,pid)||{ok:true,issues:[]};
  };

  P.addValidationLegV164=(state,pid,name='')=>{const p=programme(state,pid),flow=P.ensureValidationFlowV164(state,pid);if(!p||!flow)throw new Error('Validation programme not found.');const l=newLeg(state,p,flow.legs.length);l.name=name||`Test Leg ${flow.legs.length+1}`;const f={id:l.id,sequenceId:`SEQ-${l.id}`,name:l.name,nodes:[]};flow.legs.push(f);P.syncValidationFlowV164(state,pid);return f};
  P.renameValidationLegV164=(state,pid,legId,name)=>{const flow=P.ensureValidationFlowV164(state,pid),l=flow?.legs.find(x=>x.id===legId);if(!l)return null;l.name=String(name||l.name).trim()||l.name;P.syncValidationFlowV164(state,pid);return l};

  P.rankValidationTestIntentV164=(state,intent,limit=8)=>{
    const q=typeof intent==='string'?intent:[intent?.name,intent?.description,intent?.category,intent?.delta].filter(Boolean).join(' '),qNorm=norm(q),pseudo={description:q,category:intent?.category||'',sourceReference:intent?.reference||''};
    const base=P.rankValidationTestsV161?.(state,pseudo,100)||[],baseMap=new Map(base.map(x=>[x.test.id,x]));
    return (state.standardTests||[]).filter(t=>t.status==='Released').map(t=>{
      const prior=(state.validationActivities||[]).filter(a=>(a.standardTestId===t.id||a.basisTestId===t.id)&&a.status==='Complete').length,b=baseMap.get(t.id),nameNorm=norm(t.name),aliasExact=(t.aliases||[]).some(a=>norm(a)===qNorm),exact=qNorm&&((nameNorm===qNorm)||aliasExact),nameSim=similarity(q,standardText(t)),contains=qNorm&&nameNorm&&(qNorm.includes(nameNorm)||nameNorm.includes(qNorm));
      let coverage=Math.max(Number(b?.coverage||0),Math.round(nameSim*100));if(contains)coverage=Math.max(coverage,88);if(exact)coverage=99;
      const missing=[...(b?.missing||[])];return {test:t,score:Math.max(Number(b?.score||0),coverage/100),coverage:Math.max(0,Math.min(99,coverage)),missing,priorUses:Math.max(prior,b?.priorUses||0),duplicateRisk:coverage>=88?'high':coverage>=70?'medium':'low'};
    }).sort((a,b)=>b.coverage-a.coverage||b.priorUses-a.priorUses||String(a.test.name).localeCompare(String(b.test.name))).slice(0,limit);
  };

  P.syncValidationDevelopmentLearningV164=state=>{
    const hist=arr(state,'validationDevelopmentHistory');
    for(const a of state.validationActivities||[]){
      const actual=Number(a.developmentActualHours??(a.kind==='Test Development'?a.actualHours:null));if(!Number.isFinite(actual)||actual<=0)continue;
      const id=`DEVH-${a.id}`,existing=hist.find(x=>x.id===id),p=programme(state,a.programmeId),row={id,programmeId:a.programmeId,activityId:a.id,productId:p?.productId||null,basisTestId:a.basisTestId||a.standardTestId||null,intent:a.developmentIntent||a.name||'',delta:a.developmentDelta||'',category:a.developmentCategory||byId(state.standardTests,a.basisTestId||a.standardTestId)?.category||'',estimatedHours:Number(a.developmentEstimateHours??(a.kind==='Test Development'?a.estimatedHours:null))||null,actualHours:actual,completedAt:a.developmentCompletedAt||a.completedAt||p?.closedAt||now(),source:'Validation actual'};
      if(existing)Object.assign(existing,row);else hist.push(row);
    }
    return hist;
  };
  P.estimateValidationDevelopmentV164=(state,{intent='',basisTestId=null,coverage=0,delta='',category=''}={})=>{
    P.syncValidationDevelopmentLearningV164(state);const hist=arr(state,'validationDevelopmentHistory').filter(x=>Number(x.actualHours)>0),basis=byId(state.standardTests,basisTestId),text=[intent,delta,category].join(' ');
    const ranked=hist.map(h=>{let s=0;if(basisTestId&&h.basisTestId===basisTestId)s+=.6;if(category&&norm(h.category)===norm(category))s+=.15;s+=similarity(text,[h.intent,h.delta,h.category].join(' '))*.35;return {h,score:s}}).filter(x=>x.score>.05).sort((a,b)=>b.score-a.score).slice(0,8);
    const weighted=[];for(const r of ranked){const repeats=Math.max(1,Math.round(r.score*5));for(let i=0;i<repeats;i++)weighted.push(Number(r.h.actualHours))}
    const historyEstimate=median(weighted),standardHours=basis?(P.planningStandardHours?.(basis,1)||4):6,gap=Math.max(0,100-Number(coverage||0)),deltaTokens=tokens(delta||intent).size;
    let estimate=historyEstimate??Math.max(4,standardHours*(1.2+gap/35)+Math.min(20,deltaTokens*.6));if(!basis)estimate=Math.max(estimate,16);estimate=Math.max(2,Math.round(estimate*2)/2);
    const confidence=ranked.length>=5?'High':ranked.length>=2?'Medium':basis?'Medium-low':'Low';
    return {hours:estimate,days:Math.max(.5,Math.round(estimate/8*10)/10),confidence,historyCount:ranked.length,basis:ranked.length?`Learned from ${ranked.length} similar completed development record${ranked.length===1?'':'s'}${basis?` around ${basis.id}`:''}.`:`No close historical development actuals yet; estimate uses ${basis?`${basis.id} baseline + measured delta complexity`:'conservative new-method baseline'}.`,samples:ranked.map(x=>({programmeId:x.h.programmeId,actualHours:x.h.actualHours,score:Math.round(x.score*100)}))};
  };

  P.createValidationFlowTestV164=(state,pid,{sequenceId,index=null,mode='standard',standardTestId=null,name='',intent='',delta='',category='',requirementIds=[],quantity=null,coverage=null}={})=>{
    const p=programme(state,pid),flow=P.ensureValidationFlowV164(state,pid),seq=seqById(flow,sequenceId);if(!p||!seq)throw new Error('Target Validation test leg/branch was not found.');
    const test=byId(state.standardTests,standardTestId);const ranked=P.rankValidationTestIntentV164(state,intent||name||test?.name||'',5),top=ranked[0];
    if(mode==='new'&&top?.coverage>=88&&!delta)throw new Error(`${top.test.id} already matches this intent at ${top.coverage}%. Use the released standard or record the specific delta that requires a controlled variant.`);
    const useVariant=mode==='variant'||(mode==='new'&&test),basis=test||top?.test||null,cov=Number.isFinite(Number(coverage))?Number(coverage):(basis?(ranked.find(x=>x.test.id===basis.id)?.coverage||top?.coverage||65):top?.coverage||0),est=(mode==='standard')?null:P.estimateValidationDevelopmentV164(state,{intent:intent||name,basisTestId:basis?.id||null,coverage:cov,delta,category:category||basis?.category||''});
    const id=uid(`${pid}-VAL`),a={id,programmeId:pid,legId:flow.legs.find(l=>l.sequenceId===sequenceId)?.id||flow.legs[0].id,kind:'Validation Test',name:(mode==='standard'?test?.name:null)||name||intent||basis?.name||'Controlled validation test',standardTestId:mode==='standard'?test?.id:null,basisTestId:mode==='standard'?test?.id:(basis?.id||null),variantOfStandardTestId:useVariant?basis?.id||null:null,developmentRequired:mode!=='standard',developmentIntent:intent||name||'',developmentDelta:delta||'',developmentCategory:category||basis?.category||'',developmentEstimateHours:est?.hours||null,developmentEstimateDays:est?.days||null,developmentEstimateConfidence:est?.confidence||null,developmentEstimateBasis:est?.basis||null,standardMatchPct:cov||null,estimatedHours:test?Math.max(.25,P.planningStandardHours?.(test,p.quantity||1)||1):basis?Math.max(.25,P.planningStandardHours?.(basis,p.quantity||1)||1):Math.max(1,Number(p.quantity||1)*.5),quantity:quantity??p.quantity,requirementIds:[...new Set(requirementIds||[])],status:'Planned',predecessorIds:[],planningCapability:(test||basis)?.planningCapability||P.planningCapabilityForTest?.(test||basis)||P.inferPlanningCapabilityFromName?.(intent||name),equipmentCapability:(test||basis)?.equipmentCapability||P.inferPlanningCapabilityFromName?.(intent||name),competency:(test||basis)?.competency||P.inferPlanningSkillFromName?.(intent||name),acceptanceCriteria:(test||basis)?.acceptanceCriteria||'Meet controlled requirement / approved method criteria.',createdAt:now(),flowModel:'1.0.164'};
    arr(state,'validationActivities').push(a);seq.splice(index==null?seq.length:Math.max(0,Math.min(seq.length,Number(index))),0,{kind:'activity',activityId:id});P.syncValidationFlowV164(state,pid);return a;
  };

  P.splitValidationFlowV164=(state,pid,activityId,{branchCount=2,allocations=[]}={})=>{
    const flow=P.ensureValidationFlowV164(state,pid),loc=locateActivity(flow,activityId);if(!loc)throw new Error('Select a test in the flow to split after.');if(loc.sequence[loc.index+1]?.kind==='split')return loc.sequence[loc.index+1];
    const count=Math.max(2,Math.min(4,Number(branchCount)||2)),p=programme(state,pid),total=Math.max(1,Number(activity(state,activityId)?.quantity||p?.quantity||1)),base=Math.floor(total/count),rem=total-base*count;
    const split={kind:'split',id:uid(`${pid}-SPLIT`),parentActivityId:activityId,createdAt:now(),branches:Array.from({length:count},(_,i)=>({key:String.fromCharCode(97+i),sequenceId:uid(`${pid}-SEQ-BR`),dutCount:Number(allocations[i]??(base+(i<rem?1:0))),nodes:[]})),merged:true};loc.sequence.splice(loc.index+1,0,split);P.syncValidationFlowV164(state,pid);return split;
  };
  P.setValidationSplitAllocationV164=(state,pid,splitId,values=[])=>{const flow=P.ensureValidationFlowV164(state,pid),loc=locateSplit(flow,splitId);if(!loc)return null;loc.node.branches.forEach((b,i)=>b.dutCount=Math.max(0,Number(values[i]??b.dutCount)||0));P.syncValidationFlowV164(state,pid);return loc.node};
  P.deleteValidationFlowActivityV164=(state,pid,activityId)=>{const flow=P.ensureValidationFlowV164(state,pid),loc=locateActivity(flow,activityId);if(!loc)return false;const idx=loc.index,following=loc.sequence[idx+1];loc.sequence.splice(idx,1);if(following?.kind==='split'&&following.parentActivityId===activityId)loc.sequence.splice(idx,1);const a=activity(state,activityId);if(a&&a.status!=='Complete'&&a.actualHours==null)state.validationActivities=(state.validationActivities||[]).filter(x=>x.id!==activityId);P.syncValidationFlowV164(state,pid);return true};
  P.moveValidationFlowActivityV164=(state,pid,activityId,targetSequenceId,targetIndex=null)=>{const flow=P.ensureValidationFlowV164(state,pid),loc=locateActivity(flow,activityId),target=seqById(flow,targetSequenceId);if(!loc||!target)throw new Error('Move target not found.');const [node]=loc.sequence.splice(loc.index,1);target.splice(targetIndex==null?target.length:Math.max(0,Math.min(target.length,Number(targetIndex))),0,node);P.syncValidationFlowV164(state,pid);return node};
  P.addValidationFlowRequirementLinkV164=(state,pid,requirementId,activityId)=>{const r=byId(state.validationRequirements,requirementId),a=activity(state,activityId);if(!r||!a||a.programmeId!==pid)throw new Error('Requirement or flow test not found.');r.linkedActivityIds=[...new Set([...(r.linkedActivityIds||[]),activityId])];a.requirementIds=[...new Set([...(a.requirementIds||[]),requirementId])];const ranked=a.standardTestId?P.rankValidationTestsV161?.(state,r,8)||[]:[],m=ranked.find(x=>x.test.id===(a.standardTestId||a.basisTestId));r.mapping={mode:a.developmentRequired?'adapt':'reuse',testIds:a.standardTestId?[a.standardTestId]:a.basisTestId?[a.basisTestId]:[],coverage:a.standardMatchPct||m?.coverage||70,basis:`Flow-defined test · ${a.name}`,missingAspects:a.developmentDelta?[a.developmentDelta]:[],decisionAt:now(),decisionBy:state.identity?.name||'Engineer'};r.status='Planned';return r};

  // Flow-first workflow: design is the starting point. Requirements remain controlled
  // traceability and may be mapped after the physical test flow exists.
  const baseWorkflow=P.validationWorkflowStateV161;
  P.validationWorkflowStateV161=(state,p)=>{
    P.ensureValidationFlowV164(state,p.id);P.syncValidationFlowV164(state,p.id);const reqs=P.syncValidationRequirementStatusesV161?.(state,p.id)||P.validationRequirementsV161(state,p.id),acts=P.validationActivitiesV161(state,p.id),tests=acts.filter(a=>a.kind==='Validation Test'),bookings=(state.bookings||[]).filter(b=>b.requestId===p.id&&!P.isHistoricalPlanningBooking?.(b)),results=P.validationResultsV161(state,p.id),report=(state.validationReports||[]).find(x=>x.programmeId===p.id&&x.current!==false),mapped=reqs.filter(r=>!!r.mapping||(r.linkedActivityIds||[]).length).length,verified=reqs.filter(r=>r.status==='Verified').length,failed=reqs.filter(r=>r.status==='Failed').length,graph=P.validationGraphCheckV161(state,p.id);
    const states=[
      {id:'programme',title:'Test Flow',done:tests.length>0&&graph.ok,blocked:false,next:tests.length?`${P.validationLegsV161(state,p.id).length} test legs · ${tests.length} tests`:'Define the physical Validation test flow'},
      {id:'requirements',title:'Requirements / Coverage',done:reqs.length===0?false:mapped===reqs.length,blocked:!tests.length,next:reqs.length?`${mapped}/${reqs.length} mapped to the defined flow`:'Add/import requirements and map them to flow tests'},
      {id:'planning',title:'Resource Plan',done:bookings.length>0,blocked:!tests.length||reqs.length===0||mapped<reqs.length,next:bookings.length?`${bookings.length} shared-resource bookings`:reqs.length===0?'Add/import requirements and complete the coverage check':mapped<reqs.length?`${mapped}/${reqs.length} requirements mapped — complete coverage before planning`:'Plan the defined test demand'},
      {id:'execution',title:'Execution',done:tests.length>0&&results.length>=tests.length&&!failed,blocked:!bookings.length,next:`${results.length}/${tests.length} test results captured`},
      {id:'report',title:'Report & Close',done:report?.status==='Approved'||['Closed','Complete'].includes(p.status),blocked:tests.length>0&&results.length<tests.length,next:reqs.length?`${verified}/${reqs.length} verified${failed?` · ${failed} failed`:''}`:'Complete test evidence and learning review'}
    ];
    const current=states.find(x=>!x.done&&!x.blocked)||states.find(x=>!x.done)||states.at(-1);return {states,current:current?.id||'report',reqs,mapped,verified,failed,activities:acts,tests,bookings,results,report};
  };

  const baseSynthetic=P.validationSyntheticRequestV161;
  P.validationSyntheticRequestV161=(state,p)=>{const r=baseSynthetic(state,p);for(const tr of r.testRequirements||[]){const a=(state.validationActivities||[]).find(x=>x.programmeId===p.id&&x.kind==='Validation Test'&&norm(x.name)===norm(tr.name));if(!a)continue;if(a.developmentRequired){tr.standardTestId=null;tr.status='Development required';tr.developmentEstimateHours=Math.max(1,Number(a.developmentEstimateHours)||8);tr.executionEstimateHours=Math.max(.25,Number(a.estimatedHours)||tr.executionEstimateHours||1);tr.equipmentCapability=a.equipmentCapability||a.planningCapability||tr.equipmentCapability;tr.competency=a.competency||tr.competency}}return r};

  // Preventive lesson intelligence. Existing V163 rows are upgraded in place, not lost.
  function severityFromSignals(l){const s=l.signals||{};if((s.failedResults||0)+(s.failedMeasurements||0)+(s.qualityExceptions||0)>0)return'High';if((s.replans||0)+(s.durationOverruns||0)>0)return'Medium';return'Low'}
  function preventionFromLesson(l){const text=[...(l.recommendations||[])].join(' '),problem=l.problemStatement||l.summary||l.title||'Historical issue';let control='Review the previous evidence before releasing the new plan.';if(/calibrat|equipment|fixture/i.test(text+problem))control='Verify equipment capability, calibration validity and fixture readiness before committing the test slot.';else if(/development|method|duration|overrun/i.test(text+problem))control='Run the standard-test similarity check, freeze the controlled method delta, and reserve the learned development duration before planning execution.';else if(/fail|disposition|quality|scrap/i.test(text+problem))control='Review the prior failure mechanism and disposition, then add the proven prevention/detection check to pre-start readiness.';else if(/replan|commit|material|prototype|timing/i.test(text+problem))control='Validate upstream material/DUT availability and protected dependencies before accepting the commitment.';return control}
  P.ensurePreventiveLessonsV164=state=>{
    P.ensureLessonsV163?.(state);P.syncValidationDevelopmentLearningV164(state);const rows=arr(state,'autoLessonsV163');for(const l of rows){l.lessonModel='1.0.164';l.problemStatement=l.problemStatement||l.summary||l.title;l.failureMode=l.failureMode||((l.signals?.failedResults||l.signals?.failedMeasurements)?'Test / product verification failure':(l.signals?.durationOverruns?'Duration / planning miss':(l.signals?.qualityExceptions?'Build quality exception':'Proven baseline / no recurrence')));l.rootCause=l.rootCause||((l.recommendations||[]).find(x=>/cause|mechanism/i.test(x))||'Root cause not explicitly recorded — verify source evidence before reuse.');l.preventionControl=l.preventionControl||preventionFromLesson(l);l.detectionControl=l.detectionControl||'Confirm the prevention control is present in readiness evidence before execution starts.';l.triggerConditions=l.triggerConditions||[l.productId?`Same product: ${productLabel(state,l.productId)}`:null,...(l.methodKeys||[]).slice(0,4).map(x=>`Same/related method: ${x}`)].filter(Boolean);l.riskPriority=l.riskPriority||severityFromSignals(l);l.confidence=l.confidence||((l.evidence||[]).length>=3?'High':(l.evidence||[]).length?'Medium':'Low');l.effectivenessStatus=l.effectivenessStatus||'Unverified on next similar programme';l.preStartCheck=l.preStartCheck||`Before release: ${l.preventionControl}`;l.preventRecurrence=true}
    // Consolidate recurring patterns to stop duplicate noise.
    const patterns=arr(state,'lessonPatternsV164');const groups=new Map();for(const l of rows.filter(x=>x.riskPriority!=='Low')){const key=`${l.productId||'ANY'}|${norm(l.failureMode)}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l)}for(const [key,ls] of groups){const id=`LPAT-${btoa(unescape(encodeURIComponent(key))).replace(/[^A-Za-z0-9]/g,'').slice(0,18)}`,existing=patterns.find(x=>x.id===id),row={id,key,productId:ls[0].productId||null,failureMode:ls[0].failureMode,recurrenceCount:ls.length,sourceIds:ls.map(x=>x.sourceId),lastSeen:ls.map(x=>x.capturedAt).sort().at(-1),riskPriority:ls.some(x=>x.riskPriority==='High')?'High':'Medium',preventionControl:ls[0].preventionControl,effectivenessStatus:ls.every(x=>x.effectivenessStatus==='Effective')?'Effective':'Needs verification'};if(existing)Object.assign(existing,row);else patterns.push(row)}return {lessons:rows,patterns};
  };
  P.similarPreventiveLessonsV164=(state,{domain=null,productId=null,sourceId=null,methodKeys=[],limit=8}={})=>{P.ensurePreventiveLessonsV164(state);const methods=new Set(methodKeys||[]);return (state.autoLessonsV163||[]).filter(l=>l.sourceId!==sourceId&&l.preventRecurrence).map(l=>{let score=0,reasons=[];if(productId&&l.productId===productId){score+=.62;reasons.push('same product')}if(domain&&l.domain===domain){score+=.06;reasons.push(`same ${String(domain).toLowerCase()} work type`)}let hit=0;for(const m of l.methodKeys||[])if(methods.has(m))hit++;if(hit){score+=Math.min(.22,hit*.12);reasons.push(`${hit} shared test/process method${hit===1?'':'s'}`)}if(l.riskPriority==='High')score+=.08;if(l.riskPriority==='Medium')score+=.04;const recurrence=(state.lessonPatternsV164||[]).find(p=>p.sourceIds?.includes(l.sourceId))?.recurrenceCount||1;if(recurrence>1){score+=Math.min(.08,(recurrence-1)*.03);reasons.push(`${recurrence}× recurrence pattern`)}return {...l,similarity:Math.round(Math.min(.99,score)*100),matchReasons:reasons,recurrenceCount:recurrence}}).filter(x=>x.similarity>=45).sort((a,b)=>(b.riskPriority==='High'?1:0)-(a.riskPriority==='High'?1:0)||b.similarity-a.similarity||String(b.capturedAt).localeCompare(String(a.capturedAt))).slice(0,limit)};
  P.productPreventiveLessonReportV164=(state,productId)=>{P.ensurePreventiveLessonsV164(state);const lessons=(state.autoLessonsV163||[]).filter(x=>x.productId===productId),patterns=(state.lessonPatternsV164||[]).filter(x=>x.productId===productId),effective=lessons.filter(x=>x.effectivenessStatus==='Effective').length,high=lessons.filter(x=>x.riskPriority==='High').length;return {productId,product:productLabel(state,productId),generatedAt:now(),lessons,patterns,highRisk:high,effective,unverified:lessons.length-effective,topPrevention:[...new Map(lessons.map(l=>[l.preventionControl,l])).values()].slice(0,12)}};
})(window.ProtoLab);

/* REV 1.0.164 — evidence enrichment for preventive learning. */
(function(P){
  if(!P?.ensurePreventiveLessonsV164 || P.__preventiveEnrichmentV164)return;P.__preventiveEnrichmentV164=true;
  const base=P.ensurePreventiveLessonsV164;
  const txt=v=>String(v??'').trim();
  P.ensurePreventiveLessonsV164=state=>{
    const out=base(state);for(const l of state.autoLessonsV163||[]){
      if(l.domain==='Prototype'){
        const devs=(state.deviations||[]).filter(d=>d.requestId===l.sourceId),root=devs.map(d=>txt(d.rootCause||d.cause||d.causeText)).find(Boolean),prevent=devs.map(d=>txt(d.preventiveAction||d.correctiveAction||d.action||d.disposition)).find(Boolean);
        if(root)l.rootCause=root;if(prevent)l.preventionControl=prevent;
        const issue=devs.map(d=>txt(d.title||d.type||d.measurement)).find(Boolean);if(issue&&l.riskPriority!=='Low')l.problemStatement=`${issue}. ${l.summary}`;
      }else if(l.domain==='Validation'){
        const results=(state.validationResults||[]).filter(r=>r.programmeId===l.sourceId),fails=results.filter(r=>String(r.outcome).toLowerCase()==='fail'),root=fails.map(r=>txt(r.rootCause||r.cause||r.failureMechanism)).find(Boolean),prevent=fails.map(r=>txt(r.preventiveAction||r.correctiveAction||r.dispositionAction)).find(Boolean),problem=fails.map(r=>txt(r.comment||r.failureDescription||r.value)).find(Boolean);
        if(root)l.rootCause=root;if(prevent)l.preventionControl=prevent;if(problem)l.problemStatement=`${problem}. ${l.summary}`;
      }
      const materialRisk=l.riskPriority!=='Low'||(l.signals?.failedResults||0)>0||(l.signals?.failedMeasurements||0)>0||(l.signals?.qualityExceptions||0)>0||(l.signals?.durationOverruns||0)>0||(l.signals?.replans||0)>0;
      l.preventRecurrence=!!materialRisk;
      if(!materialRisk){l.failureMode='Successful baseline / no recurrence signal';l.rootCause='No adverse recurrence signal detected in the captured closeout evidence.';l.preventionControl='Reuse the proven route/test assumptions as the baseline; require a controlled delta review before changing them.';l.detectionControl='At the next similar start, confirm that product, method and resource assumptions are still equivalent to this baseline.';l.effectivenessStatus='Reference baseline';l.preStartCheck='Reuse the proven baseline unless the new programme introduces a controlled delta.'}
      else l.preStartCheck=`Before release: ${l.preventionControl}`;
    }
    return out;
  };
})(window.ProtoLab);

/* ============================================================
   LabOS REV 1.0.168 — shared smart test-development estimates,
   Validation sample/serial genealogy, and flow-first workflow.
   ============================================================ */
(function installV165(P){
  'use strict';
  if(!P || P.__labosV165Installed)return;P.__labosV165Installed=true;
  const norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const now=()=>P.now?P.now():new Date().toISOString();

  /* Keep explicitly controlled Prototype test-development rows as development
     even when their description is deliberately based on a released Standard Test. */
  const baseEnsureTestsV165=P.ensureTestRequirements;
  P.ensureTestRequirements=(state,r)=>{
    const forced=new Map((r?.testRequirements||[]).filter(x=>x.forceDevelopmentV165).map(x=>[norm(x.name),{...x}]));
    const out=baseEnsureTestsV165(state,r);
    for(const tr of out||[]){const old=forced.get(norm(tr.name));if(!old)continue;Object.assign(tr,old,{id:tr.id,name:tr.name,definitionKey:`CUSTOM:${norm(tr.name)}`,standardTestId:null,status:tr.developmentReleased===true?'Released developed method':'Development required',forceDevelopmentV165:true});}
    return out;
  };

  /* One estimator used by Prototype and Validation. It combines measured
     Prototype method-development history with measured Validation development
     history, while retaining the conservative delta-based fallback. */
  const baseValidationEstimateV165=P.estimateValidationDevelopmentV164;
  P.estimateTestDevelopmentV165=(state,{intent='',basisTestId=null,coverage=0,delta='',category='',developmentType='Adaptation',fallbackHours=null}={})=>{
    P.ensureDevelopmentLearningV129?.(state);P.syncValidationDevelopmentLearningV164?.(state);
    const basis=byId(state.standardTests,basisTestId),v=baseValidationEstimateV165?.(state,{intent,basisTestId,coverage,delta,category})||{hours:Number(fallbackHours)||8,days:1,confidence:'Low',historyCount:0,basis:'Controlled baseline.',samples:[]};
    const p=P.developmentRecommendationV129?.(state,{kind:'test',methodId:basisTestId||null,standardTestId:basisTestId||null,name:basis?.name||intent,familyId:basis?.familyId||null,developmentType,fallbackHours:Number(fallbackHours)||v.hours||8})||{hours:v.hours,samples:0,confidence:'Baseline',basis:'No Prototype history'};
    const pn=Math.max(0,Number(p.samples||0)),vn=Math.max(0,Number(v.historyCount||0));
    let hours=Number(v.hours||p.hours||fallbackHours||8),source='Validation similarity / controlled baseline';
    if(pn&&vn){const pw=Math.min(5,pn),vw=Math.min(5,vn);hours=(Number(p.hours)*pw+Number(v.hours)*vw)/(pw+vw);source=`Cross-domain learning · ${pn} Prototype + ${vn} Validation measured episode${pn+vn===1?'':'s'}`}
    else if(pn){hours=Number(p.hours);source=`Prototype learning · ${pn} measured episode${pn===1?'':'s'}`}
    else if(vn){hours=Number(v.hours);source=`Validation learning · ${vn} similar measured episode${vn===1?'':'s'}`}
    hours=Math.max(2,Math.round(hours*2)/2);const n=pn+vn,confidence=n>=6?'High':n>=3?'Medium':n>=1?'Low':v.confidence||'Low';
    return {hours,days:Math.max(.5,Math.round(hours/8*10)/10),confidence,prototypeSamples:pn,validationSamples:vn,historyCount:n,basis:`${source}. ${pn?p.basis:''}${pn&&vn?' ':''}${vn?v.basis:''}`.trim(),samples:[...(p.history||[]).map(x=>({domain:'Prototype',requestId:x.requestId,actualHours:x.actualHours,completedAt:x.completedAt})),...(v.samples||[]).map(x=>({domain:'Validation',programmeId:x.programmeId,actualHours:x.actualHours,score:x.score}))]};
  };
  P.estimateValidationDevelopmentV164=(state,args={})=>P.estimateTestDevelopmentV165(state,args);

  P.validationSamplePoolV165=(state,pid)=>{
    const p=byId(state.validationProgrammes,pid);if(!p)return {source:'none',sourceId:null,rows:[]};
    if(p.linkedPrototypeId){
      const rows=(state.serials||[]).filter(s=>s.requestId===p.linkedPrototypeId&&s.status!=='Cancelled').slice().sort((a,b)=>String(a.sampleNumber||a.serial||a.id).localeCompare(String(b.sampleNumber||b.serial||b.id),undefined,{numeric:true})).map((s,i)=>({refId:s.id||s.sampleId||s.serial,sampleId:s.sampleId||s.serial||s.id,sampleNumber:s.sampleNumber||String(i+1).padStart(2,'0'),serialNumber:s.serialNumber||'',status:s.status||'Active',source:'prototype',sourceRequestId:p.linkedPrototypeId}));
      p.validationSampleSourceV165={type:'prototype',sourceId:p.linkedPrototypeId,count:rows.length,updatedAt:now()};return {source:'prototype',sourceId:p.linkedPrototypeId,rows};
    }
    p.validationSamplesV165=Array.isArray(p.validationSamplesV165)?p.validationSamplesV165:[];const qty=Math.max(1,Number(p.quantity||1));
    for(let i=0;i<qty;i++)if(!p.validationSamplesV165[i])p.validationSamplesV165[i]={refId:`${p.id}-DUT-${String(i+1).padStart(3,'0')}`,sampleId:`${p.id}-DUT-${String(i+1).padStart(3,'0')}`,sampleNumber:String(i+1).padStart(2,'0'),serialNumber:'',status:'Planned',source:'validation'};
    const rows=p.validationSamplesV165.slice(0,qty);p.validationSampleSourceV165={type:'validation',sourceId:p.id,count:rows.length,updatedAt:now()};return {source:'validation',sourceId:p.id,rows};
  };
  P.setValidationProgrammeSampleSerialV165=(state,pid,refId,serialNumber)=>{const p=byId(state.validationProgrammes,pid);if(!p||p.linkedPrototypeId)return false;P.validationSamplePoolV165(state,pid);const s=(p.validationSamplesV165||[]).find(x=>x.refId===refId);if(!s)return false;s.serialNumber=String(serialNumber||'').trim();s.updatedAt=now();return true};
  P.setValidationLegSamplesV165=(state,pid,legId,refs=[])=>{const p=byId(state.validationProgrammes,pid),flow=P.ensureValidationFlowV164?.(state,pid);if(!p||!flow)return null;const pool=P.validationSamplePoolV165(state,pid),valid=new Set(pool.rows.map(x=>x.refId)),l=flow.legs.find(x=>x.id===legId);if(!l)return null;l.sampleRefsV165=[...new Set((refs||[]).filter(x=>valid.has(x)))];l.sampleSourceV165=pool.source;l.sampleSourceIdV165=pool.sourceId;l.sampleUpdatedAtV165=now();P.syncValidationFlowV164?.(state,pid);return l};
  P.validationLegSamplesV165=(state,pid,legId)=>{const flow=P.ensureValidationFlowV164?.(state,pid),pool=P.validationSamplePoolV165(state,pid),l=flow?.legs?.find(x=>x.id===legId),refs=new Set(l?.sampleRefsV165||[]);return {leg:l,pool,rows:pool.rows.filter(x=>refs.has(x.refId))}};

  const baseSyncFlowV165=P.syncValidationFlowV164;
  P.syncValidationFlowV164=(state,pid)=>{const out=baseSyncFlowV165(state,pid),flow=P.ensureValidationFlowV164?.(state,pid),pool=P.validationSamplePoolV165(state,pid),valid=new Set(pool.rows.map(x=>x.refId));if(flow){for(const l of flow.legs||[]){l.sampleRefsV165=[...new Set((l.sampleRefsV165||[]).filter(x=>valid.has(x)))];for(const a of state.validationActivities||[])if(a.programmeId===pid&&a.legId===l.id){a.sampleRefsV165=[...l.sampleRefsV165];a.sampleSourceV165=pool.source;a.sampleSourceIdV165=pool.sourceId}}}return out};

  /* Requirements/Coverage is no longer a workflow gate. Legacy requirement data
     remains readable in reports/audit but the active Validation workflow is
     Test Flow -> Resource Plan -> Execution -> Report & Close. */
  P.validationWorkflowStateV161=(state,p)=>{
    P.ensureValidationFlowV164?.(state,p.id);P.syncValidationFlowV164?.(state,p.id);const reqs=P.validationRequirementsV161?.(state,p.id)||[],acts=P.validationActivitiesV161?.(state,p.id)||[],tests=acts.filter(a=>a.kind==='Validation Test'),bookings=(state.bookings||[]).filter(b=>b.requestId===p.id&&!P.isHistoricalPlanningBooking?.(b)),results=P.validationResultsV161?.(state,p.id)||[],report=(state.validationReports||[]).find(x=>x.programmeId===p.id&&x.current!==false),failed=results.filter(r=>String(r.outcome||'').toLowerCase()==='fail').length,verified=reqs.filter(r=>r.status==='Verified').length,mapped=reqs.filter(r=>!!r.mapping||(r.linkedActivityIds||[]).length).length,graph=P.validationGraphCheckV161?.(state,p.id)||{ok:true};
    const states=[
      {id:'programme',title:'Test Flow',done:tests.length>0&&graph.ok,blocked:false,next:tests.length?`${P.validationLegsV161?.(state,p.id)?.length||0} test legs · ${tests.length} tests`:'Define the Validation test flow'},
      {id:'planning',title:'Resource Plan',done:bookings.length>0,blocked:!tests.length,next:bookings.length?`${bookings.length} shared-resource bookings`:'Plan the defined test demand'},
      {id:'execution',title:'Execution',done:tests.length>0&&results.length>=tests.length&&!failed,blocked:!bookings.length,next:`${results.length}/${tests.length} test results captured`},
      {id:'report',title:'Report & Close',done:report?.status==='Approved'||['Closed','Complete'].includes(p.status),blocked:tests.length>0&&results.length<tests.length,next:failed?`${failed} failed result${failed===1?'':'s'} require disposition`:'Complete test evidence and learning review'}
    ];
    const current=states.find(x=>!x.done&&!x.blocked)||states.find(x=>!x.done)||states.at(-1);return {states,current:current?.id||'report',reqs,mapped,verified,failed,activities:acts,tests,bookings,results,report};
  };
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.171 — controlled technical-record traceability
   and report assurance for Prototype + Validation.
   ============================================================ */
(function installV169(P){
  'use strict';
  if(!P || P.__labosV169Installed)return;P.__labosV169Installed=true;
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const arr=(state,key)=>{state[key]=Array.isArray(state[key])?state[key]:[];return state[key]};
  const baseReport=P.validationReportV161;
  const evidenceHash=(state,pid)=>{
    const p=byId(state.validationProgrammes,pid),acts=P.validationActivitiesV161?.(state,pid)||[],res=P.validationResultsV161?.(state,pid)||[],pool=P.validationSamplePoolV165?.(state,pid)||{rows:[]};
    const raw=JSON.stringify({programme:{id:p?.id,productId:p?.productId,revision:p?.productRevision,site:p?.executionSiteId},samples:pool.rows.map(x=>[x.refId,x.serialNumber,x.status]),tests:acts.filter(x=>x.kind==='Validation Test').map(x=>[x.id,x.standardTestId,x.acceptanceCriteria,x.sampleRefsV165,x.equipmentId,x.staffId,x.status]),results:res.map(x=>[x.id,x.activityId,x.outcome,x.value,x.sampleResults,x.actualHours,x.at])});
    let h=2166136261;for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0');
  };
  P.validationEvidenceFingerprintV169=evidenceHash;
  P.ensureValidationSampleLinkedResultsV169=(state,pid)=>{
    const p=byId(state.validationProgrammes,pid);if(!p)return 0;const pool=P.validationSamplePoolV165?.(state,pid)||{rows:[]},acts=P.validationActivitiesV161?.(state,pid)||[],res=P.validationResultsV161?.(state,pid)||[];let changed=0;
    for(const r of res){if(Array.isArray(r.sampleResults)&&r.sampleResults.length)continue;const a=acts.find(x=>x.id===r.activityId);if(!a)continue;const refs=(a.sampleRefsV165||[]).length?a.sampleRefsV165:pool.rows.map(x=>x.refId),rows=pool.rows.filter(x=>refs.includes(x.refId));if(!rows.length)continue;r.sampleRefs=rows.map(x=>x.refId);r.sampleResults=rows.map(x=>({sampleRef:x.refId,sampleId:x.sampleId||x.refId,sampleNumber:x.sampleNumber||'',serialNumber:x.serialNumber||'',outcome:r.outcome||'Pass',value:r.value||'',evidenceReference:'',evidenceIds:[...(r.evidenceIds||[])],derivedFromLegacyAggregateV169:true}));r.legacySampleLinkV169=true;changed++;}
    return changed;
  };
  P.validationReportApprovalV169=(state,pid)=>{
    const p=byId(state.validationProgrammes,pid);if(!p)return null;
    p.validationReportApprovalV169=p.validationReportApprovalV169||{status:'Draft',role:'Quality Engineer',person:(state.users||[]).find(u=>u.role==='quality')?.name||'Quality Engineer',revision:p.reportRevision||'A',requestedAt:null,approvedAt:null,approvedBy:null,evidenceFingerprint:null,comment:''};
    const a=p.validationReportApprovalV169,current=evidenceHash(state,pid);
    if(a.status==='Approved'&&a.evidenceFingerprint&&a.evidenceFingerprint!==current){a.status='Draft';a.comment='Controlled evidence changed after approval; re-approval required.';a.requestedAt=null;a.approvedAt=null;a.approvedBy=null;a.evidenceFingerprint=null;}
    return a;
  };
  P.validationTechnicalRecordReadinessV169=(state,pid)=>{
    P.ensureValidationSampleLinkedResultsV169(state,pid);
    const p=byId(state.validationProgrammes,pid),prod=byId(state.products,p?.productId),pool=P.validationSamplePoolV165?.(state,pid)||{rows:[]},acts=P.validationActivitiesV161?.(state,pid)||[],tests=acts.filter(a=>a.kind==='Validation Test'),res=P.validationResultsV161?.(state,pid)||[];
    const resultFor=id=>res.find(r=>r.activityId===id),checks=[];
    const add=(id,label,ok,detail,critical=true)=>checks.push({id,label,ok:!!ok,detail,critical});
    add('product','Product / part identification',!!(prod?.partNumber&&p?.productId),prod?.partNumber?`${prod.partNumber} · Rev ${p.productRevision||prod.revision||'—'}`:'Part number not defined');
    add('samples','Controlled DUT/sample identities',pool.rows.length>0&&pool.rows.every(x=>x.refId),`${pool.rows.length} DUT/sample identity record${pool.rows.length===1?'':'s'}`);
    add('serials','Formal serial traceability',pool.rows.length>0&&pool.rows.every(x=>String(x.serialNumber||'').trim()),pool.rows.every(x=>String(x.serialNumber||'').trim())?'All DUTs have formal serial numbers':'One or more DUTs lack a formal serial number');
    add('criteria','Acceptance criteria',tests.length>0&&tests.every(x=>String(x.acceptanceCriteria||'').trim()),`${tests.filter(x=>String(x.acceptanceCriteria||'').trim()).length}/${tests.length} tests have controlled criteria`);
    add('methods','Controlled test method identity',tests.length>0&&tests.every(x=>x.standardTestId||x.developmentType||x.basisTestId||x.methodRevision),`${tests.length} test method record${tests.length===1?'':'s'}`);
    add('results','Sample-linked results',tests.length>0&&tests.every(t=>{const r=resultFor(t.id);return r&&Array.isArray(r.sampleResults)&&r.sampleResults.length&&r.sampleResults.every(s=>s.sampleRef)}),`${tests.filter(t=>{const r=resultFor(t.id);return r&&Array.isArray(r.sampleResults)&&r.sampleResults.length}).length}/${tests.length} tests have DUT-linked result rows`);
    add('operator','Execution identity / timestamp',res.length>0&&res.every(r=>r.actor&&r.at),`${res.filter(r=>r.actor&&r.at).length}/${res.length} results identify actor and time`);
    add('lab','Execution laboratory identity',!!(p?.executionSiteId||p?.homeSiteId),p?.executionSiteId||p?.homeSiteId||'Execution laboratory not identified');
    const bookings=(state.bookings||[]).filter(b=>b.requestId===pid),equipmentFor=t=>t.equipmentId||bookings.find(b=>b.stepId===t.id||String(b.stepName||'').includes(t.name))?.equipmentId||null,staffFor=t=>t.staffId||bookings.find(b=>b.stepId===t.id||String(b.stepName||'').includes(t.name))?.staffId||null;
    const internal=tests.filter(t=>String(t.executionMode||'Internal').toLowerCase()!=='external'),equipped=internal.filter(t=>equipmentFor(t)).length,calReady=internal.filter(t=>{const id=equipmentFor(t),e=byId(state.equipment,id);return id&&e&&P.equipmentReady?.(e,P.todayISO(),state)!==false}).length;
    add('equipment','Test equipment / resource trace',internal.length===0||equipped===internal.length,`${equipped}/${internal.length} internal tests identify controlled equipment`,false);
    add('calibration','Measurement equipment readiness / calibration',internal.length===0||calReady===internal.length,`${calReady}/${internal.length} internal tests have equipment currently assessed ready`,false);
    const qualified=internal.filter(t=>{const sid=staffFor(t),person=byId(state.staff,sid),std=byId(state.standardTests,t.standardTestId||t.basisTestId),need=std?.competency||t.competency;return sid&&person&&(!need||(person.competencies||[]).includes(need))}).length;
    add('competence','Personnel competence linkage',internal.length===0||qualified===internal.length,`${qualified}/${internal.length} internal tests link planned staff to the controlled competency`,false);
    const external=tests.filter(t=>String(t.executionMode||'').toLowerCase()==='external'),externalEvidence=external.filter(t=>{const std=byId(state.standardTests,t.standardTestId||t.basisTestId);return std?.externalSourcing?.reference||t.externalLabQualificationEvidence||t.externalAccreditationReference}).length;
    add('external-lab','External laboratory qualification evidence',external.length===0||externalEvidence===external.length,external.length?`${externalEvidence}/${external.length} external tests retain supplier/accreditation acceptance evidence`:'No external Validation tests',false);
    const failed=res.filter(r=>String(r.outcome).toLowerCase()==='fail');
    add('nonconformance','Failed-result disposition evidence',!failed.length||failed.every(r=>String(r.comment||'').trim()&&((r.evidenceIds||[]).length||String(r.value||'').trim())),failed.length?`${failed.length} failed test result${failed.length===1?'':'s'}; disposition/comment/evidence required`:'No failed Validation result',true);
    const criticalMissing=checks.filter(x=>x.critical&&!x.ok);return {checks,ready:criticalMissing.length===0,criticalMissing};
  };
  P.validationReportV161=(state,pid,{persist=false}={})=>{
    P.ensureValidationSampleLinkedResultsV169(state,pid);
    const report=baseReport(state,pid,{persist:false}),p=byId(state.validationProgrammes,pid),prod=byId(state.products,p?.productId),pool=P.validationSamplePoolV165?.(state,pid)||{source:'none',rows:[]},approval=P.validationReportApprovalV169(state,pid),ready=P.validationTechnicalRecordReadinessV169(state,pid),acts=P.validationActivitiesV161?.(state,pid)||[];
    report.programme={...report.programme,productId:p?.productId,product:prod?.family||prod?.name||report.programme.product,partNumber:prod?.partNumber||'—',revision:p?.productRevision||prod?.revision||report.programme.revision,customerId:p?.customerId||null,specificationId:p?.specificationId||p?.sourceSpecificationId||null};
    report.sampleRegister=pool.rows.map(x=>({...x}));report.sampleSource={type:pool.source,sourceId:pool.sourceId||null};
    report.activities=acts.map(a=>{const st=byId(state.standardTests,a.standardTestId||a.basisTestId);return {id:a.id,legId:a.legId,kind:a.kind,name:a.name,standardTestId:a.standardTestId||null,basisTestId:a.basisTestId||null,methodRevision:a.methodRevision||st?.revision||a.revision||'—',acceptanceCriteria:a.acceptanceCriteria||st?.acceptanceCriteria||'',status:a.status,plannedStart:a.plannedStart,plannedEnd:a.plannedEnd,equipmentId:a.equipmentId,staffId:a.staffId,estimatedHours:a.estimatedHours,actualHours:a.actualHours,executionMode:a.executionMode||'Internal',sampleRefs:[...((a.sampleRefsV165||[]).length?a.sampleRefsV165:pool.rows.map(x=>x.refId))]};});
    report.approval={...approval};report.technicalRecordReadiness=ready;report.evidenceFingerprint=P.validationEvidenceFingerprintV169(state,pid);
    if(approval?.status==='Approved'&&approval.evidenceFingerprint===report.evidenceFingerprint)report.status='Approved';
    else if(!ready.ready)report.status='Draft · technical-record gaps';
    if(persist){state.validationReports=arr(state,'validationReports');for(const x of state.validationReports)if(x.programmeId===pid)x.current=false;state.validationReports.push(JSON.parse(JSON.stringify(report)));p.reportRevision=report.revision;P.audit?.(state,'Validation report generated','Validation Programme',pid,'Current evidence',`${report.status} · Rev ${report.revision}`,'Controlled technical record generated from sample-linked Validation evidence.');}
    return report;
  };
  // Treat a controlled approved Validation report as completion of the report step.
  const baseWf=P.validationWorkflowStateV161;
  P.validationWorkflowStateV161=(state,p)=>{const out=baseWf(state,p),a=P.validationReportApprovalV169(state,p.id),step=out.states?.find(x=>x.id==='report');if(step&&a?.status==='Approved'){step.done=true;step.blocked=false;step.next=`Validation Report Rev ${a.revision||p.reportRevision||'A'} approved`;if(out.current==='report')out.current=out.states.find(x=>!x.done&&!x.blocked)?.id||'report';}out.reportApproval=a;return out;};
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.176 — Validation test-flow snapshot and controlled
   per-test photographic evidence for the Validation Test Report.
   ============================================================ */
(function installV172ValidationReportEvidence(P){
  'use strict';
  if(!P || P.__labosV172Installed) return; P.__labosV172Installed=true;
  const baseReport=P.validationReportV161;
  const baseApproval=P.validationReportApprovalV169;
  const baseFingerprint=P.validationEvidenceFingerprintV169;
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const arr=(state,key)=>{state[key]=Array.isArray(state[key])?state[key]:[];return state[key]};
  const clone=v=>P.deepClone?P.deepClone(v):JSON.parse(JSON.stringify(v));
  const fnv=s=>{let h=2166136261;for(let i=0;i<String(s||'').length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
  const photoDigest=ph=>[ph.id,ph.caption,ph.description,ph.sampleRef,ph.fileName,ph.fileType,ph.width,ph.height,ph.includeInReport!==false,ph.dataUrl?fnv(ph.dataUrl):''].join('|');

  P.validationEvidenceFingerprintV169=(state,pid)=>{
    const base=baseFingerprint?baseFingerprint(state,pid):'',p=byId(state.validationProgrammes,pid),flow=P.ensureValidationFlowV164?.(state,pid),results=P.validationResultsV161?.(state,pid)||[],evidence=P.validationEvidenceV161?.(state,pid)||[];
    const photoIds=new Set(results.flatMap(r=>r.photoEvidenceIds||[]));
    const photos=evidence.filter(e=>photoIds.has(e.id)&&e.type==='Test photo').map(photoDigest).sort();
    const flowShape=flow?{version:flow.version,legs:(flow.legs||[]).map(l=>({id:l.id,name:l.name,sequenceId:l.sequenceId,sampleRefsV165:[...(l.sampleRefsV165||[])],nodes:clone(l.nodes||[])}))}:null;
    return fnv(`${base}|${JSON.stringify(flowShape)}|${JSON.stringify(photos)}`);
  };

  P.validationReportApprovalV169=(state,pid)=>{
    const a=baseApproval?baseApproval(state,pid):null,p=byId(state.validationProgrammes,pid);if(!p)return a;
    const approval=a|| (p.validationReportApprovalV169=p.validationReportApprovalV169||{status:'Draft',role:'Quality Engineer',person:'Quality Engineer',revision:p.reportRevision||'A',requestedAt:null,approvedAt:null,approvedBy:null,evidenceFingerprint:null,comment:''});
    const current=P.validationEvidenceFingerprintV169(state,pid);
    if(approval.status==='Approved'&&approval.evidenceFingerprint&&approval.evidenceFingerprint!==current){approval.status='Draft';approval.comment='Controlled test flow or photographic/result evidence changed after approval; re-approval required.';approval.requestedAt=null;approval.approvedAt=null;approval.approvedBy=null;approval.evidenceFingerprint=null;}
    return approval;
  };

  P.validationReportV161=(state,pid,{persist=false}={})=>{
    const report=baseReport(state,pid,{persist:false}),p=byId(state.validationProgrammes,pid),flow=P.ensureValidationFlowV164?.(state,pid),approval=P.validationReportApprovalV169(state,pid);
    report.testFlow=flow?clone(flow):{version:'1.0.176',legs:[]};
    report.legSnapshot=(flow?.legs||[]).map((l,i)=>({id:l.id,name:l.name||`Test Leg ${i+1}`,order:i+1,sampleRefs:[...(l.sampleRefsV165||[])],sequenceId:l.sequenceId}));
    const photoIds=new Set((report.results||[]).flatMap(r=>r.photoEvidenceIds||[]));
    report.photoEvidence=(report.evidence||[]).filter(e=>photoIds.has(e.id)&&e.type==='Test photo');
    report.photoCount=report.photoEvidence.filter(x=>x.includeInReport!==false).length;
    report.evidenceFingerprint=P.validationEvidenceFingerprintV169(state,pid);
    report.approval={...approval};
    if(approval?.status==='Approved'&&approval.evidenceFingerprint===report.evidenceFingerprint)report.status='Approved';
    if(persist){
      state.validationReports=arr(state,'validationReports');for(const x of state.validationReports)if(x.programmeId===pid)x.current=false;
      const snap=clone(report);
      // Keep photo binaries in the controlled Validation evidence store only. Historical report
      // revisions retain immutable evidence IDs/metadata without duplicating base64 images.
      snap.evidence=(snap.evidence||[]).map(e=>e.type==='Test photo'?{...e,dataUrl:null}:e);
      snap.photoEvidence=(snap.photoEvidence||[]).map(e=>({...e,dataUrl:null}));
      state.validationReports.push(snap);p.reportRevision=report.revision;
      P.audit?.(state,'Validation report generated','Validation Programme',pid,'Current evidence',`${report.status} · Rev ${report.revision}`,`Controlled report includes ${report.testFlow?.legs?.length||0} Test Leg(s) and ${report.photoCount} included photo(s).`);
    }
    return report;
  };
})(window.ProtoLab);


/* ============================================================
   LabOS REV 1.0.176 — controlled Prototype→Validation dependency
   propagation history and explicit automatic-replan audit trail.
   ============================================================ */
(function installV173ValidationDependencyAudit(P){
  'use strict';
  if(!P || P.__labosV173DependencyAuditInstalled) return;
  P.__labosV173DependencyAuditInstalled=true;
  const baseEnsure=P.ensureProgrammeModelV161;
  const basePlan=P.planValidationV161;
  const baseSync=P.syncValidationActionsV161;
  const historical=b=>P.isHistoricalPlanningBooking?.(b)||/complete|completed|actual|done|cancel|superseded/i.test(String(b?.status||''));
  const activeBookings=(state,pid)=>(state.bookings||[]).filter(b=>b.requestId===pid&&!historical(b));
  const programme=(state,pid)=>(state.validationProgrammes||[]).find(x=>x.id===pid)||null;
  const prototype=(state,id)=>(state.requests||[]).find(x=>x.id===id)||null;
  const fmt=v=>v||'Not planned';
  function auditAuto(state,action,pid,previousState,newState,reason,meta={}){
    state.auditTrail=Array.isArray(state.auditTrail)?state.auditTrail:[];
    const ident=state.identity||{},row={id:P.uid('AUD'),timestamp:P.now(),user:ident.name||'LabOS system',role:ident.role||'system',action,objectType:'Validation Programme',objectId:pid,previousState,newState,reason,trigger:'Automatic dependency propagation',...meta};
    state.auditTrail.unshift(row);return row;
  }
  function historyRows(state){state.validationDependencyHistoryV173=Array.isArray(state.validationDependencyHistoryV173)?state.validationDependencyHistoryV173:[];return state.validationDependencyHistoryV173}

  P.ensureProgrammeModelV161=(state,options={})=>{
    if(!state)return baseEnsure(state,options);
    historyRows(state);
    const before=new Map((state.validationProgrammes||[]).filter(p=>p.linkedPrototypeId).map(p=>[p.id,{dutAvailableDate:p.dutAvailableDate||null,forecastDate:p.forecastDate||null,executionSiteId:p.executionSiteId||null,bookings:activeBookings(state,p.id).map(b=>({id:b.id,start:b.start,end:b.end,stepName:b.stepName,siteId:b.siteId,equipmentId:b.equipmentId,staffId:b.staffId}))}]));
    const out=baseEnsure(state,options)||{changed:false,linkedChanged:[]};
    for(const pid of out.linkedChanged||[]){
      const p=programme(state,pid);if(!p)continue;
      const prior=before.get(pid)||{dutAvailableDate:p.prototypeImpact?.oldDutAvailableDate||null,forecastDate:p.forecastDate||null,executionSiteId:p.executionSiteId||null,bookings:[]},src=prototype(state,p.linkedPrototypeId);
      const sourceField=src?.forecastDate?'forecastDate':src?.currentCommitmentDate?'currentCommitmentDate':src?.requiredDate?'requiredDate':'unknown',impact=p.prototypeImpact||{};
      const history={id:P.uid('VDH'),programmeId:pid,sourcePrototypeId:p.linkedPrototypeId,occurredAt:impact.at||P.now(),oldDutAvailableDate:impact.oldDutAvailableDate??prior.dutAvailableDate??null,newDutAvailableDate:impact.newDutAvailableDate||p.dutAvailableDate||null,sourcePrototypeTimingField:sourceField,sourcePrototypeTimingDate:p.dutAvailableDate||null,previousValidationForecast:prior.forecastDate||null,previousExecutionSiteId:prior.executionSiteId||null,previousBookingCount:prior.bookings.length,previousBookingIds:prior.bookings.map(x=>x.id),status:prior.bookings.length?'AUTO_REPLAN_PENDING':'BOUNDARY_UPDATED',autoReplanned:false,recoveryRequired:false,replanError:null,replanAttemptAt:null,newValidationForecast:null,newBookingCount:null,newBookingIds:[],affectedBookingCount:0};
      historyRows(state).unshift(history);
      p.prototypeImpact={...impact,...history,historyId:history.id,at:history.occurredAt};
      p.planningRecoveryRequired=false;p.planningRecoveryReason=null;
      const ev=auditAuto(state,'Prototype dependency timing changed',pid,`DUT available ${fmt(history.oldDutAvailableDate)} · Validation forecast ${fmt(history.previousValidationForecast)} · ${history.previousBookingCount} active booking(s)`,`DUT available ${fmt(history.newDutAvailableDate)} · ${history.previousBookingCount?'automatic constrained replan pending':'next Validation plan constrained from new boundary'}`,`Linked Prototype ${p.linkedPrototypeId} ${sourceField} moved to ${history.newDutAvailableDate}. The Validation DUT-availability dependency was propagated automatically.`,{sourcePrototypeId:p.linkedPrototypeId,dependencyHistoryId:history.id,oldDutAvailableDate:history.oldDutAvailableDate,newDutAvailableDate:history.newDutAvailableDate});
      history.boundaryAuditId=ev.id;p.prototypeImpact.boundaryAuditId=ev.id;
    }
    if((out.linkedChanged||[]).length)P.syncValidationActionsV161?.(state);
    return out;
  };

  P.planValidationV161=(state,pid,options={})=>{
    const p=programme(state,pid),beforeBookings=activeBookings(state,pid).map(b=>({id:b.id,start:b.start,end:b.end,stepName:b.stepName,siteId:b.siteId,equipmentId:b.equipmentId,staffId:b.staffId})),previousForecast=p?.forecastDate||null,previousSite=p?.executionSiteId||null,hadPlan=beforeBookings.length>0||!!previousForecast,auditIds=new Set((state.auditTrail||[]).map(x=>x.id));
    const result=basePlan(state,pid,options);
    if(options.commit!==false){
      const live=programme(state,pid),afterBookings=activeBookings(state,pid),audit=(state.auditTrail||[]).find(x=>!auditIds.has(x.id)&&x.objectId===pid&&x.action==='Validation resource plan committed');
      if(audit){
        audit.action=hadPlan?'Validation resource plan replanned':'Validation resource plan committed';
        audit.previousState=hadPlan?`Forecast ${fmt(previousForecast)} · ${beforeBookings.length} active booking(s) · ${previousSite||'home lab'}`:'No committed Validation plan';
        audit.newState=`Forecast ${fmt(result?.forecastDate||live?.forecastDate)} · ${afterBookings.length} active booking(s) · ${live?.executionSiteId||'home lab'}`;
        audit.reason=`Shared constrained planner ${hadPlan?'replanned':'planned'} Validation from ${options.notBefore||live?.planningNotBefore||live?.dutAvailableDate||'current availability'}; ${afterBookings.length} booking(s) committed.`;
        audit.previousForecast=previousForecast;audit.newForecast=result?.forecastDate||live?.forecastDate||null;audit.previousBookingCount=beforeBookings.length;audit.newBookingCount=afterBookings.length;
      }
    }
    return result;
  };

  P.autoReplanLinkedValidationV173=(state,pid)=>{
    const p=programme(state,pid);if(!p||!p.linkedPrototypeId)return {ok:false,reason:'Validation programme is not linked to a Prototype.'};
    const impact=p.prototypeImpact||{},history=historyRows(state).find(x=>x.id===impact.historyId),currentBookings=activeBookings(state,pid),hadPlan=(impact.previousBookingCount||0)>0||currentBookings.length>0||!!impact.previousValidationForecast;
    if(!hadPlan){
      impact.status='BOUNDARY_UPDATED';impact.autoReplanned=false;impact.recoveryRequired=false;impact.replanError=null;p.planningRecoveryRequired=false;p.planningRecoveryReason=null;
      if(history)Object.assign(history,{status:'BOUNDARY_UPDATED',autoReplanned:false,recoveryRequired:false});P.syncValidationActionsV161?.(state);return {ok:true,replanned:false,boundaryOnly:true};
    }
    const beforeForecast=impact.previousValidationForecast||p.forecastDate||null,beforeCount=Number.isFinite(Number(impact.previousBookingCount))?Number(impact.previousBookingCount):currentBookings.length,beforeIds=(impact.previousBookingIds||currentBookings.map(x=>x.id)).slice();
    impact.replanAttemptAt=P.now();impact.status='AUTO_REPLAN_RUNNING';if(history)Object.assign(history,{replanAttemptAt:impact.replanAttemptAt,status:'AUTO_REPLAN_RUNNING'});
    try{
      const result=P.planValidationV161(state,pid,{notBefore:p.dutAvailableDate,commit:true}),after=activeBookings(state,pid),newForecast=result?.forecastDate||p.forecastDate||null;
      Object.assign(impact,{autoReplanned:true,replanError:null,recoveryRequired:false,status:'REPLANNED',newValidationForecast:newForecast,newBookingCount:after.length,newBookingIds:after.map(x=>x.id),affectedBookingCount:Math.max(beforeCount,after.length),replannedAt:P.now()});
      p.planningRecoveryRequired=false;p.planningRecoveryReason=null;p.planningRecoveryAt=null;
      const ev=auditAuto(state,'Prototype-linked Validation auto-replan completed',pid,`Prototype ${p.linkedPrototypeId} dependency moved ${fmt(impact.oldDutAvailableDate)} → ${fmt(impact.newDutAvailableDate)} · Validation forecast ${fmt(beforeForecast)} · ${beforeCount} booking(s)`,`Validation forecast ${fmt(newForecast)} · ${after.length} booking(s) · plan starts no earlier than ${fmt(p.dutAvailableDate)}`,`Automatic constrained replanning completed because linked Prototype ${p.linkedPrototypeId} moved the DUT-available boundary. ${Math.max(beforeCount,after.length)} booking position(s) were affected.`,{sourcePrototypeId:p.linkedPrototypeId,dependencyHistoryId:impact.historyId||null,oldValidationForecast:beforeForecast,newValidationForecast:newForecast,oldBookingCount:beforeCount,newBookingCount:after.length,oldBookingIds:beforeIds,newBookingIds:after.map(x=>x.id)});
      impact.replanAuditId=ev.id;if(history)Object.assign(history,{status:'REPLANNED',autoReplanned:true,recoveryRequired:false,replanError:null,newValidationForecast:newForecast,newBookingCount:after.length,newBookingIds:after.map(x=>x.id),affectedBookingCount:impact.affectedBookingCount,replannedAt:impact.replannedAt,replanAuditId:ev.id});
      P.syncValidationActionsV161?.(state);return {ok:true,replanned:true,forecastDate:newForecast,bookings:after.length,auditId:ev.id};
    }catch(e){
      const retained=activeBookings(state,pid),retainedForecast=p.forecastDate||beforeForecast||null;
      Object.assign(impact,{autoReplanned:false,replanError:e.message,recoveryRequired:true,status:'RECOVERY_REQUIRED',retainedValidationForecast:retainedForecast,retainedBookingCount:retained.length,retainedBookingIds:retained.map(x=>x.id),affectedBookingCount:Math.max(beforeCount,retained.length),failedAt:P.now()});
      p.planningRecoveryRequired=true;p.planningRecoveryReason=`Linked Prototype ${p.linkedPrototypeId} moved DUT availability to ${p.dutAvailableDate}; automatic Validation replanning failed: ${e.message}`;p.planningRecoveryAt=impact.failedAt;
      const ev=auditAuto(state,'Prototype-linked Validation auto-replan failed',pid,`Prototype ${p.linkedPrototypeId} dependency moved ${fmt(impact.oldDutAvailableDate)} → ${fmt(impact.newDutAvailableDate)} · retained forecast ${fmt(retainedForecast)} · ${retained.length} booking(s)`,`Existing Validation plan retained · recovery required · DUT boundary ${fmt(p.dutAvailableDate)}`,`Automatic constrained replanning failed: ${e.message}. Existing committed bookings were retained as controlled evidence; planner recovery / sister-lab alternatives are required before relying on the forecast.`,{sourcePrototypeId:p.linkedPrototypeId,dependencyHistoryId:impact.historyId||null,error:e.message,retainedValidationForecast:retainedForecast,retainedBookingCount:retained.length,retainedBookingIds:retained.map(x=>x.id)});
      impact.replanAuditId=ev.id;if(history)Object.assign(history,{status:'RECOVERY_REQUIRED',autoReplanned:false,recoveryRequired:true,replanError:e.message,retainedValidationForecast:retainedForecast,retainedBookingCount:retained.length,retainedBookingIds:retained.map(x=>x.id),affectedBookingCount:impact.affectedBookingCount,failedAt:impact.failedAt,replanAuditId:ev.id});
      P.syncValidationActionsV161?.(state);return {ok:false,replanned:false,recoveryRequired:true,error:e.message,auditId:ev.id};
    }
  };

  P.syncValidationActionsV161=state=>{
    const rows=baseSync(state);
    for(const p of state.validationProgrammes||[]){if(!p.planningRecoveryRequired&&!p.prototypeImpact?.recoveryRequired)continue;const a=(state.actions||[]).find(x=>x.source==='validation-v161'&&x.requestId===p.id);if(a){a.title='Recover Prototype-linked Validation plan';a.why=p.planningRecoveryReason||p.prototypeImpact?.replanError||'Upstream Prototype timing moved and automatic Validation replanning could not create a feasible controlled schedule.';a.impact=`Programme ${p.id} · Prototype ${p.linkedPrototypeId||'—'} · DUT available ${p.dutAvailableDate||'—'} · retained forecast ${p.prototypeImpact?.retainedValidationForecast||p.forecastDate||'—'}`;a.severity='High';a.resolve='validation';}}
    return rows;
  };
})(window.ProtoLab);

/* ============================================================
   LabOS REV 1.0.176 — ISO/IEC 17025-aligned Validation report
   technical-record structure and approval readiness.
   ============================================================ */
(function installV176ValidationReporting(P){
  'use strict';
  if(!P || P.__labosV176ReportingInstalled)return;P.__labosV176ReportingInstalled=true;
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  const clone=v=>P.deepClone?P.deepClone(v):JSON.parse(JSON.stringify(v));
  const baseReport=P.validationReportV161;
  const baseReadiness=P.validationTechnicalRecordReadinessV169;
  const baseFingerprint=P.validationEvidenceFingerprintV169;
  const arr=(state,key)=>{state[key]=Array.isArray(state[key])?state[key]:[];return state[key]};
  const methodText=(a,st)=>{const v=String(a?.testDescription||a?.description||st?.description||st?.purpose||'').trim();if(v)return v;const name=String(a?.name||st?.name||'controlled test').trim(),out=String(a?.output||st?.output||'').trim(),delta=String(a?.developmentDelta||a?.delta||'').trim();return `Verify ${name} on the assigned DUT population${out?` and record ${out}`:''}${delta?`. Programme-specific delta: ${delta}`:''}.`;};
  const procedureText=(a,st)=>{const v=String(a?.procedureSummary||st?.procedureSummary||st?.setupDescription||st?.workInstruction?.steps?.join(' · ')||'').trim();if(v)return v;if(st)return `Execute released method ${st.id||st.name||'Standard Test'} Rev ${st.revision||'—'} using ${st.equipmentCapability||'the specified laboratory setup'} and qualified ${st.competency||'laboratory personnel'}.`;return 'Execute the programme-specific controlled method using the approved setup, assigned DUTs and recorded test conditions.';};
  const decisionText=(a,st,r)=>String(r?.decisionRuleSnapshot||a?.decisionRule||st?.decisionRule||'').trim();
  const setupPhoto=(state,r)=>{
    const ids=new Set(r?.photoEvidenceIds||[]),rows=(state.validationEvidence||[]).filter(e=>ids.has(e.id)&&e.type==='Test photo'&&e.includeInReport!==false);
    return rows.find(e=>String(e.photoType||'').toLowerCase()==='test setup')||rows.find(e=>/setup|fixture|test arrangement|rig/i.test(`${e.reference||''} ${e.caption||''} ${e.description||''}`))||null;
  };
  const flowActivities=flow=>{
    const ids=[];
    const walk=nodes=>(nodes||[]).forEach(n=>{if(n?.kind==='activity'&&n.activityId)ids.push(n.activityId);else if(n?.kind==='split')(n.branches||[]).forEach(b=>walk(b.nodes||[]));});
    (flow?.legs||[]).forEach(l=>walk(l.nodes||[]));return ids;
  };

  P.validationEvidenceFingerprintV169=(state,pid)=>{
    const base=baseFingerprint?baseFingerprint(state,pid):'',p=byId(state.validationProgrammes,pid),tests=(P.validationActivitiesV161?.(state,pid)||[]).filter(x=>x.kind==='Validation Test'),results=P.validationResultsV161?.(state,pid)||[],evidence=P.validationEvidenceV161?.(state,pid)||[];
    const digest=JSON.stringify({
      tests:tests.map(t=>[t.id,t.testDescription||t.description||'',t.procedureSummary||'',t.decisionRule||'',t.acceptanceCriteria||'']),
      results:results.map(r=>[r.activityId,r.testConditions||'',r.measurementUncertainty||'',r.decisionRuleSnapshot||'',r.conclusion||'',r.comment||'',r.sampleResults||[]]),
      photos:evidence.filter(e=>e.type==='Test photo').map(e=>[e.id,e.activityId,e.photoType||'',e.caption||'',e.description||'',e.sampleRef||'',e.includeInReport!==false])
    });
    let h=2166136261,s=`${base}|${p?.id||pid}|${digest}`;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0');
  };

  P.validationTechnicalRecordReadinessV169=(state,pid)=>{
    const base=baseReadiness?baseReadiness(state,pid):{checks:[],ready:true,criticalMissing:[]},checks=[...(base.checks||[])],tests=(P.validationActivitiesV161?.(state,pid)||[]).filter(x=>x.kind==='Validation Test'),results=P.validationResultsV161?.(state,pid)||[],flow=P.ensureValidationFlowV164?.(state,pid),inFlow=new Set(flowActivities(flow));
    const add=(id,label,ok,detail,critical=true)=>{const i=checks.findIndex(x=>x.id===id);const row={id,label,ok:!!ok,detail,critical};if(i>=0)checks[i]=row;else checks.push(row)};
    const described=tests.filter(t=>{const st=byId(state.standardTests,t.standardTestId||t.basisTestId);return methodText(t,st)}).length;
    add('method-description','Controlled test descriptions',tests.length>0&&described===tests.length,`${described}/${tests.length} Validation tests have a controlled description / purpose`,true);
    const procedure=tests.filter(t=>{const st=byId(state.standardTests,t.standardTestId||t.basisTestId);return procedureText(t,st)}).length;
    add('procedure-summary','Setup / procedure definition',tests.length>0&&procedure===tests.length,`${procedure}/${tests.length} tests identify the controlled setup / procedure basis`,false);
    const flowOk=tests.length>0&&tests.every(t=>inFlow.has(t.id));
    add('test-flow','Released visual Test Flow',flowOk,`${[...inFlow].filter(id=>tests.some(t=>t.id===id)).length}/${tests.length} controlled tests are represented in the released Test Legs / branch flow`,true);
    const resultBy=new Map(results.map(r=>[r.activityId,r]));
    const measured=tests.filter(t=>{const r=resultBy.get(t.id);return !!r&&(r.sampleResults||[]).length>0&&(r.sampleResults||[]).every(sr=>String(sr.value??'').trim())}).length;
    add('measurements','DUT/sample measurements or observed result',tests.length>0&&measured===tests.length,`${measured}/${tests.length} tests have a non-blank measured/observed result for every assigned DUT`,true);
    const decisions=tests.filter(t=>{const st=byId(state.standardTests,t.standardTestId||t.basisTestId),r=resultBy.get(t.id);return !!r&&!!decisionText(t,st,r)}).length;
    add('decision-rule','Conformity decision rule',tests.length>0&&decisions===tests.length,`${decisions}/${tests.length} completed tests record the rule used to turn evidence into Pass/Fail`,true);
    const setupPhotos=tests.filter(t=>setupPhoto(state,resultBy.get(t.id))).length;
    add('setup-photo','Test setup photograph',tests.length>0&&setupPhotos===tests.length,`${setupPhotos}/${tests.length} tests include a controlled setup/fixture photograph selected for the report`,true);
    const conclusions=tests.filter(t=>String(resultBy.get(t.id)?.conclusion||'').trim()).length;
    add('test-conclusion','Per-test technical conclusion',tests.length>0&&conclusions===tests.length,`${conclusions}/${tests.length} tests contain an explicit technical conclusion`,true);
    const conditions=tests.filter(t=>String(resultBy.get(t.id)?.testConditions||'').trim()).length;
    add('test-conditions','Test conditions / environment',tests.length===0||conditions===tests.length,`${conditions}/${tests.length} tests record execution conditions/environment; required where they influence validity`,false);
    const criticalMissing=checks.filter(x=>x.critical&&!x.ok);return {...base,checks,ready:criticalMissing.length===0,criticalMissing};
  };

  P.validationReportV161=(state,pid,{persist=false}={})=>{
    P.ensureValidationReportDemoV176?.(state,pid);
    const report=baseReport(state,pid,{persist:false}),p=byId(state.validationProgrammes,pid),prod=byId(state.products,p?.productId),lab=byId(state.labs||state.sites,p?.executionSiteId||p?.homeSiteId),customer=byId(state.customers,p?.customerId),results=P.validationResultsV161?.(state,pid)||[];
    const resultBy=new Map(results.map(r=>[r.activityId,r]));
    report.activities=(report.activities||[]).map(a=>{const live=byId(state.validationActivities,a.id)||a,st=byId(state.standardTests,live.standardTestId||live.basisTestId),r=resultBy.get(a.id);return {...a,
      testDescription:methodText(live,st),
      procedureSummary:procedureText(live,st),
      setupDescription:String(live.setupDescription||st?.setupDescription||'').trim(),
      methodDeviation:String(live.methodDeviation||live.developmentDelta||live.delta||'').trim(),
      output:live.output||st?.output||'',
      unit:live.unit||st?.unit||'',
      target:live.target??st?.target??null,
      lsl:live.lsl??st?.lsl??null,
      usl:live.usl??st?.usl??null,
      decisionRule:decisionText(live,st,r),
      requiredEvidence:clone(live.requiredEvidence||st?.requiredEvidence||[]),
      competency:live.competency||st?.competency||'',
      equipmentCapability:live.equipmentCapability||st?.equipmentCapability||'',
      externalSourcing:clone(st?.externalSourcing||null)
    }});
    report.results=(report.results||[]).map(r=>({...r,
      testConditions:String(r.testConditions||'').trim(),
      measurementUncertainty:String(r.measurementUncertainty||'').trim(),
      decisionRuleSnapshot:String(r.decisionRuleSnapshot||report.activities.find(a=>a.id===r.activityId)?.decisionRule||'').trim(),
      conclusion:String(r.conclusion||'').trim()
    }));
    report.laboratory={id:lab?.id||p?.executionSiteId||p?.homeSiteId||'—',code:lab?.code||'',name:lab?.name||p?.executionSiteId||p?.homeSiteId||'Laboratory',location:lab?.location||'',timezone:lab?.timezone||''};
    report.customer={id:customer?.id||p?.customerId||null,name:customer?.name||p?.customerName||p?.customerId||'Internal engineering customer'};
    report.reportBasis={iso17025Aligned:true,iatfLaboratoryEvidence:true,accreditationClaim:false,statement:'Report structure supports ISO/IEC 17025-style technical reporting and IATF laboratory evidence. It does not claim laboratory accreditation or product certification.'};
    report.resultStatement='Results relate only to the identified items / DUTs and the controlled tests reported here.';
    report.reproductionStatement='Reproduction of this controlled report in part requires laboratory authorization unless otherwise agreed.';
    report.technicalRecordReadiness=P.validationTechnicalRecordReadinessV169(state,pid);
    report.evidenceFingerprint=P.validationEvidenceFingerprintV169(state,pid);
    const approval=P.validationReportApprovalV169?.(state,pid);if(approval)report.approval={...approval};
    if(approval?.status==='Approved'&&approval.evidenceFingerprint===report.evidenceFingerprint)report.status='Approved';else if(!report.technicalRecordReadiness.ready)report.status='Draft · technical-record gaps';
    if(persist){state.validationReports=arr(state,'validationReports');for(const x of state.validationReports)if(x.programmeId===pid)x.current=false;const snap=clone(report);snap.evidence=(snap.evidence||[]).map(e=>e.type==='Test photo'?{...e,dataUrl:null}:e);snap.photoEvidence=(snap.photoEvidence||[]).map(e=>({...e,dataUrl:null}));state.validationReports.push(snap);if(p)p.reportRevision=report.revision;P.audit?.(state,'Validation report generated','Validation Programme',pid,'Current evidence',`${report.status} · Rev ${report.revision}`,`REV 1.0.182 controlled technical report · ${report.activities.filter(a=>a.kind==='Validation Test').length} tests · ${report.testFlow?.legs?.length||0} Test Legs · ISO/IEC 17025-aligned report structure.`)}
    return report;
  };
})(window.ProtoLab);

/* REV 1.0.182 — single-source Validation report approval controller.
   Earlier report layers wrapped the approval helper and compared a later
   evidence fingerprint against an older fingerprint algorithm. That could
   incorrectly reopen an otherwise unchanged approved report. The final
   controller below evaluates approval only against the current controlled
   evidence fingerprint. */
(function installV177ValidationApprovalController(P){
  'use strict';
  if(!P || P.__labosV177ValidationApprovalControllerInstalled)return;
  P.__labosV177ValidationApprovalControllerInstalled=true;
  const byId=(rows,id)=>(rows||[]).find(x=>x.id===id)||null;
  P.validationReportApprovalV169=(state,pid)=>{
    const p=byId(state?.validationProgrammes,pid);if(!p)return null;
    p.validationReportApprovalV169=p.validationReportApprovalV169||{
      status:'Draft',role:'Quality Engineer',
      person:(state.users||[]).find(u=>u.role==='quality')?.name||'Quality Engineer',
      revision:p.reportRevision||'A',requestedAt:null,approvedAt:null,
      approvedBy:null,evidenceFingerprint:null,comment:''
    };
    const a=p.validationReportApprovalV169,current=P.validationEvidenceFingerprintV169?.(state,pid)||null;
    if(a.status==='Approved'&&a.evidenceFingerprint&&current&&a.evidenceFingerprint!==current){
      a.status='Draft';a.comment='Controlled Validation evidence changed after approval; re-approval required.';
      a.requestedAt=null;a.approvedAt=null;a.approvedBy=null;a.evidenceFingerprint=null;
    }
    return a;
  };
})(window.ProtoLab);



