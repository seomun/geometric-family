#!/usr/bin/env bash
# ⑪ D1 백업(WP8): 원격은 wrangler 로 SQL 덤프를 받아 날짜별로 보관. 계정·배포 뒤 사용 (Cloudflare Time Travel 은 별도로 30일 되돌리기 가능).
#   사용: scripts/backup.sh [출력폴더]  — 7일치만 남기고 지운다. 개인 데이터가 들어 있으니 저장소에 올리지 않는다(.gitignore: backups/).
set -euo pipefail
OUT="${1:-backups}"; mkdir -p "$OUT"; F="$OUT/expedition-$(date +%Y%m%d-%H%M).sql"
npx wrangler d1 export expedition-db --remote --output "$F"
gzip -f "$F"; find "$OUT" -name 'expedition-*.sql.gz' -mtime +7 -delete; echo "백업 완료: $F.gz"
