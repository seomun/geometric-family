# 그림 후보 묶음 (gf-asset, ComfyUI 로컬 생성)

만든 날 2026-10-20 · `python -I tools/asset_art_post.py` 가 만든다(손으로 고치지 말 것). 시트: `notes/snapshots/comfy_exp_pack.jpg` · `comfy_flat_retest.jpg`.

- 라이선스: SDXL base 1.0 (stabilityai) + SDXL-Lightning 8step LoRA (ByteDance) — CreativeML Open RAIL++-M: 상업 이용 가능, 출력물 권리 주장 없음("Licensor claims no rights in the Output"), Attachment A 사용 제한 준수. 로컬 생성(gf-comfy).
- **캐릭터는 없다**(생성 금지 — 정본 시트만). 배경·텍스처·밑그림 전용.
- 재현: 아래 프롬프트·음수·시드·설정 + `tools/asset_comfy_bench.py jobs`(작업표 `tools/asset_art_jobs.json`). 원본 PNG 는 `C:/projects/gf-comfy/.../output/`.


## ⑪ M2 25~29나라 배경(gf-game 요청 10/21) (20)

| id | 파일 | 크기 | 설정 | 후처리·판정 |
|---|---|---|---|---|
| exp_bg_n25_clock_a | `expedition/bg/exp_bg_n25_clock_a.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 145.8초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n25_clock_a_3102 | `expedition/bg/exp_bg_n25_clock_a_3102.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 97.5초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n25_clock_boss | `expedition/bg/exp_bg_n25_clock_boss.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 71.7초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n25_clock_boss_3102 | `expedition/bg/exp_bg_n25_clock_boss_3102.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 68.4초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n26_porridge_a_3201 | `expedition/bg/exp_bg_n26_porridge_a_3201.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 84.6초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n26_porridge_a | `expedition/bg/exp_bg_n26_porridge_a.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 118.9초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n26_porridge_boss_3201 | `expedition/bg/exp_bg_n26_porridge_boss_3201.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 76.6초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n26_porridge_boss | `expedition/bg/exp_bg_n26_porridge_boss.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 72.6초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n27_oz_a | `expedition/bg/exp_bg_n27_oz_a.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 103.5초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n27_oz_a_3302 | `expedition/bg/exp_bg_n27_oz_a_3302.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 81.6초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n27_oz_boss | `expedition/bg/exp_bg_n27_oz_boss.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 87.6초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n27_oz_boss_3302 | `expedition/bg/exp_bg_n27_oz_boss_3302.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 234.8초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n28_frog_a_3401 | `expedition/bg/exp_bg_n28_frog_a_3401.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 163.1초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n28_frog_a | `expedition/bg/exp_bg_n28_frog_a.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 118.7초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n28_frog_boss_3401 | `expedition/bg/exp_bg_n28_frog_boss_3401.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 72.6초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n28_frog_boss | `expedition/bg/exp_bg_n28_frog_boss.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 77.6초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n29_alice_a | `expedition/bg/exp_bg_n29_alice_a.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 71.8초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n29_alice_a_3502 | `expedition/bg/exp_bg_n29_alice_a_3502.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 67.8초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n29_alice_boss | `expedition/bg/exp_bg_n29_alice_boss.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 70.8초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_n29_alice_boss_3502 | `expedition/bg/exp_bg_n29_alice_boss_3502.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 65.4초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |

프롬프트(종류별):

- **exp_bg_n25_clock_a** (시드 3101, 3102)
  - prompt: `fantasy RPG battle background, grand midnight ballroom inside a clock tower castle, giant brass clockwork gears on the walls, polished marble floor with sparkling glass reflections, silhouette of a pumpkin carriage seen through tall arched windows, deep navy blue and gold palette, warm chandelier light, painterly mobile game background, empty center floor for battle, no people, no characters`
  - neg: `people, person, character, face, eyes, girl, prince, animal, text, letters, numbers, clock numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n25_clock_boss** (시드 3101, 3102)
  - prompt: `fantasy RPG boss battle background, grand ballroom inside a clock tower castle at the stroke of midnight, giant brass clockwork gears on the walls, polished marble floor, silhouette of a pumpkin carriage through tall arched windows, dark stormy night sky outside, dramatic golden light beams cutting through deep shadows, deep navy and gold, ominous, high contrast, painterly mobile game background, empty center floor for battle, no people, no characters`
  - neg: `people, person, character, face, eyes, girl, prince, animal, text, letters, numbers, clock numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n26_porridge_a** (시드 3201, 3202)
  - prompt: `fantasy RPG battle background, traditional Korean hanok house courtyard at dusk, large black iron cauldron of red bean porridge with steam, wooden mortar and pestle, woven straw mats on the ground, curved tiled roofs, warm red and orange sunset sky, painterly mobile game background, empty center ground for battle, no people, no animals, no characters`
  - neg: `people, person, character, face, eyes, grandmother, tiger, animal, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo, chinese, japanese`
- **exp_bg_n26_porridge_boss** (시드 3201, 3202)
  - prompt: `fantasy RPG boss battle background, traditional Korean hanok house courtyard as night falls, large black iron cauldron of red bean porridge glowing with embers, wooden mortar and pestle, woven straw mats, curved tiled roofs, deep crimson and dark navy sky, glowing sparks, dramatic rim light, ominous mountain shadows, painterly mobile game background, empty center ground for battle, no people, no animals, no characters`
  - neg: `people, person, character, face, eyes, grandmother, tiger, animal, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo, chinese, japanese`
- **exp_bg_n27_oz_a** (시드 3301, 3302)
  - prompt: `fantasy RPG battle background, winding yellow brick road through golden wheat fields toward a distant glowing emerald green crystal city, fluffy white clouds, bright blue sky, painterly mobile game background, empty road foreground for battle, no people, no characters`
  - neg: `people, person, character, face, eyes, girl, dog, lion, scarecrow, animal, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n27_oz_boss** (시드 3301, 3302)
  - prompt: `fantasy RPG boss battle background, winding yellow brick road through golden wheat fields toward a distant emerald green crystal city, dark storm clouds and a tornado on the horizon, eerie green glow from the emerald city, dramatic dark sky, wind sweeping the wheat, painterly mobile game background, empty road foreground for battle, no people, no characters`
  - neg: `people, person, character, face, eyes, girl, dog, lion, scarecrow, animal, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n28_frog_a** (시드 3401, 3402)
  - prompt: `fantasy RPG battle background, rainy pond side, large round lotus leaves, rain ripples spreading on the water surface, wet mossy stones, soft mist, cool teal and blue green palette, gentle rain, painterly mobile game background, empty stone foreground for battle, no animals, no people`
  - neg: `frog, toad, animal, fish, bird, people, person, character, face, eyes, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n28_frog_boss** (시드 3401, 3402)
  - prompt: `fantasy RPG boss battle background, pond side in a heavy downpour at night, large round lotus leaves, rain ripples on dark water, wet mossy stones, dark storm clouds, a flash of lightning lighting the pond in cold teal, dramatic contrast, painterly mobile game background, empty stone foreground for battle, no animals, no people`
  - neg: `frog, toad, animal, fish, bird, people, person, character, face, eyes, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n29_alice_a** (시드 3501, 3502)
  - prompt: `fantasy RPG battle background, whimsical chessboard garden, black and white checkered floor, tall green hedge maze walls, giant red spotted mushrooms, trees with leaves shaped like playing card suits, bright afternoon, painterly mobile game background, empty checkered foreground for battle, no people, no characters`
  - neg: `people, person, character, face, eyes, girl, rabbit, cat, queen, animal, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo`
- **exp_bg_n29_alice_boss** (시드 3501, 3502)
  - prompt: `fantasy RPG boss battle background, whimsical chessboard garden at twilight, black and white checkered floor, tall dark hedge maze walls, giant mushrooms, trees with leaves shaped like playing card suits, deep navy sky with gold stars, dramatic golden spotlight on the checkered floor, long shadows, mysterious, painterly mobile game background, empty checkered foreground for battle, no people, no characters`
  - neg: `people, person, character, face, eyes, girl, rabbit, cat, queen, animal, text, letters, numbers, watermark, logo, signature, purple, magenta, blurry, photo`

## ⑪ M2 텍스처 (10)

| id | 파일 | 크기 | 설정 | 후처리·판정 |
|---|---|---|---|---|
| exp_tex_n25_brass | `expedition/tex/exp_tex_n25_brass.webp` · `expedition/tex/exp_tex_n25_brass_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 68.5초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n25_brass_3602 | `expedition/tex/exp_tex_n25_brass_3602.webp` · `expedition/tex/exp_tex_n25_brass_3602_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 65.4초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n26_clay | `expedition/tex/exp_tex_n26_clay.webp` · `expedition/tex/exp_tex_n26_clay_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 63.3초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n26_clay_3702 | `expedition/tex/exp_tex_n26_clay_3702.webp` · `expedition/tex/exp_tex_n26_clay_3702_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 70.9초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n27_emerald_3801 | `expedition/tex/exp_tex_n27_emerald_3801.webp` · `expedition/tex/exp_tex_n27_emerald_3801_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 65.6초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n27_emerald | `expedition/tex/exp_tex_n27_emerald.webp` · `expedition/tex/exp_tex_n27_emerald_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 84.5초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n28_wetstone_3901 | `expedition/tex/exp_tex_n28_wetstone_3901.webp` · `expedition/tex/exp_tex_n28_wetstone_3901_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 72.8초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n28_wetstone | `expedition/tex/exp_tex_n28_wetstone.webp` · `expedition/tex/exp_tex_n28_wetstone_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 67.4초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n29_check_4001 | `expedition/tex/exp_tex_n29_check_4001.webp` · `expedition/tex/exp_tex_n29_check_4001_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 83.8초 | M2 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_n29_check | `expedition/tex/exp_tex_n29_check.webp` · `expedition/tex/exp_tex_n29_check_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 212.3초 | ★M2 채택 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |

프롬프트(종류별):

- **exp_tex_n25_brass** (시드 3601, 3602)
  - prompt: `seamless square game texture of interlocking brass clockwork gears, polished gold and bronze metal, deep navy shadows between the gears, stylized hand painted, flat even lighting, tileable, top down`
  - neg: `text, letters, numbers, clock face, watermark, logo, perspective, horizon, object, face, purple, magenta`
- **exp_tex_n26_clay** (시드 3701, 3702)
  - prompt: `seamless square game texture of red earthenware clay pottery surface, terracotta with subtle glaze cracks and soft ridges, warm red brown, stylized hand painted, flat even lighting, tileable, top down`
  - neg: `text, letters, numbers, watermark, logo, perspective, horizon, object, face, purple, magenta, pot shape`
- **exp_tex_n27_emerald** (시드 3801, 3802)
  - prompt: `seamless square game texture of faceted emerald gemstone surface, green crystal facets with thin gold edges, stylized hand painted, flat even lighting, tileable, top down`
  - neg: `text, letters, numbers, watermark, logo, perspective, horizon, object, face, purple, magenta`
- **exp_tex_n28_wetstone** (시드 3901, 3902)
  - prompt: `seamless square game texture of wet dark river pebbles with water ripples and droplets, cool teal and slate blue, stylized hand painted, flat even lighting, tileable, top down`
  - neg: `text, letters, numbers, watermark, logo, perspective, horizon, object, face, purple, magenta, frog, fish`
- **exp_tex_n29_check** (시드 4001, 4002)
  - prompt: `seamless square game texture of a checkered pattern mixed with playing card suit symbols, hearts spades diamonds clubs, black white and red with thin gold trim, stylized hand painted, flat even lighting, tileable, top down`
  - neg: `text, letters, numbers, watermark, logo, perspective, horizon, face, purple, magenta, playing card corners`

## ⑪ 전투 배경 후보 (13)

| id | 파일 | 크기 | 설정 | 후처리·판정 |
|---|---|---|---|---|
| exp_bg_valley_2101 | `expedition/bg/exp_bg_valley_2101.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 144.4초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_valley_2102 | `expedition/bg/exp_bg_valley_2102.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 110.2초 | 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_valley_2103 | `expedition/bg/exp_bg_valley_2103.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 55.5초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_valley_2104 | `expedition/bg/exp_bg_valley_2104.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 50.5초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_temple_2201 | `expedition/bg/exp_bg_temple_2201.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 61.3초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_temple_2202 | `expedition/bg/exp_bg_temple_2202.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 42.7초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_temple_2203 | `expedition/bg/exp_bg_temple_2203.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 42.3초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_temple_2204 | `expedition/bg/exp_bg_temple_2204.webp` | 1216×832 | 8스텝 cfg 1.5 euler/sgm_uniform · 42.3초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_v1_1000 | `expedition/bg/exp_bg_v1_1000.webp` | 1216×832 | 8스텝 cfg 1.0 euler/sgm_uniform · 95.7초 | 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_v1_1001 | `expedition/bg/exp_bg_v1_1001.webp` | 1216×832 | 8스텝 cfg 1.0 euler/sgm_uniform · 123.2초 | 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_v1_1002 | `expedition/bg/exp_bg_v1_1002.webp` | 1216×832 | 8스텝 cfg 1.0 euler/sgm_uniform · 72.7초 | ★추천 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_v1_1003 | `expedition/bg/exp_bg_v1_1003.webp` | 1216×832 | 8스텝 cfg 1.0 euler/sgm_uniform · 77.7초 | 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |
| exp_bg_v1_1004 | `expedition/bg/exp_bg_v1_1004.webp` | 1216×832 | 8스텝 cfg 1.0 euler/sgm_uniform · 67.4초 | 예비 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) |

프롬프트(종류별):

- **exp_bg_valley** (시드 2101, 2102, 2103, 2104)
  - prompt: `fantasy RPG battle background, wide night valley with floating geometric crystals and ancient stone ruins, deep navy blue and teal palette, warm golden rim light and gold glowing crystals, painterly mobile game background, empty flat foreground stage for battle, no characters, high detail`
  - neg: `purple, magenta, pink, people, person, character, face, text, letters, watermark, logo, blurry, photo`
- **exp_bg_temple** (시드 2201, 2202, 2203, 2204)
  - prompt: `fantasy RPG boss arena background, geometric crystal temple hall with gold trimmed pillars, deep navy blue stone, golden light beams from above, painterly mobile game key art, empty center stage for battle, no characters, high detail`
  - neg: `purple, magenta, pink, people, person, character, face, text, letters, watermark, logo, blurry, photo`
- **exp_bg_v1** (시드 1000, 1001, 1002, 1003, 1004)
  - prompt: `fantasy RPG battle background, mysterious night valley with floating geometric crystals, deep navy blue and purple palette with gold highlights, dramatic rim light, painterly game background, mobile game key art, empty foreground stage for battle, no characters, high detail`
  - neg: `photo, photorealistic, 3d render, text, letters, watermark, signature, logo, people, person, character, face, eyes, blurry, noisy, jpeg artifacts, dark muddy colors`

## ⑪ 몬스터 텍스처 후보 (19)

| id | 파일 | 크기 | 설정 | 후처리·판정 |
|---|---|---|---|---|
| exp_tex_crystal_2301 | `expedition/tex/exp_tex_crystal_2301.webp` · `expedition/tex/exp_tex_crystal_2301_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 56.4초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_crystal_2302 | `expedition/tex/exp_tex_crystal_2302.webp` · `expedition/tex/exp_tex_crystal_2302_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 56.9초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_crystal_2303 | `expedition/tex/exp_tex_crystal_2303.webp` · `expedition/tex/exp_tex_crystal_2303_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 52.4초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_crystal_2304 | `expedition/tex/exp_tex_crystal_2304.webp` · `expedition/tex/exp_tex_crystal_2304_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 48.4초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_crystal_2305 | `expedition/tex/exp_tex_crystal_2305.webp` · `expedition/tex/exp_tex_crystal_2305_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 50.3초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_crystal_2306 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 51.7초 | 실패(색 잡음, 결정 형태 없음) |
| exp_tex_stone_2401 | `expedition/tex/exp_tex_stone_2401.webp` · `expedition/tex/exp_tex_stone_2401_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 64.5초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_stone_2402 | `expedition/tex/exp_tex_stone_2402.webp` · `expedition/tex/exp_tex_stone_2402_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 45.7초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_stone_2403 | `expedition/tex/exp_tex_stone_2403.webp` · `expedition/tex/exp_tex_stone_2403_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 48.2초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_stone_2404 | `expedition/tex/exp_tex_stone_2404.webp` · `expedition/tex/exp_tex_stone_2404_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 47.3초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_shard_2501 | `expedition/tex/exp_tex_shard_2501.webp` · `expedition/tex/exp_tex_shard_2501_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 57.7초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_shard_2502 | `expedition/tex/exp_tex_shard_2502.webp` · `expedition/tex/exp_tex_shard_2502_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 53.4초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_shard_2503 | `expedition/tex/exp_tex_shard_2503.webp` · `expedition/tex/exp_tex_shard_2503_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 60.2초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_shard_2504 | `expedition/tex/exp_tex_shard_2504.webp` · `expedition/tex/exp_tex_shard_2504_tile.webp` | 1024×1024 | 8스텝 cfg 1.5 euler/sgm_uniform · 50.3초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_v1_1000 | `expedition/tex/exp_tex_v1_1000.webp` · `expedition/tex/exp_tex_v1_1000_tile.webp` | 1024×1024 | 8스텝 cfg 1.0 euler/sgm_uniform · 57.3초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_v1_1001 | `expedition/tex/exp_tex_v1_1001.webp` · `expedition/tex/exp_tex_v1_1001_tile.webp` | 1024×1024 | 8스텝 cfg 1.0 euler/sgm_uniform · 56.3초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_v1_1002 | `expedition/tex/exp_tex_v1_1002.webp` · `expedition/tex/exp_tex_v1_1002_tile.webp` | 1024×1024 | 8스텝 cfg 1.0 euler/sgm_uniform · 85.4초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_v1_1003 | `expedition/tex/exp_tex_v1_1003.webp` · `expedition/tex/exp_tex_v1_1003_tile.webp` | 1024×1024 | 8스텝 cfg 1.0 euler/sgm_uniform · 104.7초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |
| exp_tex_v1_1004 | `expedition/tex/exp_tex_v1_1004.webp` · `expedition/tex/exp_tex_v1_1004_tile.webp` | 1024×1024 | 8스텝 cfg 1.0 euler/sgm_uniform · 77.7초 | 후보 · grade_gold(자주→남색, 밝은 곳→금, 대비+8%) + tileable |

프롬프트(종류별):

- **exp_tex_crystal** (시드 2301, 2302, 2303, 2304, 2305, 2306)
  - prompt: `seamless square game texture of cracked faceted crystal stone surface, geometric shards, deep navy blue with glowing gold cracks, stylized hand painted, flat even lighting, tileable, no objects`
  - neg: `purple, magenta, text, watermark, logo, perspective, horizon, object, face`
- **exp_tex_stone** (시드 2401, 2402, 2403, 2404)
  - prompt: `seamless square game texture of geometric hexagon stone tiles, deep navy and slate blue, thin gold inlay lines between tiles, stylized hand painted, flat even lighting, tileable, top down`
  - neg: `purple, magenta, text, watermark, logo, perspective, horizon, object, face`
- **exp_tex_shard** (시드 2501, 2502, 2503, 2504)
  - prompt: `seamless square game texture of shattered glass triangles, midnight blue and teal shards with polished gold edges, stylized hand painted, flat even lighting, tileable, top down, no objects`
  - neg: `purple, magenta, text, watermark, logo, perspective, horizon, object, face`
- **exp_tex_v1** (시드 1000, 1001, 1002, 1003, 1004)
  - prompt: `seamless square game texture of cracked faceted crystal stone surface, geometric shards, deep navy blue with glowing gold cracks, stylized hand painted, top-down flat lighting, tileable, no objects`
  - neg: `photo, photorealistic, 3d render, text, letters, watermark, signature, logo, people, person, character, face, eyes, blurry, noisy, jpeg artifacts, dark muddy colors`

## 10앱 플랫 재시험 (10)

| id | 파일 | 크기 | 설정 | 후처리·판정 |
|---|---|---|---|---|
| app_flat_room_2601 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 63.7초 | 밑그림 참고만 |
| app_flat_room_2602 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 61.9초 | 밑그림 참고만 |
| app_flat_room_2603 | `app/candidates/app_flat_room_2603.webp` | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 51.3초 | ✅ 배경 후보(원본) |
| app_flat_room_2604 | `app/candidates/app_flat_room_2604.webp` | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 44.6초 | ✅ 배경 후보(원본) |
| app_flat_room_2605 | `app/candidates/app_flat_room_2605.webp` | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 43.3초 | ✅ 배경 후보(원본) |
| app_flat_room_2606 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 47.2초 | 밑그림 참고만 |
| app_flat_props_2701 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 57.5초 | 밑그림 참고만 |
| app_flat_props_2702 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 54.3초 | 밑그림 참고만 |
| app_flat_props_2703 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 51.6초 | 밑그림 참고만 |
| app_flat_props_2704 | —(저장 안 함) | 1024×1024 | 8스텝 cfg 1.8 euler/sgm_uniform · 54.3초 | 밑그림 참고만 |

프롬프트(종류별):

- **app_flat_room** (시드 2601, 2602, 2603, 2604, 2605, 2606)
  - prompt: `flat 2D vector illustration of an empty cozy living room, solid flat colors only, bold thick uniform brown outlines, minimal simple geometric shapes, pastel mint green, butter yellow, soft pink, sky blue and cream, children picture book, clean, no shading`
  - neg: `shading, shadow, gradient, lighting, glow, 3d, texture, noise, detailed, realistic, photo, face, eyes, mouth, character, person, people, animal, text, watermark`
- **app_flat_props** (시드 2701, 2702, 2703, 2704)
  - prompt: `flat 2D vector icons of household objects, teapot, potted plant, alarm clock, book stack, rice bowl, solid flat colors only, bold thick uniform brown outlines, simple geometric shapes, pastel mint, butter yellow, soft pink, sky blue, plain pure white background, evenly spaced, no shading`
  - neg: `face, eyes, mouth, smile, cute face, kawaii face, character, shading, shadow, gradient, 3d, texture, grey background, sticker border, text, watermark`
