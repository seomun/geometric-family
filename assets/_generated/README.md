# assets/_generated — 외부 도구(Recraft 등)로 만든 SVG 를 넣는 곳

1. `ASSET_LIST.csv` 의 id 대로 생성(프롬프트 초안 포함) → 이 폴더에 `bg/<id>.svg`, `item/<id>.svg`, `icon/<id>.svg`, `cover/<id>.svg`, `prop/<id>.svg` 로 저장.
2. `data/art_slots.json` 의 해당 칸에 경로를 적는다(예: `"bg": {"stream": "assets/_generated/bg/stream.svg"}`). 비어 있으면 코드 그림을 쓴다 → **파일을 넣고 경로만 적으면 교체**.
   - 키: `bg[장면id]` · `props[소품id]` · `cover['book1']` · `room[아이템id]` · `icons[이름]`
3. 단일 HTML 빌드(`games/tools/build*.py`)는 슬롯이 가리키는 SVG 를 자동으로 data URI 로 인라인한다.
4. 캐릭터 얼굴은 대상 아님(정본 시트). 흰 □△○ 단독 기호·글자·실존 로고 금지. 생성 기록은 `LOG.md`(프롬프트·날짜·플랜).
