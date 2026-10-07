#!/bin/bash
# RC 구간별 회귀(한 번에 한 구간, 구간마다 로그 한 파일: notes/rc3/seg_*.log). 사용: bash tools/rc_segments.sh   (서버 8765 필요)
# 여유 메모리가 2GB 미만이면 기다린다(Windows).
cd "$(dirname "$0")/.."; mkdir -p notes/rc3; : > notes/rc3/segments_summary.txt
free_mb() { powershell.exe -NoProfile -Command "[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)" 2>/dev/null | tr -d '\r'; }
seg() { n="$1"; shift; while [ "$(free_mb)" -lt 2000 ]; do echo "wait mem $(free_mb)MB" >> notes/rc3/segments_summary.txt; sleep 20; done
  "$@" > "notes/rc3/seg_$n.log" 2>&1; rc=$?; res=$(grep -E '^(ALL PASS|FAILED|no errors)' "notes/rc3/seg_$n.log" | head -1); echo "$n rc=$rc ${res:-?}" >> notes/rc3/segments_summary.txt; }
for c in 1 2 3 4 5 6 7 8 9 10; do seg "c1_ch$c" env ONLY=$c node games/tools/smoke.js; done
for c in 11 12 13 15; do seg "c1_book3_ch$c" env ONLY=$c node games/tools/book3_smoke.js; done
for r in 6-10 11-15 16-20; do seg "merge_$r" env LV=$r node tools/merge_smoke.js; done
for r in 1-10 11-20 21-30 41-50 51-60 61-70 71-80 91-100 101-110 111-120; do seg "block_$r" env LV=$r node tools/block_smoke.js; done
for r in 1-20 21-40 41-60 61-80 81-100 101-120; do seg "spot_$r" env LV=$r node tools/spot_smoke.js; done
for r in 1-10 11-20 41-50 51-60 61-70 71-80 81-90 91-100 101-110 111-120; do seg "tile_$r" env LV=$r node tools/tile_smoke.js; done
for r in 1-30 61-90; do seg "sort_$r" env LV=$r node tools/sort_smoke.js; done
seg quiz_sim node tools/quiz_sim.js
echo "DONE" >> notes/rc3/segments_summary.txt
