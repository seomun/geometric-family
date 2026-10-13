const { chromium } = require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
for (const a of ['merge','spot','block','quiz','day','index','idle','color']) {
 const ctx=await b.newContext({viewport:{width:390,height:780}});const p=await ctx.newPage();const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:6});
 await p.addInitScript(()=>{window.__noResume=true});const t0=Date.now();await p.goto('http://localhost:8765/games/app/'+a+'.html');
 let home=null;for(let i=0;i<200&&!home;i++){await p.waitForTimeout(100);home=await p.evaluate(()=>window.GF&&GF.cur?GF.cur.name:null)}
 const t1=Date.now()-t0;const nav=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd)}});
 console.log(a,'home@',t1,'ms',JSON.stringify(nav));await ctx.close()}
await b.close()})();
