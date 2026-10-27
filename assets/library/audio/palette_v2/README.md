# 소리 팔레트 v2 — 「따뜻하고 풍성하게」 (gf-asset, 2026-10-23)

작가 귀 판정(10/23) 「여전히 너무 날카롭고 안 예쁘다 → 풍성하게」 에 대한 새 판. **작가가 A/B(`content/promo/sound_ab_v2.mp3`)를 듣고 승인하면** gf-play·gf-game 에 납품한다. 아직 게임에 연결하지 않았다.

## 효과음 `common/` — 지금 20칸 + 콤보 3단 (모두 자체 합성, CC0 1.0)
- 만들기: `python -I tools/asset_warm_sfx.py` (numpy 합성, 외부 녹음 없음 → 라이선스 문제 없음, CC0 으로 공개).
- 칸 이름은 `games/audio/common/` 과 같다(tap·pick·drop·ok·hmm·flip·page·star·celebrate·door·pop1~3·sparkle·get·fail·cancel·praise1~3) + `combo1~3`(새 칸). `.ogg`(q2, 268KB 합) 와 `.wav`.
- 소리 결:
  - 두 겹 이상: 몸통(마림바·펠트·나무·벨) + 작은 반짝임.
  - 음정이 있는 소리는 모두 **C 장조 펜타토닉**. 콤보 1→2→3 과 칭찬 1→2→3 은 한 단씩 올라가는 화음.
  - EQ: 250Hz +3dB 로우셸프 · 3kHz −4dB · 7kHz −7dB 하이셸프. 짧은 플레이트 잔향(0.45초, 큰 소리 0.7초)을 20~24% 섞는다.
- 수치(`python -I tools/asset_tone_report.py <폴더>`):
  - 귀 아픈 2~4kHz 비중: 지금 최대 35% → 새 것 0~2%.
  - 쇳소리 6kHz+ 비중: 지금 최대 97% → 새 것 0%.
  - 피크는 −6dBFS. 다만 아래 7칸은 −4.5dBFS 다: 큰 터짐·문·별·반짝·칭찬2·3·축하.
- 음량: 지금 파일의 순간 최대 음량(momentary max LUFS)에 맞췄다.
  - 대부분은 ±1.4dB 안이다.
  - 덜 큰 칸: 칭찬3 −2.1 · 축하 −2.0 · get −2.1 · 큰 터짐 pop3 −1.8 · 별 −1.3 · 칭찬2 −1.1 · 반짝 −1.0 · 문 door −0.6 dB. (10/23 허브 요청으로 큰 터짐·문은 피크 −3dBFS 까지 열어 −5.3·−3.1 에서 보정, 고역은 그대로 0%)
  - 덜 큰 이유: 지금 소리는 날카로운 고역 덕분에 LUFS 가 높게 잡힌다. 따뜻한 소리로 같은 수치를 내려면 피크를 −6 이상으로 올려야 해서 그러지 않았다. 필요하면 게임 쪽 칸 볼륨으로 올린다.
- `levels.json` = 칸별 길이·음량·목표·피크.

## 배경음 `bgm/` — CC0 녹음 음악 (코드 합성 대체 후보)
`python -I tools/asset_bgm_v2.py` 로 만든다. 처리: 모노 32kHz · 7kHz −3dB · 200Hz +1.5dB · 이음새 2초 교차(끊김 없는 반복) · −20 LUFS · OGG q0. 출처 표는 `bgm/SOURCES.md` 에 있다.

| 파일 | 쓰임 | 곡 · 작가 · 출처 | 라이선스 |
|---|---|---|---|
| `app_warm.ogg` (90초, 472KB) | 10앱 기본 — 따뜻한 우쿨렐레 | Blue Sky · Sergmusic · https://freesound.org/people/Sergmusic/sounds/639933/ | CC0 1.0 |
| `app_marimba.ogg` (33초, 177KB) | 10앱 대안 — 마림바 | Trotting Along · code_box · https://freesound.org/people/code_box/sounds/614726/ | CC0 1.0 |
| `exp_battle.ogg` (94초, 500KB) | ⑪ 전투 — 오케스트라 판타지 | Battle Theme A · cynicmusic · https://opengameart.org/content/battle-theme-a | CC0 1.0 |

⑪ 보스·마을 후보는 이미 도서관에 있다(모두 CC0, `../CATALOG.md`): `bgm_boss__s1` Epic Boss Battle(Juhani Junkala), `bgm_battle__s2` Adventure(CleytonKauffman), `bgm_cozy__s1` Town Theme(cynicmusic). 승인이 나면 같은 처리로 더 만든다.

## 저용량 판 `common_lo/` · `bgm_lo/` (10/23, 놀이터 용량)
`python -I tools/asset_v2_lo.py`. 효과음 모노 22.05kHz 32kbps(ogg 146KB·mp3 121KB 합, wav 2.4MB 대비) · 배경음 모노 24kHz 32kbps(3곡 ogg 980KB·mp3 849KB). 용량 표 `SIZES.md`. 짧은 소리는 mp3 앞 지연(~25ms)이 있어 ogg 를 권한다.
