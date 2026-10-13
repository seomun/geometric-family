"""③ 합치기에 Room 2.0 화면 연결(멱등): 집 화면 → house2, 결과 → 집에 놓기 카드 + 다음 목표 띠, 홈에 다음 목표 띠."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
p = 'games/merge/merge.js'; s = open(p, encoding='utf-8').read()
def sub(a, b):
    global s
    if b in s: print('skip'); return
    assert a in s, a[:60]; s = s.replace(a, b, 1); print('ok')
sub("const sc = el('div', 'mg-scroll', r); sc.style.top = '70px'; Room.house(sc, {});",
    "const sc = el('div', 'mg-scroll', r); sc.style.top = '70px'; Room.house2(sc, { go: () => GF.go('mlevels') });")
sub("        UK.result({ title: '클리어!', stars, chips, parent: r, onNext: next ? () => GF.replace('mplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('mplay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });\n",
    "        const show = () => { const sc = UK.result({ title: '클리어!', stars, chips, parent: r, onNext: next ? () => GF.replace('mplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('mplay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' }); try { Room.band(sc.querySelector('.uk-sheet') || sc, { go: () => GF.go('mlevels'), toastParent: r }); } catch (e) {} };\n        if (gained.length && roomOK && Room.H) Room.dropCard(gained[gained.length - 1], r, show, { openHouse: () => GF.go('mhouse') }); else show();   // 결과의 주인공 = 「집에 놓기」\n")
sub("      el('div', 'mg-foot', r, '별 ' + totalStars()",
    "      if (Room.H) { const bw = el('div', 'h2-bandwrap', r); Room.band(bw, { go: () => GF.go('mlevels'), toastParent: r }); }\n      el('div', 'mg-foot', r, '별 ' + totalStars()")
open(p, 'w', encoding='utf-8').write(s)
