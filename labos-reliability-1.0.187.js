/* LabOS REV 1.0.187 — reliability kernel
   Canonical domain entry points. Legacy UI routes delegate here so planning,
   workflow, readiness, reporting and learning share one state boundary. */
(function(P){
'use strict'; if(!P)return;
const clone=v=>P.deepClone?P.deepClone(v):JSON.parse(JSON.stringify(v));
const norm=v=>String(v??'').trim().toLowerCase();
const historical=b=>P.isHistoricalPlanningBooking?.(b)||/complete|completed|actual|done|cancel|superseded/i.test(String(b?.status||''));
const siteName=(state,id)=>(state.labs||[]).find(x=>x.id===id)?.name||id||'—';

// Final authoritative Validation workflow normalization. Later feature wrappers in older
// revisions could leave a Closed programme looking as if Planning were current. Closure is
// a terminal business state: preserve any historical evidence gaps for audit, but never
// present an earlier stage as current or blocked after controlled closure.
const validationWorkflowBaseV186=P.validationWorkflowStateV161;
if(validationWorkflowBaseV186){
  P.validationWorkflowStateV161=(state,p)=>{
    const out=validationWorkflowBaseV186(state,p),closed=['closed','complete','completed','archived'].includes(norm(p?.status));
    if(closed){
      out.states=(out.states||[]).map(x=>({...x,done:true,blocked:false,next:x.id==='report'?`Programme ${p.status}`:x.next}));
      out.current='report';out.complete=true;out.closed=true;
    }else out.complete=!!(out.states||[]).length&&(out.states||[]).every(x=>x.done&&!x.blocked);
    return out;
  };
}

class WorkflowStateEngineV186{
  constructor(state){this.state=state;}
  domain(id){return (this.state.validationProgrammes||[]).some(x=>x.id===id)?'validation':(this.state.requests||[]).some(x=>x.id===id)?'prototype':null}
  prototype(id){
    const r=(this.state.requests||[]).find(x=>x.id===id);if(!r)return {ok:false,domain:'prototype',id,blockers:[{code:'NOT_FOUND',reason:'Build not found.'}]};
    const material=P.materialPlanningAssessment?.(this.state,r)||null,process=P.processPlanningAssessment?.(this.state,r)||null;
    let readiness=null;try{readiness=P.ReadinessService?new P.ReadinessService(this.state).evaluate(id):null}catch(e){readiness={ready:false,issues:[{name:e.message}]}}
    const guide=P.workflowGuidanceV1170?.(this.state,id)||null,blockers=[];
    if(material&&!material.workflowReady)blockers.push(...((material.issues||material.missing||[]).map(x=>({code:'MATERIAL',reason:x.reason||x.label||x.name||String(x)}))));
    if(process&&!process.ready)blockers.push(...((process.issues||[]).map(x=>({code:'PROCESS_METHOD',reason:x.reason||x.name||String(x)}))));
    if(readiness&&!readiness.ready)blockers.push(...((readiness.issues||[]).map(x=>({code:'RESOURCE_READINESS',reason:x.reason||x.name||String(x)}))));
    return {ok:true,domain:'prototype',id,current:r.currentGate||r.status||'DRAFT REQUEST',status:r.status||null,owner:guide?.roleId||r.owner||null,nextAction:guide?.message||null,nextTab:guide?.tab||null,material,process,readiness,blockers,blocked:blockers.length>0,guide};
  }
  validation(id){
    const p=(this.state.validationProgrammes||[]).find(x=>x.id===id);if(!p)return {ok:false,domain:'validation',id,blockers:[{code:'NOT_FOUND',reason:'Validation programme not found.'}]};
    const wf=P.validationWorkflowStateV161?.(this.state,p);if(!wf)return {ok:false,domain:'validation',id,blockers:[{code:'NO_WORKFLOW',reason:'Validation workflow service unavailable.'}]};
    const blockers=(wf.states||[]).filter(x=>x.blocked).map(x=>({code:String(x.id||'WORKFLOW').toUpperCase(),reason:x.next||x.title||'Blocked',stage:x.id}));
    return {...wf,ok:true,domain:'validation',id,blocked:blockers.length>0,blockers};
  }
  get(id){const d=this.domain(id);return d==='validation'?this.validation(id):this.prototype(id)}
}

class ReadinessEngineV186{
  constructor(state){this.state=state;}
  programme(id){const d=(this.state.validationProgrammes||[]).some(x=>x.id===id)?'validation':'prototype';if(d==='prototype'){const r=(this.state.requests||[]).find(x=>x.id===id);if(!r)return {ok:false,ready:false,reasons:['Build not found.']};const material=P.materialPlanningAssessment?.(this.state,r)||{},process=P.processPlanningAssessment?.(this.state,r)||{};let resource={ready:true,issues:[]};try{resource=P.ReadinessService?new P.ReadinessService(this.state).evaluate(id):resource}catch(e){resource={ready:false,issues:[{name:e.message}]}}const reasons=[];if(material.workflowReady===false)reasons.push(material.blocker||material.reason||'Materials are not ready.');if(process.ready===false)reasons.push(process.reason||process.summary||'Process/method definition is not ready.');if(resource.ready===false)reasons.push(...(resource.issues||[]).map(x=>x.reason||x.name||String(x)));return {ok:true,domain:d,ready:reasons.length===0,material,process,resource,reasons};}
    const p=(this.state.validationProgrammes||[]).find(x=>x.id===id);if(!p)return {ok:false,ready:false,reasons:['Validation programme not found.']};const wf=new WorkflowStateEngineV186(this.state).validation(id);return {ok:true,domain:d,ready:!wf.blocked,workflow:wf,reasons:wf.blockers.map(x=>x.reason)};}
}

class ReportingEngineV186{
  constructor(state){this.state=state;}
  prototype(id,options={}){if(!P.ReportService)throw new Error('Prototype reporting service unavailable.');return new P.ReportService(this.state).build(id,options)}
  validation(id,options={}){if(!P.validationReportV161)throw new Error('Validation reporting service unavailable.');return P.validationReportV161(this.state,id,options)}
  generate(id,options={}){return (this.state.validationProgrammes||[]).some(x=>x.id===id)?this.validation(id,options):this.prototype(id,options)}
}

class LessonsEngineV186{
  constructor(state){this.state=state;}
  refresh(){P.ensureLessonsV163?.(this.state);P.ensurePreventiveLessonsV164?.(this.state);return this.state.autoLessonsV163||[]}
  forProduct(productId){this.refresh();return P.productPreventiveLessonReportV164?P.productPreventiveLessonReportV164(this.state,productId):P.productLessonReportV163?.(this.state,productId)}
  relevant(programmeId){this.refresh();const w=(this.state.validationProgrammes||[]).find(x=>x.id===programmeId)||(this.state.requests||[]).find(x=>x.id===programmeId);if(!w)return [];const productId=w.productId,productFamily=w.productFamily||null;return (this.state.autoLessonsV163||[]).filter(l=>l.sourceId!==programmeId&&(l.productId===productId||(productFamily&&l.productFamily===productFamily))).sort((a,b)=>String(b.capturedAt||'').localeCompare(String(a.capturedAt||''))).slice(0,12)}
}

class DomainKernelV186{
  constructor(state){this.state=state;this.planning=new P.PlanningEngine(state);this.workflow=new WorkflowStateEngineV186(state);this.readiness=new ReadinessEngineV186(state);this.reports=new ReportingEngineV186(state);this.lessons=new LessonsEngineV186(state)}
}
P.WorkflowStateEngineV186=WorkflowStateEngineV186;P.ReadinessEngineV186=ReadinessEngineV186;P.ReportingEngineV186=ReportingEngineV186;P.LessonsEngineV186=LessonsEngineV186;P.DomainKernelV186=DomainKernelV186;P.createDomainKernelV186=state=>new DomainKernelV186(state);P.workflowStateV186=(state,id)=>new WorkflowStateEngineV186(state).get(typeof id==='string'?id:id?.id);

// Compatibility adapters: older screens keep their UI contract, but all feasibility
// and commitment decisions now pass through the REV 1.0.187 PlanningEngine.
const oldMulti=P.MultiLabPlanningV1099||{};
P.MultiLabPlanningV1099={...oldMulti,
 compareSites(state,id){const e=new P.PlanningEngine(state),pack=e.compareLabs(id),entity=e.entity(id),required=entity?.requiredDate||null,currentForecast=entity?.forecastDate||null;const rows=pack.rows.map(r=>({...r,lab:(state.labs||[]).find(x=>x.id===r.siteId)||{id:r.siteId,name:r.name},forecast:r.forecastDate||null,plannedHours:Number(r.plannedHours||0),state:r.state||null}));return {requestId:id,programmeId:id,currentSiteId:pack.currentSiteId,homeSiteId:entity?.homeSiteId||pack.currentSiteId,requiredDate:required,currentForecast,rows,externalBenchmark:oldMulti.compareSites?(()=>{try{return oldMulti.compareSites(state,id)?.externalBenchmark||null}catch(_){return null}})():null,generatedAt:P.now?.()||new Date().toISOString()};},
 transferToSite(state,id,toSiteId,rationale='Accepted sister-lab execution'){try{const next=clone(state),e=new P.PlanningEngine(next),before=e.entity(id),from=e.entitySite(before),scenario=e.plan(id,{siteId:toSiteId,notBefore:before?.dutAvailableDate||before?.planningNotBefore||null});e.commitPlan(scenario,{action:'Sister-lab programme plan applied',reason:rationale});const record={id:P.uid?.('XFER')||`XFER-${Date.now()}`,governanceModel:'unified-programme',scope:'build',transferType:'programme',domain:e.domainOf(id),requestId:id,programmeId:id,fromSiteId:from,toSiteId,status:'Accepted',acceptedAt:P.now?.()||new Date().toISOString(),rationale,forecast:e.entity(id)?.forecastDate||scenario.forecastDate,plannedHours:Number(scenario.plannedHours||0)};return {ok:true,next,record,comparison:this.compareSites(state,id)}}catch(err){return {ok:false,error:err.message,code:err.code||'PLANNING_BLOCKED'}}}
};

const oldTask=P.MultiLabPlanningV1170||{};
P.MultiLabPlanningV1170={...oldTask,
 compareTaskSites(state,id,stepId){return new P.PlanningEngine(state).compareTaskLabs(id,stepId)},
 compareTaskSiteCandidate(state,id,stepId,toSiteId){const p=new P.PlanningEngine(state).compareTaskLabs(id,stepId);return p.rows.find(x=>x.siteId===toSiteId)||{ok:false,siteId:toSiteId,error:'No candidate returned.'}},
 applyTaskTransfer(state,id,stepId,toSiteId,rationale='Accepted sister-lab operation'){try{const next=clone(state),e=new P.PlanningEngine(next),ctx=e._taskContext(id,stepId),sc=e.planTaskAtSite(id,stepId,toSiteId);e.commitPlan(sc,{action:'Sister-lab operation plan applied',reason:rationale});const w=e.entity(id);if(w)w.taskSiteOverridesV1170={...(w.taskSiteOverridesV1170||{}),[stepId]:toSiteId};const moved=e.bookings(id).find(b=>b.stepId===stepId),record={id:P.uid?.('STEPXFER')||`STEP-${Date.now()}`,governanceModel:'unified-programme',scope:'task',transferType:'task',taskKind:ctx.task?.kind||moved?.taskKind||null,requestId:id,programmeId:id,stepId,stepName:ctx.task?.name||moved?.stepName||'Operation',fromSiteId:ctx.home,toSiteId,status:'Accepted',acceptedAt:P.now?.()||new Date().toISOString(),rationale,taskDate:String(moved?.start||'').slice(0,10),forecast:e.entity(id)?.forecastDate||sc.forecastDate,plannedHours:Number(moved?.durationHours||0)};return {ok:true,next,record,comparison:this.compareTaskSites(state,id,stepId)}}catch(err){return {ok:false,error:err.message,code:err.code||'PLANNING_BLOCKED'}}},
 clearTaskTransfer(state,id,stepId,rationale='Return operation to home laboratory'){try{const next=clone(state),w=(next.requests||[]).find(x=>x.id===id)||(next.validationProgrammes||[]).find(x=>x.id===id);if(!w)throw new Error('Programme not found.');if(w.taskSiteOverridesV1170)delete w.taskSiteOverridesV1170[stepId];const e=new P.PlanningEngine(next),scenario=e.plan(id,{siteId:e.entitySite(w),notBefore:w.dutAvailableDate||w.planningNotBefore||null});e.commitPlan(scenario,{action:'Sister-lab operation returned home',reason:rationale});return {ok:true,next}}catch(err){return {ok:false,error:err.message,code:err.code||'PLANNING_BLOCKED'}}}
};

// Architecture audit surface used by the repeatable regression harness.
P.architectureAuditV186=()=>({
 planningEngine:'PlanningEngine',workflowEngine:'WorkflowStateEngineV186',readinessEngine:'ReadinessEngineV186',reportingEngine:'ReportingEngineV186',lessonsEngine:'LessonsEngineV186',
 compatibility:{multiLabProgramme:'PlanningEngine adapter',multiLabTask:'PlanningEngine adapter',validationPlanning:'PlanningEngine delegate'},
 invariants:['scenario planning clones state','cross-lab apply requires explicit commit/acceptance','manual slot search uses PlanningEngine','day-level planning horizon is bounded']
});
})(window.ProtoLab);

/* REV 1.0.187 release-integrity recovery: canonical task demand + hard lock guard.
   This is intentionally service-level logic so Prototype, Validation, AUTO PLAN,
   manual planning, sister-lab evaluation and scenarios all consume the same rules. */
(function(P){
'use strict';
if(!P)return;
const norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const isDone=x=>!!(x?.completedAt||/complete|completed|done|skipped/i.test(String(x?.status||'')));

// One canonical task-demand projection. Explicit process-development linkage wins
// over fuzzy/library matching, and already-modelled Validation test deltas are not
// silently rematched back to a standard test during planning.
P.planningTasksForRequest=function planningTasksForRequestV186(state,requestOrId,{includeCompleted=false}={}){
  const r=typeof requestOrId==='string'?(state.requests||[]).find(x=>x.id===requestOrId):requestOrId;
  if(!r)return [];
  if(!Array.isArray(r.testRequirements)||!r.testRequirements.length)P.ensureTestRequirements?.(state,r);
  const route=(state.routes||[]).find(x=>x.requestId===r.id),tasks=[];let order=0;
  const devs=(state.processDevelopments||[]).filter(d=>d.requestId===r.id);
  const explicitByStep=new Map(devs.filter(d=>d.stepId).map(d=>[d.stepId,d]));
  const findDev=step=>{
    if(explicitByStep.has(step.id))return explicitByStep.get(step.id);
    return devs.find(d=>!d.stepId&&(d.libraryCandidate===step.processId||norm(d.name).includes(norm(step.name))||norm(step.name).includes(norm(d.name))))||null;
  };
  for(const step of (route?.steps||[]).filter(x=>!x.optional).slice().sort((a,b)=>Number(a.order||0)-Number(b.order||0))){
    if(!includeCompleted&&(isDone(step)||P.requestEvidenceSatisfiesRouteStepV133?.(state,r,step)))continue;
    const dev=findDev(step),released=dev?.status==='RELEASED'||dev?.gates?.release===true;
    const key=`PROCESS:${step.id}:${step.processId||''}:${step.processRevision||''}:${step.type||'standard'}`;
    const needsDevelopment=!!dev&&!released || (step.type!=='standard'&&!released);
    if(needsDevelopment)tasks.push({id:`DEV-${step.id}`,name:`Develop / validate ${step.name}`,kind:'development',subkind:'process-development',order:++order,definitionKey:`DEV:${key}`,routeStepId:step.id,sourceStep:step,processDevelopmentId:dev?.id||null,predecessorIds:Array.isArray(step.predecessorIds)?step.predecessorIds.slice():[]});
    const predecessorIds=[];
    if(needsDevelopment)predecessorIds.push(`DEV-${step.id}`);
    else if(Array.isArray(step.predecessorIds))predecessorIds.push(...step.predecessorIds);
    tasks.push({id:step.id,name:step.name,kind:'process',order:++order,definitionKey:key,routeStepId:step.id,sourceStep:step,processDevelopmentId:dev?.id||null,predecessorIds:[...new Set(predecessorIds)]});
  }
  for(const tr of r.testRequirements||[]){
    if(!includeCompleted&&isDone(tr))continue;
    const key=`TEST:${tr.id}:${tr.definitionKey||P.testRequirementKey?.(state,tr.name)||norm(tr.name)}`;
    const needsDevelopment=!tr.standardTestId&&tr.developmentReleased!==true;
    if(needsDevelopment)tasks.push({id:`DEV-${tr.id}`,name:`Develop test · ${tr.name}`,kind:'development',subkind:'test-development',order:++order,definitionKey:`DEV:${key}`,testRequirementId:tr.id,sourceTest:tr,predecessorIds:Array.isArray(tr.predecessorIds)?tr.predecessorIds.slice():[]});
    const predecessorIds=[];
    if(needsDevelopment)predecessorIds.push(`DEV-${tr.id}`);
    else if(Array.isArray(tr.predecessorIds))predecessorIds.push(...tr.predecessorIds);
    tasks.push({id:tr.id,name:`Test · ${tr.name}`,kind:'test',order:++order,definitionKey:key,testRequirementId:tr.id,sourceTest:tr,predecessorIds:[...new Set(predecessorIds)]});
  }
  if(!['RELEASED','DELIVERED','CLOSED','ARCHIVED'].includes(String(r.status||'').toUpperCase()))tasks.push({id:`FINAL-${r.id}`,name:'Final quality review / release / handover',kind:'closeout',order:++order,definitionKey:`CLOSEOUT:${r.id}:1`,predecessorIds:[]});
  return tasks;
};

// Preserve Validation activity dependencies in the synthetic shared-planner model.
if(P.validationSyntheticRequestV161&&!P.__validationSyntheticRequestV186Wrapped){
  const prior=P.validationSyntheticRequestV161;
  P.validationSyntheticRequestV161=function validationSyntheticRequestV186(state,p){
    const r=prior(state,p),acts=P.validationActivitiesV161?.(state,p.id)||[],tests=acts.filter(a=>a.kind==='Validation Test');
    const trByActivity=new Map();
    for(const a of tests){const tr=(r.testRequirements||[]).find(x=>norm(x.name)===norm(a.name));if(tr){tr.predecessorIds=[];tr.validationActivityId=a.id;trByActivity.set(a.id,tr)}}
    for(const a of tests){const tr=trByActivity.get(a.id);if(!tr)continue;const deps=[];for(const depId of a.predecessorIds||[]){const depAct=acts.find(x=>x.id===depId);if(!depAct)continue;if(depAct.kind==='Validation Test'){const depTr=trByActivity.get(depAct.id);if(depTr)deps.push(depTr.id)}else if(depAct.kind==='Test Development'){/* canonical DEV-test task is injected from the test requirement itself */}}
      tr.predecessorIds=[...new Set(deps)];
    }
    return r;
  };
  P.__validationSyntheticRequestV186Wrapped=true;
}

// Locked bookings are hard commitments. Any active outage that intersects a lock
// blocks replanning instead of allowing AUTO PLAN to remove/move it silently.
if(P.PlanningEngine&&!P.__planningEngineV186LockWrapped){
  const priorPlan=P.PlanningEngine.prototype.plan;
  const overlap=(a0,a1,b0,b1)=>{const a=new Date(a0),b=new Date(a1),c=new Date(b0),d=new Date(b1);return ![a,b,c,d].some(x=>Number.isNaN(x.getTime()))&&b>c&&a<d};
  P.PlanningEngine.prototype._lockedConflicts=function(programmeId){
    const locks=(this.state.bookings||[]).filter(b=>b.requestId===programmeId&&b.locked===true&&!P.isHistoricalPlanningBooking?.(b));
    const events=(this.state.planningEvents||[]).filter(e=>e.active!==false&&e.start&&e.end);
    const out=[];
    for(const b of locks){
      const site=this._bookingSiteFromState?this._bookingSiteFromState(this.state,b):(b.siteId||null);
      for(const e of events){
        if(!overlap(b.start,b.end,e.start,e.end))continue;
        const hits=(e.scope==='equipment'&&e.equipmentId&&e.equipmentId===b.equipmentId)||(e.scope==='staff'&&e.staffId&&e.staffId===b.staffId)||(e.scope==='lab'&&(!e.siteId||e.siteId===site));
        if(hits)out.push({booking:b,event:e,reason:`Locked booking ${b.stepName||b.stepId||b.id} conflicts with ${e.name||e.title||e.id||'an active planning event'}.`});
      }
    }
    return out;
  };
  P.PlanningEngine.prototype.plan=function planWithHardLocks(programmeId,options={}){
    const conflicts=this._lockedConflicts(programmeId);
    if(conflicts.length){const err=new Error(conflicts.map(x=>x.reason).join(' '));err.code='LOCKED_BOOKING_CONFLICT';err.programmeId=programmeId;err.conflicts=conflicts;throw err;}
    return priorPlan.call(this,programmeId,options);
  };
  P.__planningEngineV186LockWrapped=true;
}
})(window.ProtoLab);

/* Preserve governed "develop new/adapted test" decisions during normalisation.
   Name matching may suggest a close Standard Test, but it must not silently erase
   an explicit development delta already accepted into the programme. */
(function(P){
'use strict';
if(!P||!P.ensureTestRequirements||P.__ensureTestRequirementsV186Wrapped)return;
const prior=P.ensureTestRequirements;
const key=x=>String(x?.id||x?.name||'').toLowerCase();
P.ensureTestRequirements=function ensureTestRequirementsV186(state,r){
  const explicit=new Map((Array.isArray(r?.testRequirements)?r.testRequirements:[]).filter(x=>x&&x.standardTestId==null&&(/development required/i.test(String(x.status||''))||Number(x.developmentEstimateHours)>0||x.developmentRequired===true)).map(x=>[key(x),{
    standardTestId:null,status:x.status||'Development required',developmentEstimateHours:Number(x.developmentEstimateHours)||2,executionEstimateHours:x.executionEstimateHours,equipmentCapability:x.equipmentCapability,competency:x.competency,developmentCompetency:x.developmentCompetency,developmentReleased:x.developmentReleased===true,developmentRequired:x.developmentRequired!==false,definitionKey:x.definitionKey
  }]));
  const out=prior(state,r);
  for(const tr of r.testRequirements||[]){const keep=explicit.get(key(tr))||[...explicit.entries()].find(([k])=>k===String(tr.name||'').toLowerCase())?.[1];if(!keep)continue;Object.assign(tr,keep,{standardTestId:null});if(tr.developmentReleased!==true)tr.status='Development required';}
  return out;
};
P.__ensureTestRequirementsV186Wrapped=true;
})(window.ProtoLab);

/* Development tests keep the "develop" decision but inherit a feasible planning
   capability/skill from their closest released basis test when one is known. */
(function(P){
'use strict';
if(!P||!P.ensureTestRequirements||P.__ensureTestRequirementsBasisV186Wrapped)return;
const prior=P.ensureTestRequirements;
P.ensureTestRequirements=function ensureTestRequirementsBasisV186(state,r){
  const out=prior(state,r);
  for(const tr of r?.testRequirements||[]){
    if(tr.standardTestId!=null||!/development required/i.test(String(tr.status||'')))continue;
    const m=String(tr.definitionKey||'').match(/^STD:(.+)$/i),basis=(m?(state.standardTests||[]).find(t=>t.id===m[1]):null)||P.matchStandardTest?.(state,tr.name)||null;
    if(!basis)continue;
    tr.basisStandardTestId=tr.basisStandardTestId||basis.id;
    tr.equipmentCapability=P.planningCapabilityForTest?.(basis)||basis.planningCapability||basis.equipmentCapability||tr.equipmentCapability;
    tr.competency=basis.competency||tr.competency;
  }
  return out;
};
P.__ensureTestRequirementsBasisV186Wrapped=true;
})(window.ProtoLab);
