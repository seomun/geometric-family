import pathlib, re
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
a0 = z.index("GUEST = {"); a1 = z.index("# ---- 주간 주제(4)")
new = r'''GUEST = {  # 손님 = 그 손님이 「일하는」 앱 · docs/24_CAMEO_LINES_v2.md(허브 v2). 대사 30개 모두 다름(단언: tools/ip_smoke.js), 광고성 말 없음
    'merge': ('husband.joy', '🧳', ['이삿짐이 한가득! …근데 반은 아내 캐리어야.', '이사는 한 방에 끝낸다. 허리는 내일 생각하고.', '상자에 「깨짐 주의」라고 썼어. 내 마음 말고 접시.', '짐 줄이자더니, 또 여행 가방이 늘었네.', '다 옮겼다! 이제 짜장면 시킬 시간.']),
    'spot': ('dong_dad.calm', '🖼️', ['액자가 1도 기울었어요. 바로잡는 중입니다.', '다른 곳을 찾았어요. 일곱 개 중 하나.', '사진 속 의자 하나가 비어 있네요. …괜찮습니다.', '틀린 그림은 금방 찾는데, 다른 건 잘 안 보이더군요.', '정답 일곱 개. 오늘도 정확합니다.']),
    'block': ('nemo_dad.good', '🧱', ['한 줄 맞췄다! 학원비도 이렇게 딱 맞으면 좋겠네.', '벽돌 한 장에 한숨 한 번. 그래도 집은 올라간다.', '줄은 지워지는데 할 일은 안 지워지네.', '튼튼하게 쌓는 중. 일곱 식구가 들어가야 하거든.', '두 줄 한꺼번에! 오늘은 운이 좋다.']),
    'sort': ('nemo_mom.good', '🗄️', ['선반 정리 끝! 내일이면 또 섞이겠지만요.', '양말 짝 찾는 데 삼십 분. 그래도 다 찾았어요.', '같은 것끼리 모아요. 아이들은 따로따로.', '냉장고 반찬통, 뚜껑까지 다 맞췄어요!', '「제자리에 놓으면 끝」… 오늘만 일곱 번 말했어요.']),
    'tile': ('nemo_kids.kid1', '🧺', ['세 개 모으기는 자신 있어요. 동생이 셋이거든요.', '바구니 칸이 모자라요. 우리 집 식탁처럼.', '짝을 맞췄어요! 엄마한테 자랑해야지.', '같은 그림 세 개! 막둥이도 같이 할래?', '마지막 한 칸에서 딱! 숨 참았어요.']),
    'idle': ('nemo_grandma.good', '🍲', ['국 끓여 놨다. 다 같이 먹어야 맛있지.', '밥은 먹고 다니냐. 한 숟갈만 더 떠라.', '반찬은 많을수록 좋아. 남으면 내일 먹고.', '식구가 많으니 솥도 커야지.', '오늘은 세 집이 다 모인다더라. 밥 넉넉히 해야지.']),
    'quiz': ('wife.smug', '🔮', ['오늘 결과는 세모래요. 역시 나다워!', '테스트 열 번 했는데 다 다르게 나와요. 그게 나예요.', '남편은 네모 나왔대요. 절대 아닌데…', '어느 도형이냐고요? 기분 따라 달라져요!', '다음엔 동그라미 나오게 해 볼래요. 우아하게.']),
}
KID_GUEST = [('dong_dad.joy', '🚂', 'play'), ('nemo_kids.kid2', '🖍️', 'color'), ('wife.joy', '🎈', 'play')]   # 유아 ⑩ 손님: 동그라미 아저씨·두리 누나·세모 이모(막둥이는 자기 앱에 손님으로 나오지 않는다)
def cameos():
    out = []; ORDER = ['merge', 'spot', 'block', 'sort', 'tile']; GORD = ['merge', 'spot', 'block', 'sort', 'tile', 'idle', 'quiz']
    for hi, h in enumerate(ORDER):
        guests = [g for g in GORD if g != h]; guests = guests[hi % len(guests):] + guests[:hi % len(guests)]            # 호스트마다 시작 손님을 돌려 순서가 다르게
        for j, n in enumerate([2, 4, 6, 8, 10, 12]):
            f = guests[j]; ch, prop, lines = GUEST[f]
            hosts_of_f = [x for x in ORDER if x != f]                                                                    # 그 손님이 나오는 앱 순서(자기 앱 제외)
            k = hosts_of_f.index(h)                                                                                       # 그 순서에서 내 앱이 몇 번째인가 → 그 번호의 대사
            out.append(dict(id=f'{h}:e{n}', host=h, after=f'e{n}', who=ch, prop=prop, frm=f, line=lines[k], kid=False))
    for j, n in enumerate([2, 4, 6, 8, 10, 12]):
        ch, prop, frm = KID_GUEST[j % 3]; out.append(dict(id=f'day:e{n}', host='day', after=f'e{n}', who=ch, prop=prop, frm=frm, line='', kid=True))
    return out
'''
z = z[:a0] + new + z[a1:]
b.write_text(z, encoding='utf-8')
# 앨범 카드 줄: 제목 한 줄, 힌트는 아래 작은 줄
c = pathlib.Path('games/engine/extras.css'); x = c.read_text(encoding='utf-8')
if 'ops-card hint' not in x:
    x += "\n/* 카드 줄: 제목은 한 줄 전체, 「어느 앱에서 얻나」 힌트는 그 아래 작은 줄 (ops-card hint) */\n.ops-card { flex-wrap: wrap; } .ops-card b { flex: 1 1 0; white-space: normal; overflow: visible; text-overflow: clip; } .ops-card small { flex: 1 1 100%; max-width: 100%; text-align: left; padding-left: 34px; margin-top: -2px; }\n"
    c.write_text(x, encoding='utf-8')
print('ok')
