# 영웅 진화 단계별 카드 (gf-asset, 2026-10-28, 작가 승인 전)
가족 영웅 17명 × 3단계(s3=★3·A틀, s4=★4·S틀, s5=★5·SS틀). 같은 인물이고 단계마다 장식이 늘어난다: s3 기본 → s4 속성색 후광·깃발·반짝이 → s5 금빛 날개·광배 후광·금 깃발·폭죽.
- `<unitId>_s3|s4|s5.png` 완성 카드(투명) / `art/<unitId>_sN.png` 인물+장식만(600×600, 틀 없이 쓸 때)
- `manifest.json` 영웅별 단계 → 파일·틀·전투력(제안값)
- 재생성: `NODE_PATH=…/node_modules node tools/asset_cards_evo.js [id,id…]`
