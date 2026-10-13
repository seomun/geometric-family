"""⑪ 일일 임무 3개 + 주간 상자(B22) — tools/expedition_slice_build.py 가 expedition_begin.py 다음에 exec 로 불러 쓴다. [제안]
매일 켤 이유는 주지만 빼앗는 일은 없다: 임무는 하루 3개·전부 한 번씩만 하면 되는 쉬운 것, 못 해도 잃는 것 없음(연속 일수·벌점 없음).
주간 상자는 「이번 주(월~일, KST)에 3개를 다 마친 날이 4일」이면 열린다 — 3일은 쉬어도 된다.
조건은 서버가 장부(ledger)의 오늘 기록에서 직접 센다(kinds). 보상 총량: 일일 금화 450·주 1회 💎20+🪙1200(1년 💎 약 1000, 기존 도감·이벤트 보상 안쪽)."""
BAL['daily'] = dict(
    missions=[dict(id='dq1', t='원정에서 한 번 이겨요', kinds=['stage', 'event'], n=1, gems=0, gold=150), dict(id='dq2', t='친구를 한 번 키워요', kinds=['levelup', 'upgrade'], n=1, gems=0, gold=150), dict(id='dq3', t='요일 던전이나 정찰 보상을 한 번 받아요', kinds=['dungeon', 'idle'], n=1, gems=0, gold=150)],
    weekly=dict(need=4, gems=20, gold=1200, t='이번 주에 임무를 마친 날이 4일이면 상자가 열려요'))
assert len(BAL['daily']['missions']) == 3
print('일일 임무 3 · 금화', sum(m['gold'] for m in BAL['daily']['missions']), '· 주간 상자 💎', BAL['daily']['weekly']['gems'], '🪙', BAL['daily']['weekly']['gold'])
