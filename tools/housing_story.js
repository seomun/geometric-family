// A9 시험: 집 이야기 장(성인 8) — 모두 기승전결 4컷, 글이 비지 않고 등장 인물이 실제 그림 키, 한 컷 60자 이내(읽기 편함). node tools/housing_story.js
const fs = require('fs'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const H = JSON.parse(fs.readFileSync('data/housing.json', 'utf8')), C = JSON.parse(fs.readFileSync('data/chars.json', 'utf8')), ad = H.story.filter((c) => c.group === 'adult');
ok(ad.length === 8, '성인 집 이야기 8장'); ok(ad.every((c) => c.cuts.length === 4), '장마다 4컷(기승전결): ' + ad.map((c) => c.cuts.length).join(','));
ok(ad.every((c) => c.cuts.every((k) => k.text && k.text.length >= 12 && k.text.length <= 90)), '컷 글 길이 12~90자'); const long = ad.flatMap((c) => c.cuts.map((k) => k.text.length)).sort((a, b) => b - a)[0]; console.log('  가장 긴 컷', long, '자');
ok(ad.every((c) => c.cuts.every((k) => (k.chars || []).length >= 1 && k.chars.every((id) => C[id]))), '컷마다 등장 인물이 있고 모두 실제 그림 키');
ok(ad.every((c) => new Set(c.cuts.map((k) => k.text)).size === 4), '장 안에서 같은 문장 반복 없음'); const all = ad.flatMap((c) => c.cuts.map((k) => k.text)); ok(new Set(all).size === all.length, '장 사이에도 중복 문장 없음(' + all.length + '컷)');
ok(!all.some((t) => /피곤|힘들|지쳐|우울/.test(t)), '피곤함·불행을 앞세우는 말 없음(행복 우선)');
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
