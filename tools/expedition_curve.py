"""⑪ 레벨 상한·성장 곡선(B27) — tools/expedition_slice_build.py 가 나라 파일을 모두 읽은 뒤 맨 마지막에 exec 로 불러 쓴다. [제안]
문제: 나라 파일마다 lvCapMax 를 「그 시점의 마지막 단계 값」으로 잡아 왔고(216단계 = 80), 평균 파티가 끝에서 상한에 닿는다. 상한 공식(10 + (깬 단계−6)/3)은 그대로 두되 인위적인 천장을 걷어낸다
(tools/exp_curve_extrap.js 외삽: 천장 80 이면 283/288 에서 막히고 파밍 최대 24판 — 천장 풀면 끝까지). 상한 최대 200 은 약 33나라(396단계)까지.
오래 하는 사람을 위해 후반 성장 단계도 늘린다: 스킬 5→7단계(금화), 각성 5→8단계(같은 친구 조각), 장비 10→12단계. 앞 단계 값·확률은 그대로(첫 5단계 값 불변), 기존 계정은 그대로 이어진다."""
BAL['lvCapMax'] = 200
G = BAL['grow']
assert G['skillMax'] == 5 and G['awkMax'] == 5 and G['gearMax'] == 10, '앞 단계 값이 바뀌었는지 확인'
G['skillMax'] = 7; G['skillCost'] = G['skillCost'] + [3600, 7000]
G['awkMax'] = 8; G['awkCost'] = G['awkCost'] + [110, 145, 185]
G['gearMax'] = 12
assert len(G['skillCost']) == G['skillMax'] - 1 and len(G['awkCost']) == G['awkMax']
print('성장 곡선: 상한 최대', BAL['lvCapMax'], '· 스킬', G['skillMax'], '· 각성', G['awkMax'], '· 장비', G['gearMax'])
