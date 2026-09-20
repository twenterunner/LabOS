'use strict';
/* LabOS Stage-2 deterministic portfolio worker.  This file owns no scheduling
   logic: it loads the same production services and invokes only
   PlanningPortfolioService.planCandidate. */
let LABOS_WORKER_STATE=null,LABOS_WORKER_CONTEXT=null;
(function(){
  const build=new URL(self.location.href).searchParams.get('build')||'STAGE3-GITHUB-TEST-13',q=`?build=${encodeURIComponent(build)}`;
  importScripts(`labos-core-1.0.185.js${q}`,`labos-demo-data-1.0.185.js${q}`,`labos-repository-1.0.185.js${q}`,`labos-state-1.0.185-stage1.js${q}`,`labos-services-1.0.185.js${q}`,`labos-planning-1.0.185.js${q}`,`labos-planning-stage2-1.0.185.js${q}`,`labos-network-stage3-1.0.185.js${q}`);
})();
self.onmessage=e=>{const m=e.data||{};if(m.type==='init'){LABOS_WORKER_STATE=m.state;LABOS_WORKER_CONTEXT=m.context||null;self.postMessage({type:'ready'});return}if(m.type==='plan'){try{const P=self.ProtoLab,svc=new P.PlanningPortfolioService(LABOS_WORKER_STATE,{context:LABOS_WORKER_CONTEXT||{}}),candidate=svc.planCandidate(m.options||{});self.postMessage({type:'result',id:m.id,candidate})}catch(err){self.postMessage({type:'error',id:m.id,message:err?.message||String(err),code:err?.code||null})}}};
