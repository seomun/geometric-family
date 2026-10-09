"""data/story_<앱>.json 생성 — 이야기 진행 층(games/engine/tale.js)의 데이터. 모든 글은 [제안] 각색.
원천: data/<앱>_extra.json 의 장별 옛이야기 컷 4개(단일 배역표 tools/tales_cast.py 와 같은 배역) → 기(start)=앱 한 줄+컷1, 승=컷2(장의 40%), 전=컷3(70%), 결=컷4.. (장 끝).
추가: 프롤로그 · 판 안 말풍선(start/clear) · 판 종류 설명(rules) · 엔딩 · 마지막 카드 문구. 작가 원문 문장은 쓰지 않는다."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
R = lambda p: json.load(open(p, encoding='utf-8'))

APPS = {
    'merge': dict(per=10, hook='합칠수록 달라져요. 작은 것 둘이 모이면 더 큰 하나가 돼요.', who='nemo_mom.joy',
        pro=[('nemo_mom.joy', '네모 엄마가 부엌에서 작은 재료를 모았다. 「둘이 만나면 더 좋은 게 되더라.」'),
             ('nemo_dad.wink', '네모 아빠가 옆에서 거들었다. 「같은 것끼리 합쳐 볼까?」'),
             ('wife.joy', '세모 아내가 반짝이는 조각을 내밀었다. 「이건 건너뛰어도 돼요!」')],
        start=['오늘은 무엇을 합쳐 볼까요?', '조금만 더 모이면 돼요.', '천천히, 하나씩이요.'], clear=['잘 합쳤어요!', '또 하나 커졌어요.', '이대로 쭉이요.'],
        rules={'make': ('✨', '만들기', '같은 조각 둘을 맞닿게 놓으면 하나 더 큰 조각이 돼요. 목표 조각을 만들면 끝이에요.'),
               'order': ('📝', '주문', '손님 주문표에 적힌 조각을 만들어 내요. 순서는 마음대로예요.'),
               'tight': ('🧩', '좁은 판', '자리가 적어요. 어디에 놓을지 한 번 더 생각해 봐요.'),
               'solo': ('🙂', '한 종류만', '이번엔 한 종류 조각만 나와요. 쭉 이어 합쳐 봐요.'),
               'clear': ('🧹', '판 치우기', '판 위의 조각을 합쳐서 비우면 끝이에요.'),
               'move': ('🚚', '이사', '조각을 옮겨 길을 만들어 줘요.'),
               'kimjang': ('🥬', '김장', '여러 재료를 같이 합쳐 한 상을 차려요.')}),
    'spot': dict(per=10, hook='같은 그림 같지만 어딘가 달라요. 하나씩 찾아봐요.', who='nemo_dad.joy',
        pro=[('nemo_dad.joy', '네모 아빠가 두 장의 그림을 나란히 놓았다. 「자세히 보면 달라.」'),
             ('husband.wink', '세모 남편이 눈을 가늘게 떴다. 「이건 내가 먼저 찾을걸?」'),
             ('dong_dad.calm', '동그라미 아빠는 조용히 웃었다. 「서두르지 않아도 돼요.」')],
        start=['어디가 달라졌을까요?', '눈을 크게 떠 봐요.', '천천히 보면 보여요.'], clear=['찾았어요!', '눈이 밝네요.', '한 곳씩 사라져요.'],
        rules={'diff': ('🔍', '틀린 그림', '두 그림에서 다른 곳을 눌러요. 목표 개수만큼 찾으면 끝이에요.'),
               'odd': ('☝️', '다른 하나', '여럿 중에서 모양이 다른 하나를 눌러요.'),
               'hidden': ('🫣', '숨은 물건', '그림 속에 숨은 물건을 찾아 눌러요.'),
               'three': ('3️⃣', '세 곳', '세 그림을 비교해서 다른 곳을 찾아요.'),
               'memory': ('🧠', '기억', '잠깐 보여 주는 그림을 기억해 두었다가 달라진 곳을 찾아요.'),
               'zoom': ('🔭', '확대', '그림을 크게 확대해서 작은 차이를 찾아요.')}),
    'block': dict(per=10, hook='조각을 놓아 줄을 채우면 사라져요. 가득 차기 전에 비워 봐요.', who='nemo_dad.good',
        pro=[('nemo_dad.good', '네모 아빠가 상자에 조각을 차곡차곡 쌓았다. 「딱 맞으면 기분이 좋아.」'),
             ('wife.smug', '세모 아내가 삐뚤게 놓고 윙크했다. 「이것도 맞는 거 아니에요?」'),
             ('dong_dad.calm', '동그라미 아빠가 한 줄을 완벽하게 채웠다. 「자, 한 줄.」')],
        start=['어디에 놓을까요?', '빈칸을 먼저 봐요.', '한 줄만 채우면 돼요.'], clear=['한 줄 사라졌어요!', '깔끔해요.', '여유가 생겼어요.'],
        rules={'lines': ('➖', '줄 지우기', '조각을 끌어다 놓아 가로·세로 한 줄을 채우면 사라져요. 목표만큼 지우면 끝이에요.'),
               'family': ('👪', '세 가족 판', '같은 판을 세 가족 규칙으로 해 봐요. 규칙마다 맛이 달라요.'),
               'junk': ('🧹', '판 치우기', '미리 놓인 조각을 모두 치우면 끝이에요.'),
               'combo': ('💥', '한꺼번에', '여러 줄을 한꺼번에 지워 목표 점수를 채워요.'),
               'star': ('⭐', '반짝 칸', '반짝이는 칸이 든 줄을 지우면 별을 얻어요.'),
               'limit': ('🔢', '조각 수 제한', '쓸 수 있는 조각 수가 정해져 있어요. 아껴서 놓아요.'),
               'solo': ('🙂', '한 종류만', '한 종류 조각만 나오는 판이에요.')}),
    'sort': dict(per=10, hook='같은 색끼리 한 통에 모아요. 차근차근 옮기면 풀려요.', who='nemo_mom.good',
        pro=[('nemo_mom.good', '네모 엄마가 서랍을 열었다. 「색깔별로 모아 두면 찾기 쉽지.」'),
             ('wife.wink', '세모 아내가 형형색색 구슬을 쏟았다. 「와, 다 섞였다!」'),
             ('dong_dad.calm', '동그라미 아빠가 한 통씩 채워 갔다. 「한 번에 하나씩이면 돼요.」')],
        start=['어느 통부터 채울까요?', '빈 통을 잘 써 봐요.', '색을 하나씩 모아요.'], clear=['깔끔하게 모였어요!', '통이 하나씩 차요.', '잘 정리됐어요.'],
        rules={'sort': ('🧪', '정리하기', '통을 눌러 위의 색을 다른 통으로 옮겨요. 한 통에 한 색만 모으면 끝이에요.'),
               'pair': ('🔗', '짝 칸', '두 칸이 짝인 통이에요. 같이 움직여요.'),
               'limit': ('🔢', '옮기는 수 제한', '옮길 수 있는 횟수가 정해져 있어요.'),
               'locked': ('🔒', '잠긴 칸', '잠긴 칸은 앞 칸이 비면 열려요.'),
               'hidden': ('❓', '가려진 칸', '가려진 색은 위가 치워지면 보여요.'),
               'family': ('👪', '세 가족 규칙', '같은 판을 세 가족 규칙으로 해 봐요.')}),
    'tile': dict(per=10, hook='같은 그림 짝을 찾아 바구니에 담아요. 바구니가 차면 아쉬우니 신중하게요.', who='nemo_mom.joy',
        pro=[('nemo_mom.joy', '네모 엄마가 그림 조각을 펼쳤다. 「같은 그림끼리 모아 볼까?」'),
             ('husband.joy', '세모 남편이 아무거나 집으며 웃었다. 「어, 이거 맞나?」'),
             ('dong_dad.good', '동그라미 아빠가 바구니를 정돈했다. 「자리가 있어야 해요.」')],
        start=['어떤 그림부터 모을까요?', '바구니 자리를 아껴요.', '위에서부터 열어 봐요.'], clear=['짝이 맞았어요!', '바구니가 비었어요.', '깔끔해요.'],
        rules={'classic': ('🀄', '짝 맞추기', '그림을 눌러 바구니에 담아요. 같은 그림이 모이면 사라져요. 판을 모두 비우면 끝이에요.'),
               'pair': ('👯', '짝 맞추기(둘)', '같은 그림 둘이 모이면 사라져요.'),
               'goal': ('🎯', '목표 모으기', '정해진 그림을 목표만큼 모아요.'),
               'lock': ('🗝️', '자물쇠', '열쇠 그림을 먼저 모으면 자물쇠가 풀려요.'),
               'narrow': ('📦', '작은 바구니', '바구니 자리가 적어요. 더 조심해서 골라요.'),
               'trio': ('3️⃣', '셋 맞추기', '같은 그림 셋이 모여야 사라져요.')}),
    'day': dict(per=5, hook='오늘 하루, 아이처럼 천천히. 하나씩 해 보면 돼요.', who='baby.joy',
        pro=[('baby.joy', '막둥이가 아침에 눈을 떴다. 「오늘은 뭐 할까?」'),
             ('nemo_mom.love', '엄마가 웃으며 말했다. 「이도 닦고, 옷도 입고, 같이 해 보자.」'),
             ('nemo_dad.wink', '아빠는 장난감을 정리해 놓고 윙크했다.')],
        start=['오늘도 해 볼까?', '같이 하자!', '천천히 해도 돼.'], clear=['잘했어!', '또 하나 끝났네.', '멋져!'],
        rules={'brush': ('🪥', '씻기', '손가락으로 문질러서 깨끗하게 해 줘요.'),
               'dress': ('👕', '옷 입기', '알맞은 옷을 골라 입혀 줘요.'),
               'chew': ('🍽️', '먹기', '한 입씩 맛있게 먹어요.'),
               'tidy': ('🧸', '정리하기', '제자리에 하나씩 놓아요.'),
               'sleep': ('🌙', '잠자기', '불을 끄고 포근하게 잠들어요.')}),
}

ENDING_BASE = [
    ('nemo_dad.joy', '모든 이야기가 끝났다. 네모 아빠가 크게 숨을 쉬고 웃었다.'),
    ('wife.love', '세모 아내가 손뼉을 쳤다. 「이야기마다 우리가 다 있었네요!」'),
    ('dong_dad.warm', '동그라미 아빠가 조용히 고개를 끄덕였다. 「다음에도 같이 해요.」'),
]

# 장이 없는 앱(②방치형·④색칠북·⑤성격 테스트): 프롤로그 + 판 종류 설명(성인만 「도움말」) + 엔딩 카드 문구. 장 이야기는 앱 안에 이미 있다(사연·옛이야기 색칠·결과 카드).
LIGHT = {
    'idle': dict(pro=[('nemo_dad.joy', '세 가족이 한 동네에 산다. 오늘도 식탁이 차려졌다.'), ('wife.joy', '식탁에 앉으면 온기가 조금씩 쌓여요. 가만히 있어도요.'), ('dong_dad.warm', '쌓인 온기로 가족 사연이 하나씩 열려요. 서두를 필요 없어요.')],
        rules={'table': ('🍲', '식탁', '식탁 위 음식을 눌러 온기를 모아요. 앱을 닫아도 온기는 천천히 쌓여요.'), 'story': ('📖', '가족 사연', '온기가 모이면 사연이 열려요. 다 본 사연은 도감에 남아요.'), 'season': ('🍂', '계절 손님', '계절마다 손님이 찾아와요. 놓쳐도 괜찮아요.')}),
    'color': dict(pro=[('baby.joy', '막둥이가 크레파스를 꺼냈다. 「오늘은 뭘 칠할까?」'), ('wife.joy', '세모 이모가 방긋 웃었다. 「마음대로 칠해도 돼!」'), ('nemo_mom.joy', '완성한 그림은 우리 집 벽에 걸어 줄게.')], rules={}),
    'quiz': dict(pro=[('nemo_dad.joy', '네모 아빠가 물었다. 「너는 어떤 도형이야?」'), ('wife.wink', '세모 아내가 윙크했다. 「재미있는 걸로 알아봐요!」'), ('dong_dad.calm', '정답은 없어요. 고르는 대로 나예요.')],
        rules={'test': ('📝', '도형 테스트', '질문에 답하면 네모·세모·동그라미 중 나와 닮은 도형이 나와요. 정답은 없어요.'), 'mini': ('🎮', '미니게임', '짧은 게임으로 가볍게 쉬어 가요. 결과는 기기 안에만 저장돼요.')}),
}


def build_light(app, cfg):
    d = dict(app=app, version=1, note='[제안] 이야기 진행 층(간이). tools/story_build.py 로 생성.', per=0, last=0,
             prologue=[dict(text=t, chars=[w]) for w, t in cfg['pro']], chapters={}, rules={k: dict(icon=v[0], title=v[1], text=v[2]) for k, v in cfg['rules'].items()}, ending=[],
             finalLine='네모는 평범하게, 세모는 행복하게, 동그라미는 완벽하게. 오늘의 나는 어느 쪽에 가까웠나요? 댓글로 알려 주세요.')
    json.dump(d, open(f'data/story_{app}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(app, 'light')


def build(app, cfg):
    X = R(f'data/{app}_extra.json'); L = R(f'data/{app}_levels.json'); per = cfg['per']
    chapters = {}
    for s in X['stories']:
        n = s['chapter']; cuts = s['cuts']
        faces = []
        for c in cuts:
            for i in c['chars']:
                if i not in faces: faces.append(i)
        say = lambda kind: [dict(who=(faces[i % len(faces)] if faces else cfg['who']), text=t) for i, t in enumerate(cfg[kind])]
        a1, a2 = max(1, round(per * 0.4)), max(2, round(per * 0.7))
        rest = cuts[3:]
        chapters[str(n)] = dict(title=s['title'], tale=s['tale'], faces=faces[:3], midAt1=a1, midAt2=a2,
            start=([dict(text=cfg['hook'], chars=[cfg['who']])] if n == 1 else []) + [cuts[0]],
            mid=[dict(after=a1, cuts=[cuts[1]]), dict(after=a2, cuts=[cuts[2]])], end=rest,
            say=dict(start=say('start'), clear=say('clear')))
    rules = {k: dict(icon=v[0], title=v[1], text=v[2]) for k, v in cfg['rules'].items()}
    last = max(int(k) for k in chapters)
    d = dict(app=app, version=1, note='[제안] 이야기 진행 층. tools/story_build.py 로 생성.', per=per, last=last,
             prologue=[dict(text=t, chars=[w]) for w, t in cfg['pro']], chapters=chapters, rules=rules,
             ending=[dict(text=t, chars=[w], bubble='heart' if i == 2 else None) for i, (w, t) in enumerate(ENDING_BASE)],
             finalLine='네모는 평범하게, 세모는 행복하게, 동그라미는 완벽하게. 오늘의 나는 어느 쪽에 가까웠나요? 댓글로 알려 주세요.')
    json.dump(d, open(f'data/story_{app}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(app, 'chapters', len(chapters), 'rules', len(rules), 'last', last)


if __name__ == '__main__':
    for a, c in APPS.items(): build(a, c)
    for a, c in LIGHT.items(): build_light(a, c)
