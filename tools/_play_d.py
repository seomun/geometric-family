"""① 막둥이 놀이터: 장마다 보너스 단계 D(5라운드, C 의 가장 높은 난이도를 이어 더 길게) 추가 — 15장 × 1 = 15단계. 장 해금·에필로그는 C 기준 그대로(D 는 선택). 멱등."""
import json, pathlib, re
G = pathlib.Path('games')
p = pathlib.Path('data/stages.json'); d = json.load(open(p, encoding='utf-8')); n = 0
for k, ch in d.items():
    st = ch.get('stages')
    if not st or len(st) != 3: continue
    c = st[2]['rounds']; last = c[-1]
    st.append({'rounds': [dict(x) for x in c] + [dict(last), dict(last)], 'bonus': True}); n += 1
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('bonus stages +', n)
g = G / 'engine/gf.js'; t = g.read_text(encoding='utf-8')
if "'ABCD'" not in t:
    t = t.replace("'ABC'[k]", "'ABCD'[k]").replace("'ABC'[k - 1]", "'ABCD'[k - 1]").replace("'ABC'[run.k]", "'ABCD'[run.k]")
    t = t.replace("for (let k = 0; k < def.stages.length; k++) { const id = 'c' + n + 'ABCD'[k];", "for (let k = 0; k < Math.min(3, def.stages.length); k++) { const id = 'c' + n + 'ABCD'[k];", 1)   # D 는 선택(이어하기를 막지 않음)
    t = t.replace("({ 1: [[28, 28]], 2: [[17, 28], [39, 28]], 3: [[28, 17], [16, 38], [40, 38]] })", "({ 1: [[28, 28]], 2: [[17, 28], [39, 28]], 3: [[28, 17], [16, 38], [40, 38]], 4: [[17, 17], [39, 17], [17, 39], [39, 39]] })", 1)
    t = t.replace("b.style.top = '130px'; b.style.left = 'calc(50% + ' + ((k - 1) * 215) + 'px)'; } else b.style.top = (130 + k * 140) + 'px';", "b.style.top = '130px'; b.style.left = 'calc(50% + ' + ((k - (def.stages.length - 1) / 2) * 215) + 'px)'; } else b.style.top = (130 + k * (def.stages.length > 3 ? 112 : 140)) + 'px';", 1)
    t = t.replace("const gain = Reward.sticker(run.ch + '_' + 'ABCD'[run.k], avg === 3);", "const gain = run.k < 3 ? Reward.sticker(run.ch + '_' + 'ABCD'[run.k], avg === 3) : false;   // 보너스 단계 D 는 스티커 없이 별만", 1)
    t = t.replace("if (run.k < 2) GF.popTo('stages', { ch: run.ch }); else GF.replace('book', { ch: run.ch, part: 'epi' });", "if (run.k < 2 || run.k === 3) GF.popTo('stages', { ch: run.ch }); else GF.replace('book', { ch: run.ch, part: 'epi' });", 1)
    assert t.count("'ABCD'") >= 5, t.count("'ABCD'"); g.write_text(t, encoding='utf-8')
# ip 도장 규칙: ① 끝까지 = 60단계
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
z = z.replace("r['play'] = [dict(id='first', at=1), dict(id='a', at=15), dict(id='b', at=30), dict(id='end', at=45), dict(id='story', at=None)]", "r['play'] = [dict(id='first', at=1), dict(id='a', at=20), dict(id='b', at=40), dict(id='end', at=60), dict(id='story', at=None)]")
b.write_text(z, encoding='utf-8')
print('ok')
