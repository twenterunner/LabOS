const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=__dirname;
function fakeEl(){return {innerHTML:'',textContent:'',value:'',checked:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},remove(){},click(){},focus(){},setAttribute(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){}}}
const els={};for(const k of ['#page','#mainNav','#actionCount','#roleSelect','#menuButton','#globalSearch','#searchResults','#sidebar','#toastRoot','#modalRoot','#versionBadge','.brand'])els[k]=fakeEl();
let domReady=null;const listeners={};
const document={querySelector:s=>els[s]||fakeEl(),querySelectorAll:s=>[],createElement:()=>fakeEl(),addEventListener:(ev,cb)=>{(listeners[ev]||(listeners[ev]=[])).push(cb)},body:fakeEl()};
const ctx={console,Date,Math,Intl,setTimeout:(fn)=>fn(),clearTimeout,Blob:class{},URL:{createObjectURL(){return'blob:x'},revokeObjectURL(){}},confirm(){return true},prompt(){return'1'},innerWidth:390,window:null,document,navigator:{},location:{protocol:'http:'},scrollTo(){}};ctx.window=ctx;ctx.window.addEventListener=(ev,cb)=>{if(ev==='DOMContentLoaded')domReady=cb};vm.createContext(ctx);
for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
ctx.ProtoLab.IndexedDBStorageRepository=class{async init(){return true}async load(){return ctx.ProtoLab.createDemoState()}async save(){return true}};
ctx.ProtoLab.BrowserDocumentStore=class{};
ctx.ProtoLab.DemoIdentityProvider=class{constructor(s){this.state=s}switchRole(role){const u=this.state.users.find(x=>x.role===role)||this.state.users[0];this.state.identity={userId:u.id,name:u.name,role};return this.state.identity}};
ctx.ProtoLab.MigrationService=class{static migrate(s){return s}};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');
src=src.replace("window.addEventListener('DOMContentLoaded',init);","window.__v111={App,renderWorkspace,workspaceFlow,workspaceControlPlan,workspaceExecution,workspaceCharacterisation,buildGuidedSteps,workspaceConfig};window.addEventListener('DOMContentLoaded',init);");
vm.runInContext(src,ctx,{filename:'app.js'});
let p=0,f=0;function test(name,fn){try{fn();console.log('PASS | '+name);p++}catch(e){console.error('FAIL | '+name+' | '+e.message);f++}}
(async()=>{await domReady();const T=ctx.__v111,A=T.App;A.identity.switchRole('administrator');
 const r=A.state.requests.find(x=>!x.productSafety)||A.state.requests[0];r.productSafety=false;A.workspaceId=r.id;A.currentView='workspace';
 for(const id of ['rapid','controlled','validation','production']){r.assuranceProfile=id;test(`${id} workspace renders`,()=>{const html=T.renderWorkspace();assert(html.length>1500);assert(html.includes(ctx.ProtoLab.ASSURANCE_PROFILES[id].label));assert(!/undefined/.test(html.slice(0,1000)))})}
 r.assuranceProfile='rapid';test('Rapid workflow has fewer top-level steps than validation',()=>{const a=T.buildGuidedSteps(r).length;r.assuranceProfile='validation';const b=T.buildGuidedSteps(r).length;assert(a<b,`${a} !< ${b}`)});
 r.assuranceProfile='rapid';test('Rapid route page renders editable build route',()=>{const html=T.workspaceFlow(r);assert(html.length>1200);assert(html.includes('Choose / replace route'));assert(html.includes('BUILD ROUTE'))});
 r.assuranceProfile='validation';test('Formal route page renders controlled route guidance',()=>{const html=T.workspaceFlow(r);assert(html.length>1200);assert(html.includes('BUILD ROUTE'));assert(html.includes('Validation')||html.includes('controlled'))});
 const cp=A.state.controlPlans.find(x=>x.status==='Approved');r.controlPlanId=cp.id;test('Approved Control Plan page renders revision-edit action',()=>{const html=T.workspaceControlPlan(r);assert(html.includes('Edit → new revision'));assert(html.includes(`Rev ${cp.revision}`))});
 r.assuranceProfile='rapid';test('Execution page explains optional unit identification for Rapid',()=>{const html=T.workspaceExecution(r);assert(html.includes('GUIDED BUILD EXECUTION')||html.includes('Build route complete'));assert(html.includes('Why this record exists')||html.includes('Purpose of this step record'))});
 test('Characterisation page renders without a Control Plan for Rapid',()=>{const save=r.controlPlanId;r.controlPlanId=null;const html=T.workspaceCharacterisation(r);assert(html.includes('Engineering results'));r.controlPlanId=save});
 test('Build-purpose configuration page explains assurance',()=>{const html=T.workspaceConfig(r);assert(html.includes('BUILD PURPOSE / ASSURANCE'));assert(html.includes('Engineering use'))});
 console.log(`\nRESULT: ${p} passed, ${f} failed`);process.exitCode=f?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
