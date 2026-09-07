const fs=require('fs'),vm=require('vm'),path=require('path');
const root=__dirname;
function fakeEl(){return {innerHTML:'',textContent:'',value:'',checked:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},remove(){},click(){},focus(){},setAttribute(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []}}}
const els={}; for(const k of ['#page','#mainNav','#actionCount','#roleSelect','#menuButton','#globalSearch','#searchResults','#sidebar','#toastRoot','#modalRoot','.brand']) els[k]=fakeEl();
let domReady=null;
const document={querySelector:s=>els[s]||fakeEl(),querySelectorAll:s=>[],createElement:tag=>fakeEl(),addEventListener:(ev,cb)=>{if(ev==='click'){}},body:fakeEl()};
document.addEventListener=(ev,cb)=>{if(ev==='DOMContentLoaded')domReady=cb};
const ctx={console,Date,Math,Intl,setTimeout,clearTimeout,Blob:class{},URL:{createObjectURL(){return'blob:x'},revokeObjectURL(){}},confirm(){return true},prompt(){return'1'},innerWidth:1200,window:null,document,navigator:{},location:{protocol:'http:'},scrollTo(){}};ctx.window=ctx;ctx.window.addEventListener=(ev,cb)=>{if(ev==='DOMContentLoaded')domReady=cb};vm.createContext(ctx);
for(const f of ['core.js','demo-data.js','services.js']) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
ctx.ProtoLab.IndexedDBStorageRepository=class{async init(){return true} async load(){return ctx.ProtoLab.createDemoState()} async save(){return true} async reset(){return ctx.ProtoLab.createDemoState()} async exportJSON(s){return JSON.stringify(s)} async importJSON(t){return JSON.parse(t)}};
ctx.ProtoLab.BrowserDocumentStore=class{download(){}};
ctx.ProtoLab.DemoIdentityProvider=class{constructor(s){this.state=s} switchRole(role){const u=this.state.users.find(x=>x.role===role);this.state.identity={userId:u.id,name:u.name,role};return this.state.identity}};
ctx.ProtoLab.MigrationService=class{static migrate(s){return s}};
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx,{filename:'app.js'});
(async()=>{if(!domReady)throw new Error('DOMContentLoaded handler not registered');await domReady();await new Promise(r=>setTimeout(r,10));const checks=[
 ['application ready flag',ctx.__PROTOLAB_READY__===true],
 ['dashboard markup rendered',/dashboard|Priority work/i.test(els['#page'].innerHTML)],
 ['navigation markup rendered',/Prototype Requests/.test(els['#mainNav'].innerHTML)],
 ['role selector populated',/Engineering Requester/.test(els['#roleSelect'].innerHTML)],
 ['action count populated',Number(els['#actionCount'].textContent)>0]
];let fail=0;for(const [n,v] of checks){console.log((v?'PASS':'FAIL')+' | '+n);if(!v)fail++}console.log(`\nRESULT: ${checks.length-fail} passed, ${fail} failed`);process.exitCode=fail?1:0})().catch(e=>{console.error(e);process.exitCode=1});
