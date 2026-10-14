"""⑪ 무료 반짝석 출처별 「연간 합계 표」(경제 문서 한 곳: docs/33_GEM_ECONOMY.md) — 데이터(data/expedition_slice.json·expedition_shop.json)에서 자동 계산·자동 갱신.
tools/expedition_slice_build.py 가 데이터를 쓴 뒤 불러 쓴다(단독 실행 python tools/gem_budget.py 도 된다). 새 보상 출처가 생기면 출처 목록에 등록하지 않는 한 빌드가 실패한다(표를 건너뛸 수 없다).
상한(허브 D28, 유료 판매 전 작가 확인 대기): ① 해마다 반복되는 무료(이벤트·주간) ≤ YEARLY_CAP ② 단계 첫 클리어 보상은 단계당 평균 ≤ PER_STAGE_CAP(콘텐츠 양에 비례 → 단계를 늘려도 단가만 지키면 통과) ③ 광고 보상은 별도 표기(상한 없음·선택)."""
import json, io, sys
try: sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
except Exception: pass
YEARLY_CAP = 2000          # D28: 해마다 반복되는 몫(이벤트+주간) 상한/년 ≈ 모집 13번
FIXED_ONCE_CAP = 2000     # D28: 콘텐츠와 무관한 고정 1회 보상(도감·초보·출석) 합계 상한
PER_STAGE_CAP = 66         # D28: 단계 첫 클리어 보상 단계당 평균 상한(단계 수에 비례해 늘어나는 한 번뿐인 보상의 단가)
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
    ('주간 협동 보스', 'year', (B['wkboss']['partGems'] + sum(t['gems'] for t in B['wkboss']['tiers'])) * 52, '참여 💎' + str(B['wkboss']['partGems']) + ' + 모두의 합계 단계 💎' + '·'.join(str(t['gems']) for t in B['wkboss']['tiers']) + ' × 52주(최대)'),
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
KNOWN = {'/stages[]/gems', '/gacha/startGems', '/gacha/clearGems', '/bal/dex[]/gems', '/bal/beginner[]/gems', '/bal/attend[]/gems', '/bal/events[]/gems', '/bal/daily/missions[]/gems', '/bal/daily/weekly/gems', '/bal/wkboss/partGems', '/bal/wkboss/tiers[]/gems', '/bal/ach[]/gems', '/gacha/pickup/gems'}
new = sorted(set(walk(D)) - KNOWN); assert not new, '표에 없는 새 반짝석 보상 출처: ' + ', '.join(new) + ' — tools/gem_budget.py 의 ROWS·KNOWN 에 등록하세요'
once = sum(r[2] for r in ROWS if r[1] == 'once'); year = sum(r[2] for r in ROWS if r[1] == 'year'); first = once + year; ad = sum(r[2] for r in ROWS if r[1] == 'ad')
NS = len(D['stages']); stage_sum = [r[2] for r in ROWS if r[0] == '단계 첫 클리어'][0]; content = sum(r[2] for r in ROWS if r[0] in ('단계 첫 클리어', '도감 수집', '초보자 미션 30', '출석 7일'))
assert stage_sum / NS <= PER_STAGE_CAP, f'단계 첫 클리어 보상 단계당 평균 {stage_sum / NS:.1f} > 상한 {PER_STAGE_CAP} (D28) — 새 단계의 보상 단가를 낮추세요'
fixed = sum(r[2] for r in ROWS if r[0] in ('도감 수집', '초보자 미션 30', '출석 7일'))
assert fixed <= FIXED_ONCE_CAP, f'콘텐츠와 무관한 고정 1회 보상(도감·초보·출석) {fixed} > 상한 {FIXED_ONCE_CAP} (D28)'
assert year <= YEARLY_CAP, f'해마다 반복 몫 {year} > 상한 {YEARLY_CAP}'
L = ['# ⑪ 무료 반짝석 연간 합계 표 (자동 생성)', '', '> `python tools/gem_budget.py` 가 데이터에서 계산해 이 파일을 다시 쓴다(기본 빌드 `expedition_slice_build.py` 끝에서 자동 실행). 손으로 고치지 않는다. 새 보상 출처를 만들면 `tools/gem_budget.py` 에 등록해야 빌드가 통과한다.', '', '모집 1번 = 반짝석 ' + str(PULL) + '. 아래 상한은 허브 결정(D28) — 유료 판매 전 작가 확인 대기.', '', '| 출처 | 구분 | 반짝석 | 모집 환산 | 설명 |', '|---|---|---:|---:|---|']
KIND = dict(once='처음 한 번', year='해마다', ad='광고(선택)')
for n, k, v, t in ROWS: L.append(f'| {n} | {KIND[k]} | {v:,} | {v / PULL:.1f}번 | {t} |')
L += ['', f'- 처음 한 번 몫 합계: **{once:,}** ({once / PULL:.0f}번) · 해마다 반복 몫: **{year:,}** ({year / PULL:.0f}번)', f'- 첫해 무료 합계(광고 제외): {first:,} (참고)', f'- **① 해마다 반복 몫 {year:,} ≤ 상한 {YEARLY_CAP:,}/년** (D28)', f'- **③ 고정 1회 보상(도감·초보·출석) {fixed:,} ≤ 상한 {FIXED_ONCE_CAP:,}** (D28)', f'- **② 단계 첫 클리어 단계당 평균 {stage_sum / NS:.1f} ≤ 상한 {PER_STAGE_CAP}** (D28, 단계 {NS}개) — 참고: 첫 클리어·도감·초보·출석을 모두 합친 한 번뿐인 콘텐츠 보상은 단계당 평균 {content / NS:.1f}', f'- 광고를 하루 상한까지 매일 보면 연 {ad:,} 더(선택, 결제 압박 없음 · 보지 않아도 전부 즐길 수 있다)', '', '## 확정 지급 원칙', '- 반짝석은 전부 「한 번에 확정 지급」이고 줄거나 사라지지 않는다. 뽑기 확률·천장은 `docs/expedition` 의 확률표를 따른다.', '- 임무·출석은 쉬어도 잃는 것이 없다(연속 일수·벌점 없음).', '']
open('docs/33_GEM_ECONOMY.md', 'w', encoding='utf-8', newline='\n').write('\n'.join(L))
print('반짝석 표: 처음 한 번', once, '· 해마다', year, '· 첫 클리어 단계당', round(stage_sum / NS, 1), '/', PER_STAGE_CAP, '· 콘텐츠 전체 단계당', round(content / NS, 1), '· 광고 최대', ad)
