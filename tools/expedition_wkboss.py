"""⑪ 주간 협동 보스(B26) — tools/expedition_slice_build.py 가 성장 곡선 파일 바로 앞에 exec 로 불러 쓴다. [제안]
매주 보스 한 마리(8종 순환). 한 사람이 쓰러뜨릴 수 없게 단단하고, 점수는 내 파티가 쓰러지기 전까지 준 피해. 모두의 피해를 서버가 합산하고(순위 없음) 참여만 해도 보상.
보상(D28 반복 예산 안): 참여 💎3+🪙800, 모두의 합계가 단계(tiers)에 닿으면 💎1·2·3 — 한 주 최대 💎9 → 연 468(이벤트 400 + 주간 상자 1,040 + 468 = 1,908 ≤ 2,000, tools/gem_budget.py 가 단언).
악역·보스는 모두 가족 밖(순한 판), 이름은 놀이용 별명이며 무서운 표현 없음."""
BAL['wkboss'] = dict(
    tries=3, bossK=8, partGems=3, partGold=800,
    tiers=[dict(need=200000, gems=1), dict(need=600000, gems=2), dict(need=1500000, gems=3)],
    bosses=[
        dict(name='심술 구름 대장', emoji='⛈️', role='mage', el='flash', minion=['빗방울 꼬마', '💧']),
        dict(name='장난꾸러기 도깨비 왕', emoji='👹', role='attacker', el='support', minion=['방망이 꼬마', '🪄']),
        dict(name='눈보라 대장', emoji='🌨️', role='tank', el='care', minion=['눈송이 꼬마', '❄️']),
        dict(name='과자 성 문지기', emoji='🏰', role='tank', el='support', minion=['사탕 꼬마', '🍬']),
        dict(name='낮잠 대왕 곰', emoji='🐻', role='tank', el='care', minion=['낮잠 꼬마', '💤']),
        dict(name='소나기 여우', emoji='🦊', role='attacker', el='flash', minion=['물웅덩이 꼬마', '🌦️']),
        dict(name='밤바람 부엉이', emoji='🦉', role='mage', el='care', minion=['별빛 꼬마', '✨']),
        dict(name='들불 호랑이', emoji='🐅', role='attacker', el='flash', minion=['불씨 꼬마', '🔥']),
    ])
assert len(BAL['wkboss']['bosses']) == 8 and sum(t['gems'] for t in BAL['wkboss']['tiers']) + BAL['wkboss']['partGems'] == 9
print('주간 협동 보스', len(BAL['wkboss']['bosses']), '종 · 한 주 최대 반짝석', 9)
