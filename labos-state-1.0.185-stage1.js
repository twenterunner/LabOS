(function(){
'use strict';
const P=window.ProtoLab;
if(!P)throw new Error('LabOS core must load before Stage 1 state architecture.');
const clone=P.deepClone||((x)=>JSON.parse(JSON.stringify(x)));
const isoDay=v=>{const s=String(v||'');const m=s.match(/^\d{4}-\d{2}-\d{2}/);return m?m[0]:null};
const historical=b=>P.isHistoricalPlanningBooking?P.isHistoricalPlanningBooking(b):['done','complete','completed','closed','historical','cancelled'].includes(String(b?.status||'').toLowerCase());

/* Stage 1 canonical identity context. The legacy state.identity field remains a
   compatibility projection for old Rev 185 callers; it is not the canonical
   authorization source for new services. */
class SessionContext{
  constructor({userId=null,displayName='System',role='system',labId=null,permissions=[]}={}){this.userId=userId;this.displayName=displayName||'System';this.role=role||'system';this.labId=labId||null;this.permissions=Array.from(new Set(permissions||[]));}
  static fromLegacyState(state,labId=null){const i=state?.identity||{};return new SessionContext({userId:i.userId||null,displayName:i.name||i.displayName||'System',role:i.role||'system',labId:labId||state?.settings?.activeLabId||state?.settings?.primaryLabId||null});}
  withLab(labId){return new SessionContext({...this,labId});}
  withIdentity(user){return new SessionContext({userId:user?.id||user?.userId||null,displayName:user?.name||user?.displayName||'System',role:user?.role||'system',labId:this.labId,permissions:this.permissions});}
  toLegacyIdentity(){return {userId:this.userId,name:this.displayName,role:this.role};}
}

/* One access layer for Prototype + Validation without forcing a storage merge. */
class ProgrammeRegistry{
  constructor(state){this.state=state||{};this._index=new Map();for(const x of this.state.requests||[])this._add(x,'prototype');for(const x of this.state.validationProgrammes||[])this._add(x,'validation');}
  _add(entity,domain){if(!entity?.id)return;if(this._index.has(entity.id))throw new Error(`Duplicate programme id ${entity.id}`);this._index.set(entity.id,{id:entity.id,domain,entity});}
  get(id){return this._index.get(id)||null;}
  entity(id){return this.get(id)?.entity||null;}
  domain(id){return this.get(id)?.domain||null;}
  has(id){return this._index.has(id);}
  all(){return Array.from(this._index.values());}
  executionSite(id){return this.entity(id)?.executionSiteId||null;}
  homeSite(id){return this.entity(id)?.homeSiteId||null;}
  requestedDate(id){return this.entity(id)?.requiredDate||null;}
  static validate(state){try{new ProgrammeRegistry(state);return []}catch(e){return [e.message]}}
}

const DateSemantics={
  requestedDate(state,id){return new ProgrammeRegistry(state).entity(id)?.requiredDate||null;},
  commitment(state,id){const e=new ProgrammeRegistry(state).entity(id);if(!e)return {original:null,current:null,history:[]};const h=Array.isArray(e.commitmentHistory)?e.commitmentHistory:[];const first=h.find(x=>x?.newDate)||null,last=[...h].reverse().find(x=>x?.newDate)||null;return {original:first?.newDate||e.originalCommitmentDate||null,current:last?.newDate||e.currentCommitmentDate||e.originalCommitmentDate||null,history:clone(h)};},
  forecastDate(state,id){const reg=new ProgrammeRegistry(state),rec=reg.get(id);if(!rec)return null;const bookings=(state.bookings||[]).filter(b=>b.requestId===id&&!historical(b)&&b.end);if(!bookings.length)return null;
    if(rec.domain==='prototype'&&P.currentPlanStatusV1102){const work=clone(state),r=(work.requests||[]).find(x=>x.id===id);try{const ps=P.currentPlanStatusV1102(work,r);if(ps?.active&&!ps.complete)return null;if(ps?.forecastDate)return isoDay(ps.forecastDate)}catch(_){}
    }
    const ends=bookings.map(b=>new Date(b.end)).filter(d=>!Number.isNaN(d.getTime()));if(!ends.length)return null;return new Date(Math.max(...ends.map(Number))).toISOString().slice(0,10);},
  actualDate(state,id){const e=new ProgrammeRegistry(state).entity(id);return e?.actualDeliveryDate||e?.closedAt?.slice?.(0,10)||null;},
  forProgramme(state,id){const c=this.commitment(state,id);return {requestedDate:this.requestedDate(state,id),originalCommitmentDate:c.original,currentCommitmentDate:c.current,commitmentHistory:c.history,forecastDate:this.forecastDate(state,id),actualDeliveryDate:this.actualDate(state,id)};},
  recordCommitment(state,id,newDate,{reasonCategory='',reason='',eventId=null,context=null}={}){if(!P.isStrictISODate?.(newDate))throw new Error('Commitment date must be a valid ISO date (YYYY-MM-DD).');const e=new ProgrammeRegistry(state).entity(id);if(!e)throw new Error(`Programme ${id} was not found.`);e.commitmentHistory=Array.isArray(e.commitmentHistory)?e.commitmentHistory:[];const view=this.commitment(state,id),actor=(context||SessionContext.fromLegacyState(state)).displayName||'System';if(!view.original){const row={seq:e.commitmentHistory.length+1,type:'initial',at:P.now(),oldDate:null,newDate,deltaDays:0,cumulativeDays:0,reasonCategory:'Initial commitment',reason:reason||'First lab timing commitment.',eventId:eventId||null,actor};e.commitmentHistory.push(row);e.originalCommitmentDate=newDate;e.currentCommitmentDate=newDate;return {type:'initial',changed:true,row};}if(view.current===newDate){e.originalCommitmentDate=view.original;e.currentCommitmentDate=view.current;return {type:'unchanged',changed:false};}if(!String(reasonCategory).trim()||!String(reason).trim())throw new Error('Every committed replan requires a reason category and explanation.');const deltaDays=P.daysBetween(view.current,newDate),cumulativeDays=P.daysBetween(view.original,newDate),row={seq:e.commitmentHistory.length+1,type:'replan',at:P.now(),oldDate:view.current,newDate,deltaDays,cumulativeDays,reasonCategory:String(reasonCategory).trim(),reason:String(reason).trim(),eventId:eventId||null,actor};e.commitmentHistory.push(row);e.originalCommitmentDate=view.original;e.currentCommitmentDate=newDate;return {type:'replan',changed:true,deltaDays,cumulativeDays,row};}
};

const LabOwnership={
  get(state,id){const e=new ProgrammeRegistry(state).entity(id);return e?{homeSiteId:e.homeSiteId||null,executionSiteId:e.executionSiteId||null}:null;},
  defaultForCreation(state,{productId,domain='prototype'}={}){const p=(state.products||[]).find(x=>x.id===productId);const key=domain==='validation'?'validation':domain==='failureAnalysis'?'failureAnalysis':'prototype';return p?.defaultSiteByWorkstream?.[key]||state?.settings?.primaryLabId||null;},
  assignAtCreation(state,entity,{domain='prototype',siteId=null}={}){if(!entity)throw new Error('Programme entity is required.');const chosen=siteId||this.defaultForCreation(state,{productId:entity.productId,domain});if(!chosen)throw new Error('No default laboratory is configured for this programme.');entity.homeSiteId=entity.homeSiteId||chosen;entity.executionSiteId=entity.executionSiteId||entity.homeSiteId;return entity;},
  validate(state){const ids=new Set((state.labs||[]).map(x=>x.id)),issues=[];for(const {id,entity} of new ProgrammeRegistry(state).all()){if(!entity.homeSiteId)issues.push(`${id}: homeSiteId is required`);else if(!ids.has(entity.homeSiteId))issues.push(`${id}: home lab ${entity.homeSiteId} does not exist`);if(!entity.executionSiteId)issues.push(`${id}: executionSiteId is required`);else if(!ids.has(entity.executionSiteId))issues.push(`${id}: execution lab ${entity.executionSiteId} does not exist`);}return issues;}
};

class AuditService{
  static context(state,ctx=null){if(ctx instanceof SessionContext)return ctx;return new SessionContext(ctx||SessionContext.fromLegacyState(state));}
  static append(state,{entity,action,previous=null,next=null,reason='',context=null,relatedReference=null,approvalId=null,correlationId=null,source='application'}={}){
    if(!state)throw new Error('Audit state is required.');if(!entity?.type||!entity?.id)throw new Error('Audit entity type/id is required.');if(!String(action||'').trim())throw new Error('Audit action is required.');state.auditTrail=Array.isArray(state.auditTrail)?state.auditTrail:[];const c=this.context(state,context),row={id:P.uid('AUD'),eventVersion:1,timestamp:P.now(),entity:{type:entity.type,id:entity.id},action:String(action),previous:clone(previous),next:clone(next),actor:{userId:c.userId,displayName:c.displayName,role:c.role,labId:c.labId},reason:String(reason||''),relatedReference:relatedReference||null,approvalId:approvalId||null,correlationId:correlationId||P.uid('TX'),source};
    // Legacy aliases remain until the existing Audit UI is migrated.
    Object.assign(row,{user:c.displayName,role:c.role,siteId:c.labId||null,labId:c.labId||null,objectType:entity.type,objectId:entity.id,previousState:typeof previous==='string'?previous:clone(previous),newState:typeof next==='string'?next:clone(next)});state.auditTrail.unshift(row);return row;
  }
}

class PersistenceService{
  constructor(repository){if(!repository||typeof repository.save!=='function')throw new Error('PersistenceService requires a repository.');this.repository=repository;this.identitySeed=null;}
  _captureIdentitySeed(state){if(!this.identitySeed&&state?.identity)this.identitySeed=clone(state.identity);}
  _snapshot(state){this._captureIdentitySeed(state);const snapshot=clone(state);if(this.identitySeed)snapshot.identity=clone(this.identitySeed);return snapshot;}
  _canonicalizeBoundary(state,source='load'){
    if(state==null)return {state:null,changed:false,changes:[]};
    const originalSchema=Number(state.schemaVersion||0),migrated=P.MigrationService?.migrate?P.MigrationService.migrate(state):clone(state),repair=DataRepairService.run(migrated),changed=originalSchema!==Number(repair.state.schemaVersion||0)||repair.changed;
    return {state:repair.state,changed,changes:repair.changes||[],source};
  }
  async _persistCanonicalBoundary(raw,source){
    if(raw==null)return null;this._captureIdentitySeed(raw);const canonical=this._canonicalizeBoundary(raw,source),snapshot=this._snapshot(canonical.state);
    if(canonical.changed)await this.repository.save(snapshot);
    return clone(snapshot);
  }
  async load(){return this._persistCanonicalBoundary(await this.repository.load(),'load');}
  async save(state){const snapshot=this._snapshot(state);await this.repository.save(snapshot);return snapshot;}
  async exportJSON(state){const snapshot=this._snapshot(state);return this.repository.exportJSON?this.repository.exportJSON(snapshot):JSON.stringify(snapshot);}
  async importJSON(text){if(!this.repository.importJSON)throw new Error('Repository does not support import.');const raw=await this.repository.importJSON(text);this.identitySeed=raw?.identity?clone(raw.identity):this.identitySeed;const canonical=this._canonicalizeBoundary(raw,'import'),snapshot=this._snapshot(canonical.state);await this.repository.save(snapshot);return clone(snapshot);}
  async reset(){if(!this.repository.reset)throw new Error('Repository does not support reset.');const raw=await this.repository.reset();this.identitySeed=raw?.identity?clone(raw.identity):this.identitySeed;const canonical=this._canonicalizeBoundary(raw,'reset'),snapshot=this._snapshot(canonical.state);await this.repository.save(snapshot);return clone(snapshot);}
}
function canonicalValidationIssues(state){const issues=[];issues.push(...ProgrammeRegistry.validate(state));issues.push(...LabOwnership.validate(state));if(P.validateInvariants){try{issues.push(...(P.validateInvariants(state)||[]))}catch(e){issues.push(`Invariant validation failed: ${e.message}`)}}return [...new Set(issues)];}

class StateTransactionService{
  constructor({repository,initialState,context=null}={}){this.persistence=repository instanceof PersistenceService?repository:new PersistenceService(repository);this.state=clone(initialState||{});this.context=context instanceof SessionContext?context:new SessionContext(context||SessionContext.fromLegacyState(initialState||{}));this.lastCommitted=clone(this.state);}
  validate(state){return canonicalValidationIssues(state);}
  async execute({action,entity,reason='',mutate,audit=true,context=null,relatedReference=null,approvalId=null,source='application'}={}){if(typeof mutate!=='function')throw new Error('Transaction mutate function is required.');const candidate=clone(this.state),beforeEntity=entity?.id?clone(new ProgrammeRegistry(candidate).entity(entity.id)):null;const result=await mutate(candidate);const issues=this.validate(candidate);if(issues.length){const e=new Error(`Transaction rejected: ${issues.slice(0,5).join(' | ')}`);e.issues=issues;throw e;}if(audit&&entity?.type&&entity?.id&&action){const afterEntity=clone(new ProgrammeRegistry(candidate).entity(entity.id));AuditService.append(candidate,{entity,action,previous:beforeEntity,next:afterEntity,reason,context:context||this.context,relatedReference,approvalId,source});}await this.persistence.save(candidate);this.state=candidate;this.lastCommitted=clone(candidate);return {state:this.state,result,issues:[]};}
  async adopt(candidate,{validate=true}={}){const snapshot=clone(candidate);if(validate){const issues=this.validate(snapshot);if(issues.length){const e=new Error(`State commit rejected: ${issues.slice(0,5).join(' | ')}`);e.issues=issues;throw e;}}await this.persistence.save(snapshot);this.state=candidate;this.lastCommitted=clone(candidate);return this.state;}
}

/* Deliberately explicit load-time repair service. It is separate from persistence
   and only handles canonical ownership compatibility for older snapshots. */
const DataRepairService={
  repairMultiLabMaster(state){
    const s=state,changes=[];s.settings=s.settings||{};s.labs=Array.isArray(s.labs)?s.labs:[];
    for(const seed of P.DEFAULT_LABS_V1099||[]){const hit=s.labs.find(x=>x.id===seed.id);if(hit){for(const [k,v] of Object.entries(seed))if(hit[k]===undefined){hit[k]=clone(v);changes.push(`labs:${hit.id}.${k}`)}}else{s.labs.push(clone(seed));changes.push(`labs:${seed.id}`)}}
    const internal=(s.labs||[]).filter(x=>x.type==='internal'&&x.active!==false),primary=s.settings.primaryLabId||(internal[0]?.id)||'LAB-NL';if(!s.settings.primaryLabId){s.settings.primaryLabId=primary;changes.push('settings.primaryLabId')}
    if(!s.settings.activeLabId||!internal.some(x=>x.id===s.settings.activeLabId)){s.settings.activeLabId=primary;changes.push('settings.activeLabId')}
    const validationOrder=['LAB-DE','LAB-NL','LAB-US'].filter(id=>internal.some(x=>x.id===id)),failureOrder=['LAB-US','LAB-NL','LAB-DE'].filter(id=>internal.some(x=>x.id===id));
    for(const [i,p] of (s.products||[]).entries()){p.defaultSiteByWorkstream=p.defaultSiteByWorkstream||{};if(!p.defaultSiteByWorkstream.prototype){p.defaultSiteByWorkstream.prototype=primary;changes.push(`products:${p.id}.prototype`)}if(!p.defaultSiteByWorkstream.validation){p.defaultSiteByWorkstream.validation=validationOrder[i%Math.max(1,validationOrder.length)]||primary;changes.push(`products:${p.id}.validation`)}if(!p.defaultSiteByWorkstream.failureAnalysis){p.defaultSiteByWorkstream.failureAnalysis=failureOrder[i%Math.max(1,failureOrder.length)]||primary;changes.push(`products:${p.id}.failureAnalysis`)}}
    if(!Array.isArray(s.networkTransfers)){s.networkTransfers=[];changes.push('networkTransfers')}
    return {changed:changes.length>0,changes};
  },
  repairOwnership(state){const s=state,changes=[];const labs=new Set((s.labs||[]).map(x=>x.id));for(const rec of new ProgrammeRegistry(s).all()){const e=rec.entity;if(!e.homeSiteId){const site=LabOwnership.defaultForCreation(s,{productId:e.productId,domain:rec.domain});if(site&&labs.has(site)){e.homeSiteId=site;changes.push(`${e.id}.homeSiteId`)}}if(!e.executionSiteId&&e.homeSiteId){e.executionSiteId=e.homeSiteId;changes.push(`${e.id}.executionSiteId`)}}return {changed:changes.length>0,changes};},
  repairResourceOwnership(state){const s=state,primary=s?.settings?.primaryLabId||'LAB-NL',changes=[];for(const key of ['equipment','staff','materials'])for(const x of s[key]||[])if(!x.siteId&&primary){x.siteId=primary;changes.push(`${key}:${x.id}.siteId`)}for(const c of s.trainingCertificates||[])if(!c.siteId){const site=(s.staff||[]).find(x=>x.id===c.staffId)?.siteId||primary;if(site){c.siteId=site;changes.push(`trainingCertificates:${c.id}.siteId`)}}for(const c of s.calibrationCertificates||[])if(!c.siteId){const site=(s.equipment||[]).find(x=>x.id===c.equipmentId)?.siteId||primary;if(site){c.siteId=site;changes.push(`calibrationCertificates:${c.id}.siteId`)}}return {changed:changes.length>0,changes};},
  repairOperationalOwnership(state){
    const s=state,changes=[],reg=new ProgrammeRegistry(s),equipment=new Map((s.equipment||[]).map(x=>[x.id,x])),staff=new Map((s.staff||[]).map(x=>[x.id,x])),materials=new Map((s.materials||[]).map(x=>[x.id,x]));
    const programmeSite=id=>{const e=reg.entity(id);return e?.executionSiteId||e?.homeSiteId||null};
    const resourceSite=x=>equipment.get(x?.equipmentId)?.siteId||staff.get(x?.staffId)?.siteId||null;
    for(const x of s.planningEvents||[])if(!x.siteId){const site=resourceSite(x);if(site){x.siteId=site;changes.push(`planningEvents:${x.id}.siteId`)}}
    for(const x of s.resourceCareBookings||[])if(!x.siteId){const site=resourceSite(x)||programmeSite(x.sourceRequestId||x.requestId);if(site){x.siteId=site;changes.push(`resourceCareBookings:${x.id}.siteId`)}}
    for(const x of s.bookings||[])if(!x.siteId){const site=resourceSite(x)||programmeSite(x.requestId);if(site){x.siteId=site;changes.push(`bookings:${x.id}.siteId`)}}
    for(const x of s.allocations||[])if(!x.siteId){const site=materials.get(x.materialId)?.siteId||programmeSite(x.requestId);if(site){x.siteId=site;changes.push(`allocations:${x.id}.siteId`)}}
    return {changed:changes.length>0,changes};
  },
  /* Controlled rebuild compatibility repair for pre-Stage-2 Validation graphs.
     Some persisted snapshots contain a complete Validation definition in the older
     programmeNodes/programmeEdges or validationNodes/validationEdges stores, but no
     canonical validationActivities. Stage 2 and Stage 3 intentionally consume only
     canonical activities, so hydrate that representation once at the canonical
     load/import/reset boundary. Never infer from display names. If the legacy graph
     cannot be represented without changing dependency semantics, leave it untouched
     and emit a structured integrity issue instead of guessing. */
  repairLegacyValidationStructure(state){
    const s=state,changes=[],issueSource='validation-legacy-structure',prior=(s.canonicalIntegrityIssuesV1||[]).filter(x=>x?.source!==issueSource),issues=[];
    s.validationActivities=Array.isArray(s.validationActivities)?s.validationActivities:[];s.validationLegs=Array.isArray(s.validationLegs)?s.validationLegs:[];
    const std=new Map((s.standardTests||[]).map(x=>[x.id,x])),reqs=s.validationRequirements||[],programmes=s.validationProgrammes||[];
    const schedulable=n=>{const t=String(n?.type||'').toLowerCase();return ['test','method','development','activity'].includes(t)||!!n?.standardTestId||!!n?.developmentType};
    const sortNode=(a,b)=>Number(a?.sequence??a?.order??999999)-Number(b?.sequence??b?.order??999999)||String(a?.id||'').localeCompare(String(b?.id||''));
    for(const p of programmes){
      const pid=p?.id;if(!pid||s.validationActivities.some(a=>a.programmeId===pid))continue;
      const valNodes=(s.validationNodes||[]).filter(n=>n.programmeId===pid),progNodes=(s.programmeNodes||[]).filter(n=>n.programmeId===pid),sourceNodes=valNodes.length?valNodes:progNodes;
      if(!sourceNodes.length)continue;
      const sourceKind=valNodes.length?'validationNodes':'programmeNodes',edgeStore=valNodes.length?'validationEdges':'programmeEdges',sourceEdges=(s[edgeStore]||[]).filter(e=>e.programmeId===pid),tasks=sourceNodes.filter(schedulable);
      if(!tasks.length)continue;
      const nodeMap=new Map(sourceNodes.map(n=>[n.id,n])),taskMap=new Map(tasks.map(n=>[n.id,n])),incoming=new Map(),outgoing=new Map();
      for(const e of sourceEdges){if(!e?.from||!e?.to)continue;if(!incoming.has(e.to))incoming.set(e.to,[]);incoming.get(e.to).push(e.from);if(!outgoing.has(e.from))outgoing.set(e.from,[]);outgoing.get(e.from).push(e.to)}
      const nearestPreds=(id,seen=new Set())=>{const out=[];for(const from of incoming.get(id)||[]){if(seen.has(from))continue;seen.add(from);if(taskMap.has(from))out.push(from);else if(nodeMap.has(from))out.push(...nearestPreds(from,seen))}return [...new Set(out)]};
      const predMap=new Map(tasks.map(n=>[n.id,nearestPreds(n.id)])),succMap=new Map(tasks.map(n=>[n.id,[]]));for(const [id,preds] of predMap)for(const pr of preds)if(succMap.has(pr))succMap.get(pr).push(id);
      const cross=[],complex=[];for(const n of tasks){const preds=predMap.get(n.id)||[];const x=preds.filter(pr=>taskMap.get(pr)?.legId!==n.legId);if(x.length)cross.push({activityId:n.id,predecessorIds:x});if(preds.length>1)complex.push({activityId:n.id,kind:'multiple-predecessors',ids:preds})}for(const [id,succ] of succMap)if(succ.length>1)complex.push({activityId:id,kind:'multiple-successors',ids:succ});
      if(cross.length||complex.length){issues.push({source:issueSource,code:'VALIDATION_LEGACY_STRUCTURE_UNREPRESENTABLE',severity:'warning',entityType:'ValidationProgramme',programmeId:pid,evidence:{sourceKind,crossLegDependencies:cross,complexDependencies:complex}});continue}
      const sourceLegStore=valNodes.length?'validationLegs':'programmeLegs',sourceLegs=(s[sourceLegStore]||[]).filter(l=>l.programmeId===pid),legIds=[...new Set(tasks.map(n=>n.legId).filter(Boolean))];
      const legs=legIds.map((id,i)=>{const src=sourceLegs.find(l=>l.id===id)||s.validationLegs.find(l=>l.id===id);return {id,programmeId:pid,name:src?.name||`Test Leg ${i+1}`,order:Number(src?.order||i+1),status:src?.status||'Planned',flowV164:true}}).sort((a,b)=>a.order-b.order||String(a.id).localeCompare(String(b.id)));
      if(!legs.length){issues.push({source:issueSource,code:'VALIDATION_LEGACY_STRUCTURE_NO_LEGS',severity:'warning',entityType:'ValidationProgramme',programmeId:pid,evidence:{sourceKind}});continue}
      // Build a lossless simple-chain/parallel-root flow. These are the structures
      // emitted by the historical Validation builders represented in supported snapshots.
      let representable=true;const flowLegs=[];
      for(const leg of legs){const rows=tasks.filter(n=>n.legId===leg.id).sort(sortNode),ids=new Set(rows.map(n=>n.id)),roots=rows.filter(n=>(predMap.get(n.id)||[]).filter(x=>ids.has(x)).length===0);if(!rows.length){flowLegs.push({id:leg.id,sequenceId:`SEQ-${leg.id}`,name:leg.name,nodes:[]});continue}
        const chainFrom=root=>{const out=[],visited=new Set(),walk=id=>{if(visited.has(id)){representable=false;return}visited.add(id);out.push({kind:'activity',activityId:id});const nx=(succMap.get(id)||[]).filter(x=>ids.has(x));if(nx.length>1){representable=false;return}if(nx[0])walk(nx[0])};walk(root.id);return {nodes:out,visited}};
        if(roots.length===1){const c=chainFrom(roots[0]);if(c.visited.size!==rows.length)representable=false;flowLegs.push({id:leg.id,sequenceId:`SEQ-${leg.id}`,name:leg.name,nodes:c.nodes})}
        else {const branches=[],all=new Set();for(let i=0;i<roots.length;i++){const c=chainFrom(roots[i]);for(const x of c.visited){if(all.has(x))representable=false;all.add(x)}branches.push({key:String.fromCharCode(65+i),sequenceId:`SEQ-${leg.id}-MIG-${i+1}`,name:`Migrated branch ${i+1}`,nodes:c.nodes})}if(all.size!==rows.length)representable=false;flowLegs.push({id:leg.id,sequenceId:`SEQ-${leg.id}`,name:leg.name,nodes:[{kind:'split',id:`MIG-SPLIT-${pid}-${leg.id}`,branches}]})}
      }
      if(!representable){issues.push({source:issueSource,code:'VALIDATION_LEGACY_STRUCTURE_UNREPRESENTABLE',severity:'warning',entityType:'ValidationProgramme',programmeId:pid,evidence:{sourceKind,reason:'Legacy graph is not a lossless simple-chain/parallel-root flow.'}});continue}
      const requirementIdsFor=node=>{const direct=Array.isArray(node.requirementIds)?node.requirementIds:[];const linked=reqs.filter(r=>r.programmeId===pid&&(r.linkedNodeIds||[]).includes(node.id)).map(r=>r.id);return [...new Set([...direct,...linked])].filter(Boolean)};
      const migrated=tasks.sort(sortNode).map((n,i)=>{const test=std.get(n.standardTestId),development=String(n.type||'').toLowerCase()==='method'||String(n.developmentType||'').toLowerCase().includes('method')||String(n.type||'').toLowerCase()==='development';return {id:n.id,programmeId:pid,legId:n.legId,order:Number(n.sequence??n.order??i+1),kind:development?'Test Development':'Validation Test',name:n.name||test?.name||n.id,requirementIds:requirementIdsFor(n),standardTestId:development?null:(n.standardTestId||null),basisTestId:n.basisTestId||n.standardTestId||null,estimatedHours:Number(n.latestEstimateHours??n.originalEstimateHours??n.durationHours??1)||1,actualHours:n.actualHours??null,status:n.status||n.executionStatus||'Planned',predecessorIds:[...(predMap.get(n.id)||[])],planningCapability:n.planningCapability||test?.planningCapability||null,equipmentCapability:n.equipmentCapability||test?.equipmentCapability||null,competency:n.competency||n.skillRequirement||test?.competency||null,acceptanceCriteria:n.acceptanceCriteria||test?.acceptanceCriteria||null,quantity:Number(n.dutQuantity||p.quantity||1)||1,readiness:'pending',siteId:n.executionSiteId||null,destructive:!!n.destructive,sameDutContinuation:n.dutContinuation!==false,retainedSamples:0,external:false,sisterLab:false,builderModel:'legacy-canonical-repair',flowModel:'1.0.164',canonicalMigrationV1:{source:sourceKind,sourceNodeId:n.id}}});
      s.validationActivities.push(...migrated);s.validationLegs=s.validationLegs.filter(l=>l.programmeId!==pid).concat(legs);p.validationFlowV164={version:'1.0.164',createdAt:p.createdAt||new Date(0).toISOString(),updatedAt:p.updatedAt||p.createdAt||new Date(0).toISOString(),legs:flowLegs};
      const migratedIds=new Set(migrated.map(a=>a.id));for(const r of reqs.filter(r=>r.programmeId===pid)){const fromNodes=(r.linkedNodeIds||[]).filter(id=>migratedIds.has(id));if(fromNodes.length){const next=[...new Set([...(r.linkedActivityIds||[]),...fromNodes])];if(JSON.stringify(next)!==JSON.stringify(r.linkedActivityIds||[])){r.linkedActivityIds=next;changes.push(`validationRequirements:${r.id}.linkedActivityIds`)}}}
      changes.push(`validationActivities:${pid}:migrated-from-${sourceKind}`,`validationLegs:${pid}:canonicalized`,`validationProgrammes:${pid}.validationFlowV164`);
    }
    const nextIssues=[...prior,...issues],had=Array.isArray(s.canonicalIntegrityIssuesV1);if(had||nextIssues.length){const before=JSON.stringify(s.canonicalIntegrityIssuesV1||[]),after=JSON.stringify(nextIssues);if(before!==after){s.canonicalIntegrityIssuesV1=nextIssues;changes.push('canonicalIntegrityIssuesV1')}}
    return {changed:changes.length>0,changes,issues};
  },
  /* Stage-3 acceptance continuity repair. Historical Validation planning used a
     synthetic TESTREQ-<programme>-<standard-test> identity before Stage 2 made
     Validation activity IDs stable end-to-end. Repair only deterministic legacy
     references at the canonical load/import/reset boundary. Never guess from a
     display name: ambiguous/unresolved rows remain untouched and are recorded as
     structured integrity issues for diagnosis. */
  repairValidationBookingIdentity(state){
    const s=state,changes=[],issueSource='validation-booking-identity',prior=(s.canonicalIntegrityIssuesV1||[]).filter(x=>x?.source!==issueSource),issues=[];
    const programmes=new Set((s.validationProgrammes||[]).map(x=>x.id)),activitiesByProgramme=new Map();
    for(const a of s.validationActivities||[]){if(!a?.programmeId)continue;if(!activitiesByProgramme.has(a.programmeId))activitiesByProgramme.set(a.programmeId,[]);activitiesByProgramme.get(a.programmeId).push(a)}
    const replaceRef=(pid,oldId,newId)=>{
      for(const x of s.siteAssignmentsV3||[])if(x.programmeId===pid&&x.taskId===oldId){x.taskId=newId;changes.push(`siteAssignmentsV3:${x.id}.taskId`)}
      for(const x of s.networkTransfers||[]){if(x.programmeId!==pid)continue;if(x.taskId===oldId){x.taskId=newId;changes.push(`networkTransfers:${x.id}.taskId`)}if(x.stepId===oldId){x.stepId=newId;changes.push(`networkTransfers:${x.id}.stepId`)}if(x.scope?.taskIds?.includes?.(oldId)){x.scope.taskIds=x.scope.taskIds.map(id=>id===oldId?newId:id);changes.push(`networkTransfers:${x.id}.scope.taskIds`)}}
      const vp=(s.validationProgrammes||[]).find(x=>x.id===pid),byTask=vp?.planningConstraintsV1096?.byTask;if(byTask&&Object.prototype.hasOwnProperty.call(byTask,oldId)&&!Object.prototype.hasOwnProperty.call(byTask,newId)){byTask[newId]=byTask[oldId];delete byTask[oldId];changes.push(`validationProgrammes:${pid}.planningConstraintsV1096.byTask`)}
    };
    for(const b of s.bookings||[]){
      if(!b?.requestId||!programmes.has(b.requestId)||historical(b))continue;const pid=b.requestId,acts=activitiesByProgramme.get(pid)||[];if(!acts.length)continue;
      const exact=acts.find(a=>a.id===b.stepId);if(exact){const key=`VALIDATION:${exact.id}`;if(b.taskDefinitionKey!==key){b.taskDefinitionKey=key;changes.push(`bookings:${b.id}.taskDefinitionKey`)}if(b.validationProgrammeId!==pid){b.validationProgrammeId=pid;changes.push(`bookings:${b.id}.validationProgrammeId`)}if(String(b.domain||'').toLowerCase()!=='validation'){b.domain='Validation';changes.push(`bookings:${b.id}.domain`)}continue}
      const candidates=new Map(),add=(a,reason)=>{if(a)candidates.set(a.id,{activity:a,reason})};
      const keyMatch=String(b.taskDefinitionKey||'').match(/^VALIDATION:(.+)$/);if(keyMatch)add(acts.find(a=>a.id===keyMatch[1]),'taskDefinitionKey');
      for(const ref of [b.validationActivityId,b.activityId,b.sourceActivityId])if(ref)add(acts.find(a=>a.id===ref),'explicitActivityReference');
      const prefix=`TESTREQ-${pid}-`,legacyRef=String(b.stepId||'');if(legacyRef.startsWith(prefix)){const testId=legacyRef.slice(prefix.length),matches=acts.filter(a=>a.standardTestId===testId||a.basisTestId===testId);for(const a of matches)add(a,'legacySyntheticTestRequirement')}
      /* Later pre-canonical Validation planners also emitted custom TESTREQ/DEV-TESTREQ
         booking ids.  Those rows often retain an exact stable requirement id in their
         structured booking metadata even though the activity id itself was synthetic.
         Requirement identity + task kind + graph genealogy is safe to use; a display
         label by itself is not.  Parallel/custom branches without an unambiguous
         canonical requirement/kind target deliberately remain unresolved. */
      const reqRows=(s.validationRequirements||[]).filter(r=>r.programmeId===pid),structured=[b.requirementId,b.validationRequirementId,...(Array.isArray(b.requirementIds)?b.requirementIds:[]),b.stepId,b.taskDefinitionKey,b.description,b.stepName].filter(Boolean).map(String),explicitReqs=new Set();
      for(const r of reqRows){if(structured.some(v=>v===r.id||v.includes(r.id)))explicitReqs.add(r.id)}
      const bookingKind=/development/i.test(String(b.taskKind||b.taskType||''))?'development':/closeout|final/i.test(String(b.taskKind||b.taskType||''))?'closeout':'test',parallelSignal=structured.some(v=>/parallel/i.test(v));
      if(explicitReqs.size===1&&!parallelSignal&&bookingKind!=='closeout'){
        const reqId=[...explicitReqs][0],linked=new Set(reqRows.find(r=>r.id===reqId)?.linkedActivityIds||[]),kindMatches=acts.filter(a=>(a.requirementIds||[]).includes(reqId)||linked.has(a.id)).filter(a=>bookingKind==='development'?/development/i.test(String(a.kind||'')):!/development/i.test(String(a.kind||'')));
        if(kindMatches.length===1)add(kindMatches[0],'stableRequirementAndTaskKind');else if(kindMatches.length>1)for(const a of kindMatches)add(a,'stableRequirementAndTaskKind');
      }
      const rows=[...candidates.values()];if(rows.length===1){const a=rows[0].activity,oldId=b.stepId;b.stepId=a.id;b.taskDefinitionKey=`VALIDATION:${a.id}`;b.validationProgrammeId=pid;b.domain='Validation';b.programmeType='validation';if(!b.taskKind)b.taskKind=/development/i.test(String(a.kind||''))?'development':'test';replaceRef(pid,oldId,a.id);changes.push(`bookings:${b.id}.stepId:${oldId}->${a.id}`);continue}
      issues.push({source:issueSource,code:rows.length>1?'VALIDATION_BOOKING_ACTIVITY_AMBIGUOUS':'VALIDATION_BOOKING_ACTIVITY_UNRESOLVED',severity:'warning',entityType:'Booking',bookingId:b.id||null,programmeId:pid,legacyStepId:b.stepId||null,candidateActivityIds:rows.map(x=>x.activity.id).sort(),evidence:{taskDefinitionKey:b.taskDefinitionKey||null,validationActivityId:b.validationActivityId||b.activityId||b.sourceActivityId||null}})
    }
    const nextIssues=[...prior,...issues],hadIssueRegistry=Array.isArray(s.canonicalIntegrityIssuesV1);if(hadIssueRegistry||nextIssues.length){const before=JSON.stringify(s.canonicalIntegrityIssuesV1||[]),after=JSON.stringify(nextIssues);if(before!==after){s.canonicalIntegrityIssuesV1=nextIssues;changes.push('canonicalIntegrityIssuesV1')}}
    return {changed:changes.length>0,changes,issues};
  },
  run(state){const out=clone(state),a=this.repairMultiLabMaster(out),b=this.repairResourceOwnership(out),c=this.repairOwnership(out),d=this.repairOperationalOwnership(out),e=this.repairLegacyValidationStructure(out),f=this.repairValidationBookingIdentity(out);return {state:out,changed:a.changed||b.changed||c.changed||d.changed||e.changed||f.changed,changes:[...a.changes,...b.changes,...c.changes,...d.changes,...e.changes,...f.changes],issues:[...(e.issues||[]),...(f.issues||[])]};}
};
function siteScopedPure(state,siteId,{includeRequestId=null,includeNetworkTasks=false}={}){
  const out=clone(state),sid=siteId||state?.settings?.primaryLabId||(state?.labs||[]).find(x=>x.type==='internal'&&x.active!==false)?.id||'LAB-NL';
  if(includeRequestId){const t=(out.requests||[]).find(r=>r.id===includeRequestId);if(t)t.executionSiteId=sid;}
  const homeRequestIds=new Set((out.requests||[]).filter(r=>(r.executionSiteId||r.homeSiteId||P.productDefaultSiteV1099?.(out,r.productId,P.workstreamForRequestV1099?.(r)||'prototype'))===sid).map(r=>r.id));
  if(includeRequestId)homeRequestIds.add(includeRequestId);
  const incomingRequestIds=new Set();if(includeNetworkTasks)for(const b of out.bookings||[]){if(P.isHistoricalPlanningBooking?.(b))continue;if(b.siteId===sid&&!homeRequestIds.has(b.requestId))incomingRequestIds.add(b.requestId)}
  const requestIds=new Set([...homeRequestIds,...incomingRequestIds]);out.requests=(out.requests||[]).filter(r=>requestIds.has(r.id));for(const r of out.requests||[])if(incomingRequestIds.has(r.id)&&!homeRequestIds.has(r.id))r.networkSupportOnlyV124=true;
  const eqIds=new Set((out.equipment||[]).filter(e=>e.siteId===sid).map(e=>e.id)),staffIds=new Set((out.staff||[]).filter(st=>st.siteId===sid).map(st=>st.id)),matIds=new Set((out.materials||[]).filter(m=>m.siteId===sid).map(m=>m.id));
  const visibleBookingRows=(out.bookings||[]).filter(b=>{if(!requestIds.has(b.requestId))return false;if(!includeNetworkTasks)return (!b.equipmentId||eqIds.has(b.equipmentId))&&(!b.staffId||staffIds.has(b.staffId));if(homeRequestIds.has(b.requestId))return true;return b.siteId===sid||eqIds.has(b.equipmentId)||staffIds.has(b.staffId)});
  const referencedEqIds=new Set(visibleBookingRows.map(b=>b.equipmentId).filter(Boolean)),referencedStaffIds=new Set(visibleBookingRows.map(b=>b.staffId).filter(Boolean));
  out.equipment=(out.equipment||[]).filter(e=>eqIds.has(e.id)||(includeNetworkTasks&&referencedEqIds.has(e.id)));out.staff=(out.staff||[]).filter(st=>staffIds.has(st.id)||(includeNetworkTasks&&referencedStaffIds.has(st.id)));out.materials=(out.materials||[]).filter(m=>matIds.has(m.id));
  out.routes=(out.routes||[]).filter(x=>requestIds.has(x.requestId));out.processDevelopments=(out.processDevelopments||[]).filter(x=>!x.requestId||requestIds.has(x.requestId));out.controlPlans=(out.controlPlans||[]).filter(x=>!x.buildRequestId&&!(x.requestIds||[]).length||x.buildRequestId&&requestIds.has(x.buildRequestId)||(x.requestIds||[]).some(id=>requestIds.has(id)));
  for(const key of ['pfmea','serials','measurements','deviations','approvals','actions','documents','lessons','commitmentDecisions','lessonDecisions'])if(Array.isArray(out[key]))out[key]=out[key].filter(x=>!x.requestId||requestIds.has(x.requestId));
  out.allocations=(out.allocations||[]).filter(a=>requestIds.has(a.requestId));out.bookings=visibleBookingRows;out.resourceCareBookings=(out.resourceCareBookings||[]).filter(b=>b.siteId===sid||eqIds.has(b.equipmentId)||staffIds.has(b.staffId)||homeRequestIds.has(b.sourceRequestId));out.trainingCertificates=(out.trainingCertificates||[]).filter(c=>staffIds.has(c.staffId)||(includeNetworkTasks&&referencedStaffIds.has(c.staffId)));out.calibrationCertificates=(out.calibrationCertificates||[]).filter(c=>eqIds.has(c.equipmentId)||(includeNetworkTasks&&referencedEqIds.has(c.equipmentId)));out.planningEvents=(out.planningEvents||[]).filter(ev=>ev.siteId===sid||eqIds.has(ev.equipmentId)||staffIds.has(ev.staffId));
  out.settings=out.settings||{};out.settings.activeLabId=sid;out.settings._planningSiteIdV1099=sid;out.settings._networkTaskViewV124=!!includeNetworkTasks;return out;
}
function networkMetricsPure(state){const rows=state?.networkTransfers||[],accepted=rows.filter(x=>x.status==='Accepted'),buildMoves=accepted.filter(x=>x.scope!=='task'&&x.fromSiteId!==x.toSiteId),taskMoves=accepted.filter(x=>x.scope==='task'&&x.fromSiteId!==x.toSiteId);return {sisterLabBuilds:buildMoves.length,sisterLabOperations:taskMoves.length,sisterLabTests:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='test').length,sisterLabProcessSteps:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='process').length,sisterLabDevelopmentSteps:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='development').length,sisterLabCloseoutSteps:taskMoves.filter(x=>String(x.taskKind||'').toLowerCase()==='closeout').length,recoveryTransfers:buildMoves.filter(x=>(x.transferMode||'recovery')==='recovery').length,electiveTransfers:buildMoves.filter(x=>x.transferMode==='elective').length,internallyRetainedHours:accepted.reduce((n,x)=>n+Number(x.plannedHours||0),0),outsourcingAvoided:accepted.reduce((n,x)=>n+Number(x.avoidedExternalCost||0),0),externalSpend:rows.filter(x=>x.status==='External').reduce((n,x)=>n+Number(x.externalCost||0),0)};}
function invariantIsolation(state){const work={...state};for(const key of ['settings','labs','products','equipment','staff','materials','trainingCertificates','calibrationCertificates','requests','bookings','resourceCareBookings','planningEvents','allocations','networkTransfers','developmentHistory'])if(state?.[key]!==undefined)work[key]=clone(state[key]);return work;}
function validationIsolation(state,id){
  const work={...state},match=x=>x&&(x.id===id||x.programmeId===id||x.validationProgrammeId===id||x.requestId===id||x.sourceProgrammeId===id),acts=(state.validationActivities||[]).filter(x=>x.programmeId===id),actIds=new Set(acts.map(x=>x.id)),legIds=new Set((state.validationLegs||[]).filter(x=>x.programmeId===id).map(x=>x.id));
  work.validationProgrammes=(state.validationProgrammes||[]).map(x=>x.id===id?clone(x):x);work.validationActivities=(state.validationActivities||[]).map(x=>x.programmeId===id?clone(x):x);work.validationLegs=(state.validationLegs||[]).map(x=>x.programmeId===id?clone(x):x);
  for(const key of ['validationRequirements','validationReports','validationResults','validationEvidence','validationSamplesV165','validationDependencyHistoryV173','validationLessonCandidates'])if(Array.isArray(state[key]))work[key]=state[key].map(x=>(match(x)||actIds.has(x.activityId)||legIds.has(x.legId))?clone(x):x);
  if(Array.isArray(state.bookings))work.bookings=state.bookings.map(x=>x.requestId===id?clone(x):x);return work;
}
const StateSelectors={programme(state,id){const rec=new ProgrammeRegistry(state).get(id);return rec?{id:rec.id,domain:rec.domain,entity:clone(rec.entity),dates:DateSemantics.forProgramme(state,id),ownership:LabOwnership.get(state,id)}:null;},scopeLab(state,siteId,options={}){return siteScopedPure(state,siteId,options);}};

/* Capture mutating Rev 185 query implementations once, then expose pure public query APIs. */
P.__stage1LegacySiteScoped=P.__stage1LegacySiteScoped||P.siteScopedStateV1099;P.__stage1LegacyNetworkMetrics=P.__stage1LegacyNetworkMetrics||P.networkMetricsV1099;P.__stage1LegacyValidateInvariants=P.__stage1LegacyValidateInvariants||P.validateInvariants;P.__stage1LegacyValidationWorkflow=P.__stage1LegacyValidationWorkflow||P.validationWorkflowStateV161;
P.siteScopedStateV1099=(state,siteId,options={})=>siteScopedPure(state,siteId,options);P.networkMetricsV1099=state=>networkMetricsPure(state);if(P.__stage1LegacyValidateInvariants)P.validateInvariants=state=>P.__stage1LegacyValidateInvariants(invariantIsolation(state));if(P.__stage1LegacyValidationWorkflow)P.validationWorkflowStateV161=(state,programmeOrId)=>{const id=typeof programmeOrId==='string'?programmeOrId:programmeOrId?.id,work=validationIsolation(state,id),p=(work.validationProgrammes||[]).find(x=>x.id===id)||clone(programmeOrId);return P.__stage1LegacyValidationWorkflow(work,p)};

/* Enterprise-ready audit becomes canonical; all legacy callers transparently
   receive the richer event shape without changing their screen code. */
P.__stage1LegacyAudit=P.__stage1LegacyAudit||P.audit;
P.audit=(state,action,objectType,objectId,previousState,newState,reason='')=>AuditService.append(state,{entity:{type:objectType||'Entity',id:objectId||'unknown'},action,previous:previousState,next:newState,reason,context:SessionContext.fromLegacyState(state),source:'legacy-adapter'});
P.__stage1LegacyRecordCommitment=P.__stage1LegacyRecordCommitment||P.recordCommitment;
P.recordCommitment=(state,programmeOrId,newDate,opts={})=>DateSemantics.recordCommitment(state,typeof programmeOrId==='string'?programmeOrId:programmeOrId?.id,newDate,{...opts,context:opts.context||SessionContext.fromLegacyState(state)});

const LegacyDemoIdentityProvider=P.DemoIdentityProvider;
class Stage1DemoIdentityProvider{
  constructor(state,session=null){this.state=state;this.session=session instanceof SessionContext?session:SessionContext.fromLegacyState(state);this.state.identity=this.session.toLegacyIdentity();}
  currentUser(){return this.session.toLegacyIdentity();}
  switchRole(role){const user=(this.state.users||[]).find(u=>u.role===role)||(this.state.users||[])[0];if(!user)throw new Error('No demo identity is available.');Object.assign(this.session,this.session.withIdentity(user));this.state.identity=this.session.toLegacyIdentity();return this.currentUser();}
  switchLab(labId){Object.assign(this.session,this.session.withLab(labId));return this.currentUser();}
}
P.LegacyDemoIdentityProvider=LegacyDemoIdentityProvider;
P.DemoIdentityProvider=Stage1DemoIdentityProvider;

P.SessionContext=SessionContext;
P.ProgrammeRegistry=ProgrammeRegistry;
P.DateSemantics=DateSemantics;
P.LabOwnership=LabOwnership;
P.AuditService=AuditService;
P.PersistenceService=PersistenceService;
P.StateTransactionService=StateTransactionService;
P.DataRepairService=DataRepairService;
P.StateSelectors=StateSelectors;
P.canonicalStateIssues=canonicalValidationIssues;
P.STAGE1_STATE_ARCHITECTURE='1.0.185-S1RC2';
})();
