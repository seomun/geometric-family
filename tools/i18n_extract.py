"""다국어 추출 1단계(C16): 10앱·공통 엔진의 화면 문자열(버튼 text·title·toast·el() 글자·textContent)을 GF.t('c16.…') 로 바꾸고 사전에 모은다.
python tools/i18n_extract.py [--dry]   멱등(바꾼 자리는 더 안 잡힘). 사전은 tools/i18n_c16.json(한국어 원문 = 정본) → tools/ops_build.py 가 data/ops.json strings 에 합친다.
안전 규칙: ① 따옴표 하나짜리 순수 문자열만(보간 ${}·이어 붙이기·태그·역슬래시 없음). ② 함수 본문 안의 것만 — 파일을 읽을 때 바로 실행되는 표 상수는 사전이 아직 안 올라와 키가 보인다.
③ 같은 문장은 한 키. 키 = c16.<파일>.<번호>. 데이터 표(타일 이름·규칙 문구 등)와 이야기·사연은 건드리지 않는다(문화 각색이 필요 — docs/32 계획 3번)."""
import re, sys, json, glob, os
DRY = '--dry' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
BS = chr(92)       # 역슬래시
NL = chr(10)


def fn_intervals(src):
    """함수 본문({ … }) 구간 목록. 문자열·주석·정규식·템플릿을 건너뛰며 중괄호를 센다."""
    out = []; stack = []; i = 0; n = len(src); prev = ''
    while i < n:
        c = src[i]
        if c == '/' and src[i + 1:i + 2] == '/':
            j = src.find(NL, i); i = n if j < 0 else j; continue
        if c == '/' and src[i + 1:i + 2] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in ("'", '"'):
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == BS else 1
            i = j + 1; prev = 'a'; continue
        if c == '`':
            j = i + 1; depth = 0
            while j < n:
                if src[j] == BS: j += 2; continue
                if src[j] == '$' and src[j + 1:j + 2] == '{': depth += 1; j += 2; continue
                if src[j] == '}' and depth: depth -= 1; j += 1; continue
                if src[j] == '`' and not depth: break
                j += 1
            i = j + 1; prev = 'a'; continue
        if c == '/' and prev in '(,=:[!&|?{};':
            j = i + 1; cls = False
            while j < n and src[j] != NL:
                if src[j] == BS: j += 2; continue
                if src[j] == '[': cls = True
                elif src[j] == ']': cls = False
                elif src[j] == '/' and not cls: break
                j += 1
            i = j + 1; prev = 'a'; continue
        if c == '{':
            head = src[max(0, i - 160):i].rstrip()
            isfn = head.endswith('=>') or (head.endswith(')') and not re.search(r'\b(?:if|for|while|switch|catch|with)\s*\([^{}]*\)$', head))
            stack.append((i, isfn))
        elif c == '}' and stack:
            st, isfn = stack.pop()
            if isfn: out.append((st, i))
        if not c.isspace(): prev = c
        i += 1
    return [(a, b) for a, b in out if b - a < n * 0.6]      # 파일 전체를 감싸는 즉시실행 함수는 「함수 안」이 아니다(읽을 때 바로 실행됨)


KO = r"(?:[^'\\\n]*[가-힣][^'\\\n]*)"      # 한국어가 들어 있는 순수 문자열(역슬래시 없음)
PATS = [
    re.compile(r"(\b(?:text|title|label|sub|placeholder|msg|hint|note|retryText|homeText|nextText|ask|desc|cta|tip|ttl)\s*:\s*)'(" + KO + r")'"),
    re.compile(r"(\b(?:UK\.)?toast\(\s*|\bsay\(\s*)'(" + KO + r")'"),
    re.compile(r"(\bel\(\s*'[a-z0-9]+'\s*,\s*'[^'\n]*'\s*,\s*[A-Za-z_.$()\[\]0-9]+\s*,\s*)'(" + KO + r")'(\s*\))"),
    re.compile(r"(\.(?:textContent|innerText)\s*=\s*)'(" + KO + r")'"),
]
SKIP_FILE = re.compile(r'-gen|core|android|room2|expedition|node_modules|/demo|/store|/media|/audio')
D = {}
DP = 'tools/i18n_c16.json'
if os.path.exists(DP): D = json.load(open(DP, encoding='utf-8'))
by_text = {v: k for k, v in D.items()}
files = sorted({f.replace(BS, '/') for f in glob.glob('games/engine/*.js') + glob.glob('games/engine/ui-kit/*.js') + glob.glob('games/engine/room/room.js') + glob.glob('games/*/*.js')})
tot = 0; per = {}; skipped_top = 0
for f in files:
    if SKIP_FILE.search(f): continue
    s = open(f, encoding='utf-8', newline='').read(); orig = s; stem = os.path.basename(f)[:-3].replace('-', '_')
    FN = []

    def sub(m):
        global tot, skipped_top
        txt = m.group(2)
        if '${' in txt or '<' in txt or 'GF.t' in txt: return m.group(0)       # 태그가 섞인 문장은 건드리지 않는다
        tail = m.string[m.end():m.end() + 8].lstrip()
        if tail[:1] == '+' or txt.endswith((' ', '·', '(')) or txt.startswith((' ', '·')): return m.group(0)      # 이어 붙이는 조각은 번역 단위가 아니다
        if not any(a < m.start(2) < b for a, b in FN):
            skipped_top += 1; return m.group(0)          # 읽을 때 바로 실행되는 자리(표 상수 등)는 건드리지 않는다
        k = by_text.get(txt)
        if not k:
            i = 1 + sum(1 for x in D if x.startswith('c16.' + stem + '.')); k = 'c16.' + stem + '.' + str(i).zfill(3); D[k] = txt; by_text[txt] = k
        tot += 1
        return m.group(1) + "GF.t('" + k + "')" + (m.group(3) if m.lastindex and m.lastindex >= 3 else '')
    for p in PATS:
        FN = fn_intervals(s); s = p.sub(sub, s)
    if s != orig:
        per[f] = len(re.findall(r"GF\.t\('c16\.", s)) - len(re.findall(r"GF\.t\('c16\.", orig))
        if not DRY: open(f, 'w', encoding='utf-8', newline='').write(s)
for f, n in sorted(per.items(), key=lambda x: -x[1]): print(n, f)
print('바꾼 곳', tot, '· 읽을 때 실행되는 자리라 건너뜀', skipped_top, '· 사전 문장', len(D))
if not DRY: json.dump(D, open(DP, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
