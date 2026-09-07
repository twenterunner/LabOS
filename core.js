(function(){
  'use strict';
  const ProtoLab = window.ProtoLab = window.ProtoLab || {};
  ProtoLab.VERSION = '1.0.1-poc';
  ProtoLab.SCHEMA_VERSION = 1;
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
    engineering_requester:['request:create','request:view','delivery:ack','report:view'], engineering_lead:['request:view','request:clarify','request:approve','report:view'],
    lab_planner:['request:view','triage','plan','route:edit','materials:allocate','report:view'], process_engineer:['request:view','route:edit','process:develop','process:release','pfmea:edit','workinstruction:edit','report:view'],
    technician:['request:view','execution:run','evidence:add','measurement:add','report:view'], quality:['request:view','controlplan:edit','controlplan:approve','quality:disposition','release:review','report:approve'],
    metrology:['request:view','equipment:manage','measurement:review'], product_safety:['request:view','productsafety:approve'], lab_manager:['request:view','plan','priority:change','override:approve','release:approve','dashboard:management'],
    approver:['request:view','approval:perform'], auditor:['request:view','audit:view','report:view'], administrator:['*']
  };
  ProtoLab.can = (role,perm) => { const p=ProtoLab.PERMISSIONS[role]||[]; return p.includes('*')||p.includes(perm); };
  ProtoLab.statusClass = s => {
    const v=String(s||'').toLowerCase();
    if(/released|approved|delivered|closed|complete|ready|available|pass|verified|valid/.test(v)) return 'good';
    if(/fail|blocked|hold|scrap|expired|missing|overdue|rejected|required/.test(v)) return 'bad';
    if(/risk|pending|review|progress|development|warning|await|draft|triage/.test(v)) return 'warn';
    if(/character|plan|submitted|scheduled/.test(v)) return 'info';
    return 'neutral';
  };
  ProtoLab.status = s => `<span class="status ${ProtoLab.statusClass(s)}">${ProtoLab.escape(s)}</span>`;
  ProtoLab.audit = (state, action, objectType, objectId, previousState, newState, reason='') => {
    state.auditTrail.unshift({id:ProtoLab.uid('AUD'),timestamp:ProtoLab.now(),user:state.identity.name,role:state.identity.role,action,objectType,objectId,previousState,newState,reason});
  };
  ProtoLab.validateInvariants = state => {
    const errors=[];
    const serials=state.serials.map(s=>s.serial); if(new Set(serials).size!==serials.length) errors.push('Serial numbers are not unique.');
    state.requests.forEach(r=>{
      if(r.status==='RELEASED' || r.status==='DELIVERED' || r.status==='CLOSED'){
        const holds=state.deviations.filter(d=>d.requestId===r.id && d.releaseHold && d.status!=='CLOSED');
        if(holds.length) errors.push(`${r.id} released with unresolved release hold.`);
      }
    });
    state.controlPlans.filter(c=>c.status==='Approved').forEach(c=>{ if(!c.revision) errors.push(`${c.id} approved without revision.`); });
    state.measurements.filter(m=>m.calibrationRequired).forEach(m=>{ if(m.equipmentCalibrationStatus==='Invalid' && m.compliant===true) errors.push(`${m.id} claims compliant measurement with invalid calibration.`); });
    state.deviations.filter(d=>d.status==='CLOSED').forEach(d=>{if((d.actions||[]).some(a=>a.mandatory&&!a.closed)) errors.push(`${d.id} closed with mandatory open action.`)});
    return errors;
  };
})();
