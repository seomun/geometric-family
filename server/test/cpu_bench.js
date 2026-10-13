// WP4 CPU 실측(단일 스레드라 경과시간≈CPU): node test/cpu_bench.js — 서버 전투 재현(stage-core.replay) 한 판당 CPU 시간. Workers 는 같은 V8 이라 순수 계산 시간은 거의 같다(요청 처리·D1 왕복은 별도).
import SC from '../../games/expedition/stage-core.js';
import SLICE from '../../data/expedition_slice.json' with { type: 'json' };
const D = SLICE, starters = D.units.filter((u) => u.route === 'start').map((u) => u.id), N = 400;
const party = (lv) => starters.map((id) => ({ id, lv })); const t = []; let steps = 0, maxSteps = 0;
for (let w = 0; w < 50; w++) SC.replay(D, { stage: 2, seed: w, party: party(5), auto: true, inputs: [] });   // 예열
for (const st of D.stages) for (const lv of [1, 5, 10]) for (let k = 0; k < N / 18 + 1; k++) { const c0 = process.hrtime.bigint(); const r = SC.replay(D, { stage: st.id, seed: k * 7919 + st.id, party: party(lv), auto: k % 2 === 0, inputs: k % 2 ? [[0, 'c', 0], [2, 'c', 1], [4, 'c', 2], [8, 'r']] : [] }); t.push(Number(process.hrtime.bigint() - c0) / 1e6); steps += r.steps; maxSteps = Math.max(maxSteps, r.steps); }
t.sort((a, b) => a - b); const q = (p) => t[Math.min(t.length - 1, Math.floor(t.length * p))].toFixed(2);
console.log(`재현 ${t.length}판 · 평균 ${(t.reduce((a, b) => a + b, 0) / t.length).toFixed(2)}ms · p50 ${q(0.5)} · p95 ${q(0.95)} · p99 ${q(0.99)} · 최대 ${t[t.length - 1].toFixed(2)}ms · 평균 ${(steps / t.length).toFixed(0)}행동 · 최대 ${maxSteps}행동 (상한 ${SC.MAX_STEPS})`);
let mw = 0, ml = 0; for (const s of D.stages) for (const lv of [1, 3, 5, 8, 10]) for (let k = 0; k < 200; k++) { const r = SC.replay(D, { stage: s.id, seed: k * 31 + s.id, party: party(lv), auto: true, inputs: [] }); if (r.win) mw = Math.max(mw, r.steps); else ml = Math.max(ml, r.steps); }
console.log(`이긴 판 최대 ${mw}행동 · 진 판 최대 ${ml}행동`);
