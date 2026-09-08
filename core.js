(function(){
  'use strict';
  const ProtoLab = window.ProtoLab = window.ProtoLab || {};
  ProtoLab.VERSION = '1.0.4-poc';
  ProtoLab.SCHEMA_VERSION = 2;
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

  ProtoLab.GATES = ['DRAFT REQUEST','SUBMITTED','LAB TRIAGE','FEASIBILITY','PROCESS DEFINITION','BUILD READINESS REVIEW','READY TO BUILD','BUILD IN PROGRESS','CHARACTERISATION','QUALITY REVIEW','ENGINEERING REVIEW','RELEASE APPROVAL','RELEASED','DELIVERED','CLOSED'];
  ProtoLab.ROLES = [
    ['engineering_requester','Engineering Requester'],['engineering_lead','Engineering Project Lead'],['lab_planner','Prototype Lab Coordinator / Planner'],['process_engineer','Process Engineer'],['technician','Prototype Technician'],['quality','Quality Engineer'],['metrology','Metrology / Measurement Owner'],['product_safety','Product Safety Representative'],['lab_manager','Lab Manager'],['approver','Approver / Reviewer'],['auditor','Auditor / Read-only'],['administrator','Administrator']
  ].map(([id,label])=>({id,label}));
  ProtoLab.PERMISSIONS = {
    engineering_requester:['request:create','request:view','delivery:ack','report:view'], engineering_lead:['request:view','request:clarify','request:approve','approval:perform','report:view'],
    lab_planner:['request:view','triage','plan','route:edit','materials:allocate','report:view'], process_engineer:['request:view','route:edit','process:develop','process:release','pfmea:edit','workinstruction:edit','report:view'],
    technician:['request:view','execution:run','evidence:add','measurement:add','report:view'], quality:['request:view','controlplan:edit','controlplan:approve','quality:disposition','release:review','approval:perform','report:approve'],
    metrology:['request:view','equipment:manage','measurement:review'], product_safety:['request:view','productsafety:approve','approval:perform'], lab_manager:['request:view','plan','priority:change','override:approve','release:approve','approval:perform','dashboard:management'],
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
  ProtoLab.audit = (state, action, objectType, objectId, previousState, newState, reason='') => {
    state.auditTrail.unshift({id:ProtoLab.uid('AUD'),timestamp:ProtoLab.now(),user:state.identity.name,role:state.identity.role,action,objectType,objectId,previousState,newState,reason});
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
  ProtoLab.getDefaultBom = productId => (ProtoLab.DEFAULT_BOMS[productId]||[]).map((x,i)=>({id:`BOM-${productId}-${i+1}`,partNumber:x[0],description:x[1],revision:x[2],qtyPerUnit:1,unit:'pcs'}));
  ProtoLab.getDefaultRoute = productId => ProtoLab.deepClone(ProtoLab.DEFAULT_ROUTES[productId]||ProtoLab.DEFAULT_ROUTES.default);
  ProtoLab.ensureMaterialRequirements = (state,r) => {
    const product=state.products.find(p=>p.id===r.productId); if(product&&!product.bom?.length) product.bom=ProtoLab.getDefaultBom(product.id);
    if(!Array.isArray(r.materialRequirements)||!r.materialRequirements.length){
      const bom=(product?.bom?.length?product.bom:ProtoLab.getDefaultBom(r.productId));
      r.materialRequirements=bom.map((b,i)=>({id:`MATREQ-${r.id}-${i+1}`,partNumber:b.partNumber,description:b.description,revision:b.revision,qtyPerUnit:Number(b.qtyPerUnit||1),requiredQty:Number(b.qtyPerUnit||1)*Number(r.quantity||1),unit:b.unit||'pcs'}));
    }
    return r.materialRequirements;
  };
  ProtoLab.ensureMaterialModel = state => {
    state.materials=state.materials||[]; state.allocations=state.allocations||[]; state.approvals=state.approvals||[]; state.bookings=state.bookings||[];
    (state.products||[]).forEach(p=>{if(!p.bom?.length)p.bom=ProtoLab.getDefaultBom(p.id);if(!p.defaultRoute?.length)p.defaultRoute=ProtoLab.getDefaultRoute(p.id);});
    const allParts=(state.products||[]).flatMap(p=>p.bom||[]);
    allParts.forEach((b,i)=>{if(!state.materials.some(m=>m.partNumber===b.partNumber&&m.revision===b.revision)){state.materials.push({id:`STOCK-${b.partNumber}-A`,partNumber:b.partNumber,description:b.description,revision:b.revision,supplier:i%3===0?'Supplier Alpha':i%3===1?'Supplier Beta':'Internal Stores',lot:`LOT-${b.partNumber.replace(/[^A-Z0-9]/gi,'').slice(-8)}-A`,quantity:80,status:'Available',certificate:`COC-${b.partNumber}-A`,specialHandling:'Standard ESD',expiry:null});state.materials.push({id:`STOCK-${b.partNumber}-B`,partNumber:b.partNumber,description:b.description,revision:b.revision,supplier:'Internal Stores',lot:`LOT-${b.partNumber.replace(/[^A-Z0-9]/gi,'').slice(-8)}-B`,quantity:30,status:'Available',certificate:`COC-${b.partNumber}-B`,specialHandling:'Standard ESD',expiry:null});}});
    (state.requests||[]).forEach(r=>ProtoLab.ensureMaterialRequirements(state,r));
    (state.allocations||[]).forEach(a=>{if(!a.requirementId){const r=state.requests.find(x=>x.id===a.requestId),m=state.materials.find(x=>x.id===a.materialId),req=r?.materialRequirements?.find(q=>q.partNumber===m?.partNumber&&q.revision===m?.revision);if(req)a.requirementId=req.id;else if(a.status==='Issued')a.status='Unmatched';}});
    return state;
  };
  ProtoLab.ensureApprovalRecords = (state,r) => {
    state.approvals=state.approvals||[];
    state.approvals.filter(a=>a.requestId===r.id).forEach(a=>{if(a.type==='Product Safety'||a.type==='Build Readiness')a.stage=a.stage||'readiness';if(['Customer / quality gate','Engineering review','Lab manager gate'].includes(a.type))a.stage=a.stage||'release';});
    const user=(role)=>state.users.find(u=>u.role===role);
    if(r.productSafety&&!state.approvals.some(a=>a.requestId===r.id&&a.type==='Product Safety')){const done=ProtoLab.GATES.indexOf(r.status)>=ProtoLab.GATES.indexOf('RELEASED');state.approvals.push({id:ProtoLab.uid('APR'),requestId:r.id,type:'Product Safety',role:'Product Safety Representative',person:user('product_safety')?.name||'Product Safety Representative',status:done?'Approved':'Pending',timestamp:done?ProtoLab.now():null,stage:'readiness',comment:done?'Migrated/seeded evidence assumed complete for already released build.':'Review product-safety relevance, special characteristics and required evidence.'});}
    const customer=state.customers?.find(c=>c.id===r.customerId);
    const map={Quality:['Customer / quality gate','Quality Engineer','quality'],Engineering:['Engineering review','Engineering Project Lead','engineering_lead'],'Lab Manager':['Lab manager gate','Lab Manager','lab_manager']};
    (customer?.requiredApprovals||[]).forEach(label=>{const x=map[label];if(!x)return;if(!state.approvals.some(a=>a.requestId===r.id&&a.type===x[0])){const done=ProtoLab.GATES.indexOf(r.status)>=ProtoLab.GATES.indexOf('RELEASED');state.approvals.push({id:ProtoLab.uid('APR'),requestId:r.id,type:x[0],role:x[1],person:user(x[2])?.name||x[1],status:done?'Approved':'Pending',timestamp:done?ProtoLab.now():null,stage:'release',comment:`Required by customer profile ${customer.name}.`});}});
    return state.approvals.filter(a=>a.requestId===r.id);
  };
  ProtoLab.controlCharacteristicReady = c => {
    const hasSpec=(c.target!==null&&c.target!==undefined&&String(c.target).trim()!==''&&String(c.target).trim()!=='Define target') || c.lsl!==null&&c.lsl!==undefined || c.usl!==null&&c.usl!==undefined;
    return !c.classification || (hasSpec&&!!String(c.method||'').trim()&&!!String(c.reactionPlan||'').trim()&&!!String(c.equipment||'').trim()&&!!String(c.evidence||'').trim());
  };
  ProtoLab.validateInvariants = state => {
    const errors=[];
    const serials=(state.serials||[]).map(s=>s.serial); if(new Set(serials).size!==serials.length) errors.push('Serial numbers are not unique.');
    (state.requests||[]).forEach(r=>{
      if(['RELEASED','DELIVERED','CLOSED'].includes(r.status)){
        const holds=(state.deviations||[]).filter(d=>d.requestId===r.id && d.releaseHold && d.status!=='CLOSED'); if(holds.length) errors.push(`${r.id} released with unresolved release hold.`);
      }
      const reqs=r.materialRequirements||[]; const alloc=(state.allocations||[]).filter(a=>a.requestId===r.id&&a.status==='Issued');
      alloc.forEach(a=>{if(a.requirementId&&!reqs.some(q=>q.id===a.requirementId))errors.push(`${r.id} has material allocation to an unknown requirement.`);});
    });
    (state.controlPlans||[]).filter(c=>c.status==='Approved').forEach(c=>{ if(!c.revision) errors.push(`${c.id} approved without revision.`); });
    (state.measurements||[]).filter(m=>m.calibrationRequired).forEach(m=>{ if(m.equipmentCalibrationStatus==='Invalid' && m.compliant===true) errors.push(`${m.id} claims compliant measurement with invalid calibration.`); });
    (state.deviations||[]).filter(d=>d.status==='CLOSED').forEach(d=>{if((d.actions||[]).some(a=>a.mandatory&&!a.closed)) errors.push(`${d.id} closed with mandatory open action.`)});
    return errors;
  };
})();
