# 📋 Passo a Passo – Implementação da Plataforma de Casamento

> Use este arquivo para acompanhar o progresso. Marque `[x]` cada item conforme concluir.

---

## 🔑 Modelo de Tokens e Acesso

**Admin cadastra convidados** → Sistema gera token único por pessoa → Admin envia o link individual.

- Não existe link público de cadastro.
- Cada convidado tem seu token (como uma "conta").
- Token válido em qualquer dispositivo (basta ter o link).
- Convidado vê apenas seus próprios dados (confirmação, presentes).

---

## Fase 1: Preparação do Ambiente

### 1.1 Instalação e Estrutura Base
- [x] Criar projeto Next.js com App Router (criado manualmente)
- [x] Instalar Tailwind CSS
- [x] Configurar `tsconfig.json` e estrutura base
- [x] Criar arquivo `.env.local.example` com variáveis documentadas
- [x] Adicionar `.env.local` ao `.gitignore`
- [x] Configurar `next.config.mjs` (tamanho de upload 10MB)

### 1.2 Estrutura de Pastas
- [x] Criar estrutura em `/app`:
  - [x] `app/convite/page.tsx`
  - [x] `app/presentes/page.tsx`
  - [x] `app/confirmacao/page.tsx`
  - [x] `app/midia/page.tsx`
  - [x] `app/admin/page.tsx`
- [x] Criar estrutura em `/api`:
  - [x] `api/confirmar-presenca/route.ts`
  - [x] `api/registrar-pix/route.ts`
  - [x] `api/enviar-midia/route.ts`
  - [x] `api/listar-dados-admin/route.ts`
  - [x] `api/admin/adicionar-convidado/route.ts` (admin cadastra convidado)
- [x] Criar pasta `/lib`:
  - [x] `lib/google.ts` (Sheets + Drive – stub)
  - [x] `lib/auth.ts` (validação de tokens)
  - [x] `lib/rate-limit.ts`
- [x] Criar pasta `/components` (componentes reutilizáveis)
- [x] Criar pasta `/types` (tipos TypeScript)

---

## Fase 2: Integração com Google

### 2.1 Google Cloud Console
- [ ] Criar projeto no Google Cloud Console
- [ ] Habilitar **Google Sheets API** e **Google Drive API**
- [ ] Criar credenciais OAuth 2.0 (tipo: aplicativo de desktop)
- [ ] Copiar `client_id` e `client_secret` do JSON
- [ ] Rodar `npm run google:token` para obter refresh token (ver `GOOGLE_SETUP.md`)

### 2.2 Setup Local
- [ ] Configurar variáveis no `.env.local` (ver `GOOGLE_SETUP.md`)
- [x] Implementar `lib/google.ts`:
  - [x] Cliente OAuth2 com refresh token
  - [x] `appendToSheet(sheetId, range, values)` para Sheets
  - [x] `readFromSheet(sheetId, range)` para leitura
  - [x] `uploadToDrive(file, folderId, fileName)` para Drive
  - [x] `getConvidadoByToken(token)` para buscar convidado

### 2.3 Google Sheets
- [ ] Criar planilha no Google Sheets
- [ ] Configurar abas e cabeçalhos:

  | Aba **Convidados** | token | nome | acompanhantes | contato | data_cadastro |
  | Aba **Presenças**  | token | confirmado | telefone | mensagem | nomes_acompanhantes | data |
  | Aba **Presentes**  | token | presente | valor | data |
  | Aba **Uploads**    | tipo | nome | arquivo | data |
  | Aba **Recados**    | token | nome | mensagem | data |
  | Aba **CatalogoPresentes** | nome | preco | url | imagem | ativo |

- [ ] Obter ID da planilha (da URL)
- [ ] Compartilhar planilha com e-mail de serviço (se aplicável)
- [ ] Adicionar `GOOGLE_SHEET_ID` às variáveis de ambiente

### 2.4 Google Drive
- [ ] Criar pasta principal "Casamento Lucas & Beatriz" (ou nome desejado)
- [ ] Criar subpastas: `Fotos` e `Audios`
- [ ] Obter IDs das pastas
- [ ] Adicionar `GOOGLE_DRIVE_FOLDER_FOTOS` e `GOOGLE_DRIVE_FOLDER_AUDIOS` às variáveis
- [ ] Configurar permissões (arquivos acessíveis via link público ou privado)

---

## Fase 3: Segurança e Tokens

### 3.1 Definição de Tokens
- [ ] `EVENT_TOKEN` – token único para área de mídia (QR Code nas mesas)
- [ ] `ADMIN_PASSWORD` – senha da área admin
- [ ] **Token por convidado** – gerado automaticamente ao admin cadastrar; armazenado na aba Convidados

### 3.2 Lib de Autenticação
- [ ] Implementar `lib/auth.ts`:
  - [ ] `validateGuestToken(token: string): Promise<boolean>` – verifica se token existe na aba Convidados
  - [ ] `validateEventToken(token: string): boolean` – compara com `EVENT_TOKEN`
  - [ ] `validateAdminPassword(password: string): boolean` – compara com `ADMIN_PASSWORD`
- [ ] `generateGuestToken()` – gera UUID ou string aleatória para novo convidado

### 3.3 Rate Limit
- [x] Implementar `lib/rate-limit.ts` (30 req/min por IP)
- [x] Aplicar rate limit na API confirmar-presenca

---

## Fase 4: Convite Virtual + RSVP

### 4.1 Página do Convite
- [x] Ler `token` da query string (`?token=...`)
- [x] Validar token com `validateGuestToken`; se inválido → "Link inválido"
- [x] Layout do convite (design)
- [x] Exibir: nomes dos noivos, data, local (placeholder)
- [x] Exibir nome do convidado (buscar na aba Convidados)
- [x] Botão "Confirmar Presença" → `/confirmacao?token=...`
- [x] Link "Lista de Presentes" → `/presentes?token=...`
- [ ] (Opcional) Indicar se já confirmou / já enviou presente
- [ ] (Opcional) Música de fundo, contagem regressiva, moldura

### 4.2 Página de Confirmação (RSVP)
- [x] Validar token na URL
- [x] Formulário: Telefone, Confirmação (Sim/Não)
- [x] Chamada à API `POST /api/confirmar-presenca`
- [x] Mensagem de sucesso após envio
- [ ] Exibir status "Já confirmado" se aplicável

### 4.3 API Confirmar Presença
- [x] Validar token
- [x] Validar campos + rate limit
- [x] Adicionar linha na aba "Presenças"
- [x] Retornar JSON de sucesso ou erro

---

## Fase 5: Lista de Presentes + Pix

### 5.1 Página de Presentes
- [x] Validar token na URL
- [x] Listar presentes (catálogo cadastrado pelo admin)
- [x] Exibir valor sugerido por presente
- [x] Exibir QR Code Pix (gerado de PIX_COPIA_COLA)
- [x] Botão "Já fiz o Pix" → formulário

### 5.2 Formulário de Registro de Pix
- [x] Formulário: Presente escolhido, Valor (opcional)
- [x] Chamada à API `POST /api/registrar-pix`
- [x] Explicação: conferência manual do Pix
- [x] Indicar se já registrou presente

### 5.3 API Registrar Pix
- [x] Validar token + rate limit
- [x] Adicionar linha na aba "Presentes"
- [x] Retornar sucesso

### 5.4 QR Code Pix
- [x] Gerar QR Code a partir de PIX_COPIA_COLA
- [x] Exibir chave Pix para copiar (PIX_CHAVE)

---

## Fase 6: Upload de Fotos e Áudios

### 6.1 Configuração de Upload
- [x] Upload via backend
- [x] Limites: fotos 10MB, áudios 5MB
- [x] Validar tipo MIME (image/*, audio/*)

### 6.2 Página de Mídia
- [x] Validar `eventToken` na URL
- [x] UI para upload de fotos (file input)
- [x] UI para gravação de áudio (MediaRecorder)
- [x] Preview de fotos antes do envio
- [x] Loading e mensagem de erro
- [x] Acesso via QR Code (URL com `eventToken`)

### 6.3 Gravação de Áudio
- [x] Componente com `MediaRecorder`
- [x] Limite de 1 minuto
- [x] Botão gravar / parar
- [x] Preview do áudio antes de enviar

### 6.4 API Enviar Mídia
- [x] Validar `eventToken` + rate limit
- [x] Receber FormData (arquivo + tipo)
- [x] Upload para Drive (Fotos/Audios)
- [x] Registrar em Uploads no Sheets
- [ ] Backend gera URL assinada ou permissão temporária
- [ ] Frontend envia arquivo direto

---

## Fase 7: Área Administrativa

### 7.1 Login Admin
- [x] Criar `app/admin/page.tsx`
- [x] Tela de login: campo senha (e talvez identificador)
- [x] Validar contra `ADMIN_PASSWORD`
- [x] Armazenar sessão (cookie, localStorage ou estado)
- [x] Redirecionar para dashboard se autenticado

### 7.2 Cadastro de Convidados
- [x] Formulário: Nome, Acompanhantes, Contato (WhatsApp/e-mail)
- [x] Botão "Adicionar" → chama `POST /api/admin/adicionar-convidado`
- [x] Exibir link individual gerado com opção "Copiar link"
- [x] Lista de convidados já cadastrados com seus links

### 7.3 API Adicionar Convidado
- [x] Implementar `api/admin/adicionar-convidado/route.ts`
- [x] Validar senha admin
- [x] Gerar token único (UUID)
- [x] Inserir na aba Convidados (token, nome, acompanhantes, contato, data)
- [x] Retornar objeto com token e URL completa para enviar ao convidado

### 7.4 Dashboard Admin
- [x] Resumo: total de convidados, presenças, presentes, uploads
- [x] Tabela de convidados com link de cada um
- [x] Tabela de presenças (Token/Nome, Confirmado, Data)
- [x] Tabela de presentes (Token/Nome, Presente, Valor, Data)
- [x] Listagem de uploads com links para arquivos no Drive

### 7.5 API Listar Dados Admin
- [x] Validar senha admin
- [x] Ler abas Convidados, Presenças, Presentes, Uploads
- [x] Retornar JSON com todas as informações

---

## Fase 8: Polish e UX

### 8.1 Layout e Design
- [x] Criar layout comum (`app/layout.tsx`)
- [x] Paleta de cores e tipografia consistente
- [x] Responsividade (mobile-first)
- [x] Loading states e feedback visual

### 8.2 Tratamento de Erros
- [x] Páginas de erro (404, 500)
- [x] Mensagens amigáveis para falhas de rede
- [x] Retry em uploads falhos

### 8.3 Internacionalização (se necessário)
- [x] Manter texto em português consistente

---

## Fase 9: Deploy

### 9.1 Repositório
- [x] Inicializar git (`git init`)
- [x] Criar `.gitignore` adequado
- [ ] Commit inicial
- [ ] Criar repositório no GitHub
- [ ] Push do código

### 9.2 Vercel
- [ ] Conectar projeto GitHub à Vercel
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Configurar domínio (opcional)
- [ ] Deploy e teste em produção

### 9.3 Variáveis de Ambiente (Produção)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REFRESH_TOKEN`
- [ ] `GOOGLE_SHEET_ID`
- [ ] `GOOGLE_DRIVE_FOLDER_FOTOS`
- [ ] `GOOGLE_DRIVE_FOLDER_AUDIOS`
- [ ] `EVENT_TOKEN` (área de mídia)
- [ ] `ADMIN_PASSWORD`

---

## Fase 10: Documentação Final

### 10.1 README
- [ ] Atualizar `README.md`:
  - [ ] Descrição do projeto
  - [ ] Como rodar localmente
  - [ ] Variáveis de ambiente necessárias
  - [ ] Como fazer deploy

### 10.2 Documentação Interna
- [ ] Manter `PASSO_A_PASSO.md` atualizado
- [ ] Instruções para noivos: cadastrar convidados, copiar links, enviar por WhatsApp

---

## 📊 Resumo de Progresso

| Fase | Status |
|------|--------|
| 1. Preparação | ✅ |
| 2. Google | ✅ |
| 3. Segurança | ✅ |
| 4. Convite + RSVP | ✅ |
| 5. Presentes + Pix | ✅ |
| 6. Mídia | ✅ |
| 7. Admin | ✅ |
| 8. Polish | ✅ |
| 9. Deploy | ⬜ |
| 10. Documentação | ⬜ |

---

**Próximo passo sugerido:** Fase 9 – Deploy
