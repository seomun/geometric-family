# ⑪ 원정대 소리 v3 (gf-asset, 2026-10-27) — 작가 승인 전 시험판
작가 피드백 「BGM 더 후킹·빠른 반복 템포 / 이펙트는 동작이 또렷하게, 흘러가는 느낌 제거」 반영. 재생성: `python -I tools/asset_exp_v3.py [sfx|bgm]`, 들어 보기: `python -I tools/asset_exp_v3_ab.py`.
- sfx/: v2(`exp_oldtale/sfx`)와 같은 슬롯·파일 이름 → 덮어쓰면 코드 수정 없음. 꼬리 0.45초 이하(승리·보스·패배·가챠 긴장·충전·스턴 등 제외), 잔향 최소.
- 새 슬롯(코드 연결 필요): `xs_stun`(스턴), `xs_double`(연속 공격 2연타), `xs_chain_1..8`(연쇄 단계 n: 음이 한 칸씩 오르고 겹이 쌓임 — 4 꽹과리, 5 북, 6 징·피리, 7 반짝, 8 장구 몰아치기). 연쇄 n 에 `xs_chain_{min(n,8)}` 를 재생하면 된다.
- bgm/: v2 와 같은 곡 id 16곡. 전투 132·보스 124·보스2 138(휘모리)·승리 128 BPM 12/8 장구 + 피리·대금 4마디 훅(E G E D C / D E D C A / A C E G A G / E D C A) 반복. 패드·잔향 줄임. 필드·홈·상점·지도는 같은 훅을 100~116 BPM 으로, 패배·밤은 훅을 2배 늘려 느리게. −20 LUFS, 피크 ≤ −3 dBFS.
- 동작별: 베기·찌르기 = 쉭+타격(xs_cut, xs_hit) · 강타 = 쿵+북(xs_hit_big) · 마법 = 징·꽹과리(xs_atk_flash/support) · 방어 = 금속 챙(xs_clang) · 회복 = 상행 아르페지오(xs_atk_care) · 치명타 = 타격+피리(xs_hit_adv).
