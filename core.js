(function(){
  'use strict';
  const ProtoLab = window.ProtoLab = window.ProtoLab || {};
  ProtoLab.VERSION = '1.0.65-poc';
  ProtoLab.SCHEMA_VERSION = 29;
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
    rapid:{id:'rapid',code:'E0',label:'Rapid Engineering',tagline:'Fast learning with essential safety and traceability only',description:'For quick engineering experiments, troubleshooting, failure analysis and early process learning. Allows provisional methods and simplified records. Not customer-releasable and not production representative.',formalLevel:0,requires:{processRelease:false,testRelease:false,controlPlan:false,independentControlPlanApproval:false,formalReadiness:false,releaseApproval:false,customerApprovals:false,serialisation:false,fullGenealogy:false}},
    controlled:{id:'controlled',code:'E1',label:'Controlled Engineering',tagline:'Lean but repeatable engineering build',description:'For design learning, correlation and engineering prototypes where repeatability and useful traceability matter. Released standards are preferred; provisional engineering methods may be used with explicit owner/evidence.',formalLevel:1,requires:{processRelease:false,testRelease:false,controlPlan:'special-only',independentControlPlanApproval:false,formalReadiness:true,releaseApproval:false,customerApprovals:false,serialisation:false,fullGenealogy:false}},
    validation:{id:'validation',code:'V',label:'Validation / Customer',tagline:'Controlled evidence for DV/PV or customer-facing samples',description:'For design validation, customer samples and formal engineering verification. Requires released methods, controlled risks, approved Control Plan where applicable, traceable measurements and formal quality/release review.',formalLevel:2,requires:{processRelease:true,testRelease:true,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:true,customerApprovals:true,serialisation:true,fullGenealogy:true}},
    production:{id:'production',code:'P',label:'Production Intent',tagline:'Maximum prototype governance for production-representative parts',description:'For production-intent, PPAP-supporting, safe-launch or equivalent production-representative builds. Applies the strongest available prototype controls, customer-specific gates, full genealogy, approved methods and formal release.',formalLevel:3,requires:{processRelease:true,testRelease:true,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:true,customerApprovals:true,serialisation:true,fullGenealogy:true}}
  };
  ProtoLab.profile = r => ProtoLab.ASSURANCE_PROFILES[r?.assuranceProfile]||ProtoLab.ASSURANCE_PROFILES.controlled;
  ProtoLab.recommendAssuranceProfile = data => {
    const purpose=String(data?.purpose||'').toLowerCase(),maturity=String(data?.maturity||'').toLowerCase(),customer=String(data?.customerId||'').toLowerCase();
    if(data?.productSafety)return 'validation';
    if(/production|ppap|safe launch|production intent/.test(purpose))return 'production';
    if(/customer|design validation|dv|pv|formal validation/.test(purpose))return 'validation';
    if(/quick|experiment|failure analysis|process learning|troubleshoot|debug/.test(purpose))return 'rapid';
    if(/correlation|design learning|engineering prototype/.test(purpose))return 'controlled';
    if(maturity.includes('c-sample')&&customer&&!customer.includes('internal'))return 'validation';
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
    if(route&&route.confirmed!==true){
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
    if(!state||!r||!cp)throw new Error('Request and Control Plan are required.');if(cp.buildSpecific&&cp.buildRequestId===r.id)return cp;
    const clone=ProtoLab.deepClone(cp);clone.id=ProtoLab.uid('CP');clone.revision=`${cp.revision}.B1`;clone.status='Draft';clone.approvedBy=null;clone.approvedAt=null;clone.baselineId=cp.id;clone.baselineRevision=cp.revision;clone.buildSpecific=true;clone.buildRequestId=r.id;clone.requestIds=[r.id];clone.name=`${cp.name} · ${r.id} adaptation`;state.controlPlans.push(clone);r.controlPlanId=clone.id;const pack=ProtoLab.ensureReusePackage(r);pack.controlPlan={mode:'modified',baselineId:cp.id,revision:cp.revision,buildSpecificId:clone.id};ProtoLab.markBuildSpecificDelta(state,r,'Control Plan',reason);return clone;
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
    state.approvals.filter(a=>a.requestId===r.id).forEach(a=>{if(a.type==='Product Safety'||a.type==='Build Readiness')a.stage=a.stage||'readiness';if(['Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type))a.stage=a.stage||'release';});
    const user=(role)=>state.users.find(u=>u.role===role);
    if(r.productSafety&&!state.approvals.some(a=>a.requestId===r.id&&a.type==='Product Safety')){const done=ProtoLab.GATES.indexOf(r.status)>=ProtoLab.GATES.indexOf('RELEASED');state.approvals.push({id:ProtoLab.uid('APR'),requestId:r.id,type:'Product Safety',role:'Product Safety Representative',person:user('product_safety')?.name||'Product Safety Representative',status:done?'Approved':'Pending',timestamp:done?ProtoLab.now():null,stage:'readiness',comment:done?'Migrated/seeded evidence assumed complete for already released build.':'Review product-safety relevance, special characteristics and required evidence.'});}
    const customer=state.customers?.find(c=>c.id===r.customerId);
    const map={Quality:['Customer / quality gate','Quality Engineer','quality'],Engineering:['Engineering review','Engineering Project Lead','engineering_lead'],'Lab Manager':['Lab manager gate','Lab Manager','lab_manager']};
    if(profile.requires.customerApprovals)(customer?.requiredApprovals||[]).forEach(label=>{const x=map[label];if(!x)return;if(!state.approvals.some(a=>a.requestId===r.id&&a.type===x[0])){const done=ProtoLab.GATES.indexOf(r.status)>=ProtoLab.GATES.indexOf('RELEASED');state.approvals.push({id:ProtoLab.uid('APR'),requestId:r.id,type:x[0],role:x[1],person:user(x[2])?.name||x[1],status:done?'Approved':'Pending',timestamp:done?ProtoLab.now():null,stage:'release',comment:`Required by ${profile.label} profile and customer profile ${customer.name}.`});}});
    else state.approvals=state.approvals.filter(a=>a.requestId!==r.id||!['Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type));
    return state.approvals.filter(a=>a.requestId===r.id);
  };
  ProtoLab.controlCharacteristicReady = c => {
    const hasSpec=(c.target!==null&&c.target!==undefined&&String(c.target).trim()!==''&&String(c.target).trim()!=='Define target') || c.lsl!==null&&c.lsl!==undefined || c.usl!==null&&c.usl!==undefined;
    return !c.classification || (hasSpec&&!!String(c.method||'').trim()&&!!String(c.reactionPlan||'').trim()&&!!String(c.equipment||'').trim()&&!!String(c.evidence||'').trim());
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
  ProtoLab.ensureTestRequirements = (state,r) => {
    const existing=new Map((r.testRequirements||[]).map(x=>[String(x.name||'').toLowerCase(),x]));
    r.testRequirements=(r.characterisation||[]).map((name,i)=>{const old=existing.get(String(name).toLowerCase()),test=ProtoLab.matchStandardTest(state,name);return Object.assign({id:`TESTREQ-${r.id}-${i+1}`,name,standardTestId:test?.id||null,status:test?'Standard test':'Development required',developmentEstimateHours:null,owner:test?.owner||(state.users||[]).find(u=>u.role==='process_engineer')?.name||'Process Engineer'},old||{},test?{standardTestId:test.id,status:'Standard test'}:{});});
    return r.testRequirements;
  };
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
      const supply=r.materialSupply||{}; const planningReady=!!(supply.expectedDate&&supply.owner),partial=outputLimit.maxBuildQty>0&&!issuedReady;
      return {source:r.materialOwnership,planningReady,buildReady:issuedReady,earliestDate:supply.expectedDate||null,owner:supply.owner||r.requester,summary:issuedReady?'Exact engineering-supplied BOM material is received and issued':partial?`Partial material is issued: current output limit ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} units`:planningReady?`Engineering supply promised for ${supply.expectedDate}`:'Engineering supply date/owner not yet defined',issues:issuedReady?[]:partial?[`Current issued material limits output to ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} requested unit(s). Receive the remaining BOM quantity to remove the limiter.`]:planningReady?[]:['Record who supplies the BOM material and its expected lab arrival date.'],outputLimit};
    }
    const lines=reqs.map(req=>{const reserved=alloc.filter(a=>a.requirementId===req.id&&['Reserved','Issued'].includes(a.status)).reduce((n,a)=>n+Number(a.qty||0),0),available=(state.materials||[]).filter(m=>m.status==='Available'&&m.partNumber===req.partNumber&&m.revision===req.revision).reduce((n,m)=>n+Number(m.quantity||0),0);return {req,reserved,available,ok:reserved+available>=Number(req.requiredQty||0)};});
    const reservedReady=lines.every(x=>x.reserved>=Number(x.req.requiredQty||0)),partial=outputLimit.maxBuildQty>0&&!issuedReady;
    return {source:'Lab supplied',planningReady:reservedReady,buildReady:issuedReady,earliestDate:today,owner:(state.users||[]).find(u=>u.role==='lab_planner')?.name||'Lab Planner',summary:issuedReady?'Exact BOM material is issued for the full build':partial?`Partial BOM material is issued: current output limit ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} units`:reservedReady?'Exact BOM material is reserved from lab stock':lines.every(x=>x.ok)?'Exact BOM material is available but must be reserved before planning':'One or more exact BOM items are not available in sufficient quantity',issues:issuedReady?[]:partial?[`Current issued material limits output to ${outputLimit.maxBuildQty}/${outputLimit.requestedQty} requested unit(s). Issue/receive the remaining exact BOM quantity to remove the limiter.`]:reservedReady?[]:lines.filter(x=>x.reserved<Number(x.req.requiredQty||0)).map(x=>`${x.req.partNumber} Rev ${x.req.revision}: reserve ${x.req.requiredQty}; currently reserved/issued ${x.reserved}, unreserved stock ${x.available}`),lines,outputLimit};
  };
  ProtoLab.processPlanningAssessment = (state,r) => {
    const profile=ProtoLab.ensureAssuranceProfile(r), route=(state.routes||[]).find(x=>x.requestId===r.id); ProtoLab.ensureTestRequirements(state,r); const issues=[];
    const testOnlyRapid=profile.formalLevel===0&&(!route?.steps?.length)&&(r.testRequirements||[]).length>0;
    if(!route?.steps?.length&&!testOnlyRapid)issues.push('Define the process route, or use a Rapid Engineering test-only request.'); else if(route?.steps?.length&&route.confirmed!==true)issues.push(profile.formalLevel===0?'Lab/Process Engineering must acknowledge the intended engineering route before planning.':'Process Engineer must confirm the proposed route.');
    (route?.steps||[]).forEach(s=>{const proc=(state.processes||[]).find(p=>p.id===s.processId);if(s.type==='standard'){
      if(!proc)issues.push(`${s.name}: process definition is missing.`);else{
        if(profile.requires.processRelease&&proc.status!=='Released')issues.push(`${s.name}: ${profile.label} requires a released process revision.`);
        if(!Number.isFinite(Number(proc.setupTime))||!Number.isFinite(Number(proc.cycleTime)))issues.push(`${s.name}: planning setup/cycle time missing.`);
        if(!proc.equipmentCapability)issues.push(`${s.name}: equipment capability not defined.`);if(!proc.competency)issues.push(`${s.name}: required competency not defined.`);
      }
    }else{const dev=(state.processDevelopments||[]).find(d=>d.requestId===r.id&&(d.libraryCandidate===s.processId||String(d.name).includes(s.name)));if(!dev||!Number(dev.planningEstimateHours))issues.push(`${s.name}: define a Process Engineer-owned development/planning allowance before scheduling.`);}});
    (r.testRequirements||[]).forEach(tr=>{if(tr.standardTestId){const test=(state.standardTests||[]).find(x=>x.id===tr.standardTestId);if(!test)issues.push(`${tr.name}: standard test definition is missing.`);else{if(profile.requires.testRelease&&test.status!=='Released')issues.push(`${tr.name}: ${profile.label} requires a released standard test.`);if(!test.equipmentCapability||!test.competency||!Number.isFinite(Number(test.setupTime))||!Number.isFinite(Number(test.cycleTime)))issues.push(`${tr.name}: standard test planning data incomplete.`);}}else if(!Number(tr.developmentEstimateHours)||!Number(tr.executionEstimateHours)||!tr.equipmentCapability||!tr.competency)issues.push(`${tr.name}: define provisional development/execution time, equipment capability and skill.`);});
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
      const eq=(state.equipment||[]).find(e=>e.capability===p.equipmentCapability);equipment+=hours*Number(eq?.hourlyCost||0);
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
    (state.standardTests||[]).forEach((x,i)=>{x.fixedCharge=Number(x.fixedCharge??(18+(i%4)*6));x.consumableCost=Number(x.consumableCost??(4+(i%3)*3));x.workInstruction=x.workInstruction||{id:`WI-${x.id}`,revision:x.revision||'A',title:`Test instruction · ${x.name}`,status:'Released',steps:[`Prepare ${x.name} setup`,`Execute controlled method`,`Retain raw results and disposition`]};});
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
      if(e.calibrationRequired!==false && !state.calibrationCertificates.some(c=>c.equipmentId===e.id)){
        const due=new Date(`${e.calibrationDue||ProtoLab.todayISO()}T12:00:00`);const completed=new Date(due.getTime()-180*86400000);
        state.calibrationCertificates.push({id:`CALCERT-${e.id}-SEED`,equipmentId:e.id,certificateNo:`CAL-${e.id}-2026`,issuer:'Accredited Calibration Lab (Demo)',referenceStandard:'Traceable reference standard',completedAt:completed.toISOString().slice(0,10),nextDue:e.calibrationDue,result:'Pass',status:'Valid',evidence:`Demo calibration certificate ${e.id}`,person:'Daan Mulder',fileName:`CAL-${e.id}-2026-demo.txt`,fileType:'text/plain',fileData:'data:text/plain;base64,REVNTyBDQUxJQlJBVElPTiBDRVJUSUZJQ0FURSAtIFBST1RPTEFCIE9T',documentUploaded:true});
      }
      e.calibrationCertificateValid=!!state.calibrationCertificates.find(c=>c.equipmentId===e.id&&c.result==='Pass'&&c.status==='Valid'&&c.completedAt<=ProtoLab.todayISO()&&c.nextDue>=ProtoLab.todayISO());
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
    const cert=(state.trainingCertificates||[]).find(c=>c.staffId===staff.id&&c.skillId===skillId&&c.status==='Valid'&&(!c.expiresAt||c.expiresAt>=onDate));
    return {valid:!!cert,certificate:cert,reason:cert?`Certificate ${cert.certificateNo} valid to ${cert.expiresAt}`:`No valid training certificate for ${skillId}`};
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

})();
