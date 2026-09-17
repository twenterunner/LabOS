(function(P){
'use strict';
if(!P)return;
const clone=v=>P.deepClone?P.deepClone(v):JSON.parse(JSON.stringify(v));
const norm=v=>String(v??'').trim().toLowerCase();
const isoDay=v=>String(v||'').slice(0,10);
const historical=b=>P.isHistoricalPlanningBooking?.(b)||/complete|completed|actual|done|cancel|superseded/i.test(String(b?.status||''));
const overlaps=(a0,a1,b0,b1)=>{const a=new Date(a0),b=new Date(a1),c=new Date(b0),d=new Date(b1);return ![a,b,c,d].some(x=>Number.isNaN(x.getTime()))&&b>c&&a<d};
const addDays=(iso,n)=>{const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const daysBetween=(a,b)=>{if(!a||!b)return 0;return Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000)};
const closeStatus=v=>['closed','complete','completed','archived','released','delivered','cancelled'].includes(norm(v));

class PlanningEngine{
  constructor(state){this.state=state;P.ensureMultiLabModelV1099?.(state);}
  domainOf(id){return (this.state.validationProgrammes||[]).some(x=>x.id===id)?'validation':(this.state.requests||[]).some(x=>x.id===id)?'prototype':null}
  entity(id){return (this.state.validationProgrammes||[]).find(x=>x.id===id)||(this.state.requests||[]).find(x=>x.id===id)||null}
  activeLabId(){return this.state.settings?.activeLabId||this.state.settings?.primaryLabId||(this.internalLabs()[0]?.id)||null}
  internalLabs(){P.ensureMultiLabModelV1099?.(this.state);return P.internalLabsV1099?P.internalLabsV1099(this.state):(this.state.labs||[]).filter(x=>x.type==='internal'&&x.active!==false&&x.status!=='Inactive')}
  labName(id){const l=(this.state.labs||[]).find(x=>x.id===id);return l?.name||l?.code||id||'—'}
  bookingSite(b){if(b?.siteId)return b.siteId;const e=(this.state.equipment||[]).find(x=>x.id===b?.equipmentId),s=(this.state.staff||[]).find(x=>x.id===b?.staffId);if(e?.siteId)return e.siteId;if(s?.siteId)return s.siteId;const w=this.entity(b?.requestId);return w?.executionSiteId||w?.homeSiteId||this.state.settings?.primaryLabId||null}
  entitySite(w){return w?.executionSiteId||w?.homeSiteId||this.state.settings?.primaryLabId||null}
  bookings(id=null){return (this.state.bookings||[]).filter(b=>!historical(b)&&(!id||b.requestId===id))}
  openProgrammes({siteId=this.activeLabId(),domain='all'}={}){
    const atSite=new Set(this.bookings().filter(b=>!siteId||this.bookingSite(b)===siteId).map(b=>b.requestId));
    const proto=(this.state.requests||[]).filter(r=>!closeStatus(r.status)&&(!siteId||this.entitySite(r)===siteId||atSite.has(r.id))).map(x=>({id:x.id,domain:'prototype',entity:x}));
    const val=(this.state.validationProgrammes||[]).filter(p=>!p.archived&&!closeStatus(p.status)&&(!siteId||this.entitySite(p)===siteId||atSite.has(p.id))).map(x=>({id:x.id,domain:'validation',entity:x}));
    const all=[...proto,...val];return domain==='prototype'?proto:domain==='validation'?val:all;
  }
  impactedBySituation(id){
    const bs=this.bookings(id),evs=(this.state.planningEvents||[]).filter(e=>e.active!==false&&e.start&&e.end);return bs.some(b=>evs.some(e=>{if(!overlaps(b.start,b.end,e.start,e.end))return false;const sid=this.bookingSite(b);return (e.scope==='lab'&&(!e.siteId||e.siteId===sid))||(e.scope==='equipment'&&e.equipmentId===b.equipmentId)||(e.scope==='staff'&&e.staffId===b.staffId)}));
  }
  filterRows(rows,filter='all'){
    const booked=new Set(this.bookings().map(b=>b.requestId));
    if(filter==='booked')return rows.filter(r=>booked.has(r.id));
    if(filter==='validation')return rows.filter(r=>r.domain==='validation'&&booked.has(r.id));
    if(filter==='situations')return rows.filter(r=>this.impactedBySituation(r.id));
    if(filter==='late')return rows.filter(r=>{const e=r.entity;return !!(e?.forecastDate&&e?.requiredDate&&isoDay(e.forecastDate)>isoDay(e.requiredDate))});
    if(filter==='commitment')return rows.filter(r=>{const e=r.entity;return !!((e?.currentCommitmentDate&&e?.forecastDate&&isoDay(e.currentCommitmentDate)!==isoDay(e.forecastDate))||(e?.prototypeImpact&&e.prototypeImpact.oldDutAvailableDate!==e.prototypeImpact.newDutAvailableDate))});
    return rows;
  }
  rows({siteId=this.activeLabId(),domain='all',filter='all'}={}){return this.filterRows(this.openProgrammes({siteId,domain}),filter)}
  metrics({siteId=this.activeLabId(),domain='all'}={}){const all=this.openProgrammes({siteId,domain});return {all:all.length,booked:this.filterRows(all,'booked').length,validation:this.filterRows(all,'validation').length,situations:this.filterRows(all,'situations').length,late:this.filterRows(all,'late').length,commitment:this.filterRows(all,'commitment').length}}
  _forecast(state,id){const w=(state.validationProgrammes||[]).find(x=>x.id===id)||(state.requests||[]).find(x=>x.id===id),bs=(state.bookings||[]).filter(b=>b.requestId===id&&!historical(b)),last=bs.map(b=>b.end||b.start).filter(Boolean).sort().at(-1);return isoDay(last||w?.forecastDate||w?.triage?.forecastDate||'')||null}
  _result(state,id,domain,siteId){const w=(state.validationProgrammes||[]).find(x=>x.id===id)||(state.requests||[]).find(x=>x.id===id),bs=(state.bookings||[]).filter(b=>b.requestId===id&&!historical(b)),forecast=this._forecast(state,id),required=isoDay(w?.requiredDate),plannedHours=bs.reduce((n,b)=>n+Number(b.durationHours||0),0);return {ok:true,programmeId:id,domain,siteId,forecastDate:forecast,requiredDate:required||null,lateDays:required&&forecast?Math.max(0,daysBetween(required,forecast)):0,bookings:bs,bookingCount:bs.length,plannedHours,state}}
  _prototypePlan(id,{siteId,notBefore=null,manualConstraint=null}={}){
    const base=clone(this.state);P.ensureMultiLabModelV1099?.(base);const live=(base.requests||[]).find(x=>x.id===id);if(!live)throw new Error('Prototype build was not found.');const sid=siteId||live.executionSiteId||live.homeSiteId||base.settings?.activeLabId||base.settings?.primaryLabId;
    let work=P.siteScopedStateV1099?P.siteScopedStateV1099(base,sid,{includeRequestId:id,includeNetworkTasks:true}):base;const r=(work.requests||[]).find(x=>x.id===id);if(!r)throw new Error('Prototype build is outside the selected planning context.');r.executionSiteId=sid;if(notBefore)r.planningNotBefore=notBefore;
    // Whole-programme scenarios deliberately remove previous task-specific site overrides. Manual slot search keeps the whole programme at one site as well.
    r.taskSiteOverridesV1170={};
    if(manualConstraint){r.planningConstraintsV1096=clone(r.planningConstraintsV1096||{});r.planningConstraintsV1096.byTask=clone(r.planningConstraintsV1096.byTask||{});r.planningConstraintsV1096.byTask[manualConstraint.stepId]={date:manualConstraint.date,...(manualConstraint.equipmentId?{equipmentId:manualConstraint.equipmentId}:{}),...(manualConstraint.staffId?{staffId:manualConstraint.staffId}:{})};}
    const planner=new P.PlannerService();planner.autoPlan(work,id);
    let enterprise=P.mergeSitePlanningStateV1099?P.mergeSitePlanningStateV1099(base,work,sid):work;const er=(enterprise.requests||[]).find(x=>x.id===id);if(er)er.executionSiteId=sid;return this._result(enterprise,id,'prototype',sid);
  }
  _validationPlan(id,{siteId,notBefore=null,manualConstraint=null}={}){
    const work=clone(this.state);P.ensureMultiLabModelV1099?.(work);P.ensureProgrammeModelV161?.(work,{seedDemo:false});const p=(work.validationProgrammes||[]).find(x=>x.id===id);if(!p)throw new Error('Validation programme was not found.');if(!P.validationActivitiesV161?.(work,id)?.length)throw new Error('Generate the Validation programme before resource planning.');const sid=siteId||p.executionSiteId||p.homeSiteId||work.settings?.activeLabId||work.settings?.primaryLabId;p.executionSiteId=sid;if(notBefore)p.planningNotBefore=notBefore;
    const synthetic=P.validationSyntheticRequestV161(work,p);synthetic.executionSiteId=sid;synthetic.homeSiteId=p.homeSiteId||sid;synthetic.taskSiteOverridesV1170={};if(notBefore)synthetic.planningNotBefore=notBefore;
    if(manualConstraint){synthetic.planningConstraintsV1096=clone(synthetic.planningConstraintsV1096||{});synthetic.planningConstraintsV1096.byTask=clone(synthetic.planningConstraintsV1096.byTask||{});synthetic.planningConstraintsV1096.byTask[manualConstraint.stepId]={date:manualConstraint.date,...(manualConstraint.equipmentId?{equipmentId:manualConstraint.equipmentId}:{}),...(manualConstraint.staffId?{staffId:manualConstraint.staffId}:{})};}
    work.requests=(work.requests||[]).filter(x=>x.id!==id);work.requests.push(synthetic);P.ensurePlanningModel?.(work);new P.PlannerService().autoPlan(work,id);
    const generated=(work.bookings||[]).filter(b=>b.requestId===id&&!historical(b));for(const b of generated)Object.assign(b,{domain:'Validation',programmeType:'validation',validationProgrammeId:id,siteId:b.siteId||sid});const forecast=this._forecast(work,id);p.forecastDate=forecast;p.executionSiteId=sid;p.status='Planned';p.lastPlannedAt=P.now();p.lastPlannedBy=work.identity?.name||'Lab Planner';
    const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),byName=n=>generated.find(b=>normalize(b.stepName).includes(normalize(n))||normalize(n).includes(normalize(String(b.stepName||'').replace(/^test\s*·\s*/i,''))));for(const a of P.validationActivitiesV161(work,id)||[]){const b=byName(a.name);if(b){a.plannedStart=b.start;a.plannedEnd=b.end;a.equipmentId=b.equipmentId||null;a.staffId=b.staffId||null;a.siteId=b.siteId||sid}}
    // Validation is a first-class programme, not a synthetic Prototype request in persistent state.
    work.requests=(work.requests||[]).filter(x=>x.id!==id);P.syncValidationActionsV161?.(work);const liveP=(work.validationProgrammes||[]).find(x=>x.id===id);if(liveP){liveP.forecastDate=forecast;liveP.executionSiteId=sid;liveP.status='Planned';liveP.lastPlannedAt=liveP.lastPlannedAt||P.now();liveP.lastPlannedBy=liveP.lastPlannedBy||work.identity?.name||'Lab Planner'}return this._result(work,id,'validation',sid);
  }
  plan(id,{siteId=null,notBefore=null,manualConstraint=null}={}){const d=this.domainOf(id);if(!d)throw new Error('Planning programme was not found.');return d==='validation'?this._validationPlan(id,{siteId,notBefore,manualConstraint}):this._prototypePlan(id,{siteId,notBefore,manualConstraint})}
  compareLabs(id){const w=this.entity(id);if(!w)throw new Error('Programme was not found.');const currentSiteId=this.entitySite(w);const rows=this.internalLabs().map(l=>{try{const s=this.plan(id,{siteId:l.id,notBefore:w.dutAvailableDate||w.planningNotBefore||null});return {...s,name:l.name||l.id,current:l.id===currentSiteId}}catch(e){return {ok:false,programmeId:id,domain:this.domainOf(id),siteId:l.id,name:l.name||l.id,current:l.id===currentSiteId,reason:e.message,code:e.code||'PLANNING_BLOCKED'}}});return {programmeId:id,domain:this.domainOf(id),currentSiteId,rows}}
  optimizeRecovery(id){
    const entity=this.entity(id);if(!entity)throw new Error('Programme was not found.');
    const currentSiteId=this.entitySite(entity),currentForecast=isoDay(entity.forecastDate),required=isoDay(entity.requiredDate),notBefore=entity.dutAvailableDate||entity.planningNotBefore||null;
    const baselineLate=required&&currentForecast?Math.max(0,daysBetween(required,currentForecast)):null,candidates=[];
    const decorate=(sc,strategy,name,detail)=>{const newLate=required&&sc.forecastDate?Math.max(0,daysBetween(required,sc.forecastDate)):null,improvementDays=currentForecast&&sc.forecastDate?Math.max(0,daysBetween(sc.forecastDate,currentForecast)):0,improves=currentForecast?((newLate??0)<(baselineLate??0)||String(sc.forecastDate)<String(currentForecast)):true;return {...sc,strategy,name,detail,currentForecast,baselineLateDays:baselineLate,newLateDays:newLate,improvementDays,improves}};
    try{candidates.push(decorate(this.plan(id,{siteId:currentSiteId,notBefore}),'local-constrained','Local constrained replan','Re-run the current laboratory plan against live capacity, readiness and dependencies while preserving controlled manual constraints.'))}catch(e){candidates.push({ok:false,programmeId:id,domain:this.domainOf(id),siteId:currentSiteId,strategy:'local-constrained',name:'Local constrained replan',reason:e.message,code:e.code||'PLANNING_BLOCKED'})}
    // A second local scenario may release only soft/manual date-resource constraints. Explicitly
    // protected manual decisions remain locked. This is a recovery intervention, not sister-lab routing.
    const relaxedState=clone(this.state),rw=(relaxedState.validationProgrammes||[]).find(x=>x.id===id)||(relaxedState.requests||[]).find(x=>x.id===id);
    if(rw){const byTask=clone(rw.planningConstraintsV1096?.byTask||{}),protectedBy=rw.manualPlanningProtectionV126?.byTask||{},kept={};for(const [stepId,c] of Object.entries(byTask))if(protectedBy?.[stepId]?.protected===true)kept[stepId]=c;const released=Object.keys(byTask).length-Object.keys(kept).length;if(released>0){if(Object.keys(kept).length)rw.planningConstraintsV1096={...(rw.planningConstraintsV1096||{}),byTask:kept,source:'Protected manual constraints retained during recovery'};else delete rw.planningConstraintsV1096;try{const sc=new PlanningEngine(relaxedState).plan(id,{siteId:currentSiteId,notBefore});candidates.push(decorate(sc,'release-soft-constraints','Release soft manual constraints',`${released} soft manual constraint${released===1?'':'s'} released; protected decisions retained.`))}catch(e){candidates.push({ok:false,programmeId:id,domain:this.domainOf(id),siteId:currentSiteId,strategy:'release-soft-constraints',name:'Release soft manual constraints',reason:e.message,code:e.code||'PLANNING_BLOCKED'})}}}
    const seen=new Set(),rows=candidates.filter(x=>x.ok).filter(x=>{const sig=`${x.forecastDate}|${(x.bookings||[]).map(b=>`${b.stepId}:${isoDay(b.start)}:${b.equipmentId||''}:${b.staffId||''}`).join(';')}`;if(seen.has(sig))return false;seen.add(sig);return true}).sort((a,b)=>(b.improves-a.improves)||(a.newLateDays??9999)-(b.newLateDays??9999)||String(a.forecastDate||'9999').localeCompare(String(b.forecastDate||'9999')));
    return {programmeId:id,domain:this.domainOf(id),mode:'local-recovery',currentSiteId,currentForecast,requiredDate:required||null,baselineLateDays:baselineLate,rows,improvements:rows.filter(x=>x.improves),blocked:candidates.filter(x=>!x.ok)};
  }
  readinessFloor(id){const w=this.entity(id);if(!w)return P.todayISO?.()||new Date().toISOString().slice(0,10);let dates=[w.planningNotBefore,w.dutAvailableDate,w.networkTransferAvailableDate].filter(Boolean).map(isoDay);if(this.domainOf(id)==='prototype'){try{const m=P.materialPlanningAssessment?.(this.state,w);if(m?.earliestDate)dates.push(isoDay(m.earliestDate))}catch(_){}}dates=dates.filter(Boolean).sort();return dates.at(-1)||P.todayISO?.()||new Date().toISOString().slice(0,10)}
  feasibleSlots(bookingId,{horizonDays=120,maxGreen=8,maxYellow=8,maxRed=12}={}){
    const original=this.bookings().find(x=>x.id===bookingId)||(this.state.bookings||[]).find(x=>x.id===bookingId);if(!original)throw new Error('Selected planning activity no longer exists.');if(historical(original))throw new Error('Completed / historical work is locked.');const id=original.requestId,domain=this.domainOf(id),w=this.entity(id);if(!w)throw new Error('Programme was not found.');const siteId=original.siteId||this.entitySite(w),floor=this.readinessFloor(id),today=P.todayISO?.()||new Date().toISOString().slice(0,10),current=isoDay(original.start),start=[floor,today].sort().at(-1),end=addDays(start,Math.max(30,Number(horizonDays)||120)),out=[],counts={green:0,yellow:0,red:0};
    let cursor=start,attempt=0;while(cursor<=end&&attempt<92&&(counts.green<maxGreen||counts.yellow<maxYellow||counts.red<maxRed)){const d=new Date(`${cursor}T12:00:00`);cursor=addDays(cursor,1);if([0,6].includes(d.getDay())&&this.state.settings?.includeWeekendsForBuilds!==true)continue;attempt++;
      try{const sc=this.plan(id,{siteId,notBefore:w.dutAvailableDate||w.planningNotBefore||null,manualConstraint:{stepId:original.stepId,date:d.toISOString().slice(0,10)}}),moved=sc.bookings.find(b=>b.stepId===original.stepId)||sc.bookings.find(b=>norm(b.stepName)===norm(original.stepName));if(!moved||isoDay(moved.start)!==d.toISOString().slice(0,10))throw new Error('The constrained planner could not place this activity on the selected day.');const eqChanged=(moved.equipmentId||null)!==(original.equipmentId||null),staffChanged=(moved.staffId||null)!==(original.staffId||null),careBefore=(this.state.resourceCareBookings||[]).filter(c=>c.sourceRequestId===id).length,careAfter=(sc.state.resourceCareBookings||[]).filter(c=>c.sourceRequestId===id).length,kind=(!eqChanged&&!staffChanged&&careAfter<=careBefore)?'green':'yellow';if(counts[kind]<(kind==='green'?maxGreen:maxYellow)){out.push({kind,date:isoDay(moved.start),start:moved.start,end:moved.end,equipmentId:moved.equipmentId||null,staffId:moved.staffId||null,siteId:moved.siteId||siteId,equipmentName:(sc.state.equipment||[]).find(x=>x.id===moved.equipmentId)?.name||'No equipment',staffName:(sc.state.staff||[]).find(x=>x.id===moved.staffId)?.name||'Unassigned',reason:kind==='green'?'Same controlled resources remain feasible.':'Feasible with controlled resource/readiness reassignment.',scenario:sc});counts[kind]++}}
      catch(e){if(counts.red<maxRed){out.push({kind:'red',date:d.toISOString().slice(0,10),siteId,reason:e.message,code:e.code||'NOT_FEASIBLE'});counts.red++}}
    }
    return {bookingId,programmeId:id,domain,siteId,currentDate:current,floor,searchEnd:end,options:out,counts};
  }
  transferRequests(){this.state.networkTransfers=Array.isArray(this.state.networkTransfers)?this.state.networkTransfers:[];return this.state.networkTransfers}
  transferRecord(id){return this.transferRequests().find(x=>x.id===id)||null}
  requestTransfer(programmeId,toSiteId,{reason='Sister-lab execution requested',actor=null}={}){
    const entity=this.entity(programmeId);if(!entity)throw new Error('Programme was not found.');const fromSiteId=this.entitySite(entity);if(!toSiteId||toSiteId===fromSiteId)throw new Error('Choose a different internal laboratory.');
    if(this.transferRequests().some(x=>x.status==='Requested'&&x.requestId===programmeId&&x.toSiteId===toSiteId&&x.governanceModel==='unified-programme'))throw new Error('A formal transfer request to this laboratory is already awaiting a decision.');
    const comparison=this.compareLabs(programmeId),candidate=comparison.rows.find(x=>x.ok&&x.siteId===toSiteId);if(!candidate)throw new Error(comparison.rows.find(x=>x.siteId===toSiteId)?.reason||'The receiving laboratory no longer has a complete feasible plan.');
    const user=actor||this.state.identity||{},domain=this.domainOf(programmeId),rec={id:P.uid?P.uid('XFERREQ'):`XFER-${Date.now()}`,governanceModel:'unified-programme',scope:'programme',transferType:'programme',domain,requestId:programmeId,programmeId,fromSiteId,toSiteId,status:'Requested',requestStage:'receiver-acceptance',requestedAt:P.now?P.now():new Date().toISOString(),requestedBy:user.name||'Planner',requestedByRole:user.role||null,requestedByUserId:user.userId||null,rationale:String(reason||'').trim(),requestedForecast:candidate.forecastDate||null,requestedPlannedHours:Number(candidate.plannedHours||0),requestedBookingCount:Number(candidate.bookingCount||candidate.bookings?.length||0),proposalSummary:{forecastDate:candidate.forecastDate||null,bookingCount:Number(candidate.bookingCount||candidate.bookings?.length||0),plannedHours:Number(candidate.plannedHours||0),activityNames:(candidate.bookings||[]).map(b=>b.stepName||b.stepId).filter(Boolean).slice(0,40)}};
    this.transferRequests().push(rec);P.audit?.(this.state,'Sister-lab transfer requested',domain==='validation'?'Validation Programme':'Request',programmeId,fromSiteId,toSiteId,`Formal receiver acceptance required · ${rec.rationale} · ${rec.requestedBookingCount} booking(s) · requested forecast ${rec.requestedForecast||'—'}`);return rec;
  }
  acceptTransfer(recordId,{reason='Receiving laboratory accepted after live-capacity review',actor=null}={}){
    const rec=this.transferRecord(recordId);if(!rec||rec.status!=='Requested')throw new Error('This transfer request is no longer awaiting a decision.');const entity=this.entity(rec.requestId);if(!entity)throw new Error('Programme was not found.');if(this.entitySite(entity)!==rec.fromSiteId)throw new Error('The programme execution site changed after this request was created. Cancel it and create a fresh request.');
    const candidate=this.plan(rec.requestId,{siteId:rec.toSiteId,notBefore:entity.dutAvailableDate||entity.planningNotBefore||null});this.commitPlan(candidate,{action:'Sister-lab transfer accepted and plan committed',reason:`Receiver acceptance · ${reason}`});
    const live=this.transferRecord(recordId);if(!live)throw new Error('Transfer record reconciliation failed safely.');const user=actor||this.state.identity||{};Object.assign(live,{status:'Accepted',requestStage:'accepted-and-applied',acceptedAt:P.now?P.now():new Date().toISOString(),acceptedBy:user.name||'Receiver',acceptedByRole:user.role||null,receiverDecisionReason:String(reason||'').trim(),appliedForecast:this.entity(rec.requestId)?.forecastDate||candidate.forecastDate||null,appliedBookingCount:this.bookings(rec.requestId).length});
    P.audit?.(this.state,'Sister-lab transfer accepted by receiving lab',live.domain==='validation'?'Validation Programme':'Request',live.requestId,live.fromSiteId,live.toSiteId,`${live.receiverDecisionReason} · live constrained plan revalidated and applied · ${live.appliedBookingCount} booking(s)`);return live;
  }
  rejectTransfer(recordId,{reason='Receiving laboratory rejected the transfer',actor=null}={}){const rec=this.transferRecord(recordId);if(!rec||rec.status!=='Requested')throw new Error('This transfer request is no longer awaiting a decision.');const user=actor||this.state.identity||{};Object.assign(rec,{status:'Rejected',requestStage:'rejected',rejectedAt:P.now?P.now():new Date().toISOString(),rejectedBy:user.name||'Receiver',rejectedByRole:user.role||null,receiverDecisionReason:String(reason||'').trim()});P.audit?.(this.state,'Sister-lab transfer rejected by receiving lab',rec.domain==='validation'?'Validation Programme':'Request',rec.requestId,rec.fromSiteId,rec.toSiteId,`${rec.receiverDecisionReason} · live execution unchanged`);return rec}
  cancelTransfer(recordId,{reason='Sending laboratory cancelled the transfer request',actor=null}={}){const rec=this.transferRecord(recordId);if(!rec||rec.status!=='Requested')throw new Error('This transfer request is no longer awaiting a decision.');const user=actor||this.state.identity||{};Object.assign(rec,{status:'Cancelled',requestStage:'cancelled',cancelledAt:P.now?P.now():new Date().toISOString(),cancelledBy:user.name||'Sender',cancelledByRole:user.role||null,cancelReason:String(reason||'').trim()});P.audit?.(this.state,'Sister-lab transfer request cancelled',rec.domain==='validation'?'Validation Programme':'Request',rec.requestId,rec.fromSiteId,rec.toSiteId,`${rec.cancelReason} · live execution unchanged`);return rec}
  _replaceState(next){const copy=clone(next);for(const k of Object.keys(this.state))delete this.state[k];Object.assign(this.state,copy);return this.state}
  commitPlan(result,{action='Unified programme plan committed',reason='Accepted constrained planning result'}={}){
    if(!result?.ok||!result?.state)throw new Error('The planning candidate is no longer a complete feasible result.');
    const id=result.programmeId,domain=result.domain||this.domainOf(id),before=this.entity(id),beforeForecast=isoDay(before?.forecastDate)||'Unplanned';
    this._replaceState(result.state);const after=this.entity(id),afterForecast=isoDay(after?.forecastDate)||result.forecastDate||'Planned';
    P.audit?.(this.state,action,domain==='validation'?'Validation Programme':'Request',id,beforeForecast,afterForecast,`${reason} · ${this.labName(result.siteId)} · ${result.bookingCount||result.bookings?.length||0} booking(s)`);
    return {programmeId:id,domain,siteId:result.siteId,forecastDate:afterForecast,bookingCount:result.bookingCount||result.bookings?.length||0};
  }
  commitSite(id,siteId,{reason='User accepted constrained lab plan'}={}){const w=this.entity(id);if(!w)throw new Error('Programme was not found.');const r=this.plan(id,{siteId,notBefore:w.dutAvailableDate||w.planningNotBefore||null});return this.commitPlan(r,{action:siteId===this.entitySite(w)?'Programme recovery plan committed':'Sister-lab programme plan committed',reason})}
  commitSlot(option,{actor='Planner'}={}){if(!option?.scenario?.state)throw new Error('The selected slot is not a complete feasible candidate.');return this.commitPlan(option.scenario,{action:'Manual planning slot committed',reason:`${actor} · ${option.kind} slot · ${option.date} · ${option.reason||'constrained slot search'}`})}
  auditScopedState(siteId=this.activeLabId()){
    const state=this.state,sid=siteId,out=clone(state),live=this.bookings(),atSite=new Set(live.filter(b=>this.bookingSite(b)===sid).map(b=>b.requestId)),proto=(state.requests||[]).filter(r=>this.entitySite(r)===sid||atSite.has(r.id)),vals=(state.validationProgrammes||[]).filter(p=>this.entitySite(p)===sid||atSite.has(p.id)),pids=new Set(proto.map(x=>x.id)),vids=new Set(vals.map(x=>x.id)),workIds=new Set([...pids,...vids]),eq=(state.equipment||[]).filter(x=>(x.siteId||state.settings?.primaryLabId)===sid),staff=(state.staff||[]).filter(x=>(x.siteId||state.settings?.primaryLabId)===sid),eqIds=new Set(eq.map(x=>x.id)),staffIds=new Set(staff.map(x=>x.id));
    out.requests=clone(proto);out.validationProgrammes=clone(vals);out.equipment=clone(eq);out.staff=clone(staff);out.bookings=clone(live.filter(b=>workIds.has(b.requestId)&&this.bookingSite(b)===sid));out.routes=clone((state.routes||[]).filter(x=>pids.has(x.requestId)));out.serials=clone((state.serials||[]).filter(x=>pids.has(x.requestId)));out.validationSamplesV165=clone((state.validationSamplesV165||[]).filter(x=>vids.has(x.programmeId)));out.resourceCareBookings=clone((state.resourceCareBookings||[]).filter(x=>(x.siteId||((state.equipment||[]).find(e=>e.id===x.equipmentId)?.siteId)||((state.staff||[]).find(st=>st.id===x.staffId)?.siteId))===sid||eqIds.has(x.equipmentId)||staffIds.has(x.staffId)));out.calibrationCertificates=clone((state.calibrationCertificates||[]).filter(x=>eqIds.has(x.equipmentId)));out.maintenanceRecords=clone((state.maintenanceRecords||[]).filter(x=>eqIds.has(x.equipmentId)));out.trainingCertificates=clone((state.trainingCertificates||[]).filter(x=>staffIds.has(x.staffId)||staffIds.has(x.personId)));out.planningEvents=clone((state.planningEvents||[]).filter(x=>(x.siteId||((state.equipment||[]).find(e=>e.id===x.equipmentId)?.siteId)||((state.staff||[]).find(st=>st.id===x.staffId)?.siteId)||state.settings?.primaryLabId)===sid));
    for(const key of ['validationRequirements','validationLegs','validationActivities','validationResults','validationEvidence','validationReports'])if(Array.isArray(state[key]))out[key]=clone(state[key].filter(x=>vids.has(x.programmeId)));if(Array.isArray(state.validationFlowsV164))out.validationFlowsV164=clone(state.validationFlowsV164.filter(x=>vids.has(x.programmeId||x.id)));
    const text=x=>JSON.stringify(x||{}),relevant=a=>{const oid=String(a?.objectId||a?.entityId||a?.requestId||'');if(workIds.has(oid)||eqIds.has(oid)||staffIds.has(oid))return true;const s=text(a);for(const id of workIds)if(s.includes(id))return true;for(const id of eqIds)if(s.includes(id))return true;for(const id of staffIds)if(s.includes(id))return true;return a?.siteId===sid||a?.labId===sid};out.auditTrail=clone((state.auditTrail||[]).filter(relevant));out.settings={...(out.settings||{}),activeLabId:sid,_auditSiteScope:sid};return out;
  }
}
P.PlanningEngine=PlanningEngine;
P.createPlanningEngine=state=>new PlanningEngine(state);
// Canonical public planning API. Prototype and Validation callers should use these
// entry points rather than constructing domain-specific planning implementations.
P.planProgrammeV181=(state,id,options={})=>{
  const e=new PlanningEngine(state),r=e.plan(id,options);
  if(options.commit===false)return r;
  e.commitPlan(r,{action:options.action||'Unified programme plan committed',reason:options.reason||'Canonical constrained planning engine'});
  return {...r,state,forecastDate:e._forecast(state,id),bookings:e.bookings(id),bookingCount:e.bookings(id).length};
};
P.compareProgrammeLabsV181=(state,id)=>new PlanningEngine(state).compareLabs(id);
P.optimizeProgrammeRecoveryV181=(state,id)=>new PlanningEngine(state).optimizeRecovery(id);
P.findProgrammeSlotsV181=(state,bookingId,options={})=>new PlanningEngine(state).feasibleSlots(bookingId,options);
P.scopeLabV181=(state,siteId)=>new PlanningEngine(state).auditScopedState(siteId);
P.planProgrammeV183=P.planProgrammeV181;
P.compareProgrammeLabsV183=P.compareProgrammeLabsV181;
P.optimizeProgrammeRecoveryV183=P.optimizeProgrammeRecoveryV181;
P.findProgrammeSlotsV183=P.findProgrammeSlotsV181;
P.scopeLabV183=P.scopeLabV181;
P.requestProgrammeTransferV183=(state,id,toSiteId,options={})=>new PlanningEngine(state).requestTransfer(id,toSiteId,options);
P.acceptProgrammeTransferV183=(state,recordId,options={})=>new PlanningEngine(state).acceptTransfer(recordId,options);
P.rejectProgrammeTransferV183=(state,recordId,options={})=>new PlanningEngine(state).rejectTransfer(recordId,options);
P.cancelProgrammeTransferV183=(state,recordId,options={})=>new PlanningEngine(state).cancelTransfer(recordId,options);

// Stable Validation API delegates to the same canonical programme planner so
// legacy workflow entry points do not create a second planning implementation.
P.planValidationV161=(state,pid,{siteId=null,notBefore=null,commit=true}={})=>{
  const e=new PlanningEngine(state),p=e.entity(pid);if(!p||e.domainOf(pid)!=='validation')throw new Error('Validation programme was not found.');
  const beforeForecast=p.forecastDate||null,beforeCount=e.bookings(pid).length,hadPlan=beforeCount>0||!!beforeForecast;
  const result=e.plan(pid,{siteId:siteId||p.executionSiteId||p.homeSiteId||e.activeLabId(),notBefore:notBefore||p.dutAvailableDate||p.planningNotBefore||null});
  if(commit===false)return {proposal:{success:true,bookings:result.bookingCount,forecastDate:result.forecastDate,quality:'Best feasible'},bookings:clone(result.bookings),forecastDate:result.forecastDate,siteId:result.siteId,state:result.state};
  const candidate=result.state,cp=(candidate.validationProgrammes||[]).find(x=>x.id===pid);if(!cp)throw new Error('Validation planning candidate lost its programme record.');
  // Commit only this programme's planning projection into the live state. This keeps
  // existing object references valid for dependency/audit workflows while still using
  // the canonical PlanningEngine as the sole feasibility solver.
  state.bookings=(state.bookings||[]).filter(b=>b.requestId!==pid||historical(b));
  state.bookings.push(...clone((candidate.bookings||[]).filter(b=>b.requestId===pid&&!historical(b))));
  state.resourceCareBookings=(state.resourceCareBookings||[]).filter(c=>c.sourceRequestId!==pid||c.portfolioOwned===true||historical(c));
  state.resourceCareBookings.push(...clone((candidate.resourceCareBookings||[]).filter(c=>c.sourceRequestId===pid&&!historical(c))));
  for(const k of ['executionSiteId','forecastDate','planningNotBefore','status','lastPlannedAt','lastPlannedBy'])p[k]=cp[k];
  const candActs=(candidate.validationActivities||[]).filter(a=>a.programmeId===pid),liveActs=(state.validationActivities||[]).filter(a=>a.programmeId===pid),byAct=new Map(candActs.map(a=>[a.id,a]));
  for(const a of liveActs){const ca=byAct.get(a.id);if(!ca)continue;for(const k of ['plannedStart','plannedEnd','equipmentId','staffId','siteId'])a[k]=ca[k]??null}
  P.audit?.(state,hadPlan?'Validation resource plan replanned':'Validation resource plan committed','Validation Programme',pid,hadPlan?`Forecast ${beforeForecast||'Unplanned'} · ${beforeCount} active booking(s)`:'No committed Validation plan',`Forecast ${p.forecastDate||result.forecastDate||'Planned'} · ${state.bookings.filter(b=>b.requestId===pid&&!historical(b)).length} active booking(s)`, `Canonical PlanningEngine · execution ${p.executionSiteId||result.siteId} · constrained from ${notBefore||p.planningNotBefore||p.dutAvailableDate||'current availability'}`);
  P.syncValidationActionsV161?.(state);
  const liveBookings=(state.bookings||[]).filter(b=>b.requestId===pid&&!historical(b));
  return {proposal:{success:true,bookings:liveBookings.length,forecastDate:p.forecastDate||result.forecastDate,quality:'Best feasible'},bookings:clone(liveBookings),forecastDate:p.forecastDate||result.forecastDate,siteId:p.executionSiteId||result.siteId};
};
P.validationSiteOptionsV161=(state,pid)=>new PlanningEngine(state).compareLabs(pid).rows.map(r=>({siteId:r.siteId,name:r.name,feasible:!!r.ok,forecastDate:r.forecastDate||null,bookings:r.bookingCount||0,reason:r.reason||null,code:r.code||null,internal:true}));
})(window.ProtoLab);
