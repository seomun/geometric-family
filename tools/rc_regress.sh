#!/bin/bash
# RC 전체 회귀(구간 나눠서): bash tools/rc_regress.sh > notes/rc_regress.log  (서버 8765 필요)
cd "$(dirname "$0")/.."
run() { echo "=== $1"; shift; "$@" 2>&1 | grep -E "^(FAIL|FAILED|ALL PASS|ASSERT|assert ok|no errors|ERRORS|PAGEERR|ch1[1-5] )|Error" | head -8; }
for c in 1 2 3 4 5 6 7 8 9 10; do run "① ch$c" env ONLY=$c node games/tools/smoke.js; done
for c in 11 12 13 14 15; do run "① 3권 ch$c" env ONLY=$c node games/tools/book3_smoke.js; done
for r in 1-5 6-10 11-15 16-20; do run "③ merge LV=$r" env LV=$r node tools/merge_smoke.js; done
for r in 1-10 11-20 21-30 31-40 41-50 51-60 61-70 71-80 81-90 91-100 101-110 111-120; do run "⑦ block LV=$r" env LV=$r node tools/block_smoke.js; done
run "⑦ block_sim" node tools/block_sim.js
for r in 1-10 11-20; do run "⑥ spot LV=$r" env LV=$r node tools/spot_smoke.js; done
run "⑥ spot_sim" node tools/spot_sim.js
for r in 1-10 11-20; do run "⑨ tile LV=$r" env LV=$r node tools/tile_smoke.js; done
run "⑨ tile_sim" node tools/tile_sim.js
for r in 1-10 11-20; do run "⑧ sort LV=$r" env LV=$r node tools/sort_smoke.js; done
run "⑧ sort_sim" node tools/sort_sim.js
run "⑩ day LV=1-20" env LV=1-20 node tools/day_smoke.js
run "⑩ day_sim" node tools/day_sim.js
run "④ color" node tools/color_smoke.js
run "⑤ quiz" node tools/quiz_smoke.js
run "② idle" node tools/idle_smoke.js
run "first30" node tools/first30_check.js
run "greet" node tools/greet_check.js
run "room codes" node tools/room_codes_check.js
run "merge_sim" node tools/merge_sim.js
run "quiz_sim" node tools/quiz_sim.js
run "idle_sim" node tools/idle_sim.js
echo "=== DONE"
