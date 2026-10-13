"""D7: 웹툰 E15 「최악의 날」(작가 원고 content/seeds/author/2026-10-08_최악의날.md — 원문은 손대지 않는다)을 게임에 각색해 넣는다. 멱등. 문구는 모두 [제안].
① ② 세 가족 식탁 사연 31번째(s31, 4번째 길 「오늘의 사연」) — data/idle_stories.json + 온기 문턱(data/idle_balance.json) + 이야기 지도(tools/map_build.py 가 길을 만든다)
② 우리 집 「오늘의 장면」 1종 「퇴근길 마중」은 games/engine/room/room2.js 의 D_EV 에 있다(이 스크립트가 넣지는 않는다)."""
import json, pathlib
R = pathlib.Path('.')
p = R / 'data/idle_stories.json'; d = json.load(open(p, encoding='utf-8'))
if not any(s['id'] == 's31' for s in d['stories']):
    d['stories'].append(dict(id='s31', title='최악의 날', source='content/seeds/author/2026-10-08_최악의날.md (작가 원고 E15, 각색 [제안])', bg='indoor', cuts=[
        dict(text='누구에게나 최악의 날이 있다.\n오늘은 역대급 3위 안에 든다.', src='각색 [제안]', chars=['nemo_dad.worry']),
        dict(text='사소한 실수 하나가 시스템을 멈췄다.\n스물여덟 시간 만에 겨우 수습했다. 한없이 길고 힘든 퇴근길.', src='각색 [제안]', chars=['nemo_dad.worry']),
        dict(text='버스 앞에서 셋째와 막내가 기다린다.\n막내가 펄쩍펄쩍 손을 흔든다.', src='각색 [제안]', chars=['nemo_kids.kid3', 'baby.joy'], bubble='sparkle'),
        dict(text='와락 안기는 막내 냄새에\n하루가 다르게 보인다.', src='각색 [제안]', chars=['nemo_dad.love', 'baby.love'], bubble='heart')],
        question=dict(q='최악의 날을 뒤집어 준 건?', options=[dict(k='nemo', t='가족'), dict(k='semo', t='혼자만의 시간'), dict(k='dong', t='그래도 최악')]), reward=dict(laugh=40)))
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
b = R / 'data/idle_balance.json'; B = json.load(open(b, encoding='utf-8'))
if len(B['storyThresholds']) == 30:
    B['storyThresholds'].append(1800000000000000); json.dump(B, open(b, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('idle stories', len(d['stories']), 'thresholds', len(B['storyThresholds']))
