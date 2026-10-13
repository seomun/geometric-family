"""⑪ 무료 반짝석 출처별 「연간 합계 표」(경제 문서 한 곳: docs/33_GEM_ECONOMY.md) — 데이터(data/expedition_slice.json·expedition_shop.json)에서 자동 계산·자동 갱신.
tools/expedition_slice_build.py 가 데이터를 쓴 뒤 불러 쓴다(단독 실행 python tools/gem_budget.py 도 된다). 새 보상 출처가 생기면 출처 목록에 등록하지 않는 한 빌드가 실패한다(표를 건너뛸 수 없다).
상한은 [제안] — 작가 확인 목록(HANDOFF)에 올려 둔다: 첫해 무료 합계(광고 제외) ≤ FIRST_YEAR_CAP, 해마다 반복되는 몫 ≤ YEARLY_CAP."""
import json, io, sys
try: sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
except Exception: pass
FIRST_YEAR_CAP = 15000     # [제안] 첫해(광고 제외) 무료 반짝석 상한 ≈ 모집 100번
YEARLY_CAP = 2000          # [제안] 해마다 반복되는 몫(이벤트+주간) 상한 ≈ 모집 13번
D = json.load(open('data/expedition_slice.json', encoding='utf-8')); S = json.load(open('data/expedition_shop.json', encoding='utf-8'))
B, G, W = D['bal'], D['gacha'], D['bal']['daily']['weekly']; PULL = G['cost']
SEASONS = len(B['events']); ADS = S['ads']['rewardKinds']['gems']
# (출처, 구분, 연간 합계, 설명) — 구분: once = 처음 한 번, year = 해마다 반복, ad = 광고 시청(선택, 하루 상한 가득 볼 때)
ROWS = [
    ('시작 선물', 'once', G['startGems'], '계정을 만들 때 한 번'),
    ('초보자 미션 30', 'once', sum(m['gems'] for m in B['beginner']), '30개를 다 받으면'),
    ('출석 7일', 'once', sum(a['gems'] for a in B['attend']), '7번 찍으면(쉬어도 이어서)'),
    ('도감 수집', 'once', sum(m['gems'] for m in B['dex']), '문턱 5·10·15·20·30명'),
    ('단계 첫 클리어', 'once', sum(s['gems'] if s.get('gems') is not None else G['clearGems'] for s in D['stages']), str(len(D['stages'])) + '단계를 처음 깰 때(깨는 속도만큼)'),
    ('업적', 'once', sum(a.get('gems', 0) for a in B['ach']), '업적은 칭호만(반짝석 없음)'),
    ('계절 이벤트', 'year', sum(sum(e['gems']) for e in B['events']), '계절 ' + str(SEASONS) + '번 × 3단계 첫 클리어'),
    ('주간 상자', 'year', W['gems'] * 52, '매주 1번(임무를 마친 날 ' + str(W['need']) + '일) × 52주'),
    ('보상형 광고', 'ad', ADS['grant'] * ADS['perDay'] * 365, '하루 ' + str(ADS['perDay']) + '번 × ' + str(ADS['grant']) + '(보고 싶은 만큼만 · 최대치)'),
]
# 새 보상 출처 점검: 데이터 안의 모든 'gems' 값이 위 표 어딘가에 잡혀 있어야 한다
def walk(o, p=''):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'gems' or k.endswith('Gems'): yield p + '/' + k
            yield from walk(v, p + '/' + k)
    elif isinstance(o, list):
        for v in o: yield from walk(v, p + '[]')
KNOWN = {'/stages[]/gems', '/gacha/startGems', '/gacha/clearGems', '/bal/dex[]/gems', '/bal/beginner[]/gems', '/bal/attend[]/gems', '/bal/events[]/gems', '/bal/daily/missions[]/gems', '/bal/daily/weekly/gems', '/bal/ach[]/gems', '/gacha/pickup/gems'}
new = sorted(set(walk(D)) - KNOWN); assert not new, '표에 없는 새 반짝석 보상 출처: ' + ', '.join(new) + ' — tools/gem_budget.py 의 ROWS·KNOWN 에 등록하세요'
once = sum(r[2] for r in ROWS if r[1] == 'once'); year = sum(r[2] for r in ROWS if r[1] == 'year'); first = once + year; ad = sum(r[2] for r in ROWS if r[1] == 'ad')
assert first <= FIRST_YEAR_CAP, f'첫해 무료 합계 {first} > 상한 {FIRST_YEAR_CAP} — 보상을 줄이거나 상한 변경을 작가에게 확인'
assert year <= YEARLY_CAP, f'해마다 반복 몫 {year} > 상한 {YEARLY_CAP}'
L = ['# ⑪ 무료 반짝석 연간 합계 표 (자동 생성)', '', '> `python tools/gem_budget.py` 가 데이터에서 계산해 이 파일을 다시 쓴다(기본 빌드 `expedition_slice_build.py` 끝에서 자동 실행). 손으로 고치지 않는다. 새 보상 출처를 만들면 `tools/gem_budget.py` 에 등록해야 빌드가 통과한다.', '', '모집 1번 = 반짝석 ' + str(PULL) + '. 아래 상한은 **[제안]** — 작가 확인 대기.', '', '| 출처 | 구분 | 반짝석 | 모집 환산 | 설명 |', '|---|---|---:|---:|---|']
KIND = dict(once='처음 한 번', year='해마다', ad='광고(선택)')
for n, k, v, t in ROWS: L.append(f'| {n} | {KIND[k]} | {v:,} | {v / PULL:.1f}번 | {t} |')
L += ['', f'- 처음 한 번 몫 합계: **{once:,}** ({once / PULL:.0f}번) · 해마다 반복 몫: **{year:,}** ({year / PULL:.0f}번)', f'- **첫해 무료 합계(광고 제외): {first:,}** ≤ 상한 {FIRST_YEAR_CAP:,} [제안] — 해마다 반복 몫 {year:,} ≤ 상한 {YEARLY_CAP:,} [제안]', f'- 광고를 하루 상한까지 매일 보면 연 {ad:,} 더(선택, 결제 압박 없음 · 보지 않아도 전부 즐길 수 있다)', '', '## 확정 지급 원칙', '- 반짝석은 전부 「한 번에 확정 지급」이고 줄거나 사라지지 않는다. 뽑기 확률·천장은 `docs/expedition` 의 확률표를 따른다.', '- 임무·출석은 쉬어도 잃는 것이 없다(연속 일수·벌점 없음).', '']
open('docs/33_GEM_ECONOMY.md', 'w', encoding='utf-8', newline='\n').write('\n'.join(L))
print('반짝석 표: 처음 한 번', once, '· 해마다', year, '· 첫해 합계', first, '(상한', FIRST_YEAR_CAP, ') · 광고 최대', ad)
