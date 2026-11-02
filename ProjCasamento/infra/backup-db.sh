#!/bin/sh
# Backup diário do Postgres dos convites. Cron: 0 3 * * * /opt/casamento/ProjCasamento/infra/backup-db.sh
set -e
DEST=/opt/casamento/backups
mkdir -p "$DEST"
docker exec casamento-db pg_dump -U casamento -d casamento | gzip > "$DEST/casamento-$(date +%F).sql.gz"
find "$DEST" -name 'casamento-*.sql.gz' -mtime +14 -delete
