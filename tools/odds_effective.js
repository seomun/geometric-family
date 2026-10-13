// ⑪ 실효 확률 산출(허브 결정): 표시 확률(기본)과 「10회 보장 포함 실효」 확률을 같은 코어(games/expedition/gacha-core.js)로 센다.
//   node tools/odds_effective.js → data/expedition_odds.json (화면·/gacha/odds·스토어 문서가 이 값을 같이 쓴다) + games/store/EXPEDITION_ODDS_ko.md
const fs = require('fs'); const GC = require('../games/expedition/gacha-core.js'); const D = require('../data/expedition_slice.json');
const N = 6000000, G = D.gacha; let a = 0xC0FFEE; const rand = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const P = { since5: 0, since4: 0, guard: 0 }, byUnit = {}, byGrade = { 3: 0, 4: 0, 5: 0 }; let n5 = 0, since = 0, max5 = 0, sum5 = 0, gap4 = 0, since4 = 0;
for (let i = 0; i < N; i++) { since++; const r = GC.pullOnce(G, D.units, P, rand); byUnit[r.id] = (byUnit[r.id] || 0) + 1; byGrade[r.grade]++; if (r.grade === 5) { n5++; sum5 += since; max5 = Math.max(max5, since); since = 0; } }
const pct = (x) => Math.round(x / N * 1e6) / 1e4;       // % 소수 4자리
const eff = { ver: 'eff-1', pulls: N, grade: { 5: pct(byGrade[5]), 4: pct(byGrade[4]), 3: pct(byGrade[3]) }, unit: Object.fromEntries(D.units.filter((u) => u.route === 'gacha').map((u) => [u.id, pct(byUnit[u.id] || 0)])), expected5: Math.round(sum5 / n5 * 100) / 100, max5, pickup5: pct(byUnit[D.units.find((u) => u.pickup).id] || 0), note: '실효 = 소프트 천장(61회~)·하드 천장(80회)·픽업 보장·10회 ★4 이상 보장을 모두 반영한 장기 평균. 표시(기본) 확률은 천장·보장 전의 한 회 기본값.' };
const base = { 5: G.rates.five * 100, 4: G.rates.four * 100, 3: G.rates.three * 100 };
fs.writeFileSync('data/expedition_odds.json', JSON.stringify({ base, effective: eff }, null, 1), 'utf8');
const SP = 'data/expedition_slice.json', SD = JSON.parse(fs.readFileSync(SP, 'utf8')); SD.gacha.effective = eff; fs.writeFileSync(SP, JSON.stringify(SD, null, 1), 'utf8');
const rows = D.units.filter((u) => u.route === 'gacha').sort((x, y) => y.grade - x.grade);
const md = `# 「기하학 원정대」 모집(뽑기) 확률 — 스토어·화면 공통 표기 (자동 생성: tools/odds_effective.js)

> 이 표는 앱 안 「확률 공개」 화면, 서버 \`/gacha/odds\`, 스토어 설명이 **같은 값**을 쓴다. 확률표 버전 \`${eff.ver}\`. **랜덤 아이템 포함** — 모집(뽑기)은 확률로 동료를 얻는다.

| 등급 | 기본 확률(한 회) | 실효 확률(천장·보장 포함 장기 평균) |
|---|---|---|
| ★5 | ${base[5]}% | ${eff.grade[5]}% |
| ★4 | ${base[4]}% | ${eff.grade[4]}% |
| ★3 | ${base[3]}% | ${eff.grade[3]}% |

- **천장**: ${G.soft + 1}회째부터 ★5 확률이 매 회 +${G.softUp * 100}%, ${G.hard}회째 ★5 확정(이후 0으로). 픽업 ★5 는 ★5 중 절반, 픽업이 아닌 ★5 가 나오면 다음 ★5 는 픽업 확정.
- **10회 보장**: 10회 모집에는 ★4 이상 1명을 보장한다(10번 연속 ★3 이 나오지 않게 천장 카운터로 구현).
- ★5 를 얻는 데 걸리는 평균 횟수 약 ${eff.expected5}회(최대 ${eff.max5}회).
- 산출: 서버와 같은 코어로 ${N.toLocaleString('en')}회 시행. 개별 확률(기본/실효):

| 등급 | 동료 | 기본 | 실효 |
|---|---|---|---|
${rows.map((u) => { const b = u.grade === 5 ? G.rates.five * (u.pickup ? G.pickup.share : (1 - G.pickup.share) / (rows.filter((x) => x.grade === 5).length - 1)) : (u.grade === 4 ? G.rates.four : G.rates.three) / rows.filter((x) => x.grade === u.grade).length; return `| ★${u.grade} | ${u.name}${u.pickup ? ' (픽업)' : ''} | ${(b * 100).toFixed(2)}% | ${eff.unit[u.id]}% |`; }).join('\n')}
`;
fs.mkdirSync('games/store', { recursive: true }); fs.writeFileSync('games/store/EXPEDITION_ODDS_ko.md', md, 'utf8');
console.log('기본', JSON.stringify(base), '실효', JSON.stringify(eff.grade), '★5 평균', eff.expected5, '픽업 실효', eff.pickup5);
