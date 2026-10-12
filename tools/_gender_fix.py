"""허브 결정 2026-10-12: ① 해님 달님 = 「누나와 남동생」(누나=하나 kid1 해님, 동생=세찌 kid3 달님) ② 의좋은 형제 형=세찌(kid3)·아우=막둥이 전부 통일
+ tales_cast 성별 일치 단언 + tales_build 가 다른 앱 원천을 덮는 문제 근본 수정(emit_extra). 한 번 돌리면 되는 일회성 정정 스크립트(멱등)."""
import json, pathlib, re
R = pathlib.Path('.')

def edit(path, fn):
    p = R / path; raw = p.read_bytes().decode('utf-8'); new = fn(raw)
    if new != raw: p.write_bytes(new.encode('utf-8')); print('edit', path)

# ---------- ① 해님 달님 텍스트 변환 ----------
def sun_text(s):
    return s.replace('오누이({kid1}·{kid2})', '남매({kid1}·{kid3})').replace('오누이는', '남매는').replace('오누이', '남매')
def sun_block(raw, start_pat, end_pat):
    a = raw.index(start_pat); b = raw.index(end_pat, a + 10)
    blk = raw[a:b]
    blk = sun_text(blk).replace('{kid2}', '{kid3}').replace('nemo_kids.kid2', 'nemo_kids.kid3')
    blk = blk.replace("('오빠(달님)', '네모네 {kid1}'", "('누나(해님)', '네모네 {kid1}'").replace("('동생(해님)', '네모네 {kid2}'", "('동생(달님)', '네모네 {kid3}'")
    return raw[:a] + blk + raw[b:]
edit('tools/tales_build.py', lambda r: sun_block(r, " dict(id='sun',", " dict(id='ant',"))
edit('tools/tales_block.py', lambda r: sun_block(r, " dict(base='sun',", " dict(base="))   # 다음 dict(base= 까지
edit('tools/tales_cast.py', lambda r: r.replace("'sun': [('오빠(달님)', 'kid1', 'lead'), ('동생(해님)', 'kid2', 'lead')", "'sun': [('누나(해님)', 'kid1', 'lead'), ('동생(달님)', 'kid3', 'lead')"))

# ---------- ② 데이터(앱별 *_extra.json): 해님 달님·의좋은 형제 ----------
def fix_stories(d):
    ch = 0
    for s in d.get('stories', []):
        if s.get('tale') == 'sun':
            for c in s['cuts']:
                c['text'] = sun_text(c['text']).replace('{kid2}', '{kid3}'); c['chars'] = [x.replace('nemo_kids.kid2', 'nemo_kids.kid3') for x in c['chars']]; ch += 1
        if s.get('tale') == 'brothers':
            for c in s['cuts']:
                c['text'] = c['text'].replace('형(네모네 {kid1})', '형(네모네 {kid3})'); c['chars'] = [x.replace('nemo_kids.kid1', 'nemo_kids.kid3') for x in c['chars']]; ch += 1
    return ch
for f in ['merge', 'spot', 'block', 'sort', 'tile', 'day']:
    p = R / f'data/{f}_extra.json'; raw = p.read_text(encoding='utf-8'); d = json.loads(raw); n = fix_stories(d)
    out = json.dumps(d, ensure_ascii=False, indent=1)
    if n and out != raw.rstrip('\n'): p.write_text(out + ('\n' if raw.endswith('\n') else ''), encoding='utf-8'); print('data', f, n, 'cuts')

# ---------- ③ tales_build: 출력 분리(emit_extra) + 파일 줄바꿈 보존 + ① 11장 그림 ----------
def build_fix(raw):
    if 'def emit_extra' not in raw:
        helper = '''
def emit_extra(new, path):
    """앱별 *_extra.json 에는 이 스크립트가 만드는 장(1..N)만 갱신한다. 다른 스크립트·손으로 더한 장(N+1~)·시즌·상품 같은 나머지 키는 그대로 둔다(덮어쓰기 방지, 2026-10-12)."""
    old = json.load(open(path, encoding='utf-8')) if path.exists() else {}
    out = dict(old)
    for k, v in new.items():
        if k == 'stories': continue
        out.setdefault(k, v)
    gen = new.get('stories', []); out['stories'] = gen + [s for s in old.get('stories', []) if s.get('chapter', 0) > len(gen)]
    json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

'''
        i = raw.index('T12 = [')
        raw = raw[:i] + helper.lstrip('\n') + raw[i:]
    pat = re.compile(r"json\.dump\((\{.*?\}), open\(R / '(data/(?:block|spot|tile)_extra\.json)', 'w', encoding='utf-8'\)[^\r\n]*\)", re.S)
    raw, n = pat.subn(lambda m: "emit_extra(" + m.group(1) + ", R / '" + m.group(2) + "')", raw)
    print('emit_extra 치환', n)
    # JS 생성기 파일 줄바꿈 보존
    raw = raw.replace("s = open(p, encoding='utf-8').read()\n    s = re.sub(r\"const CHAPTERS", "s = open(p, encoding='utf-8', newline='').read()\n    s = re.sub(r\"const CHAPTERS")
    raw = raw.replace("count=1); open(p, 'w', encoding='utf-8').write(s)", "count=1); open(p, 'w', encoding='utf-8', newline='').write(s)")
    raw = raw.replace("g = open(p, encoding='utf-8').read()", "g = open(p, encoding='utf-8', newline='').read()").replace("count=1); open(p, 'w', encoding='utf-8').write(g)", "count=1); open(p, 'w', encoding='utf-8', newline='').write(g)")
    raw = raw.replace("ST['ch11']['heroes'] = ['nemo_kids.kid1', 'baby.joy']", "ST['ch11']['heroes'] = ['nemo_kids.kid3', 'baby.joy']")
    raw = raw.replace("[주의 2026-10-12] 이 스크립트는 data/spot_extra.json·story_spot.json 을 3권 원천으로 다시 쓰므로, RC4 에서 따로 추가한 ⑥ 13~14장(의좋은 형제·눈의 여왕)이 지워진다. 호칭만 고칠 때는 돌린 뒤 git checkout data/spot_extra.json data/story_spot.json 으로 되돌리고 python tools/story_build.py 를 다시 돌릴 것.",
                      "[2026-10-12 수정] 앱별 *_extra.json 은 emit_extra 로 생성하는 장(1..N)만 갱신하고 나머지 장·키는 보존한다(RC4 에서 더한 ⑥ 13~14장 등이 지워지던 문제의 근본 수정).")
    return raw
edit('tools/tales_build.py', build_fix)

# ---------- ④ tales_cast: 성별 일치 단언 ----------
def cast_fix(raw):
    if 'GENDER_OK' in raw: return raw
    add = '''
# 성별 일치(허브 2026-10-12): kid1·kid2(하나·두리, 딸)는 형/오빠/아우/남동생/아들 역 금지, kid3·baby(세찌·막둥이, 아들)는 누나/언니/누이/여동생/딸 역 금지
FEMALE_KIDS, MALE_KIDS = ('kid1', 'kid2'), ('kid3', 'baby')
MALE_WORDS, FEMALE_WORDS = ('형', '오빠', '아우', '남동생', '아들'), ('누나', '언니', '누이', '여동생', '딸')
def GENDER_OK():
    bad = []
    for tale, rows in CAST.items():
        for row in rows:
            role, key = row[0], row[1]
            if key in FEMALE_KIDS and any(w in role for w in MALE_WORDS): bad.append('%s: %s 역을 %s(딸)이 맡음' % (tale, role, key))
            if key in MALE_KIDS and any(w in role for w in FEMALE_WORDS): bad.append('%s: %s 역을 %s(아들)이 맡음' % (tale, role, key))
    assert not bad, '배역 성별 불일치: ' + ' / '.join(bad)
    return True
'''
    raw = raw.replace("\n\ndef audit():", add + "\n\ndef audit():", 1)
    raw = raw.replace("    assert semo <= 3, '세모의 웃긴 실패역/악역 전체 %d회(>3)' % semo\n", "    assert semo <= 3, '세모의 웃긴 실패역/악역 전체 %d회(>3)' % semo\n    GENDER_OK()\n", 1)
    return raw
edit('tools/tales_cast.py', cast_fix)
print('ok')
