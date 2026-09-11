const fs=require('fs');
global.window=global;global.crypto=require('crypto').webcrypto;
const root=__dirname,read=f=>fs.readFileSync(`${root}/${f}`,'utf8');
for(const f of ['core.js','demo-data.js','services.js','repository.js'])eval(read(f));
const P=global.ProtoLab,app=read('app.js'),services=read('services.js'),index=read('index.html'),css=read('styles.css');
const checks=[];
function check(name,ok,detail=''){checks.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?` | ${detail}`:''}`)}
check('Version and schema',P.VERSION==='1.0.94-poc'&&P.SCHEMA_VERSION===33,`${P.VERSION} / ${P.SCHEMA_VERSION}`);
check('Cache-busted release assets',(index.match(/1\.0\.94-r6/g)||[]).length>=6);
for(const f of ['core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js']){const r=require('child_process').spawnSync(process.execPath,['--check',`${root}/${f}`],{encoding:'utf8'});check(`JavaScript syntax · ${f}`,r.status===0,(r.stderr||'').trim().slice(0,160));}
const fresh=P.createDemoState();P.ensureEnterpriseModel(fresh);
check('Fresh state invariants',P.validateInvariants(fresh).length===0,JSON.stringify(P.validateInvariants(fresh).slice(0,3)));
check('Pipeline probability normalized',fresh.pipelineProjects.every(x=>x.probability>=0&&x.probability<=1),fresh.pipelineProjects.map(x=>x.probability).join(','));
const old=P.deepClone(fresh);old.schemaVersion=31;const migrated=P.MigrationService.migrate(old);
check('Schema 31 → 33 migration',migrated.schemaVersion===33&&P.validateInvariants(migrated).length===0,`schema ${migrated.schemaVersion}`);
check('Project-team assignments migrated',migrated.requestingTeams.some(x=>x.assignments?.length));
const team=migrated.requestingTeams.find(x=>x.assignments?.length),assignment=team?.assignments?.[0];if(assignment){assignment.identity={provider:'entra-id',subject:'future-object-id',email:'future@example.test'};check('Provider-neutral principal resolution',P.projectTeamCan(migrated,team.id,{provider:'entra-id',subject:'future-object-id'},assignment.approvalRights[0]));}
check('Grouped month/week/day calendar',app.includes('swim-calendar-month-v1094')&&app.includes('swim-calendar-week-v1094')&&app.includes('v1094IsoWeekYear')&&css.includes('.swim-calendar-day-v1094'));
check('Total days-late KPI and health filters',app.includes('data-v1094-total-late')&&app.includes('data-v1094-health-filter')&&app.includes("['all','All']"));
check('Detailed booking section removed from rendered planner',app.includes("page.querySelectorAll('details.planning-details').forEach")&&app.includes("closest('.card')?.remove()"));
check('Yellow option requires explicit acceptance',app.includes('data-v1094-approve-yellow')&&app.includes('Yellow is an active planning decision'));
check('Tiered score guard exists',app.includes('NO_PORTFOLIO_IMPROVEMENT')&&app.includes('after.objective>=before.objective'));
check('Escalation replans target then portfolio',app.includes('v1094RunEscalation')&&app.includes('v1076TargetFirstPortfolio(proposed,id)'));
check('Capacity errors are decision-safe',!services.includes('no conflict-free slot exists')&&!services.includes('multi-year future date')&&services.includes('controlled capacity-recovery decision'));
check('Bounded interval-jump search retained',services.includes('planningHorizonEnd')&&services.includes('blockingEnds')&&services.includes('nextSearchPoint'));
check('One controlled planning-task manifest is shared',typeof P.planningTaskManifest==='function'&&typeof P.planningTaskDrift==='function'&&app.includes('v1094ControlledPlanningTasks')&&app.includes('v1094AlignWorkspacePlanningTasks'));
const singles=[];for(const r of fresh.requests.filter(x=>!['DELIVERED','CLOSED','RELEASED'].includes(x.status)).slice(0,8)){const s=P.deepClone(fresh),t=Date.now();try{const changes=new P.PlannerService().autoPlan(s,r.id),audit=P.planningIntegrityAudit(s);singles.push({id:r.id,ok:audit.ok,changes:changes.length,ms:Date.now()-t})}catch(e){singles.push({id:r.id,ok:false,code:e.code,ms:Date.now()-t})}}
check('Eight representative single plans are valid',singles.every(x=>x.ok),JSON.stringify(singles));
check('Single-plan performance bounded',singles.every(x=>x.ms<2000),`${Math.max(...singles.map(x=>x.ms))} ms max`);
const aligned=P.deepClone(fresh),alignedRequest=aligned.requests.find(x=>!['DELIVERED','CLOSED','RELEASED'].includes(x.status));new P.PlannerService().autoPlan(aligned,alignedRequest.id);const manifest=P.planningTaskManifest(aligned,alignedRequest.id),planned=aligned.bookings.filter(x=>x.requestId===alignedRequest.id&&!/complete|actual|done/i.test(String(x.status||'')));
check('AUTO-PLAN exactly matches controlled task manifest',P.planningTaskDrift(aligned,alignedRequest.id).length===0&&manifest.length===planned.length,`${manifest.length} controlled tasks / ${planned.length} bookings`);
check('Manifest covers process, tests and final handover',manifest.some(x=>x.kind==='process')&&manifest.some(x=>x.kind==='test')&&manifest.at(-1)?.kind==='closeout',manifest.map(x=>`${x.order}:${x.kind}`).join(','));
const renamed=P.deepClone(aligned),renamedBooking=renamed.bookings.find(x=>x.requestId===alignedRequest.id&&x.taskType==='test');if(renamedBooking)renamedBooking.stepName='Wrong sticky-menu test';check('Fault injection detects a mislabelled test',!!renamedBooking&&P.planningTaskDrift(renamed,alignedRequest.id).some(x=>/label/.test(x)));
const missing=P.deepClone(aligned),missingTest=missing.bookings.find(x=>x.requestId===alignedRequest.id&&x.taskType==='test');if(missingTest)missing.bookings=missing.bookings.filter(x=>x.id!==missingTest.id);check('Fault injection detects a missing planned test',!!missingTest&&P.planningTaskDrift(missing,alignedRequest.id).some(x=>/Missing planned task/.test(x)));
const duplicate=P.deepClone(aligned),dupSource=duplicate.bookings.find(x=>x.requestId===alignedRequest.id&&x.taskType==='test');if(dupSource)duplicate.bookings.push({...P.deepClone(dupSource),id:'FI-DUPLICATE-TEST'});check('Fault injection detects a duplicate planned test',!!dupSource&&P.planningTaskDrift(duplicate,alignedRequest.id).some(x=>/Duplicate planned task/.test(x)));
const portfolio=P.deepClone(fresh),pt=Date.now(),results=new P.PlannerService().autoPlanPortfolio(portfolio),portfolioMs=Date.now()-pt,failed=results.filter(x=>!x.ok),portfolioAudit=P.planningIntegrityAudit(portfolio);
check('Full portfolio plans atomically',!failed.length&&results.atomicApplied===true,`${results.length} builds / ${failed.length} failed`);
check('Full portfolio passes integrity audit',portfolioAudit.ok,JSON.stringify(portfolioAudit.counts));
check('Portfolio performance bounded',portfolioMs<10000,`${portfolioMs} ms`);
const blocked=P.deepClone(fresh),target=blocked.requests.find(r=>!['DELIVERED','CLOSED','RELEASED'].includes(r.status));blocked.settings.planningHorizonDays=7;blocked.settings.planningRecoveryDays=0;blocked.planningEvents=[{id:'FI-CLOSE',type:'Lab closure',scope:'lab',start:'2025-01-01T00:00:00.000Z',end:'2029-12-31T23:59:59.000Z',active:true,reason:'fault injection'}];const before=JSON.stringify(blocked),bt=Date.now();let capacityError=null;try{new P.PlannerService().autoPlan(blocked,target.id)}catch(e){capacityError=e}
check('Capacity exhaustion returns structured blocker',capacityError?.code==='CAPACITY_UNRESOLVABLE',capacityError?.message||'no error');
check('Capacity failure is transactional',before===JSON.stringify(blocked));
check('Capacity failure is fast',Date.now()-bt<1000,`${Date.now()-bt} ms`);
check('Capacity failure does not leak raw solver output',!/no conflict-free slot|multi-year future date|best feasible/i.test(capacityError?.message||''));
const noEquipment=P.deepClone(fresh);noEquipment.equipment.forEach(e=>e.status='Retired');const neBefore=JSON.stringify(noEquipment);let equipmentError=null;try{new P.PlannerService().autoPlan(noEquipment,target.id)}catch(e){equipmentError=e}
check('Unavailable equipment is rejected safely',!!equipmentError&&['ZERO_EQUIPMENT_CAPABILITY','CAPACITY_UNRESOLVABLE'].includes(equipmentError.code),equipmentError?.code||'no error');
check('Unavailable-equipment fault rolls back',neBefore===JSON.stringify(noEquipment));
const collision=P.deepClone(fresh),booking=collision.bookings.find(x=>x.equipmentId||x.staffId);collision.bookings.push({...P.deepClone(booking),id:'FI-DUPLICATE',stepId:'FI-DUPLICATE'});const collisionAudit=P.planningIntegrityAudit(collision);
check('Injected resource collision detected',!collisionAudit.ok&&(collisionAudit.equipmentOverlaps.length+collisionAudit.staffOverlaps.length)>0,JSON.stringify(collisionAudit.counts));
const invalidTeam=P.deepClone(fresh),it=invalidTeam.requestingTeams[0];it.assignments=[{id:'BAD',userId:'U-X',identity:{provider:'local',subject:'U-X'},roleId:'not-a-role',approvalRights:['not-a-right'],active:true}];const inv=P.validateInvariants(invalidTeam);
check('Invalid team role/right detected',inv.some(x=>/unknown role/.test(x))&&inv.some(x=>/unknown approval right/.test(x)),JSON.stringify(inv));
const failedChecks=checks.filter(x=>!x.ok);console.log(`\nSUMMARY | ${checks.length-failedChecks.length}/${checks.length} passed | ${failedChecks.length} failed`);process.exitCode=failedChecks.length?1:0;
