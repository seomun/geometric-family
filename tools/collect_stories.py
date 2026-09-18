"""이야기 수집기 — 국내외 RSS 에서 '가족·부부·직장·돈' 사연을 긁어 시드 후보로 만든다.
python tools/collect_stories.py            → content/seeds/inbox/YYYY-MM-DD.md
python tools/collect_stories.py --days 3   → 최근 3일치만
규칙: 원문을 베끼지 않는다. 링크·제목·짧은 요지만 보관하고, 상황만 빌려 세 가족 버전으로 다시 쓴다(사람이).
소스는 tools/sources.json. 안 되는 소스는 건너뛰고 로그에 남긴다."""
import json, os, re, sys, time, html, argparse, hashlib, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "content", "seeds", "inbox"); os.makedirs(INBOX, exist_ok=True)
SEEN = os.path.join(INBOX, "_seen.json")
UA = "Mozilla/5.0 (compatible; GeometricFamilyCollector/1.0; +https://seomun.github.io/geometric-family/)"

# 우리 이야기와 맞는 키워드 (점수). 한 번에 3가족 버전이 떠오르는 '일상 사건' 위주.
KEYWORDS = {
    3: ["부고", "장례", "funeral", "결혼식", "wedding", "이혼", "divorce", "명절", "어버이날", "학원비", "중고차", "이사", "청소", "chores", "in-law", "시댁", "처가", "동창", "reunion", "건강검진", "회식"],
    2: ["부부", "아내", "남편", "wife", "husband", "아빠", "엄마", "dad", "mom", "아이", "kids", "toddler", "부모", "parents", "가족", "family", "월급", "salary", "대출", "mortgage", "용돈", "allowance", "야근", "퇴근", "커피", "주말"],
    1: ["회사", "직장", "coworker", "boss", "친구", "friend", "집", "home", "돈", "money", "밥", "저녁", "dinner", "학교", "school", "선생님", "teacher", "동네", "이웃", "neighbor"]
}

def fetch(url, timeout=15, tries=3):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8"})
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < tries - 1: time.sleep(8 * (i + 1)); continue
            raise

def strip(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or "")); return re.sub(r"\s+", " ", s).strip()

def parse_feed(raw):
    """RSS 2.0 / Atom 모두 → [{title, link, summary, date}]"""
    items = []
    try: root = ET.fromstring(raw)
    except ET.ParseError: return items
    ns = {"a": "http://www.w3.org/2005/Atom"}
    for it in root.iter("item"):  # RSS
        items.append({"title": strip(it.findtext("title")), "link": (it.findtext("link") or "").strip(),
                      "summary": strip(it.findtext("description")), "date": it.findtext("pubDate") or ""})
    for e in root.iter("{http://www.w3.org/2005/Atom}entry"):  # Atom (reddit)
        link = e.find("a:link", ns); link = link.get("href") if link is not None else ""
        items.append({"title": strip(e.findtext("a:title", default="", namespaces=ns)), "link": link,
                      "summary": strip(e.findtext("a:content", default="", namespaces=ns) or e.findtext("a:summary", default="", namespaces=ns)),
                      "date": e.findtext("a:updated", default="", namespaces=ns) or e.findtext("a:published", default="", namespaces=ns)})
    return items

def score(text):
    t = text.lower(); sc = 0; hits = []
    for w, words in KEYWORDS.items():
        for k in words:
            if k.lower() in t: sc += w; hits.append(k)
    return sc, sorted(set(hits), key=lambda k: -len(k))[:6]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--days", type=int, default=7); ap.add_argument("--min", type=int, default=2); a = ap.parse_args()
    sources = json.load(open(os.path.join(ROOT, "tools", "sources.json"), encoding="utf-8"))
    seen = set(json.load(open(SEEN, encoding="utf-8"))) if os.path.exists(SEEN) else set()
    today = datetime.now().strftime("%Y-%m-%d"); out = []; log = []; new_seen = set(seen)
    for src in sources:
        time.sleep(2.5)  # 소스 간 예의(레딧 429 방지)
        try:
            raw = fetch(src["url"]); items = parse_feed(raw)
        except Exception as e:
            log.append(f"[skip] {src['name']}: {type(e).__name__} {str(e)[:60]}"); continue
        kept = 0; cand = []
        for it in items:
            if not it["title"] or not it["link"]: continue
            key = hashlib.md5(it["link"].encode()).hexdigest()[:12]
            if key in seen: continue
            sc, hits = score(it["title"] + " " + it["summary"])
            if sc < a.min: continue
            cand.append({"key": key, "src": src["name"], "lang": src.get("lang", ""), "title": it["title"][:120], "link": it["link"], "score": sc, "hits": hits,
                         "gist": it["summary"][:220] + ("…" if len(it["summary"]) > 220 else "")})
        cand.sort(key=lambda x: -x["score"])
        for c in cand[:src.get("cap", 15)]: new_seen.add(c.pop("key")); out.append(c); kept += 1
        log.append(f"[ok]   {src['name']}: {len(items)} items, {kept} kept")
    out.sort(key=lambda x: -x["score"])
    json.dump(sorted(new_seen), open(SEEN, "w", encoding="utf-8"))
    path = os.path.join(INBOX, f"{today}.md")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(f"# 이야기 인박스 {today} — 후보 {len(out)}건\n\n> 원문 인용 금지. 상황만 빌려 세 가족 버전으로 다시 쓴다. 링크는 출처 확인용.\n\n")
        f.write("## 이번 주 후보 TOP 5 — 세 가족 버전 뼈대 (사람이 채운다)\n\n")
        for it in out[:5]:
            f.write(f"### ★{it['score']} {it['title']}\n- 출처: {it['src']} · {it['link']}\n- 요지: {it['gist']}\n- 키워드: {', '.join(it['hits'])}\n"
                    f"- 🟦 네모라면: \n- 🔺 세모라면: \n- ⚫ 동그라미라면: \n- 마지막 질문: 당신은 어느 도형인가요? — \n\n")
        f.write("## 전체 목록\n\n| 점수 | 출처 | 제목 | 키워드 |\n|---|---|---|---|\n")
        for it in out: f.write(f"| {it['score']} | {it['src']} | [{it['title']}]({it['link']}) | {', '.join(it['hits'])} |\n")
        f.write("\n## 수집 로그\n" + "\n".join("- " + l for l in log) + "\n")
    print("\n".join(log)); print(f"→ {path}  ({len(out)} candidates)")

if __name__ == "__main__": main()
