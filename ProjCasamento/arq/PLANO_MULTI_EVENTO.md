# Plano de implementação — Multi-evento

Guia completo para transformar o projeto do casamento (evento único, Google Sheets) em uma plataforma com **vários eventos**, cada um com **admin próprio**, **banco Postgres na VPS** e **subdomínio próprio**.

Legenda das tarefas:

- **[VOCÊ]** — precisa ser feito por você, fora do código (DNS, contas, informações).
- **[DEV]** — implementação no código / servidor (eu faço, guiado por este arquivo).
- **[JUNTOS]** — eu executo, você valida.

---

## Sumário

1. [Visão geral e decisões](#1-visão-geral-e-decisões)
2. [Checklist do que você precisa fazer por fora](#2-checklist-do-que-você-precisa-fazer-por-fora)
3. [Etapa 0 — Arquivar o casamento atual](#etapa-0--arquivar-o-casamento-atual)
4. [Etapa 1 — Banco de dados (Postgres + Drizzle)](#etapa-1--banco-de-dados-postgres--drizzle)
5. [Etapa 2 — Evento pelo domínio + camada de dados](#etapa-2--evento-pelo-domínio--camada-de-dados)
6. [Etapa 3 — Admin multiusuário](#etapa-3--admin-multiusuário)
7. [Etapa 4 — Páginas do convidado por tipo de evento](#etapa-4--páginas-do-convidado-por-tipo-de-evento)
8. [Etapa 5 — Pagamentos por evento (Pix + Mercado Pago)](#etapa-5--pagamentos-por-evento-pix--mercado-pago)
9. [Etapa 6 — Temas (Mickey 2 anos e Casamento oliva)](#etapa-6--temas-mickey-2-anos-e-casamento-oliva)
10. [Etapa 7 — Deploy na VPS](#etapa-7--deploy-na-vps)
11. [Operação do dia a dia](#11-operação-do-dia-a-dia)
12. [Ordem de execução resumida](#12-ordem-de-execução-resumida)

---

## 1. Visão geral e decisões

### Decisões tomadas

| Tema | Decisão |
|---|---|
| Casamento Lucas & Beatriz | Arquivado (tag no git). Dados continuam no Sheets/Drive. Não é migrado. |
| Acesso dos convidados | Um **subdomínio por evento**: `convite-henry.lumensoft.com.br` (aniversário) e `convite-ediane.lumensoft.com.br` (casamento). |
| Banco | **Postgres próprio** do projeto, em container no `docker-compose` do casamento. |
| Admin | Login **usuário + senha** por pessoa. Cada admin vê só o próprio evento. Você é **super admin** (vê tudo). |
| Dados do evento | Editáveis pelo próprio admin numa tela de **Configurações**. |
| Pagamento | **Pix e Mercado Pago próprios de cada evento**, configurados no admin. |
| Fotos / áudio / álbum | **Não** existem nos eventos novos (Google Drive sai do projeto). |

### Os dois eventos

| | Evento A — Aniversário | Evento B — Casamento |
|---|---|---|
| Tipo | `convite_completo` | `so_presentes` |
| Tema | `mickey` (aniversário de 2 anos do Mickey) | `oliva` (verde oliva + branco/bege) |
| Convite (página com contagem, local, mapa) | Sim | **Não** |
| Confirmação de presença | Sim | Sim |
| Lista de presentes (Pix + cartão) | Sim | Sim |
| Recados | Sim | Sim |
| Admin | Parente 1 | Parente 2 |

### Arquitetura final

```text
Convidado ──► convite-henry.lumensoft.com.br ──┐
Convidado ──► convite-ediane.lumensoft.com.br ─┤
                                          ▼
                     Nginx (HTTPS, um server por subdomínio)
                                          ▼
                      casamento-web (Next.js, porta 3001)
                       │  middleware lê o Host → descobre o evento
                       ▼
                      casamento-db (Postgres 16, só rede interna)
```

- Um único app Next.js atende todos os eventos.
- O **Host** da requisição define o evento (`eventos.dominio`).
- O admin de cada evento fica em `https://<subdominio>/admin`.

### Variáveis de ambiente (novo `.env`)

```env
# Banco
DATABASE_URL=postgres://casamento:SENHA_FORTE@db:5432/casamento
POSTGRES_PASSWORD=SENHA_FORTE

# Sessão do admin (string aleatória longa — openssl rand -hex 32)
SESSION_SECRET=

# Criptografa tokens do Mercado Pago salvos no banco (openssl rand -hex 32)
APP_ENCRYPTION_KEY=

# Desenvolvimento local: evento usado em http://localhost:3000
DEV_EVENTO_SLUG=convite-henry
```

Saem do `.env`: `GOOGLE_*`, `EVENT_*`, `ADMIN_PASSWORD`, `PIX_*`, `MERCADOPAGO_*`, `EVENT_TOKEN`.

---

## 2. Checklist do que você precisa fazer por fora

Faça na ordem. Cada item diz **quando** ele bloqueia o trabalho.

### 2.1 Escolher os subdomínios — [VOCÊ] — feito

- `convite-henry.lumensoft.com.br` (aniversário de 2 anos — Mickey)
- `convite-ediane.lumensoft.com.br` (casamento — sem convite)

### 2.2 Criar os registros DNS — [VOCÊ] — bloqueia a Etapa 7

No painel onde o domínio `lumensoft.com.br` está:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| A | `convite-henry` | `195.35.18.119` | 3600 (ou padrão) |
| A | `convite-ediane` | `195.35.18.119` | 3600 (ou padrão) |

Para conferir (no PowerShell):

```powershell
nslookup convite-henry.lumensoft.com.br
nslookup convite-ediane.lumensoft.com.br
```

Tem que responder `195.35.18.119`. Pode levar de minutos a algumas horas.

### 2.3 Logins dos admins — [VOCÊ] — bloqueia a Etapa 3 (seed)

Me passe, para cada parente:

- Nome
- Login desejado (ex.: `ana`, `carlos`)
- Qual evento ele administra

Eu gero uma **senha provisória** para cada um; eles trocam no primeiro acesso.

### 2.4 Pix de cada evento — [VOCÊ / parente] — bloqueia a Etapa 5 (pode ser preenchido no admin depois)

Para cada evento:

- **Chave Pix** (CPF, e-mail, telefone ou aleatória)
- **Nome do recebedor** — até 25 caracteres, sem acento
- **Cidade** — até 15 caracteres, sem acento

### 2.5 Mercado Pago de cada evento (cartão) — [VOCÊ / parente] — opcional, bloqueia só o cartão

Cada dono do evento, **com a própria conta Mercado Pago**:

1. Entrar em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel/app) → **Suas integrações** → **Criar aplicação**.
   - Tipo: *Pagamentos online* → *Checkout Pro*.
2. Em **Credenciais de produção**, copiar o **Access Token** (começa com `APP_USR-`).
   - Nunca usar a *Public Key*.
3. Para testar antes: **Credenciais de teste** → Access Token de teste (`TEST-...`).
4. Em **Webhooks** (na mesma aplicação):
   - URL: `https://<subdominio-do-evento>/api/webhooks/mercadopago`
   - Evento: **Pagamentos**
5. Colar o Access Token no admin do evento (tela **Configurações → Pagamentos**), marcando “Modo teste” enquanto usar token de teste.

Se o evento não quiser cartão, basta deixar o token vazio: a lista de presentes mostra só Pix.

### 2.6 Conteúdo de cada evento — [VOCÊ] — bloqueia a Etapa 6

**Evento A — Aniversário de 2 anos (Mickey):**

- Nome da criança, idade, frase do convite
- Data, horário, local (nome, endereço, link do Google Maps)
- Data limite para confirmar presença
- Imagens: fotos da criança, logo/arte do tema (PNG/SVG de boa resolução)
- Referências visuais (prints, Pinterest, convite impresso)
- Mensagem do WhatsApp para enviar o convite
- Itens da lista de presentes (nome, preço, imagem/link) — pode ser cadastrado no admin

**Evento B — Casamento (sem convite):**

- Nomes do casal, data, local (se quiser mostrar)
- Cores: verde oliva + branco/bege (já definido); alguma referência extra
- Texto da página inicial e da mensagem do WhatsApp
- Itens da lista de presentes — pode ser cadastrado no admin

### 2.7 Acesso à VPS — [JUNTOS]

Eu uso a chave SSH (`C:\Users\lucas\.ssh\key.key`). Quando eu pedir aprovação de comando na VPS, é só aprovar.

---

## Etapa 0 — Arquivar o casamento atual

**Objetivo:** guardar o estado atual para poder subir o site antigo no futuro.

### Passos — [DEV]

1. Garantir que o `main` está limpo e igual ao que está na VPS.
2. Criar a tag e enviar:

   ```bash
   git tag -a arquivo-lucas-beatriz -m "Casamento Lucas & Beatriz (Sheets/Drive) — arquivado"
   git push origin arquivo-lucas-beatriz
   ```

3. Criar a branch de trabalho:

   ```bash
   git checkout -b multi-evento
   ```

4. Na VPS, deixar o container antigo parado (já está) e salvar o `.env` antigo:

   ```bash
   cp /opt/casamento/ProjCasamento/.env /opt/casamento/env-arquivo-lucas-beatriz.env
   ```

### Como subir o site antigo no futuro (se precisar)

```bash
git checkout arquivo-lucas-beatriz
cp /opt/casamento/env-arquivo-lucas-beatriz.env .env
docker compose up -d --build
```

### Pronto quando

- [ ] Tag `arquivo-lucas-beatriz` existe no GitHub.
- [ ] `.env` antigo salvo na VPS.
- [ ] Branch `multi-evento` criada.

---

## Etapa 1 — Banco de dados (Postgres + Drizzle)

**Objetivo:** Postgres rodando localmente e na VPS, com as tabelas criadas e um super admin.

### 1.1 Ferramentas — [VOCÊ, uma vez]

No seu PC: **Docker Desktop** instalado e aberto (para o Postgres local).

### 1.2 Dependências — [DEV]

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit tsx
```

- `drizzle-orm` + `postgres`: acesso ao banco (leve, funciona bem no Docker Alpine).
- `drizzle-kit`: gera migrations a partir do schema.
- Hash de senha com `crypto.scrypt` do Node (sem dependência extra).

### 1.3 Postgres no `docker-compose.yml` — [DEV]

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: casamento-db
    environment:
      POSTGRES_DB: casamento
      POSTGRES_USER: casamento
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - casamento_pgdata:/var/lib/postgresql/data
    # Só para acessar do host (backup / psql). Não expor para a internet.
    ports:
      - "127.0.0.1:5434:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U casamento -d casamento"]
      interval: 10s
      timeout: 5s
      retries: 10

  migrate:
    build:
      context: .
      target: builder
    env_file: .env
    command: ["node", "--import", "tsx", "scripts/db-migrate.ts"]
    depends_on:
      db:
        condition: service_healthy
    profiles: ["tools"]

  casamento:
    # ...como hoje, mais:
    depends_on:
      db:
        condition: service_healthy

volumes:
  casamento_pgdata:
```

- Porta `5434` para não conflitar com os Postgres do Enterprise (`5432` e `5433`).
- O serviço `migrate` usa o estágio `builder` (tem todas as dependências) e só roda quando chamado.

Para desenvolvimento local, um `docker-compose.dev.yml` só com o `db` e `DATABASE_URL=postgres://casamento:dev@localhost:5434/casamento` no `.env.local`.

### 1.4 Schema — [DEV]

Arquivo `db/schema.ts` (Drizzle). Estrutura equivalente em SQL:

```sql
CREATE TABLE eventos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,            -- 'convite-henry', 'convite-ediane'
  dominio          text UNIQUE NOT NULL,            -- 'convite-henry.lumensoft.com.br'
  tipo             text NOT NULL CHECK (tipo IN ('convite_completo','so_presentes')),
  tema             text NOT NULL,                   -- 'mickey' | 'oliva'
  titulo           text NOT NULL,                   -- 'Aniversário do Theo' / 'Maria & João'
  subtitulo        text,
  data_evento      date,
  hora_evento      time,
  local_nome       text,
  local_endereco   text,
  local_mapa_url   text,
  confirmar_ate    date,
  textos           jsonb NOT NULL DEFAULT '{}',     -- convite, whatsapp, rodapé, página inicial
  pix_chave        text,
  pix_nome         text,
  pix_cidade       text,
  mp_access_token_enc text,                         -- criptografado (AES-256-GCM)
  mp_sandbox       boolean NOT NULL DEFAULT true,
  mp_taxa_percent  numeric(5,2) NOT NULL DEFAULT 5,
  ativo            boolean NOT NULL DEFAULT true,
  criado_em        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login       text UNIQUE NOT NULL,
  nome        text NOT NULL,
  senha_hash  text NOT NULL,                        -- scrypt
  papel       text NOT NULL CHECK (papel IN ('super','admin')),
  evento_id   uuid REFERENCES eventos(id) ON DELETE CASCADE,  -- NULL para super
  trocar_senha boolean NOT NULL DEFAULT true,
  ativo       boolean NOT NULL DEFAULT true,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE convidados (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id          uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  token              text UNIQUE NOT NULL,          -- link individual
  nome               text NOT NULL,
  acompanhantes      text NOT NULL DEFAULT '',      -- nomes separados por vírgula (lib/acompanhantes.ts)
  contato            text,
  origem             text,                          -- 'noivo', 'noiva', 'família'...
  convite_enviado_em timestamptz,
  criado_em          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON convidados (evento_id);

CREATE TABLE presencas (
  convidado_id   uuid PRIMARY KEY REFERENCES convidados(id) ON DELETE CASCADE,
  evento_id      uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  confirmado     boolean NOT NULL,
  mensagem       text,
  acompanhantes  text NOT NULL DEFAULT '',          -- quem vai junto (confirmado)
  atualizado_em  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON presencas (evento_id);

CREATE TABLE catalogo_presentes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  preco_centavos  integer NOT NULL,
  url             text,
  imagem          text,
  ativo           boolean NOT NULL DEFAULT true,
  ordem           integer NOT NULL DEFAULT 0,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (evento_id, nome)
);

CREATE TABLE presentes_recebidos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id       uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  convidado_id    uuid REFERENCES convidados(id) ON DELETE SET NULL,
  itens           jsonb NOT NULL,                   -- [{nome, preco_centavos, qtd}]
  valor_centavos  integer NOT NULL,
  metodo          text NOT NULL CHECK (metodo IN ('pix','cartao')),
  status          text NOT NULL DEFAULT 'pendente', -- pendente | aprovado | recusado
  mp_payment_id   text UNIQUE,
  criado_em       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON presentes_recebidos (evento_id);

CREATE TABLE recados (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  convidado_id  uuid REFERENCES convidados(id) ON DELETE SET NULL,
  nome          text NOT NULL,
  mensagem      text NOT NULL,
  visivel       boolean NOT NULL DEFAULT true,      -- admin pode ocultar
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON recados (evento_id);
```

Regras importantes:

- **Toda tabela de dados tem `evento_id`** e toda consulta filtra por ele.
- Preços em **centavos** (`integer`) para não ter erro de arredondamento.
- `mp_payment_id UNIQUE` evita registrar o mesmo pagamento duas vezes (webhook + retorno).

### 1.5 Arquivos novos — [DEV]

| Arquivo | Função |
|---|---|
| `db/schema.ts` | Tabelas Drizzle |
| `db/index.ts` | Conexão única (`postgres(DATABASE_URL)` + `drizzle`) |
| `drizzle.config.ts` | Config do `drizzle-kit` |
| `drizzle/` | Migrations SQL geradas (versionadas no git) |
| `scripts/db-migrate.ts` | Aplica migrations |
| `scripts/db-seed.ts` | Cria super admin e os 2 eventos com dados provisórios |
| `scripts/criar-usuario.ts` | Cria/reseta usuário: `npm run usuario -- --login ana --evento convite-henry` |
| `lib/senha.ts` | `hashSenha` / `conferirSenha` (scrypt) |
| `lib/cripto.ts` | `criptografar` / `descriptografar` (AES-256-GCM com `APP_ENCRYPTION_KEY`) |

Scripts no `package.json`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "tsx scripts/db-migrate.ts",
"db:seed": "tsx scripts/db-seed.ts",
"db:studio": "drizzle-kit studio",
"usuario": "tsx scripts/criar-usuario.ts"
```

### 1.6 Rodar localmente — [JUNTOS]

```powershell
docker compose -f docker-compose.dev.yml up -d
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run db:studio   # abre interface web para ver as tabelas
```

### Pronto quando

- [ ] `db:migrate` cria todas as tabelas sem erro.
- [ ] `db:seed` cria: 1 super admin, evento `convite-henry` (tipo `convite_completo`, tema `mickey`), evento `convite-ediane` (tipo `so_presentes`, tema `oliva`).
- [ ] `db:studio` mostra os dados.

---

## Etapa 2 — Evento pelo domínio + camada de dados

**Objetivo:** o site descobre o evento pelo endereço e lê/grava tudo no Postgres, sem Google Sheets.

### 2.1 Descobrir o evento pelo Host — [DEV]

`middleware.ts` (raiz do projeto):

1. Lê o `Host` (sem porta).
2. Se for `localhost`/`127.0.0.1` → usa `DEV_EVENTO_SLUG`.
3. Se for `xxx.localhost` → usa `xxx` como slug (teste local de cada evento: `http://convite-henry.localhost:3000`).
4. Caso contrário → domínio completo.
5. Repassa como header interno `x-evento-host` (ou `x-evento-slug` no dev).

`lib/evento-atual.ts`:

- `getEventoAtual()` — lê o header, busca em `eventos` (por `dominio` ou `slug`), com cache em memória de ~30 s.
- Se não achar ou `ativo = false` → página “Evento não encontrado”.

`lib/evento.ts` (hoje uma constante `EVENTO`) passa a ser só **tipos + helpers de formatação** (`formatarData`, `getDataHoraConviteUppercase(evento)`, `getEventoTimestamp(evento)`), recebendo o evento como parâmetro.

### 2.2 Repositórios (substituem `lib/google.ts`) — [DEV]

Pasta `lib/repo/`, todas as funções recebem `eventoId`:

| Arquivo | Funções | Substitui |
|---|---|---|
| `convidados.ts` | `listar`, `porToken`, `criar`, `editar`, `remover`, `marcarConviteEnviado` | `getConvidadoByToken`, `updateConvidadoRow`, `deleteConvidadoRow`, aba Convidados |
| `presencas.ts` | `porConvidado`, `upsert`, `listar` | `upsertPresencaRow`, `getPresencaStatus`, aba Presenças |
| `catalogo.ts` | `listarAtivos`, `listarTodos`, `criar`, `editar`, `remover`, `reordenar` | `getCatalogoPresentes`, `updateCatalogoPresenteRow`, `deleteCatalogoPresenteRow` |
| `presentes.ts` | `registrar`, `porConvidado`, `listar`, `existePagamentoMP` | aba Presentes, `getPresenteRegistrado` |
| `recados.ts` | `listarVisiveis`, `listarTodos`, `criar`, `alternarVisivel` | aba Recados |
| `eventos.ts` | `porDominio`, `porSlug`, `atualizarConfig`, `listarTodos` | `lib/evento.ts` (constante) |
| `usuarios.ts` | `porLogin`, `criar`, `trocarSenha`, `listarPorEvento` | `ADMIN_PASSWORD` |

Token de convidado: `porToken(eventoId, token)` — **o token só vale dentro do evento dele**.

### 2.3 Rotas a reescrever — [DEV]

| Rota atual | O que muda |
|---|---|
| `api/confirmar-presenca` | `getEventoAtual` + `presencas.upsert` |
| `api/status-presenca` | `presencas.porConvidado` |
| `api/enviar-recado` / `api/listar-recados` | `recados.*` por evento |
| `api/registrar-pix` | `presentes.registrar` (metodo `pix`) |
| `api/pix-info` | Pix do evento (Etapa 5) |
| `api/mercadopago/*`, `api/webhooks/mercadopago` | Token do evento (Etapa 5) |
| `api/listar-dados-admin` | Consulta por `evento_id` da sessão |
| `api/admin/*` | Sessão + `evento_id` (Etapa 3) |
| `api/og/convite` | Dados do evento atual |
| `app/convite`, `app/confirmacao`, `app/presentes`, `app/recados` | `getEventoAtual()` no lugar de `EVENTO` |
| `lib/mercadopago-registrar-pagamento.ts` | Grava em `presentes_recebidos` |
| `lib/convite-whatsapp.ts` | Texto do `eventos.textos.whatsapp` + domínio do evento |

### 2.4 Remover o que sai — [DEV]

- `app/midia`, `app/galeria`, `api/enviar-midia`, `api/galeria`, `api/test-google`
- `lib/google.ts`, `lib/photo-moment.ts`, `lib/capture-hint.ts`, `lib/compress-image.ts`, `lib/upload-with-progress.ts`
- `scripts/get-refresh-token.mjs`, `scripts/gerar-fotos-teste-exif.mjs`
- Dependências: `googleapis`, `exifr`, `piexifjs`

(Tudo continua disponível na tag `arquivo-lucas-beatriz`.)

### Pronto quando

- [ ] `http://convite-henry.localhost:3000` e `http://convite-ediane.localhost:3000` carregam eventos diferentes.
- [ ] Domínio desconhecido mostra “Evento não encontrado”.
- [ ] Nenhum import de `lib/google` sobra (`rg "lib/google"` vazio).
- [ ] `npm run build` passa.

---

## Etapa 3 — Admin multiusuário

**Objetivo:** cada parente entra com o próprio login em `https://<subdominio>/admin` e só mexe no próprio evento.

### 3.1 Autenticação — [DEV]

- Login: `POST /api/admin/login` com `{ login, senha }`.
  - Confere `usuarios.senha_hash` (scrypt).
  - Permite entrar se: `papel = 'super'` **ou** `usuario.evento_id = evento do domínio`.
- Sessão: cookie `admin_sessao` (httpOnly, `SameSite=Lax`, `Secure` em produção, 30 dias) com `{ usuarioId, exp }` assinado com HMAC (`SESSION_SECRET`).
- `lib/admin-sessao.ts`:
  - `getSessaoAdmin()` → `{ usuario, evento }` ou `null`.
  - `exigirAdmin()` → usado em **todas** as rotas `api/admin/*`; retorna 401 se não logado ou se o evento da sessão não for o do domínio (exceto super).
- Rate limit no login (já existe `lib/rate-limit.ts`): 10 tentativas / 15 min por IP.
- Primeiro acesso com `trocar_senha = true` → tela obrigatória “Defina sua senha”.

Nível de segurança: adequado para uso familiar (senha com hash, cookie assinado, escopo por evento). Sem 2FA, sem recuperação por e-mail — senha esquecida é resetada por você com `npm run usuario`.

### 3.2 Telas do admin — [DEV]

Navegação em abas no topo do `/admin`:

| Aba | Conteúdo |
|---|---|
| **Resumo** | Total de convidados, confirmados, recusados, sem resposta, pessoas confirmadas (com acompanhantes), total arrecadado |
| **Convidados** | Adicionar / editar / remover (já existe: `AddConvidado`, `EditarConvidadoModal`), botão **Enviar no WhatsApp** por convidado, **Envio em lote** (`EnvioEmLote`), filtro por status, marcação “convite enviado” |
| **Presenças** | Lista de respostas com mensagens e acompanhantes (`PendenciasPresencaModal`) |
| **Presentes** | Catálogo (adicionar/editar/remover/reordenar) + presentes recebidos (Pix/cartão, status) + sincronizar pagamento MP |
| **Recados** | Ver todos, ocultar/mostrar |
| **Configurações** | Dados do evento: título, subtítulo, data, hora, local, mapa, data limite, textos (convite, página inicial, WhatsApp) · Pagamentos: Pix e Mercado Pago (token mascarado, modo teste) · **Minha senha** |
| **Eventos** (só super) | Lista de eventos, criar evento, criar/resetar usuários |

### 3.3 Links de convite — [DEV]

Gerados a partir do evento:

- `convite_completo`: `https://<dominio>/convite?token=<token>`
- `so_presentes`: `https://<dominio>/?token=<token>`

Mensagem do WhatsApp: modelo em `eventos.textos.whatsapp` com variáveis `{nome}`, `{link}`, `{data}`, `{titulo}`. O link fica sozinho entre linhas em branco (para o WhatsApp deixar clicável, como hoje).

### 3.4 Exportação — [DEV]

Botão **Exportar CSV** em Convidados/Presenças/Presentes (abre no Excel/Sheets), substituindo a planilha como “relatório”.

### Pronto quando

- [ ] Admin do Mickey não consegue logar no domínio do Casamento (e vice-versa).
- [ ] Super admin loga em qualquer domínio.
- [ ] Toda rota `api/admin/*` retorna 401 sem sessão (testar com `curl`).
- [ ] Parente consegue: cadastrar convidado → enviar WhatsApp → ver a confirmação chegar.
- [ ] Troca de senha funciona; senha provisória obriga a trocar.

---

## Etapa 4 — Páginas do convidado por tipo de evento

**Objetivo:** cada evento mostra só as páginas do seu tipo.

### 4.1 Matriz de páginas — [DEV]

| Rota | `convite_completo` (Mickey) | `so_presentes` (Casamento) |
|---|---|---|
| `/` | Redireciona para `/convite` (mantém `?token`) | **Capa** do evento: título, data, texto, botões Confirmar presença / Lista de presentes / Recados |
| `/convite` | Convite completo (contagem, local, mapa, status de presença) | 404 → redireciona para `/` |
| `/confirmacao` | Sim | Sim |
| `/presentes` | Sim | Sim |
| `/recados` | Sim | Sim |
| `/admin` | Sim | Sim |

Implementação: `lib/recursos-evento.ts` com `temConvite(evento)` etc., checado em cada `page.tsx`.

### 4.2 Token do convidado — [DEV]

- Mantém o modelo atual: cada convidado tem link próprio com `?token=`.
- Sem token (ou token de outro evento) → mensagem amigável “Use o link que você recebeu”.
- Todas as navegações internas preservam o `token` na URL (já é assim hoje).

### 4.3 Open Graph (preview do link) — [DEV]

- `generateMetadata` por evento: título e descrição do evento.
- Imagem de preview opcional por evento (`textos.og_imagem`); hoje o casamento usa sem imagem — manter configurável.

### Pronto quando

- [ ] `convite-henry.localhost:3000/?token=X` abre o convite.
- [ ] `convite-ediane.localhost:3000/convite` não existe (vai para a capa).
- [ ] Confirmação, presentes e recados funcionam nos dois.

---

## Etapa 5 — Pagamentos por evento (Pix + Mercado Pago)

**Objetivo:** cada evento recebe no próprio Pix e na própria conta Mercado Pago.

### 5.1 Pix — [DEV]

- `api/pix-info` e `lib/pix-brcode.ts` passam a usar `eventos.pix_chave`, `pix_nome`, `pix_cidade`.
- Validação no admin: nome ≤ 25, cidade ≤ 15, remover acentos automaticamente.
- Se o evento não tiver chave Pix → a opção Pix some da lista de presentes.

### 5.2 Mercado Pago — [DEV]

- Token salvo **criptografado** (`mp_access_token_enc`, AES-256-GCM com `APP_ENCRYPTION_KEY`). No admin aparece só `APP_USR-••••1234`.
- `lib/mercadopago-shared.ts`: criar cliente MP **a partir do evento** (não do `.env`).
- Preferência (`api/mercadopago/preferencia`):
  - `back_urls` e `notification_url` usam o **domínio do evento** → `https://<dominio>/api/webhooks/mercadopago`.
  - `external_reference` continua no formato atual (token + itens).
- Webhook (`api/webhooks/mercadopago`):
  - O Host da notificação identifica o evento → busca o token daquele evento → consulta o pagamento → grava em `presentes_recebidos` (idempotente por `mp_payment_id`).
- `mp_sandbox` e `mp_taxa_percent` por evento (substituem `MERCADOPAGO_SANDBOX` e `MERCADOPAGO_TAXA_PERCENT`).
- Se o evento não tiver token → a opção cartão some.

### 5.3 Teste — [JUNTOS]

1. No admin do evento: colar token **de teste** e marcar “Modo teste”.
2. Comprar um presente com [cartão de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards).
3. Conferir: presente aparece como **aprovado** no admin.
4. Trocar para token de **produção** e desmarcar “Modo teste”.

### Pronto quando

- [ ] Pix gera QR com a chave e o valor certo de cada evento.
- [ ] Pagamento de teste no cartão aparece no admin do evento certo.
- [ ] Webhook repetido não duplica o presente.

---

## Etapa 6 — Temas (Mickey 2 anos e Casamento oliva)

**Objetivo:** visual totalmente diferente por evento, reaproveitando a mesma lógica.

### 6.1 Sistema de temas — [DEV]

- Cores viram **variáveis CSS** por tema. O Tailwind referencia as variáveis:

  ```ts
  // tailwind.config.ts
  colors: {
    tema: {
      primaria: "rgb(var(--tema-primaria) / <alpha-value>)",
      secundaria: "rgb(var(--tema-secundaria) / <alpha-value>)",
      fundo: "rgb(var(--tema-fundo) / <alpha-value>)",
      texto: "rgb(var(--tema-texto) / <alpha-value>)",
      destaque: "rgb(var(--tema-destaque) / <alpha-value>)",
    },
  }
  ```

- `lib/temas/<tema>.ts` define: cores, fontes, textura de fundo, raio de borda, estilo de botões.
- O `app/layout.tsx` aplica `data-tema="<tema>"` no `<body>` a partir do evento atual.
- Troca progressiva das classes `invite-olive`, `invite-cream`, `font-invite-caps` por `tema-*`.
- Páginas compartilhadas (confirmação, presentes, recados, admin) usam só `tema-*` → mudam de cara automaticamente.
- O **convite** tem componentes próprios por tema: `app/convite/temas/mickey/ConviteMickey.tsx`.

### 6.2 Tema `oliva` (Casamento) — [DEV]

- Base: paleta atual do projeto (verde oliva + creme/bege), textura de linho.
- Ajustes: mais branco/bege no fundo, oliva nos títulos e botões.
- Capa (`/`) elegante e simples: nomes do casal em fonte cursiva, data, 3 botões.

### 6.3 Tema `mickey` (Aniversário 2 anos) — [DEV, depende do item 2.6]

Direção inicial (ajustar com as referências):

- Cores: vermelho `#E21E25`, preto `#111111`, amarelo `#FFD100`, branco.
- Elementos: orelhas do Mickey como moldura, bolinhas brancas sobre vermelho (calção), número **2** em destaque.
- Fontes arredondadas e divertidas para títulos; sem serifa legível para textos.
- Convite: foto da criança, “Vem comemorar meus 2 aninhos!”, contagem regressiva, local com mapa, confirmar presença.
- Atenção a direitos de imagem: usar artes próprias/silhuetas, não logos oficiais da Disney.

### Pronto quando

- [ ] Trocar `tema` no banco muda as cores de todas as páginas.
- [ ] Convite Mickey aprovado por você no celular.
- [ ] Capa do Casamento aprovada por você no celular.

---

## Etapa 7 — Deploy na VPS

**Objetivo:** os dois subdomínios no ar com HTTPS.

### 7.1 Pré-requisitos

- [ ] Itens 2.1 e 2.2 (DNS) feitos e respondendo `195.35.18.119`.
- [ ] Branch `multi-evento` mergeada no `main`.

### 7.2 `.env` na VPS — [DEV]

```bash
cd /opt/casamento/ProjCasamento
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # APP_ENCRYPTION_KEY
openssl rand -hex 24   # POSTGRES_PASSWORD
nano .env
```

Conteúdo: o bloco de variáveis da seção 1. **Guardar `APP_ENCRYPTION_KEY` também fora da VPS** (gerenciador de senhas): sem ela, os tokens do MP salvos não podem ser lidos.

### 7.3 Subir banco, migrations e app — [DEV]

```bash
cd /opt/casamento/ProjCasamento
git fetch origin && git reset --hard origin/main
docker compose up -d db
docker compose --profile tools run --rm migrate
docker compose --profile tools run --rm migrate node --import tsx scripts/db-seed.ts
docker compose up -d --build casamento
docker compose ps
```

### 7.4 Nginx + HTTPS — [DEV]

Arquivo `infra/nginx-eventos.conf` (um `server_name` com todos os subdomínios; o app separa pelo Host):

```nginx
server {
    listen 80;
    server_name convite-henry.lumensoft.com.br convite-ediane.lumensoft.com.br;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

```bash
sudo cp infra/nginx-eventos.conf /etc/nginx/sites-available/eventos
sudo ln -sf /etc/nginx/sites-available/eventos /etc/nginx/sites-enabled/eventos
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d convite-henry.lumensoft.com.br -d convite-ediane.lumensoft.com.br
```

- `proxy_set_header Host $host` é **obrigatório** (é como o app sabe o evento).
- Desativar o site antigo: `sudo rm /etc/nginx/sites-enabled/meucasamento.lumenemotion.com.br` (ou apontar para uma página de “evento encerrado”).

### 7.5 Backup automático do banco — [DEV]

`/opt/casamento/backup-db.sh`:

```bash
#!/bin/sh
set -e
DEST=/opt/casamento/backups
mkdir -p "$DEST"
docker exec casamento-db pg_dump -U casamento -d casamento | gzip > "$DEST/casamento-$(date +%F).sql.gz"
find "$DEST" -name 'casamento-*.sql.gz' -mtime +14 -delete
```

```bash
chmod +x /opt/casamento/backup-db.sh
( crontab -l 2>/dev/null; echo "0 4 * * * /opt/casamento/backup-db.sh" ) | crontab -
```

Restaurar:

```bash
gunzip -c /opt/casamento/backups/casamento-AAAA-MM-DD.sql.gz | docker exec -i casamento-db psql -U casamento -d casamento
```

### 7.6 Teste final — [JUNTOS]

- [ ] `https://convite-henry.lumensoft.com.br/admin` → login do admin do aniversário.
- [ ] `https://convite-ediane.lumensoft.com.br/admin` → login do admin do casamento.
- [ ] Cada um cadastra 1 convidado de teste e manda o link no próprio WhatsApp.
- [ ] Abrir o link no celular → confirmar presença → aparece no admin.
- [ ] Presente via Pix (QR com valor certo) e via cartão de teste.
- [ ] Recado aparece na página de recados e no admin.
- [ ] Preview do link no WhatsApp com o título do evento.
- [ ] Backup gerado em `/opt/casamento/backups` no dia seguinte.

### 7.7 Entregar para os parentes — [VOCÊ]

Mande para cada um:

- Link do admin: `https://<subdominio>/admin`
- Login e senha provisória
- Lembrete: cadastrar o Pix e (opcional) o Mercado Pago em **Configurações → Pagamentos**

---

## 11. Operação do dia a dia

| Situação | Como resolver |
|---|---|
| Parente esqueceu a senha | `docker compose --profile tools run --rm migrate node --import tsx scripts/criar-usuario.ts --login ana --resetar` → nova senha provisória |
| Novo evento no futuro | Super admin cria em **Eventos** · DNS do novo subdomínio · adicionar no `server_name` do Nginx · `certbot --nginx -d novo.lumensoft.com.br --expand` |
| Atualizar o site | `git pull` + `docker compose up -d --build casamento` (+ `migrate` se houver migration nova) |
| Ver dados direto no banco | `docker exec -it casamento-db psql -U casamento` |
| Evento terminou | Admin/super marca `ativo = false` → site mostra “Evento encerrado”; dados ficam no banco |
| Restaurar backup | Ver 7.5 |

---

## 12. Ordem de execução resumida

| # | O quê | Quem | Depende de |
|---|---|---|---|
| 1 | Escolher subdomínios e criar DNS (2.1, 2.2) | VOCÊ | — |
| 2 | Logins dos parentes (2.3) | VOCÊ | — |
| 3 | Etapa 0 — tag + branch | DEV | — |
| 4 | Etapa 1 — Postgres + schema + seed | DEV | Docker Desktop |
| 5 | Etapa 2 — evento pelo domínio + repositórios | DEV | 4 |
| 6 | Etapa 3 — admin multiusuário | DEV | 5, item 2 |
| 7 | Etapa 4 — páginas por tipo | DEV | 5 |
| 8 | Etapa 5 — Pix + Mercado Pago por evento | DEV | 6 |
| 9 | Pix e Mercado Pago de cada evento (2.4, 2.5) | VOCÊ / parentes | 8 (pode ser no admin) |
| 10 | Conteúdo e referências dos eventos (2.6) | VOCÊ | — |
| 11 | Etapa 6 — temas oliva e Mickey | DEV | 7, item 10 |
| 12 | Etapa 7 — deploy, HTTPS, backup | DEV | 1, 8 |
| 13 | Teste final e entrega (7.6, 7.7) | JUNTOS / VOCÊ | 12 |

As etapas 0 a 5 não dependem de design e podem começar já. O tema Mickey começa quando chegarem as referências do item 2.6.
