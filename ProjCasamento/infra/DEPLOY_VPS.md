# Deploy VPS — meucasamento.lumenemotion.com.br

DNS: `meucasamento.lumenemotion.com.br` → `195.35.18.119`

## 1. Na VPS (SSH)

```bash
sudo mkdir -p /opt/casamento
sudo chown "$USER":"$USER" /opt/casamento
cd /opt/casamento

# Clone do repo (ajuste a URL se o remoto mudou)
git clone git@github.com:UserCardinot/MeuCasamento.git .
# Se o Next está na subpasta:
# cd ProjCasamento
```

Se o código do site estiver em `ProjCasamento/`:

```bash
cd /opt/casamento/ProjCasamento
```

## 2. Arquivo `.env` (produção)

```bash
nano .env
```

Copie as mesmas variáveis do `.env.local` / Vercel e inclua:

```env
NEXT_PUBLIC_SITE_URL=https://meucasamento.lumenemotion.com.br
MERCADOPAGO_SANDBOX=false
```

**Não** use valores `[SENSITIVE]`. `GOOGLE_SHEET_ID` só o ID (sem `/edit`).

## 3. Subir o container

```bash
docker compose up -d --build
docker compose ps
curl -sI http://127.0.0.1:3001 | head -5
```

A app escuta em **127.0.0.1:3001** (só local).

## 4. Nginx + HTTPS

Do seu PC (ou na VPS), copie os arquivos:

```bash
# na VPS, a partir do repo:
sudo cp infra/nginx-meucasamento.conf /tmp/nginx-meucasamento.conf
sudo bash infra/setup-nginx-meucasamento.sh
```

Isso cria o site, recarrega o Nginx e pede certificado Let's Encrypt.

## 5. Testar

- https://meucasamento.lumenemotion.com.br  
- https://meucasamento.lumenemotion.com.br/midia?eventToken=SEU_TOKEN  

## 6. Atualizar depois

```bash
cd /opt/casamento/ProjCasamento   # ou pasta correta
git pull
docker compose up -d --build
```

## 7. QR das mesas

Gere o QR com:

```text
https://meucasamento.lumenemotion.com.br/midia?eventToken=SEU_EVENT_TOKEN
```

## Limite de upload

Nginx: `client_max_body_size 0` — sem teto de upload na VPS (app também sem limite de tamanho).
