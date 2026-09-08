(function(){
'use strict';
const P=window.ProtoLab;
class StorageRepository{async init(){} async load(){} async save(){} async reset(){} async exportJSON(){} async importJSON(){} }
class IndexedDBStorageRepository extends StorageRepository{
 constructor(){super();this.dbName='ProtoLabOS';this.store='app';this.key='state';this.db=null;this.memoryFallback=null;}
 async init(){
  try{this.db=await new Promise((resolve,reject)=>{const req=indexedDB.open(this.dbName,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(this.store))db.createObjectStore(this.store);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return true;}
  catch(e){console.warn('IndexedDB unavailable, using in-memory fallback',e);this.memoryFallback=P.createDemoState();return false;}
 }
 async load(){ if(!this.db)return this.memoryFallback||P.createDemoState(); return new Promise((resolve,reject)=>{const tx=this.db.transaction(this.store,'readonly');const req=tx.objectStore(this.store).get(this.key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);}); }
 async save(state){ if(!this.db){this.memoryFallback=P.deepClone(state);return true;} return new Promise((resolve,reject)=>{const tx=this.db.transaction(this.store,'readwrite');tx.objectStore(this.store).put(P.deepClone(state),this.key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);}); }
 async reset(){const state=P.createDemoState();await this.save(state);return state;}
 async exportJSON(state){return JSON.stringify({schemaVersion:P.SCHEMA_VERSION,exportedAt:P.now(),appVersion:P.VERSION,state},null,2);}
 async importJSON(text){const parsed=JSON.parse(text);const state=parsed.state||parsed;if(!state.schemaVersion)throw new Error('Missing schemaVersion');const migrated=MigrationService.migrate(state);await this.save(migrated);return migrated;}
}
class MigrationService{
 static migrate(state){
  let s=P.deepClone(state);if(s.schemaVersion>P.SCHEMA_VERSION)throw new Error('This data was created by a newer schema.');
  while(s.schemaVersion<P.SCHEMA_VERSION){
   if(s.schemaVersion===0){s.settings=s.settings||{};s.schemaVersion=1;continue;}
   if(s.schemaVersion===1){
    P.ensureMaterialModel(s);
    (s.requests||[]).forEach(r=>{
      P.ensureMaterialRequirements(s,r);P.ensureApprovalRecords(s,r);
      let route=(s.routes||[]).find(x=>x.requestId===r.id);
      if(!route){route={id:r.routeId||P.uid('ROUTE'),requestId:r.id,revision:'A',steps:[],reworkLoops:[]};s.routes.push(route);r.routeId=route.id;}
      if(!route.steps?.length){route.proposed=true;route.confirmed=false;route.steps=P.getDefaultRoute(r.productId).map((pid,i)=>{const proc=(s.processes||[]).find(p=>p.id===pid);return {id:P.uid('STEP'),order:i+1,processId:pid,name:proc?.name||pid,processRevision:proc?.revision||'A',type:'standard',owner:'Unassigned',planned:null,status:'Proposed',readiness:'pending',parallelGroup:null,optional:false};});}
    });
    s.dataVersion=s.dataVersion||'migrated';s.schemaVersion=2;continue;
   }
   throw new Error(`No migration available from schema ${s.schemaVersion}`);
  }
  P.ensureMaterialModel(s);(s.requests||[]).forEach(r=>P.ensureApprovalRecords(s,r));return s;
 }
}
class BrowserDocumentStore{download(name,text,type='application/json'){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);} readFile(file){return file.text();}}
class DemoIdentityProvider{constructor(state){this.state=state;} currentUser(){return this.state.identity;} switchRole(role){const user=this.state.users.find(u=>u.role===role)||this.state.users[0];this.state.identity={userId:user.id,name:user.name,role};return this.state.identity;}}
P.StorageRepository=StorageRepository;P.IndexedDBStorageRepository=IndexedDBStorageRepository;P.MigrationService=MigrationService;P.BrowserDocumentStore=BrowserDocumentStore;P.DemoIdentityProvider=DemoIdentityProvider;
})();
