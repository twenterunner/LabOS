(function(){
  'use strict';
  const ProtoLab = window.ProtoLab = window.ProtoLab || {};
  ProtoLab.VERSION = '1.0.26-poc';
  ProtoLab.SCHEMA_VERSION = 12;
  ProtoLab.now = () => new Date().toISOString();
  ProtoLab.todayISO = () => new Date().toISOString().slice(0,10);
  ProtoLab.uid = (prefix='ID') => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  ProtoLab.deepClone = obj => JSON.parse(JSON.stringify(obj));
  ProtoLab.escape = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  ProtoLab.formatDate = iso => { if(!iso) return '—'; const d=new Date(iso); return Number.isNaN(d.getTime())?iso:d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}); };
  ProtoLab.formatDateTime = iso => { if(!iso) return '—'; const d=new Date(iso); return Number.isNaN(d.getTime())?iso:d.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}); };
  ProtoLab.daysBetween = (a,b) => Math.ceil((new Date(b)-new Date(a))/86400000);
  ProtoLab.clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  ProtoLab.currency=n=>new Intl.NumberFormat(undefined,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n||0));

  ProtoLab.GATES = ['DRAFT REQUEST','SUBMITTED','FEASIBILITY','PROCESS DEFINITION','LAB TRIAGE','BUILD READINESS REVIEW','READY TO BUILD','BUILD IN PROGRESS','CHARACTERISATION','QUALITY REVIEW','ENGINEERING REVIEW','RELEASE APPROVAL','RELEASED','DELIVERED','CLOSED'];
  ProtoLab.ASSURANCE_PROFILES = {
    rapid:{id:'rapid',code:'E0',label:'Rapid Engineering',tagline:'Fast learning with essential safety and traceability only',description:'For quick engineering experiments, troubleshooting, failure analysis and early process learning. Allows provisional methods and simplified records. Not customer-releasable and not production representative.',formalLevel:0,requires:{processRelease:false,testRelease:false,pfmea:false,controlPlan:false,independentControlPlanApproval:false,formalReadiness:false,releaseApproval:false,customerApprovals:false,serialisation:false,fullGenealogy:false}},
    controlled:{id:'controlled',code:'E1',label:'Controlled Engineering',tagline:'Lean but repeatable engineering build',description:'For design learning, correlation and engineering prototypes where repeatability and useful traceability matter. Released standards are preferred; provisional engineering methods may be used with explicit owner/evidence.',formalLevel:1,requires:{processRelease:false,testRelease:false,pfmea:'high-risk',controlPlan:'special-only',independentControlPlanApproval:false,formalReadiness:true,releaseApproval:false,customerApprovals:false,serialisation:false,fullGenealogy:false}},
    validation:{id:'validation',code:'V',label:'Validation / Customer',tagline:'Controlled evidence for DV/PV or customer-facing samples',description:'For design validation, customer samples and formal engineering verification. Requires released methods, controlled risks, approved Control Plan where applicable, traceable measurements and formal quality/release review.',formalLevel:2,requires:{processRelease:true,testRelease:true,pfmea:true,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:true,customerApprovals:true,serialisation:true,fullGenealogy:true}},
    production:{id:'production',code:'P',label:'Production Intent',tagline:'Maximum prototype governance for production-representative parts',description:'For production-intent, PPAP-supporting, safe-launch or equivalent production-representative builds. Applies the strongest available prototype controls, customer-specific gates, full genealogy, approved methods and formal release.',formalLevel:3,requires:{processRelease:true,testRelease:true,pfmea:true,controlPlan:true,independentControlPlanApproval:true,formalReadiness:true,releaseApproval:true,customerApprovals:true,serialisation:true,fullGenealogy:true}}
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
    lab_planner:['request:view','triage','plan','route:edit','materials:allocate','materials:receive','product:view','report:view','improvement:review'], process_engineer:['request:view','route:edit','process:develop','process:release','pfmea:edit','workinstruction:edit','product:view','report:view'],
    technician:['request:view','execution:run','evidence:add','measurement:add','report:view'], quality:['request:view','controlplan:edit','controlplan:approve','quality:disposition','release:review','approval:perform','report:approve'],
    metrology:['request:view','equipment:manage','measurement:review','calibration:manage','maintenance:manage'], product_safety:['request:view','productsafety:approve','approval:perform'], lab_manager:['request:view','plan','process:develop','product:view','planning:standards','finance:manage','skills:manage','equipment:manage','calibration:manage','maintenance:manage','improvement:review','priority:change','override:approve','release:approve','approval:perform','dashboard:management'],
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
  ProtoLab.nextReportRevision = rev => {
    const src=String(rev||'A').toUpperCase().replace(/[^A-Z]/g,'')||'A';let n=0;for(const ch of src)n=n*26+(ch.charCodeAt(0)-64);n++;let out='';while(n){n--;out=String.fromCharCode(65+n%26)+out;n=Math.floor(n/26);}return out;
  };
  ProtoLab.invalidateBuildReport = (state,r,reason='Controlled report content changed') => {
    if(!state||!r)return false;const a=ProtoLab.ensureBuildReportApproval(state,r),prev=a.status;
    if(!['Approved','Pending'].includes(prev))return false;
    if(prev==='Approved'){
      const oldRev=r.buildReportRevision||'A',next=ProtoLab.nextReportRevision(oldRev);r.buildReportRevision=next;
      state.documents=state.documents||[];const doc=state.documents.find(d=>d.requestId===r.id&&d.type==='Prototype Build Report'&&d.status==='Approved'&&String(d.revision||'A')===String(oldRev));
      if(doc){doc.status='Superseded';doc.supersededBy=next;doc.supersededAt=ProtoLab.now();}
    }
    a.status='Draft';a.timestamp=null;a.approvedAt=null;a.requestedAt=null;a.requestedBy=null;a.comment=`Re-approval required: ${reason}`;
    r.buildReportApprovedAt=null;r.buildReportApprovedBy=null;
    ProtoLab.audit(state,'Build report approval invalidated','Request',r.id,prev,'Draft',`${reason}; current report revision ${r.buildReportRevision||'A'}`);return true;
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
  ProtoLab.ensurePlanningModel = state => {
    state.standardTests=state.standardTests||[]; state.buildHistory=state.buildHistory||[]; state.competencies=state.competencies||[]; state.planningEvents=state.planningEvents||[];
    (state.requests||[]).forEach(r=>{
      r.materialOwnership=ProtoLab.normaliseMaterialSource(r.materialOwnership);ProtoLab.ensureAssuranceProfile(r);ProtoLab.ensureMaterialRequirements(state,r);ProtoLab.ensureTestRequirements(state,r);
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
  ProtoLab.materialPlanningAssessment = (state,r) => {
    ProtoLab.ensureMaterialRequirements(state,r); r.materialOwnership=ProtoLab.normaliseMaterialSource(r.materialOwnership);
    const reqs=r.materialRequirements||[],alloc=(state.allocations||[]).filter(a=>a.requestId===r.id),today=ProtoLab.todayISO();
    const issuedReady=reqs.every(req=>alloc.filter(a=>a.requirementId===req.id&&a.status==='Issued').reduce((n,a)=>n+Number(a.qty||0),0)>=Number(req.requiredQty||0));
    if(r.materialOwnership==='Engineering supplied'){
      const supply=r.materialSupply||{}; const planningReady=!!(supply.expectedDate&&supply.owner);
      return {source:r.materialOwnership,planningReady,buildReady:issuedReady,earliestDate:supply.expectedDate||null,owner:supply.owner||r.requester,summary:planningReady?`Engineering supply promised for ${supply.expectedDate}`:'Engineering supply date/owner not yet defined',issues:planningReady?[]:['Record who supplies the BOM material and its expected lab arrival date.']};
    }
    const lines=reqs.map(req=>{const reserved=alloc.filter(a=>a.requirementId===req.id&&['Reserved','Issued'].includes(a.status)).reduce((n,a)=>n+Number(a.qty||0),0),available=(state.materials||[]).filter(m=>m.status==='Available'&&m.partNumber===req.partNumber&&m.revision===req.revision).reduce((n,m)=>n+Number(m.quantity||0),0);return {req,reserved,available,ok:reserved+available>=Number(req.requiredQty||0)};});
    const reservedReady=lines.every(x=>x.reserved>=Number(x.req.requiredQty||0));return {source:'Lab supplied',planningReady:reservedReady,buildReady:issuedReady,earliestDate:today,owner:(state.users||[]).find(u=>u.role==='lab_planner')?.name||'Lab Planner',summary:reservedReady?'Exact BOM material is reserved from lab stock':lines.every(x=>x.ok)?'Exact BOM material is available but must be reserved before planning':'One or more exact BOM items are not available in sufficient quantity',issues:reservedReady?[]:lines.filter(x=>x.reserved<Number(x.req.requiredQty||0)).map(x=>`${x.req.partNumber} Rev ${x.req.revision}: reserve ${x.req.requiredQty}; currently reserved/issued ${x.reserved}, unreserved stock ${x.available}`),lines};
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
  ProtoLab.validateInvariants = state => {
    const errors=[];
    const serials=(state.serials||[]).map(s=>s.serial); if(new Set(serials).size!==serials.length) errors.push('Serial numbers are not unique.');
    (state.requests||[]).forEach(r=>{
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
    return errors;
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
    state.pipelineProjects=state.pipelineProjects||[];
    state.planningEvents=state.planningEvents||[];
    state.settings.capacity=state.settings.capacity||{productiveStaffHoursPerWeek:32,equipmentHoursPerWeek:60};
    state.improvementProposals=state.improvementProposals||[];
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
          state.trainingCertificates.push(cert); person.trainingCertificates.push(cert.id);
        }
      });
    });
    (state.processes||[]).forEach((x,i)=>{x.workInstruction=x.workInstruction||{id:`WI-${x.id}`,revision:x.revision||'A',title:`Work instruction · ${x.name}`,status:x.status==='Released'?'Released':'Draft',steps:[`Verify material/configuration for ${x.name}`,`Perform ${x.name} using controlled parameters`,`Record required evidence in the guided build execution`]};x.fixedCharge=Number(x.fixedCharge??(8+(i%5)*4));x.consumableCost=Number(x.consumableCost??(3+(i%4)*2));});
    (state.standardTests||[]).forEach((x,i)=>{x.fixedCharge=Number(x.fixedCharge??(18+(i%4)*6));x.consumableCost=Number(x.consumableCost??(4+(i%3)*3));x.workInstruction=x.workInstruction||{id:`WI-${x.id}`,revision:x.revision||'A',title:`Test instruction · ${x.name}`,status:'Released',steps:[`Prepare ${x.name} setup`,`Execute controlled method`,`Retain raw results and disposition`]};});
    (state.materials||[]).forEach((m,i)=>{m.unitCost=Number(m.unitCost??(6+(i%7)*4));});
    (state.calibrationCertificates||[]).forEach(c=>{if(!c.fileData&&String(c.evidence||'').startsWith('Demo calibration certificate')){c.fileName=c.fileName||`${c.certificateNo||c.id}-demo.txt`;c.fileType='text/plain';c.fileData='data:text/plain;base64,REVNTyBDQUxJQlJBVElPTiBDRVJUSUZJQ0FURSAtIFBST1RPTEFCIE9T';c.documentUploaded=true;}});
    (state.equipment||[]).forEach((e,i)=>{
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

})();
