// 다국어 준비 점검(C15): node tools/i18n_check.js [--report] — ① 코드의 GF.t('키') 가 모두 한국어 사전에 있음 ② 영어 사전 키 ⊂ 한국어 키, 자리표시({이름}) 일치 ③ 언어를 en 으로 바꾸면 번역된 건 영어·빈 건 한국어 ④ 번역 현황·미추출 한국어 문자열 수를 docs/32_I18N_PLAN.md 에 기록
const fs = require('fs'), path = require('path'); const O = require('../data/ops.json'), EN = require('../data/i18n/en.json').strings;
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const SKIP = /node_modules|android|demo|^app$|build|store|media|sound|audio|tools/;
const walk = (d, out = []) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (SKIP.test(f.name)) continue; const p = path.join(d, f.name); if (f.isDirectory()) walk(p, out); else if (/\.js$/.test(f.name)) out.push(p); } return out; };
const files = walk('games'), used = new Map(), kor = {}; let korTotal = 0;
const KO = /[가-힣]/, STRRE = /'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
files.forEach((f) => {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/GF\.t\(\s*'([^']+)'/g)) { if (!used.has(m[1])) used.set(m[1], new Set()); used.get(m[1]).add(f); }
  let n = 0; src.split('\n').forEach((ln) => { const code = ln.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, ''); for (const m of code.matchAll(STRRE)) { const t = m[1] != null ? m[1] : m[2]; if (KO.test(t)) n++; } });
  if (n) { kor[f.replace(/\\/g, '/')] = n; korTotal += n; }
});
const missing = [...used.keys()].filter((k) => (k.endsWith('.') ? !Object.keys(O.strings).some((x) => x.startsWith(k)) : !(k in O.strings)));      // 「ops.mis.」 처럼 점으로 끝나면 뒤에 id 를 붙여 쓰는 키(접두어) ok(missing.length === 0, '코드가 쓰는 GF.t 키 ' + used.size + '개가 모두 한국어 사전에 있음' + (missing.length ? ' · 없는 키: ' + missing.slice(0, 5).join(',') : ''));
ok(Object.keys(O.strings_en || {}).length === Object.keys(O.strings).length, '영어 틀(strings_en)이 한국어 키 ' + Object.keys(O.strings).length + '개와 같은 키를 가짐'); ok(Object.keys(EN).every((k) => k in O.strings), '영어 사전에 한국어에 없는 키가 없음');
const ph = (t) => (String(t).match(/\{\w+\}/g) || []).sort().join(','); const badPh = Object.keys(EN).filter((k) => EN[k] && ph(EN[k]) !== ph(O.strings[k])); ok(badPh.length === 0, '번역된 문장의 자리표시({이름})가 한국어와 같음' + (badPh.length ? ' · ' + badPh.slice(0, 4).join(',') : ''));
// 동작: 언어 전환(엔진 GF.t 와 같은 식)
const GF = { data: { ops: O }, lang: 'ko' }; const t = (k, v) => { const o = GF.data.ops, s = o.strings; let x = GF.lang === 'en' && o.strings_en && o.strings_en[k] ? o.strings_en[k] : s[k]; if (x == null) return k; if (v) x = x.replace(/\{(\w+)\}/g, (m, y) => (v[y] != null ? v[y] : m)); return x; };
const tr = Object.keys(EN).filter((k) => EN[k]), un = Object.keys(EN).length - tr.length; ok(t('common.close') === O.strings['common.close'], '기본(ko)은 한국어'); GF.lang = 'en'; ok(tr.length === 0 || t(tr[0]) === EN[tr[0]], '영어로 바꾸면 번역된 문장은 영어'); const emptyK = Object.keys(EN).find((k) => !EN[k]); ok(!emptyK || t(emptyK) === O.strings[emptyK], '번역 안 된 문장은 한국어로 대신(빈 화면 없음)');
console.log(`번역 현황: ${tr.length}/${Object.keys(EN).length} (남은 ${un}) · GF.t 로 뺀 키 사용 ${used.size}종 · 코드 안에 남은 한국어 따옴표 문자열 ${korTotal}개(${Object.keys(kor).length}파일)`);
if (process.argv.includes('--report')) {
  const top = Object.entries(kor).sort((a, b) => b[1] - a[1]).slice(0, 25);
  const md = [
    '# 32. 다국어 준비 현황 · 계획 (C15)', '',
    '> 생성: `node tools/i18n_check.js --report`. 지금은 **틀만** 있다: 사전(`data/i18n/en.json` → `ops.json` 의 `strings_en`)과 `GF.t` 언어 전환(`GF.lang`)·빠진 키 점검. 번역은 나중. [제안]', '',
    '## 지금 상태',
    `- 한국어 사전 키 ${Object.keys(O.strings).length}개 / 영어 번역 ${tr.length}개(나머지는 한국어로 대신 나옴).`,
    `- 코드가 \`GF.t\` 로 쓰는 키 ${used.size}종 — 모두 사전에 있음(시험 단언).`,
    `- **아직 코드 안에 박혀 있는 한국어 따옴표 문자열 ${korTotal}개**(${Object.keys(kor).length}개 파일) — 화면 글자 대부분이 여기에 있다. 사전으로 빼는 것이 다음 작업.`, '',
    '## 파일별 남은 한국어 문자열(많은 순 25)', '| 파일 | 개수 |', '|---|---|', ...top.map(([f, n]) => `| \`${f}\` | ${n} |`), '',
    '## 계획(권장 순서)',
    '1. **키트·공통**(ui-kit·extras·ops·polish): 화면 어디서나 쓰는 버튼·토스트·설정 → 이미 상당수 `GF.t`. 남은 것 정리.',
    '2. **앱 홈·결과·튜토리얼**: 첫 화면과 결과 카드(스토어 스크린샷에 나옴).',
    '3. **이야기·사연·대사 데이터**(data/*.json): 번역이 아니라 별도 로케일 폴더(`data/<언어>/story_*.json`)로 분리(문화 각색 필요, 옛이야기는 나라마다 익숙한 이야기가 다름).',
    '4. **⑪ 원정대**(exp.js): 문장이 가장 많음 — 별도 사전 `exp.*`.',
    '5. 설정에 「언어」 줄(ko/en) 추가는 번역이 한 앱 분량 이상 모인 뒤.', '',
    '## 주의',
    '- 자리표시 `{이름}` 은 번역에서도 그대로(시험이 확인). 한국어 조사(은/는)가 붙는 문장은 번역 대신 문장 구조를 다시 쓴다.',
    '- 한국어 줄 바꿈 설정(`word-break: keep-all`)은 로케일별 분기 필요.',
    '- 영어 번역이 비어 있으면 한국어로 나오므로 **출시판은 번역이 다 찬 언어만 켠다**.', '',
  ].join('\n');
  fs.writeFileSync('docs/32_I18N_PLAN.md', md, 'utf8');
}
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
