#!/bin/bash
# Rode NA VPS (como root ou com sudo), depois de copiar o conf para /tmp.
set -euo pipefail

DOMAIN=meucasamento.lumenemotion.com.br
CONF_SRC=/tmp/nginx-meucasamento.conf
CONF_DST=/etc/nginx/sites-available/$DOMAIN

cp "$CONF_SRC" "$CONF_DST"
ln -sfn "$CONF_DST" /etc/nginx/sites-enabled/$DOMAIN

nginx -t
systemctl reload nginx

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
    --register-unsafely-without-email --redirect || \
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
    -m admin@lumenemotion.com.br --redirect
else
  echo "Cert already exists for $DOMAIN"
fi

nginx -t
systemctl reload nginx
echo "Nginx OK for $DOMAIN"
curl -sI "http://127.0.0.1" -H "Host: $DOMAIN" | head -5 || true
