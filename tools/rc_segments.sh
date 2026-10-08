#!/bin/bash
# RC 구간별 회귀(한 번에 한 구간, 구간마다 로그 한 파일: notes/rc5/seg_*.log). 사용: bash tools/rc_segments.sh   (서버 8765 필요)
# 여유 메모리가 1.3GB 미만이면 기다린다(허브 승인 기준)(Windows).
cd "$(dirname "$0")/.."; mkdir -p notes/rc5; : ; [ "$RESUME" = "1" ] || : > notes/rc5/segments_summary.txt   # RESUME=1: 이미 통과한 구간(rc=0)은 건너뛰고 이어서
free_mb() { powershell.exe -NoProfile -Command "[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)" 2>/dev/null | tr -d '\r'; }
seg() { n="$1"; shift; if [ "$RESUME" = "1" ] && grep -q "^$n rc=0 \(ALL PASS\|no errors\|?\)" notes/rc5/segments_summary.txt 2>/dev/null; then return; fi; while [ "$(free_mb)" -lt 1300 ]; do echo "wait mem $(free_mb)MB" >> notes/rc5/segments_summary.txt; sleep 20; done
  "$@" > "notes/rc5/seg_$n.log" 2>&1; rc=$?; res=$(grep -E '^(ALL PASS|FAILED|no errors)' "notes/rc5/seg_$n.log" | head -1); echo "$n rc=$rc ${res:-?}" >> notes/rc5/segments_summary.txt; }
for c in 1 2 3 4 5 6 7 8 9 10; do seg "c1_ch$c" env ONLY=$c node games/tools/smoke.js; done
for c in 11 12 13 14 15; do seg "c1_book3_ch$c" env ONLY=$c node games/tools/book3_smoke.js; done
for r in 1-5 6-10 11-15 16-20; do seg "merge_$r" env LV=$r node tools/merge_smoke.js; done
for r in 1-10 11-20 21-30 31-40 41-50 51-60 61-70 71-80 81-90 91-100 101-110 111-120; do seg "block_$r" env LV=$r node tools/block_smoke.js; done
for r in 1-20 21-40 41-60 61-80 81-100 101-120 121-140; do seg "spot_$r" env LV=$r node tools/spot_smoke.js; done
for r in 1-10 11-20 21-30 31-40 41-50 51-60 61-70 71-80 81-90 91-100 101-110 111-120; do seg "tile_$r" env LV=$r node tools/tile_smoke.js; done
for r in 1-30 31-60 61-90 91-120; do seg "sort_$r" env LV=$r node tools/sort_smoke.js; done
seg quiz_sim node tools/quiz_sim.js
seg quiz_smoke node tools/quiz_smoke.js
seg color_smoke node tools/color_smoke.js
seg idle_smoke node tools/idle_smoke.js
seg idle_sim node tools/idle_sim.js
seg merge_sim node tools/merge_sim.js
for a in block spot tile sort day; do seg "${a}_sim" node tools/${a}_sim.js; done
for r in 1-15 16-30 31-45 46-60; do seg "day_$r" env LV=$r node tools/day_smoke.js; done
seg first30 node tools/first30_check.js
seg greet node tools/greet_check.js
seg btn_wrap node tools/btn_wrap_check.js
seg btn_wrap_big env BIG=1 node tools/btn_wrap_check.js
seg extras node tools/extras_smoke.js
seg resume node tools/resume_smoke.js
seg ads node tools/ads_shots.js
for a in merge spot block sort tile; do seg "rank_$a" env ONLY=$a node tools/rank_smoke.js; done
seg room_codes node tools/room_codes_check.js
echo "DONE" >> notes/rc5/segments_summary.txt
