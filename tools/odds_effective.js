// ⑪ 실효 확률 산출(허브 결정): 표시 확률(기본)과 「10회 보장 포함 실효」 확률을 같은 코어(games/expedition/gacha-core.js)로 센다. 배너마다 따로(B15: 한정 동료는 그 배너 풀에만).
//   node tools/odds_effective.js → data/expedition_odds.json (화면·/gacha/odds·스토어 문서가 이 값을 같이 쓴다) + games/store/EXPEDITION_ODDS_ko.md
const fs = require('fs'); const GC = require('../games/expedition/gacha-core.js'); const D = require('../data/expedition_slice.json');
const N = 6000000, G = D.gacha; let a = 0xC0FFEE; const rand = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pct = (x) => Math.round(x / N * 1e6) / 1e4;       // % 소수 4자리
function sim(bid) {      // 같은 시드에서 시작해 배너마다 N 회
  a = 0xC0FFEE; const P = { since5: 0, since4: 0, guard: 0 }, byUnit = {}, byGrade = { 3: 0, 4: 0, 5: 0 }; let n5 = 0, since = 0, max5 = 0, sum5 = 0;
  for (let i = 0; i < N; i++) { since++; const r = GC.pullOnce(G, D.units, P, rand, bid); byUnit[r.id] = (byUnit[r.id] || 0) + 1; byGrade[r.grade]++; if (r.grade === 5) { n5++; sum5 += since; max5 = Math.max(max5, since); since = 0; } }
  const list = [5, 4, 3].flatMap((g) => GC.pool(D.units, g, bid)), pk = GC.pickupOf(G, D.units, bid);
  return { ver: 'eff-2', pulls: N, grade: { 5: pct(byGrade[5]), 4: pct(byGrade[4]), 3: pct(byGrade[3]) }, unit: Object.fromEntries(list.map((u) => [u.id, pct(byUnit[u.id] || 0)])), expected5: Math.round(sum5 / n5 * 100) / 100, max5, pickup5: pct(byUnit[pk.id] || 0), pickup: pk.id };
}
const MAXR = GC.ceiling(G), RULE_MAX = (() => { let p = 0; for (let k = 1; k < 1000; k++) { p = G.rates.five + (k > G.soft ? (k - G.soft) * G.softUp : 0); if (p >= 1 - 1e-9) return k; } return -1; })();
if (MAXR !== RULE_MAX) throw new Error('표기 최대(' + MAXR + ') != 규칙 계산 최대(' + RULE_MAX + ')');
const banners = Object.fromEntries((G.banners || [{ id: 'main' }]).map((b) => [b.id, sim(b.id)]));
Object.values(banners).forEach((E) => { if (E.max5 > MAXR) throw new Error('시뮬 관측 최대 ' + E.max5 + ' > 표기 최대 ' + MAXR); E.max5 = MAXR; E.max5Observed = undefined; });      // 최대는 시뮬 관측값이 아니라 규칙으로 계산한 값
const eff = Object.assign({}, banners.main, { banners, note: '실효 = 소프트 천장(61회~ 매 회 +6%, 77회째 100%)·픽업 보장·10회 ★4 이상 보장을 모두 반영한 장기 평균. 표시(기본) 확률은 천장·보장 전의 한 회 기본값. 배너마다 따로 센다.' });
const base = { 5: G.rates.five * 100, 4: G.rates.four * 100, 3: G.rates.three * 100 };
fs.writeFileSync('data/expedition_odds.json', JSON.stringify({ base, effective: eff }, null, 1), 'utf8');
const SP = 'data/expedition_slice.json', SD = JSON.parse(fs.readFileSync(SP, 'utf8')); SD.gacha.effective = eff; fs.writeFileSync(SP, JSON.stringify(SD, null, 1), 'utf8');
const section = (b) => {
  const E = banners[b.id], list = [5, 4, 3].flatMap((g) => GC.pool(D.units, g, b.id)), five = list.filter((u) => u.grade === 5);
  return `## 배너 「${b.name}」 (\`${b.id}\`)

| 등급 | 기본 확률(한 회) | 실효 확률(천장·보장 포함 장기 평균) |
|---|---|---|
| ★5 | ${base[5]}% | ${E.grade[5]}% |
| ★4 | ${base[4]}% | ${E.grade[4]}% |
| ★3 | ${base[3]}% | ${E.grade[3]}% |

- 픽업 ★5: **${D.units.find((u) => u.id === E.pickup).name}** — ★5 중 ${G.pickup.share * 100}%. ★5 를 얻는 데 걸리는 평균 횟수 약 ${E.expected5}회(최대 ${MAXR}회).

| 등급 | 동료 | 기본 | 실효 |
|---|---|---|---|
${list.map((u) => { const isPk = u.id === E.pickup, bs = u.grade === 5 ? G.rates.five * (isPk ? G.pickup.share : (1 - G.pickup.share) / (five.length - 1)) : (u.grade === 4 ? G.rates.four : G.rates.three) / list.filter((x) => x.grade === u.grade).length; return `| ★${u.grade} | ${u.name}${isPk ? ' (픽업)' : ''}${u.banner ? ' (이 배너 한정)' : ''} | ${(bs * 100).toFixed(2)}% | ${E.unit[u.id]}% |`; }).join('\n')}
`;
};
const md = `# 「기하학 원정대」 모집(뽑기) 확률 — 스토어·화면 공통 표기 (자동 생성: tools/odds_effective.js)

> 이 표는 앱 안 「확률 공개」 화면, 서버 \`/gacha/odds\`, 스토어 설명이 **같은 값**을 쓴다. 확률표 버전 \`${eff.ver}\`. **랜덤 아이템 포함** — 모집(뽑기)은 확률로 동료를 얻는다.

- **천장**: ${G.soft + 1}회째부터 ★5 확률이 매 회 +${G.softUp * 100}%씩 올라 **${MAXR}회째에는 반드시 ★5**(규칙으로 계산한 최대 횟수). 픽업이 아닌 ★5 가 나오면 다음 ★5 는 픽업 확정이라 **픽업은 최대 ${MAXR * 2}회 안에 반드시** 나온다. 천장 카운터는 **배너마다 따로** 센다.
- **10회 보장**: 10회 모집에는 ★4 이상 1명을 보장한다(10번 연속 ★3 이 나오지 않게 천장 카운터로 구현).
- 한정 동료는 그 배너에서만 나오고, 다른 배너 확률에는 영향을 주지 않는다.
- 산출: 서버와 같은 코어로 배너마다 ${N.toLocaleString('en')}회 시행.

${(G.banners || []).map(section).join('\n')}`;
fs.mkdirSync('games/store', { recursive: true }); fs.writeFileSync('games/store/EXPEDITION_ODDS_ko.md', md, 'utf8');
console.log('기본', JSON.stringify(base), Object.entries(banners).map(([k, v]) => k + ' 실효 ' + JSON.stringify(v.grade) + ' ★5 평균 ' + v.expected5 + ' 픽업 ' + v.pickup5).join(' | '));
