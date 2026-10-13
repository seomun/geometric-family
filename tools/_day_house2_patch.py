"""⑩ 하루에 Room 2.0 화면 연결(멱등): 집 화면 → house2, 결과 → 집에 놓기 카드 + 다음 목표 띠(그림만), 홈 띠."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
p = 'games/day/day.js'; s = open(p, encoding='utf-8').read()
def sub(a, b):
    global s
    if b in s: print('skip'); return
    assert a in s, a[:60]; s = s.replace(a, b, 1); print('ok')
sub("Room.house(sc, { room: 'kid' }); },", "Room.house2(sc, { room: 'kid', go: () => GF.go('dmap') }); },")
sub("          const result = () => { const nx = !LV.kind && D.levels.find((l) => l.id === LV.id + 1), it = gained[0] && Room.item(gained[0]);\n            UK.result({ kid: true,",
    "          const result0 = () => { const nx = !LV.kind && D.levels.find((l) => l.id === LV.id + 1), it = gained[0] && Room.item(gained[0]);\n            const rs = UK.result({ kid: true,")
sub("if (sh) { const b = el('div', 'uk-big', null, it.emoji); sh.insertBefore(b, sh.children[1] || null); } } };\n",
    "if (sh) { const b = el('div', 'uk-big', null, it.emoji); sh.insertBefore(b, sh.children[1] || null); } } try { Room.band(rs.querySelector('.uk-sheet') || rs, { go: () => GF.go('dmap'), toastParent: r }); } catch (e) {} };\n          const result = () => { if (gained.length && Room.H) Room.dropCard(gained[gained.length - 1], r, result0, { openHouse: () => GF.go('dhouse') }); else result0(); };   // 결과의 주인공 = 집에 놓기(글자 없음)\n")
sub("      const row = el('div', 'dy-cards', r);\n", "      if (Room.H) { const bw = el('div', 'h2-bandwrap', r); Room.band(bw, { go: () => GF.go('dmap'), toastParent: r }); }\n      const row = el('div', 'dy-cards', r);\n")
open(p, 'w', encoding='utf-8').write(s)
