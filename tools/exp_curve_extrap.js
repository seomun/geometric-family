// ⑪ 성장 곡선 외삽 시험(B27): node tools/exp_curve_extrap.js [끝 단계=360] — 19나라 이후(217~N단계)를 지금 나라들(145~216)의 틀을 돌려 가며 합성해 진행 시뮬을 돌린다.
// 확인할 것: ① 끝까지 클리어(막히지 않음) ② 파밍 평균·최대 ③ 레벨이 상한에 계속 닿지 않음(평균 Lv < 상한) ④ 금화 부족으로 막히지 않음. 합성 단계의 포섭·보스 잠금은 뺀다(곡선만 본다).
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'expedition_slice.json'), 'utf8')), END = +(process.argv[2] || 360);
const kbase = (s) => 1.376 + 0.037 * 24 + 0.012 * (s - 36), N0 = D.stages.length;
for (let s = N0 + 1; s <= END; s++) {
  const t = D.stages[144 + ((s - 1) % 72)], tb = kbase(t.id), nat = Math.floor((s - 1) / 12) + 1, i = ((s - 1) % 12) + 1;
  const st = JSON.parse(JSON.stringify(t)); st.id = s; st.name = nat + '나라 ' + i + '단계'; st.gold = Math.round(260 * Math.pow(1.055, s - 6) * (t.boss ? 1.15 : 1)); delete st.recruit; delete st.join;
  st.enemies.forEach((e) => { e.k = Math.round(e.k * kbase(s) / tb * 1000) / 1000; delete e.lock; });
  D.stages.push(st);
}
D.bal.stages = D.stages.length; const tmp = path.join(os.tmpdir(), 'exp_extrap.json'); fs.writeFileSync(tmp, JSON.stringify(D));
const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'exp_progress_sim.js'), '1', 'q'], { env: Object.assign({}, process.env, { DATA: tmp }), encoding: 'utf8', maxBuffer: 1 << 26 });
const out = (r.stdout || '').trim().split('\n').slice(-2).join('\n'); console.log(out || r.stderr);
const m = /클리어 (\d+)\/(\d+) · 파밍 합계 (\d+)판 \(평균 ([\d.]+), 최대 (\d+)\) · 최종 평균 Lv ([\d.]+)/.exec(out), cap = Math.min(D.bal.lvCapMax, D.bal.lvCap + Math.floor((END - D.bal.lvCapFrom) / D.bal.lvCapEvery));
let fails = 0; const ok = (c, msg) => { console.log((c ? 'OK   ' : 'FAIL ') + msg); if (!c) fails++; };
ok(!!m && +m[1] === END, '합성 ' + END + '단계까지 모두 클리어(막히지 않음)'); if (m) { ok(+m[4] <= 0.5, '파밍 평균 ' + m[4] + ' ≤ 0.5'); ok(+m[5] <= 7, '파밍 최대 ' + m[5] + ' ≤ 7'); ok(+m[6] < cap, '최종 평균 Lv ' + m[6] + ' < 상한 ' + cap + '(상한에 계속 닿지 않음)'); }
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
