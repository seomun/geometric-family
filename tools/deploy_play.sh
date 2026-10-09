#!/usr/bin/env bash
# 게임 10종 웹 시험판을 gh-pages 의 play/ 에 올린다 (다른 웹툰 페이지는 그대로 둔다).
# 사용: bash tools/deploy_play.sh   → https://seomun.github.io/geometric-family/play/
# 먼저 앱 HTML 을 최신으로: python games/tools/make_demo.py (또는 각 build_*.py)
set -e
cd "$(dirname "$0")/.."
W=$(mktemp -d)
git fetch -q origin gh-pages
git worktree add -q "$W" origin/gh-pages
mkdir -p "$W/play"
for f in block color day idle merge quiz sort spot tile; do cp games/app/$f.html "$W/play/$f.html"; done
cp games/app/index.html "$W/play/playground.html"
for f in toddler tables merge color quiz block spot sort tile day; do [ -f games/demo/icon_$f.png ] && cp games/demo/icon_$f.png "$W/play/"; done
cp games/web_play_index.html "$W/play/index.html"
if grep -l -i "domgle\|gftestkey" "$W"/play/*.html; then echo "민감 문자열 발견 — 중단"; git worktree remove --force "$W"; exit 1; fi
cd "$W" && git add play && git commit -q -m "play: 웹 시험판 $(date +%F)" && git push -q origin HEAD:gh-pages
cd - >/dev/null && git worktree remove --force "$W"
echo "배포: https://seomun.github.io/geometric-family/play/"
