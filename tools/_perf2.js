const { chromium } = require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const ctx=await b.newContext({viewport:{width:390,height:780}});const p=await ctx.newPage();const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:6});await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:500});await c.send('Profiler.start');
await p.addInitScript(()=>{window.__noResume=true});await p.goto('http://localhost:8765/games/app/'+(process.argv[2]||'merge')+'.html');
for(let i=0;i<200;i++){await p.waitForTimeout(100);if(await p.evaluate(()=>window.GF&&GF.cur?GF.cur.name:null))break}
await p.waitForTimeout(300);const {profile}=await c.send('Profiler.stop');
const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const self={};const dt=profile.timeDeltas;profile.samples.forEach((id,i)=>{const n=byId[id];const k=(n.callFrame.functionName||'(anon)')+' '+n.callFrame.url.split('/').pop()+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+(dt[i]||0)});
const tot=Object.values(self).reduce((a,b)=>a+b,0);console.log('total ms',Math.round(tot/1000));Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,14).forEach(([k,v])=>console.log(Math.round(v/1000)+'ms',k));await b.close()})();
