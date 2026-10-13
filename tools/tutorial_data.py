"""D22-1 「스토리가 곧 튜토리얼」 — 앱별 프롤로그·1장 시작 컷·판 종류 컷 데이터. tools/story_build.py 가 읽어 data/story_<앱>.json 에 덮어쓴다. 모든 글 [제안].
규칙: 이야기 속 배역이 그 게임의 동작을 직접 한다. 컷 안 작은 판(mini)은 실제 게임 판 조각 그림으로 그리고, 마지막 컷은 설명 카드→손가락 시연으로 이어진다.
mini 값은 games/<앱>/<앱>.js 의 GF.tale.mini.reg 가 읽는다. 배역: 1장 = 아기 돼지 삼형제(첫째 kid1·둘째 kid2·셋째 kid3)."""

K1, K2, K3 = 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3'

# ---- 합치기 ③ (세모 남편이 상자를 겹친다) ----
MG = {'c': 0, 't': 1}
SORT_A = {'pal': ['w:p_mix', 's:0:0', 's:0:1'], 'tubes': [[0, 1], [1], []], 'move': [0, 1]}
SORT_B = {'pal': ['w:p_mix', 's:0:0', 's:0:1'], 'tubes': [[1, 2], [2], []], 'move': [0, 1]}
TILE_A = {'kinds': ['k0', 'k1', 'k0', 'k2', 'k1', 'k2'], 'pick': 'k0', 'n': 2}      # 1~2장 첫 판은 「짝 맞추기(둘)」
TILE_B = {'kinds': ['k1', 'k0', 'k2', 'k0', 'k1', 'k2'], 'pick': 'k0', 'n': 2}
TILE_3 = {'kinds': ['k0', 'k1', 'k0', 'k2', 'k0', 'k1'], 'pick': 'k0', 'n': 3}

TUT = {
    'merge': dict(
        pro=[('husband.joy', '세모 남편이 이삿짐을 나르다 멈췄다. 「어? 똑같은 상자가 둘이네.」', None),
             ('husband.joy', '두 상자를 나란히 놓자… 짠! 하나 더 큰 상자가 됐다.', MG),
             ('nemo_mom.joy', '이제 같이 해 봐요. 같은 조각 둘을 맞닿게 놓으면 돼요.', MG)],
        hook=(K1, '첫째 돼지가 볏짚 둘을 겹쳐 놓자, 더 단단한 한 덩이가 됐다.', MG),
        cuts={'order': ('nemo_mom.joy', '손님이 주문표를 내밀었다. 「이 조각을 만들어 주세요.」', {'c': 0, 't': 2}),
              'tight': ('nemo_dad.wink', '자리가 좁네. 하나씩 놓을 곳을 먼저 생각해 보자.', MG),
              'solo': ('wife.joy', '이번엔 한 종류만 나와요. 쭉 이어 합쳐 봐요!', {'c': 1, 't': 1}),
              'clear': ('nemo_dad.joy', '판 위를 합쳐서 싹 비워 볼까?', MG),
              'move': ('husband.joy', '이삿날이다! 조각을 옮겨 길을 만들어 줘.', MG),
              'kimjang': ('nemo_mom.joy', '배추도 무도 한 상에. 여러 재료를 같이 합쳐요.', {'c': 2, 't': 1})}),
    'spot': dict(
        pro=[('dong_dad.calm', '동그라미 아빠가 그림 두 장을 나란히 걸었다. 「똑같아 보여도 한 군데가 달라요.」', None),
             ('dong_dad.calm', '가만히 들여다보다가 — 여기! 하고 동그라미를 쳤다.', {'level': 1, 'diff': 0}),
             ('nemo_dad.joy', '이제 같이 찾아봐요. 다른 곳을 콕 눌러요.', {'level': 1, 'diff': 0})],
        hook=(K1, '아기 돼지들 집 그림 두 장. 첫째가 소리쳤다. 「여기 달라요!」', {'level': 1, 'diff': 1}),
        cuts={'odd': ('husband.wink', '여럿 중에 모양이 다른 하나가 숨어 있어요.', {'level': 1, 'diff': 0}),
              'hidden': ('nemo_mom.joy', '그림 속에 숨은 물건이 있네. 어디 있을까?', {'level': 1, 'diff': 1}),
              'three': ('dong_dad.calm', '세 장을 나란히 두고 비교해 봐요.', {'level': 1, 'diff': 0}),
              'memory': ('nemo_dad.joy', '잠깐 보여 주는 그림을 기억해 뒀다가 달라진 곳을 찾아요.', {'level': 1, 'diff': 1}),
              'zoom': ('husband.joy', '작은 차이는 크게 확대해서 보면 보여요.', {'level': 1, 'diff': 0})}),
    'block': dict(
        pro=[('nemo_dad.good', '네모 아빠가 벽돌 조각을 쌓다가 멈췄다. 「한 줄만 채우면 되는데.」', None),
             ('nemo_dad.good', '빈칸에 조각을 쏙! 한 줄이 가득 차자 줄이 사라지고 벽이 한 칸 올라갔다.', {'c': 0}),
             ('dong_dad.calm', '이제 같이 쌓아 봐요. 조각을 끌어다 빈칸에 놓아요.', {'c': 1})],
        hook=(K3, '셋째 돼지가 벽돌을 한 줄로 채우자, 줄이 사라지며 벽이 우뚝 섰다.', {'c': 2}),
        cuts={'family': ('wife.joy', '같은 판이어도 세 가족 규칙이면 맛이 달라요.', {'c': 1}),
              'junk': ('nemo_mom.joy', '바닥에 짐이 가득! 조각을 놓아 모두 치워요.', {'c': 0}),
              'combo': ('dong_dad.calm', '여러 줄을 한꺼번에 채우면 점수가 크게 올라요.', {'c': 2}),
              'star': ('wife.wink', '반짝이는 칸이 든 줄을 지우면 별을 받아요.', {'c': 1}),
              'limit': ('nemo_dad.good', '조각 수가 정해져 있어요. 아껴서 놓아요.', {'c': 0}),
              'solo': ('nemo_mom.joy', '이번엔 한 종류 조각만 나와요.', {'c': 0})}),
    'sort': dict(
        pro=[('nemo_mom.good', '네모 엄마가 선반을 보며 말했다. 「같은 물건은 한 칸에 모아야지.」', None),
             ('nemo_mom.good', '맨 위의 하나를 옮기자, 같은 것끼리 한 칸에 모였다.', SORT_A),
             ('dong_dad.calm', '이제 같이 정리해요. 칸을 눌러 맨 위를 옮겨요.', SORT_A)],
        hook=(K2, '둘째 돼지가 나무 조각을 나무 칸으로 옮겼다. 차곡차곡.', SORT_B),
        cuts={'pair': ('nemo_mom.good', '두 칸이 짝이에요. 같이 움직여요.', SORT_A),
              'limit': ('nemo_dad.good', '옮길 수 있는 횟수가 정해져 있어요. 천천히 생각해요.', SORT_A),
              'locked': ('husband.wink', '잠긴 칸은 앞 칸이 비면 열려요.', SORT_A),
              'hidden': ('wife.joy', '가려진 물건은 위가 치워지면 보여요.', SORT_A),
              'family': ('nemo_mom.joy', '같은 판을 세 가족 규칙으로 해 봐요.', SORT_B)}),
    'tile': dict(
        pro=[(K1, '하나가 그림 조각을 펼쳤다. 「어? 같은 그림이 둘이나 있네!」', None),
             (K1, '같은 그림 둘을 눌러 바구니에 담자 — 쏙! 사라졌다.', TILE_A),
             ('nemo_mom.joy', '이제 같이 해요. 같은 그림을 눌러 바구니에 모아요.', TILE_A)],
        hook=(K3, '셋째 돼지가 벽돌 그림 둘을 바구니에 담았다. 쏙쏙!', TILE_B),
        cuts={'goal': ('dong_dad.good', '정해진 그림을 목표만큼 모아 봐요.', TILE_A),
              'lock': ('husband.joy', '열쇠 그림을 먼저 모으면 자물쇠가 풀려요.', TILE_A),
              'narrow': ('nemo_mom.joy', '바구니가 작아요. 더 조심해서 골라요.', TILE_A),
              'trio': ('dong_dad.good', '이번엔 같은 그림이 셋 모여야 사라져요.', TILE_3)}),
}

# ---- ⑩ 하루(유아) · ② 방치형 · ④ 색칠북 · ⑤ 테스트: 판 종류·프롤로그. ⑩ 1장 첫 판은 「양치」(brush) ----
BR = {'theme': 'teeth', 'level': 1}
TUT['day'] = dict(
    pro=[('baby.joy', '막둥이가 아침에 눈을 떴다. 「오늘은 뭐 할까?」', None),
         ('baby.joy', '칫솔이 쓱쓱 지나가자, 이에 묻은 얼룩이 사라졌다.', BR),
         ('nemo_mom.love', '엄마가 웃었다. 「이제 우리 막둥이가 닦아 볼까?」', BR)],
    hook=('baby.joy', '막둥이가 칫솔을 들고 이 닦는 순서를 따라 했다. 쓱쓱!', BR),
    cuts={'dress': ('baby.joy', '옷을 쏙! 입으니 든든해.', {'a': '👕', 'b': '🧒'}),
          'chew': ('baby.joy', '냠냠, 한 입씩 맛있게.', {'a': '🍚', 'b': '👄'}),
          'tidy': ('baby.joy', '장난감은 제자리에. 쏙!', {'a': '🧸', 'b': '📦'}),
          'sleep': ('baby.joy', '불을 끄고, 포근하게 쿨쿨.', {'a': '🌙', 'b': '🛏️'})})
TUT['idle'] = dict(
    pro=[('nemo_dad.joy', '세 가족이 한 동네에 산다. 오늘도 식탁이 차려졌다.', None),
         ('wife.joy', '음식을 톡 누르면 온기가 한 칸씩 쌓여요.', {'k': 'table'}),
         ('dong_dad.warm', '앱을 닫아도 온기는 천천히 쌓여요. 다 쌓이면 사연이 열려요.', {'k': 'story'})],
    hook=None, cuts={'story': ('nemo_mom.joy', '온기가 가득 차면 가족 사연이 열려요.', {'k': 'story'})})
TUT['color'] = dict(
    pro=[('baby.joy', '막둥이가 크레파스를 꺼냈다. 「오늘은 뭘 칠할까?」', None),
         ('baby.joy', '쓱쓱 칠하자 그림에 색이 번졌다.', {'k': 'paint'}),
         ('wife.joy', '세모 이모가 웃었다. 「마음대로 칠해도 돼!」', {'k': 'paint'})], hook=None, cuts={})
TUT['quiz'] = dict(
    pro=[('nemo_dad.joy', '네모 아빠가 물었다. 「너는 어떤 도형이야?」', None),
         ('wife.wink', '둘 중 끌리는 쪽을 톡 눌러요. 정답은 없어요.', {'who': 1}),
         ('dong_dad.calm', '고른 대로 나와 닮은 도형이 나와요.', {'who': 2})], hook=None, cuts={})
