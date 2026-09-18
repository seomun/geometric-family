#!/usr/bin/env bash
# dist/ 를 gh-pages 브랜치로 배포. bash tools/deploy.sh
set -e
cd "$(dirname "$0")/.."
python tools/build.py
cd dist && rm -rf .git && git init -q && git checkout -q -b gh-pages && git add -A && git commit -q -m "deploy $(date +%F)" && git push -f "https://github.com/seomun/geometric-family.git" gh-pages && rm -rf .git
echo "deployed → https://seomun.github.io/geometric-family/"
