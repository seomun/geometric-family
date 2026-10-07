"""③④⑤ 스토어 문서(등록 문안·방침·등급 답안)를 한 틀에서 만든다: python games/tools/make_store_docs.py
→ games/store/{LISTING,PRIVACY,RATING}_{merge,color,quiz}_ko.md   (문구는 여기서 고치고 다시 돌린다. ①②의 기존 문서는 건드리지 않는다)"""
import pathlib
OUT = pathlib.Path(__file__).resolve().parents[1] / 'store'
OP = '______________'
SIB = {'kid': ('「기하학 가족 놀이터」와 「막둥이 색칠북」', '유아 그룹'), 'adult': ('「세 가족 식탁」·「도형 합치기」·「도형 블록」·「당신은 어느 도형?」', '성인 그룹')}

APPS = {
 'merge': dict(
  name='기하학 가족: 도형 합치기', short='도형 합치기', pkg='com.geometricfamily.merge', grp='adult', adult=True, age='만 13세 이상 일반',
  cat='게임 > 퍼즐', one='같은 도형을 톡톡 합쳐 집을 채우는 잔잔한 퍼즐. 120판과 매일 한 판, 클리어한 가구가 우리 집에 놓여요',
  body='''네모·세모·동그라미가 새집으로 이사 가요. 판 위에 도형 조각을 한 칸씩 놓고, 같은 도형이 모이면 합쳐져 커집니다. 다 채우면 집이 한 칸 완성돼요.

■ 120판(아기돼지 삼형제 → 세 마리 곰 → 구두장이와 요정 … 12개 옛이야기) + 오늘의 한 판 + 계절 판
■ 판 종류 7가지: 만들기·주문·짐 치우기·좁은 집·한 가족만·이사·김장 — 장마다 새 규칙이 하나씩 나와요
■ 세 가족 판: 같은 판에서 네모·세모·동그라미 규칙이 서로 달라요
■ 클리어한 판에서 만든 가구가 「우리 집」에 놓여요
■ 되돌리기는 한 판에 한 번, 힌트는 언제든 · 시간 제한 없음, 틀려도 벌 없음
■ 광고·결제·서버·가입 없음, 개인정보 수집 없음, 오프라인 실행''',
  shots=['홈', '120판 목록', '합치는 중', '클리어', '세 가족 판', '우리 집'],
  ratingnote='판 퍼즐. 폭력·공포·선정·언어·약물·사행성 요소 없음. 확률형·랜덤 뽑기 없음(가구는 클리어 조건으로 확정 획득).',
  extra='게임 기록: 클리어한 판·별·모은 가구'),
 'color': dict(
  name='기하학 가족: 막둥이 색칠북', short='막둥이 색칠북', pkg='com.geometricfamily.color', grp='kid', adult=False, age='전체 이용가 · 만 3~6세 대상(가족 정책 준수)',
  cat='게임 > 어린이(Kids)  ※ 한국 스토어에서 선택 가능한지 포털 확인, 아니면 게임 > 교육/캐주얼', one='막둥이와 쓱쓱 색칠해요. 80장 도안, 완성하면 벽에 걸리는 광고 없는 안심 색칠북',
  body='''막둥이와 함께 색칠하는 놀이책이에요. 칠하고 싶은 색을 고르고 칸을 톡 누르면 쓱쓱 채워져요. 자유 색칠에는 틀린 색이 없어요.

■ 80장 도안: 자유 색칠, 번호 따라 색칠, 선 따라 그리기, 스티커 붙이기, 벽지 꾸미기, 옛이야기 색칠(아기돼지 삼형제·흥부 박 …)
■ 놀이 화면에 글자가 없어요(이야기 자막만 있어요)
■ 완성한 그림은 「우리 집」 벽에 액자로 걸려요
■ 광고·결제·서버·가입 없음, 사진·카메라·마이크 사용 없음, 앱 밖 링크 없음
■ 그림은 이 기기 안에만 저장돼요(사진첩 저장·공유 기능 없음)
■ 보호자 잠금(구구단) 뒤에서만 가족 집·설정 이용''',
  shots=['홈', '색칠 도안 목록', '색칠하기', '완성', '스티커', '우리 집'],
  ratingnote='아동 대상(만 3~6세). 폭력·공포·선정·언어·약물·사행성 없음. 광고·결제·외부 링크·추적 없음.',
  extra='색칠 기록: 칸 번호→색, 스티커 위치'),
 'block': dict(
  name='기하학 가족: 도형 블록', short='도형 블록', pkg='com.geometricfamily.block', grp='adult', adult=True, age='만 13세 이상 일반',
  cat='게임 > 퍼즐', one='네모·세모·동그라미 조각을 끌어다 놓아 줄을 채워 지우는 블록 퍼즐. 판마다 아는 옛이야기가 이어지고 깰수록 집 바깥이 채워져요',
  body='''조각 세 개를 판에 끌어다 놓고, 가로나 세로 한 줄을 가득 채우면 줄이 사라져요. 시간 제한도, 하트도 없어요. 자리가 없으면 바로 한 번 더!

■ 레벨 20판으로 시작(옛이야기 「아기돼지 삼형제」「브레멘 음악대」 순서로 계속 늘어나요) + 오늘의 한 판 + 계절 판
■ 판 종류 7가지: 줄 지우기·도형 모으기·짐 치우기·한꺼번에·반짝 칸·조각 아껴 쓰기·한 가족만
■ 세 가족 판: 같은 판을 네모·세모·동그라미 규칙으로 해 보세요(한꺼번에 지우면 조각을 돌려받기·반짝 줄은 옆 줄까지·4×4 방도 지워짐)
■ 깰수록 지붕·굴뚝·담장·대문·우체통이 「우리 집」 바깥에 놓여요
■ 되돌리기 한 판에 한 번, 힌트는 언제든 · 광고·결제·서버·가입 없음, 개인정보 수집 없음, 오프라인 실행''',
  shots=['홈', '레벨 목록', '플레이', '옛이야기 사연', '클리어', '우리 집(집 바깥)'],
  ratingnote='블록 퍼즐. 폭력·공포·선정·언어·약물·사행성 요소 없음. 확률형·랜덤 뽑기 없음(소품은 판 클리어로 확정 획득).',
  extra='게임 기록: 클리어한 판·별·모은 집 바깥 소품'),
 'quiz': dict(
  name='기하학 가족: 당신은 어느 도형?', short='당신은 어느 도형?', pkg='com.geometricfamily.quiz', grp='adult', adult=True, age='만 13세 이상 일반',
  cat='게임 > 라이프스타일/퀴즈(캐주얼)', one='웹툰 속 하루와 옛이야기로 알아보는 나는 네모? 세모? 동그라미? 테스트 17종과 미니게임',
  body='''식탁, 단톡방, 건강검진, 명절 … 일상의 작은 순간에서 내 선택을 골라 보세요. 끝나면 「나는 어느 도형인가요?」가 나와요.

■ 테스트 17종(일상 10 · 시즌 2 · 「동화 속 당신은?」 5) · 102문항 · 결과 9종(네모형·세모형·동그라미형의 세부 성향)
■ 내 도형 카드를 이미지로 저장 — 버튼을 누르면 기기 사진첩(Pictures/기하학 가족)에 저장돼요(저장소 권한 불필요)
■ 미니게임 5종(반응·기억·선택·그림·가족 맞히기), 결과는 문패와 배지로 「우리 집」에 걸려요
■ 테스트에는 정답이 없고 점수 비교·순위도 없어요, 결과는 이 기기에만 남음(집계·공유 서버 없음)
■ 광고·결제·서버·가입 없음, 개인정보 수집 없음, 오프라인 실행''',
  shots=['홈', '테스트 목록', '문항', '결과', '우리 집(문패)', '미니게임'],
  ratingnote='성향 테스트(재미용). 의학·심리 진단 아님. 폭력·공포·선정·언어·약물·사행성 없음.',
  extra='테스트 기록: 고른 결과(도형·세부 유형·점수 분포), 미니게임 별, 내 도형 문패'),
}


def listing(k, a):
    sib, gname = SIB[a['grp']]
    return f'''# 스토어 등록 문안 (초안) — {a['name']}

| 항목 | 내용 |
|---|---|
| 앱 이름 | {a['name']} |
| 패키지 | {a['pkg']} (한 번 올리면 못 바꿈) |
| 한 줄 소개 | {a['one']} |
| 카테고리 | {a['cat']} |
| 연령 | {a['age']} — {'아동 대상(Kids/Families 정책 적용)' if not a['adult'] else '아동 대상 아님 · 「아이용·유아」 표현을 문구·아이콘에 쓰지 않음(D12), 구현은 Families 수준(데이터·SDK·외부 링크 0)'} |
| 가격 | 무료 · 앱 내 결제 없음 · 광고 없음(수익 방식은 작가·퍼블리셔 결정, 현재 빌드는 갈고리만) |
| 개인정보처리방침 URL | (허브가 github.io 에 게시) — `PRIVACY_{k}_ko.md` |
| 지원 이메일 | {{{{SUPPORT_EMAIL}}}} (사업자 도메인 메일로 교체 예정) |
| 권한 | **없음** (인터넷 포함 선언 없음) |
| 아이콘 | `store/icon_512_{k}.png` |
| 버전 | 1.0.0 (versionCode 1) |

## 긴 설명
{a['body']}

## 함께 쓰면 좋아요 (같은 기기, 같은 회사 앱)
{gname}({sib})을 같은 기기에 함께 설치하면 「우리 집」을 서로 나눠 써요. 서버나 계정 없이 이 기기 안에서만 이어집니다. 설치하지 않아도 앱은 그대로 즐길 수 있어요. (앱 안에 다른 앱 설치·구매 안내나 링크는 없습니다.)

## 스크린샷 (store/shots_{k}/phone_1~6.png, 1080×1920 액자형 — 방치형·놀이터와 같은 틀)
`node games/tools/app_store.js {k}` → `APP={k} python games/tools/frame_shots.py`
| # | 장면 |
|---|---|
''' + '\n'.join(f'| {i + 1} | {s} |' for i, s in enumerate(a['shots'])) + '''

문구는 `frame_shots.py` 의 APPCAP (허브 확인용 초안). 홈·결과 화면의 계절 띠는 찍는 달에 따라 달라질 수 있으니 심사 제출 직전에 다시 찍는다.

## 정책 체크
- 랜덤 뽑기·확률형 아이템·유료 재화·시간 단축 결제: 없음
- 앱 밖 링크: 없음 / 권한: 없음 / 개인정보 수집: 없음 / 광고·결제: 현재 빌드 없음
- 폰트: Google Fonts 를 앱 안에 포함하지 않고 기기 글꼴 사용(인터넷 미사용)
'''


def privacy(k, a):
    sib, gname = SIB[a['grp']]
    save = ''
    if k == 'quiz':
        save = '\n사용자가 「이미지 저장」 버튼을 눌렀을 때만, 결과 카드 그림 한 장을 기기 사진첩(Pictures/기하학 가족)에 저장합니다. 이는 Android 가 제공하는 미디어 저장 기능을 쓰며 **저장소 권한을 요청하지 않습니다.** 저장된 이미지는 사용자가 직접 지우거나 공유할 수 있고, 앱은 이를 외부로 보내지 않습니다.\n'
    kidline = '\n## 5. 이용 연령\n만 3~6세 어린이를 대상으로 합니다. 수집하는 정보가 없고, 광고·결제·외부 링크가 없으며, 보호자 잠금(구구단 문제) 뒤에서만 가족 집·설정이 열립니다. 어린이 대상 앱의 개인정보 보호 규정(구글 가족 정책 등)을 따릅니다.\n' if not a['adult'] else '\n## 5. 이용 연령\n만 13세 이상 일반 이용을 전제로 한 앱입니다. 수집하는 정보가 없으므로 연령 확인 절차도 없습니다.\n'
    return f'''# 개인정보처리방침 — {a['name']} (초안)

시행일: 2026-__-__ (게시일로 채움) · 게시는 허브가 github.io 에 올린다 (스토어 등록 시 URL 필요)

## 한 줄 요약
**이 앱은 어떤 개인정보도 수집·저장·전송하지 않습니다.** 계정이 없고, 인터넷에 연결하지 않으며, 아무 권한도 요청하지 않습니다.

## 1. 수집하는 정보
없습니다. 이름·연락처·사진·음성·위치·기기 식별자·광고 ID·사용 기록 분석 정보를 수집하지 않습니다.

## 2. 기기 안에만 저장되는 정보
{a['extra']}, 모은 가구·소품과 놓은 위치, 설정이 이 **기기 안**에만 저장되며 외부로 전송되지 않습니다. 앱 삭제로 지워집니다.{save}
같은 회사의 형제 앱({sib})이 같은 기기에 설치돼 있으면 「우리 집」(얻은 아이템 번호 목록과 놓은 위치)을 서로 읽어 와 함께 보여 줍니다. 이 공유는 **같은 서명의 앱 사이, 같은 기기 안**에서만 이뤄지고({gname}끼리만), 서버·계정·권한이 없으며 다른 앱이나 제3자는 읽을 수 없습니다.

## 3. 제3자 제공·광고·결제
- 제3자에게 제공하거나 공유하는 정보가 없습니다.
- 현재 버전에는 광고 SDK·분석 SDK·결제 기능이 없습니다. (추가되면 먼저 이 방침을 고쳐 게시합니다.)
- 앱 밖(웹사이트·다른 앱)으로 이동하는 링크가 없습니다.

## 4. 앱 권한
요청하는 권한이 없습니다(인터넷·저장소·카메라·마이크·위치·알림 모두 사용하지 않음).
{kidline}
## 6. 운영자와 문의
- **개인정보 처리자(운영자)**: {OP} (사업자 명의·대표자 확정 후 기재)
- **사업자등록번호**: {OP} (해당 시)
- 문의: {{{{SUPPORT_EMAIL}}}} (사업자 도메인 메일로 교체 예정). 변경 시 이 문서와 앱 업데이트 노트에 알립니다.

---
## Privacy Policy (English summary)
This app does not collect, store, or transmit any personal information. No accounts, no network access, no permissions, no ads, no analytics, no in-app purchases in this version. Progress is stored only on the device and is erased by uninstalling the app. Sibling apps from the same publisher on the same device may share the in-game "house" (item ids and positions) through an on-device store restricted to apps signed with the same key; nothing leaves the device.{' The quiz result card can be saved as an image to Pictures only when the user taps Save, without any storage permission.' if k == 'quiz' else ''}
'''


def rating(k, a):
    adult = a['adult']
    rows = [('폭력성 (신체·무기·유혈)', '없음'), ('공포', '없음'), ('선정성·노출', '없음'), ('언어(욕설·비속어)', '없음'), ('약물·음주·흡연', '없음'),
            ('**사행성(도박·확률형 아이템·랜덤 뽑기)**', '**없음**'), ('앱 내 결제', '없음'), ('광고', '없음'), ('사용자 간 상호작용·채팅·UGC', '없음'),
            ('개인정보 수집·공유', '없음'), ('위치 공유', '없음'), ('외부 링크·웹 접속', '없음'), ('정치·종교·실존 인물', '없음')]
    t = '\n'.join(f'| {q} | {r} | {a["ratingnote"] if i == 0 else ("PRIVACY_" + k + "_ko.md" if "개인정보" in q else "—")} |' for i, (q, r) in enumerate(rows))
    return f'''# 등급 설문 답안 초안 — {a['name']} (삼성 갤럭시 스토어 자체등급분류 · 구글 IARC 공통 기준)

| 질문 | 답 | 근거 |
|---|---|---|
{t}
| 대상 연령 | {a['age']} | {'「아동 대상」 체크, Families/Kids 정책 준수(보호자 잠금·외부 링크 없음·추적 없음)' if not adult else 'Kids 카테고리 아님 — 「아동 대상」 체크하지 않음(D12). 문구·아이콘에 아이용 표현 없음'} |

예상 등급: 전체 이용가. 최종 등급은 스토어 설문 결과를 따른다.
⚠ 실제 문항명은 포털 확인. 국내 게임물 등급분류(자체등급분류 가능 여부·사업자 요건)는 판매자 등록 시 확인(RELEASE_CHECKLIST.md).
'''


for k, a in APPS.items():
    (OUT / f'LISTING_{k}_ko.md').write_text(listing(k, a), encoding='utf-8')
    (OUT / f'PRIVACY_{k}_ko.md').write_text(privacy(k, a), encoding='utf-8')
    (OUT / f'RATING_{k}_ko.md').write_text(rating(k, a), encoding='utf-8')

# 자리표시({{SUPPORT_EMAIL}} 등)를 저장소 밖 ~/.gf/store.env 값으로 채워 games/store/out/ (gitignore)에 낸다 — 공개 저장소에 실제 메일을 두지 않기 위함
env = {}
ef = pathlib.Path.home() / '.gf' / 'store.env'
if ef.exists():
    for ln in ef.read_text(encoding='utf-8').splitlines():
        if '=' in ln and not ln.startswith('#'): k_, v_ = ln.split('=', 1); env[k_.strip()] = v_.strip()
od = OUT / 'out'; od.mkdir(exist_ok=True)
for f in sorted(OUT.glob('*_ko.md')):
    t = f.read_text(encoding='utf-8')
    for k_, v_ in env.items(): t = t.replace('{{' + k_ + '}}', v_)
    (od / f.name).write_text(t, encoding='utf-8')
left = sorted({m for f in od.glob('*.md') for m in __import__('re').findall(r'\{\{[A-Z_]+\}\}', f.read_text(encoding='utf-8'))})
print('store docs ok', '· 채워지지 않은 자리표시:', left or '없음')
