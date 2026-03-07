# 📋 Plano de Desenvolvimento – Redesign Completo

> Aplicar o design system (verde pastel/oliva, moderno e organizado) em todas as telas.

**Referência visual:** `arq/DESIGN_SISTEMA_CASAMENTO.md`

---

## Fase 0: Base (design system no código)

**Objetivo:** Cores e tipografia disponíveis em todo o app.

| # | Tarefa | Arquivo(s) | Descrição |
|---|--------|------------|-----------|
| 0.1 | Atualizar paleta Tailwind | `tailwind.config.ts` | Incluir `oliva`, `sage`, `sage-claro`, `pastel`, `creme`, `white`; manter `verde` como alias de `oliva` se quiser compatibilidade. |
| 0.2 | CSS global (opcional) | `app/globals.css` | Variáveis CSS para gradientes padrão (opcional; pode ser só Tailwind). |
| 0.3 | Layout raiz | `app/layout.tsx` | `body`: fundo `bg-casamento-creme`, texto `text-stone-800`. |

**Entregável:** Qualquer página que use `casamento-*` já usa a nova paleta.

---

## Fase 1: Páginas públicas (convidado)

### 1.1 Home (`/`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.1.1 | Redesign | `app/page.tsx` | Gradiente novo; título com `font-heading` e cor oliva/sage; texto secundário; card opcional com borda sage; botão/links se houver. |

### 1.2 Convite (`/convite`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.2.1 | Página principal | `app/convite/page.tsx` | Fundo gradiente (creme → pastel); card central com `rounded-2xl`, borda sage; títulos em heading + oliva; botões primário/secundário novos; divider em sage. |
| 1.2.2 | Contagem regressiva | `app/convite/ContagemRegressiva.tsx` | Estilo alinhado ao design system (cores sage/oliva, tipografia). |
| 1.2.3 | Status presença | `app/convite/StatusPresenca.tsx` | Botões/links com novo padrão. |
| 1.2.4 | Loading | `app/convite/loading.tsx` | Skeleton ou spinner em tons verde/creme. |

### 1.3 Confirmação de presença (`/confirmacao`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.3.1 | Página | `app/confirmacao/page.tsx` | Mesmo fundo e container; título e espaçamento padronizados. |
| 1.3.2 | Formulário | `app/confirmacao/FormConfirmacao.tsx` | Inputs e selects com `rounded-xl`, focus ring oliva; botão primário; mensagens de sucesso/erro com novos estilos; radio/checkbox alinhados ao tema. |

### 1.4 Lista de presentes (`/presentes`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.4.1 | Página | `app/presentes/page.tsx` | Link “Voltar” com estilo padrão; título e descrição; fundo gradiente. |
| 1.4.2 | Lista de presentes | `app/presentes/ListaPresentesConvidado.tsx` | Cards de presente com borda sage, `rounded-2xl`; botões e preços com oliva/sage. |
| 1.4.3 | Formulário Pix | `app/presentes/FormPix.tsx` | Inputs e botão no padrão do design system. |
| 1.4.4 | QR Code Pix | `app/presentes/QrCodePix.tsx` | Card ao redor do QR; texto e botão “copiar” padronizados. |
| 1.4.5 | Copiar chave | `app/presentes/CopiarChave.tsx` | Botão e feedback visual no tema. |
| 1.4.6 | Loading | `app/presentes/loading.tsx` | Consistente com convite. |

### 1.5 Recados (`/recados`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.5.1 | Página | `app/recados/page.tsx` | Fundo e container; título; formulário (textarea + botão); lista de recados em cards (borda sage, fundo white). |

### 1.6 Mídia – Fotos e áudios (`/midia`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.6.1 | Página | `app/midia/page.tsx` | Título e descrição; link “Ver galeria” no padrão; seções com títulos claros. |
| 1.6.2 | Upload fotos | `app/midia/UploadFotos.tsx` | Área de drop/input com borda sage, estados hover/focus; botão enviar primário. |
| 1.6.3 | Gravar áudio | `app/midia/GravarAudio.tsx` | Botões gravar/parar e enviar no tema; barra/contador se houver. |

### 1.7 Galeria (`/galeria`)

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 1.7.1 | Página | `app/galeria/page.tsx` | Grid de fotos com cantos arredondados; mensagens de loading/erro/vazio padronizadas; fundo creme/pastel. |

---

## Fase 2: Páginas de erro e estados globais

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 2.1 | 404 | `app/not-found.tsx` | Fundo gradiente; “404” em oliva; texto e botão no design system. |
| 2.2 | Erro global | `app/error.tsx` | Mesmo padrão visual; botão “Tentar novamente” primário. |

---

## Fase 3: Área administrativa

### 3.1 Login admin

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 3.1.1 | Guard + página | `app/admin/page.tsx` / `AdminGuard.tsx` | Fundo creme/pastel na tela de login. |
| 3.1.2 | Formulário login | `app/admin/LoginForm.tsx` | Card central (white, borda sage); input e botão no design system; mensagem de erro. |

### 3.2 Dashboard

| # | Tarefa | Arquivo | Alterações |
|---|--------|---------|------------|
| 3.2.1 | Dashboard | `app/admin/Dashboard.tsx` | Cabeçalho com título e “Sair”; cards de resumo (número em oliva, fundo white, borda sage); tabelas com cabeçalho e linhas alternadas ou bordas suaves; botões “Exportar CSV”, “Copiar”, “WhatsApp” padronizados; seções (Convidados, Presenças, Presentes, Catálogo, Recados, Uploads, Galeria) com títulos e espaçamento consistentes; estado de erro “Tentar novamente” no tema. |
| 3.2.2 | Adicionar convidado | `app/admin/AddConvidado.tsx` | Card/accordion; inputs e botão no design system. |
| 3.2.3 | Envio em lote | `app/admin/EnvioEmLote.tsx` | Textarea e botões no tema. |
| 3.2.4 | Adicionar presente | `app/admin/AddPresente.tsx` | Formulário com inputs e botão primário. |

---

## Fase 4: Revisão e polish

| # | Tarefa | Descrição |
|---|--------|-----------|
| 4.1 | Substituir `casamento-verde` | Buscar usos de `casamento-verde` e trocar por `casamento-oliva` onde for cor primária (ou manter alias no config). |
| 4.2 | Substituir `casamento-sage` (antigo) | Garantir que bordas e fundos leves usem `sage` ou `sage-claro` conforme o design system. |
| 4.3 | Substituir `casamento-creme` | Fundos de página em `creme` e gradientes com `pastel`. |
| 4.4 | Testes visuais | Verificar todas as rotas em mobile e desktop; foco em formulários e botões. |
| 4.5 | Acessibilidade | Checar contraste e focus visível (ring oliva). |

---

## Ordem sugerida de execução

1. **Fase 0** (base) – uma única sessão.
2. **Fase 1** na ordem: Home → Convite → Confirmação → Presentes → Recados → Mídia → Galeria.
3. **Fase 2** (not-found + error).
4. **Fase 3** (admin: login → dashboard e subcomponentes).
5. **Fase 4** (substituições em massa + testes).

---

## Checklist por tela (para marcar [x])

- [x] **Fase 0:** tailwind.config, layout body
- [x] **Home** – page.tsx
- [x] **Convite** – page, ContagemRegressiva, StatusPresenca, loading
- [x] **Confirmação** – page, FormConfirmacao
- [x] **Presentes** – page, ListaPresentesConvidado, FormPix, QrCodePix, CopiarChave, loading
- [x] **Recados** – page
- [x] **Mídia** – page, UploadFotos, GravarAudio
- [x] **Galeria** – page
- [x] **Erros** – not-found, error
- [x] **Admin** – LoginForm, AdminGuard, Dashboard, AddConvidado, EnvioEmLote, AddPresente
- [ ] **Polish** – substituições e testes

---

Quando quiser começar a implementação, diga por qual fase (ou tela) prefere que eu aplique o redesign primeiro (ex.: “começa pela Fase 0 e pela página do convite”).
