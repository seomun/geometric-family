"""D21(광고 제거·로컬 알림·문의/백업) 문구를 games/tools/make_store_docs.py 와 KIDS_COMPLIANCE 에 반영(멱등)."""
import pathlib
p = pathlib.Path('games/tools/make_store_docs.py'); s = p.read_text(encoding='utf-8'); n0 = s
R = [
 ("| 가격 | 무료 · 앱 내 결제 없음 · **광고 포함**", "| 가격 | 무료 · 앱 내 결제 {'**없음**' if not a['adult'] else '**선택**(광고 제거 1회·소품 팩 1회 — 소품은 확정 지급, 랜덤 없음, 상품 ID 준비 후)'} · **광고 포함**"),
 ("저장소·카메라·마이크·위치는 없음' if a['adult'] else", "알림(POST_NOTIFICATIONS — 설정에서 「오늘의 한 판 알림」을 켤 때만 요청) · 결제(BILLING, 선택 구매용) — 저장소·카메라·마이크·위치는 없음' if a['adult'] else"),
 ("- 앱 개발자는 이용자의 정보를 제3자에게 제공하지 않습니다. 분석 SDK·결제 기능은 없습니다.", "- 앱 개발자는 이용자의 정보를 제3자에게 제공하지 않습니다. 분석 SDK 는 없습니다.{' 선택 구매(성인 앱의 광고 제거·소품 팩)는 Google Play 결제를 쓰며 결제 정보는 Google 이 처리하고 개발자는 카드·결제 정보를 받지 않습니다.' if a['adult'] else ' 유아 앱에는 결제 기능이 없습니다.'}"),
 ("('앱 내 결제', '없음')", "('앱 내 결제', '없음' if not adult else '선택(광고 제거·소품 팩 1회, 소품은 확정 지급·랜덤 아님)')"),
 ("진동(VIBRATE, 판을 놓을 때의 짧은 손맛, 설정에서 끌 수 있음), 인터넷·네트워크 상태(광고 SDK), 광고 ID(AD_ID, 광고 SDK 용)를 사용합니다.", "진동(VIBRATE, 판을 놓을 때의 짧은 손맛, 설정에서 끌 수 있음), 인터넷·네트워크 상태(광고 SDK), 광고 ID(AD_ID, 광고 SDK 용), 알림(POST_NOTIFICATIONS, 설정에서 「오늘의 한 판 알림」을 켤 때만 요청, 기본 꺼짐), 결제(BILLING, 선택 구매용)를 사용합니다."),
]
for a, b in R:
    if a in s: s = s.replace(a, b)
    else: print('MISS', a[:40])
p.write_text(s, encoding='utf-8'); print('store docs', s != n0)
k = pathlib.Path('games/KIDS_COMPLIANCE.md'); t = k.read_text(encoding='utf-8')
if '## 10. D21' not in t:
    t += """
## 10. D21 운영·구매·알림 추가분 (2026-10-12) — 유아 ①④⑩ 영향
- **구매·알림 없음**: 유아 flavor 매니페스트에서 `com.android.vending.BILLING`·`POST_NOTIFICATIONS` 를 `tools:node="remove"` 로 제거, `GFBilling`·`GFNotify` 는 `BuildConfig.GF_KID` 면 모든 호출을 무시(Java), JS(`GF.ops.iap/notif`)도 유아 앱에선 `configured`/`native` 가 항상 false(smoke 가 스텁을 심어도 줄이 없음을 단언).
- **인앱 리뷰 없음**: `GFOps.review()` 가 유아 flavor 에서 즉시 반환, JS `reviewDue()` 도 유아면 false.
- **보호자 메뉴(구구단 뒤)에 추가된 것**: 「움직임 줄이기」·「문의·FAQ」·「백업 코드」(기기 안 문자열, 서버 없음). 문의 메일은 `GFOps.mail` 이 시스템 메일 앱을 연다(앱 밖 이동이므로 **보호자 잠금 뒤 화면에서만**, 주소는 빌드 때 `~/.gf/store.env` 에서 주입 — 비어 있으면 버튼 숨김). 미션·달력·앨범은 성인 전용.
- **금요일 선물·오늘의 하루**: 기기 날짜 기준, 글자 없는 연출, 서버·권한 없음, 집 소품 확정 지급(뽑기 아님), 카운트다운·압박 없음.
"""
    k.write_text(t, encoding='utf-8')
print('ok')
