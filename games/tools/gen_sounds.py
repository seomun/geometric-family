"""data/sounds.json 만들기·보충: python games/tools/gen_sounds.py
소리는 파일이 아니라 "자리(슬롯)". 코드는 id 만 안다. 교체 = 이 JSON 의 file 만 바꾸거나 같은 이름 파일을 덮어쓴다 (docs/16_SOUND.md).
이미 있는 항목(손으로 바꾼 file·vol)은 건드리지 않고, 없는 자리(예: 새 그림책 음성 id)만 채운다.
"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
P = ROOT / 'data' / 'sounds.json'
cur = json.loads(P.read_text(encoding='utf-8')) if P.exists() else {}
cur.setdefault('version', 1)
SFX = {
    'tap': ('버튼 누름 — 톡, 나무 마림바 한 음', 1.0), 'pick': ('캐릭터·조각 집기 — 뿅, 위로 오르는 짧은 음', 1.0),
    'drop': ('내려놓기(스냅) — 퐁, 부드러운 착지', 1.0), 'ok': ('정답 — 두세 음 오르는 반짝임', 1.0),
    'hmm': ('오답 — 부정적이지 않게 내려갔다 오르는 "음?"', 1.0), 'flip': ('카드 뒤집기 — 종이 사락', 1.0),
    'page': ('그림책 넘김 — 책장', 1.0), 'star': ('별 받기 — 반짝 띵', 1.0),
    'celebrate': ('라운드 클리어 — 꽃가루 팡 + 짧은 팡파레', 1.0),
    'wind': ('5장 바람 친구 — 후~ 귀여운 바람', 1.0), 'door': ('5장 문 열림 — 끼익 아닌 "딩동"', 1.0),
}
sfx = cur.setdefault('sfx', {})
for k, (desc, vol) in SFX.items():
    e = sfx.setdefault(k, {}); e.setdefault('file', f'audio/{k}.wav'); e.setdefault('vol', vol); e.setdefault('jitter', 0.05); e.setdefault('desc', desc)
cur.setdefault('alias', {'no': 'hmm', 'tada': 'celebrate'})
mus = cur.setdefault('music', {})
for k, (file, vol, loop, fb, desc) in {
    'theme_main': (None, 0.22, True, 'theme_kids', '「기하학 가족」 테마 — 타이틀·홈 (60~90초 루프)'),
    'theme_kids': ('audio/bgm.wav', 0.22, True, None, '놀이 중 BGM — 테마의 자장가·뮤직박스 편곡 (60초 루프, 지금은 임시 자장가)'),
    'theme_short': (None, 0.13, True, None, '쇼츠·릴스 나레이션 밑 — 잔잔한 피아노, 말소리 대역 비움 (30초 루프)'),
    'logo_sting': (None, 0.6, False, None, '소리 로고 2초 — 테마 첫 네 음'),
    'night': (None, 0.2, True, 'theme_kids', '4장 밤길 — 고요한 편곡 (60초 루프)'),
}.items():
    e = mus.setdefault(k, {'file': file, 'vol': vol, 'loop': loop, 'desc': desc})
    if fb: e.setdefault('fallback', fb)
voice = cur.setdefault('voice', {})
story = json.loads((ROOT / 'data' / 'story.json').read_text(encoding='utf-8'))
for ch, parts in story.items():
    for part in parts.values():
        for cut in part:
            if cut.get('voice'):
                vid = 'voice_' + cut['voice']
                e = voice.setdefault(vid, {'file': None}); e['text'] = cut.get('text', '')    # 작가 녹음용 문장 (file 이 null 이면 아직 녹음 전)
P.write_text(json.dumps(cur, ensure_ascii=False, indent=1), encoding='utf-8', newline='\n')
print('sounds.json:', len(sfx), 'sfx,', len(mus), 'music,', len(voice), 'voice')
