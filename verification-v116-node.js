const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=__dirname;
function fakeEl(){return {innerHTML:'',textContent:'',value:'',checked:false,files:[],style:{},dataset:{},className:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},remove(){},click(){},focus(){},setAttribute(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){}}}
const els={};for(const k of ['#page','#mainNav','#actionCount','#roleSelect','#menuButton','#globalSearch','#searchResults','#sidebar','#toastRoot','#modalRoot','#versionBadge','.brand'])els[k]=fakeEl();
let domReady=null;const document={querySelector:s=>els[s]||fakeEl(),querySelectorAll:s=>[],createElement:()=>fakeEl(),addEventListener(){},body:fakeEl()};
const ctx={console,Date,Math,Intl,setTimeout:(fn)=>fn(),clearTimeout,Blob:class{},URL:{createObjectURL(){return'blob:x'},revokeObjectURL(){}},confirm(){return true},prompt(){return'1'},innerWidth:390,window:null,document,navigator:{},location:{protocol:'http:'},scrollTo(){}};ctx.window=ctx;ctx.window.addEventListener=(ev,cb)=>{if(ev==='DOMContentLoaded')domReady=cb};vm.createContext(ctx);
for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
ctx.ProtoLab.IndexedDBStorageRepository=class{async init(){return true}async load(){return ctx.ProtoLab.createDemoState()}async save(){return true}};
ctx.ProtoLab.BrowserDocumentStore=class{};ctx.ProtoLab.DemoIdentityProvider=class{constructor(s){this.state=s}switchRole(role){const u=this.state.users.find(x=>x.role===role)||this.state.users[0];this.state.identity={userId:u.id,name:u.name,role};return this.state.identity}};ctx.ProtoLab.MigrationService=class{static migrate(s){return s}};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');src=src.replace("window.addEventListener('DOMContentLoaded',init);","window.__v116={App,renderActionCentre,actionItem,actionResolutionModel,PROCESS_DEV_GUIDANCE,PROCESS_DEV_GATES,workspaceOverview};window.addEventListener('DOMContentLoaded',init);");vm.runInContext(src,ctx,{filename:'app.js'});
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8'),index=fs.readFileSync(path.join(root,'index.html'),'utf8');let p=0,f=0;function test(n,fn){try{fn();console.log('PASS | '+n);p++}catch(e){console.error('FAIL | '+n+' | '+e.message);f++}}
(async()=>{await domReady();const T=ctx.__v116,A=T.App;A.identity.switchRole('administrator');
 test('REV 1.0.16 active',()=>{assert.equal(ctx.ProtoLab.VERSION,'1.0.16-poc');assert(index.includes('REV 1.0.16'));});
 const laser=A.state.actions.find(a=>a.id==='ACT-002');
 test('Action Centre Resolve opens guided resolver instead of workspace jump',()=>{const h=T.actionItem(laser);assert(h.includes('data-resolve-action="ACT-002"'));assert(!h.includes('data-open-request'));});
 test('Laser weld blocker resolves to process-development workflow',()=>{const m=T.actionResolutionModel(laser);assert.equal(m.kind,'process-development');assert.equal(m.dev.id,'DEV-001');assert.equal(m.ownerRole,'process_engineer');});
 test('Laser weld current step is risk review',()=>{const m=T.actionResolutionModel(laser);assert.equal(m.current.key,'risk');assert(m.stages.find(x=>x.key==='trial').done);assert(!m.stages.find(x=>x.key==='risk').done);});
 test('Process-development guidance states action evidence and completion criterion',()=>{const g=T.PROCESS_DEV_GUIDANCE.risk;assert(g.action.includes('failure modes'));assert(g.evidence.includes('process-risk'));assert(g.done.includes('high-risk'));});
 test('Full development path includes release',()=>{assert.equal(T.PROCESS_DEV_GATES.length,11);assert.equal(T.PROCESS_DEV_GATES.at(-1)[0],'release');});
 test('Other action types receive guided models',()=>{const kinds=A.state.actions.map(a=>T.actionResolutionModel(a).kind);for(const k of ['material','control-plan','quality','approval','calibration','clarification'])assert(kinds.includes(k),k);});
 test('Action Centre renders guided Resolve buttons',()=>{const h=T.renderActionCentre();assert(h.includes('data-resolve-action'));assert(h.includes('Laser weld geometry is outside released process envelope'));});
 const r=A.state.requests.find(x=>x.id===laser.requestId);A.workspaceId=r.id;A.currentView='workspace';
 test('Workspace Next action uses same guided resolver',()=>{const h=T.workspaceOverview(r);assert(h.includes(`data-resolve-action="${laser.id}"`));});
 test('Guided resolver mobile styles exist',()=>{assert(css.includes('.resolution-layout'));assert(css.includes('.resolution-current'));assert(css.includes('@media(max-width:820px)'));});
 test('Guided development evidence is auditable',()=>{assert(src.includes('Guided process-development evidence recorded'));assert(src.includes('resolutionEvidence'));assert(src.includes('completedBy'));});
 test('Released process clears originating Action Centre blocker',()=>{assert(src.includes("filter(a=>a.id!==actionId)"));assert(src.includes('Action Centre blocker cleared'));});
 console.log(`\nRESULT: ${p} passed, ${f} failed`);process.exitCode=f?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
