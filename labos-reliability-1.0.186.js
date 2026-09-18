/* LabOS REV 1.0.186 — reliability kernel
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
// and commitment decisions now pass through the REV 1.0.186 PlanningEngine.
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
