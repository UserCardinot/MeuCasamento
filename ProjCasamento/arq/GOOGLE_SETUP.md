# 📘 Configuração Google – Passo a Passo

Siga estes passos para configurar Google Sheets e Drive no projeto.

---

## 1. Google Cloud Console

### 1.1 Criar projeto
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Clique em **Selecionar projeto** → **Novo projeto**
3. Nome: `Casamento` (ou outro)
4. Clique em **Criar**

### 1.2 Habilitar APIs
1. No menu lateral: **APIs e Serviços** → **Biblioteca**
2. Busque **Google Sheets API** → clique → **Ativar**
3. Volte à Biblioteca, busque **Google Drive API** → clique → **Ativar**

### 1.3 Criar credenciais OAuth
1. **APIs e Serviços** → **Credenciais**
2. **+ Criar credenciais** → **ID do cliente OAuth**
3. Tipo: **Aplicativo para computador**
4. Nome: `Casamento Dev`
5. Clique em **Criar**
6. Baixe o JSON (ícone de download) e abra o arquivo
7. Copie:
   - `client_id` → será `GOOGLE_CLIENT_ID`
   - `client_secret` → será `GOOGLE_CLIENT_SECRET`

---

## 2. Obter Refresh Token

1. Configure o `.env.local` com os valores copiados:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```

2. Instale dependências (se ainda não fez):
   ```cmd
   npm install
   ```

3. Rode o script:
   ```cmd
   npm run google:token
   ```

4. O script abrirá um link. Abra no navegador, autorize e copie o código.
5. Cole o código no terminal.
6. Copie o `GOOGLE_REFRESH_TOKEN` gerado para o `.env.local`.

---

## 3. Google Sheets

### 3.1 Criar planilha
1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma nova planilha
3. Renomeie as abas (ou crie) conforme abaixo

### 3.2 Abas e cabeçalhos

**Aba "Convidados"** (primeira aba):
| token | nome | acompanhantes | contato | data_cadastro |

**Aba "Presenças"**:
| token | confirmado | telefone | data |

**Aba "Presentes"**:
| token | presente | valor | data |

**Aba "Uploads"**:
| tipo | nome | arquivo | data | momento |

Na primeira linha de cada aba, escreva exatamente esses cabeçalhos.

### 3.3 Obter ID da planilha
- A URL é: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`
- Copie o `SEU_ID_AQUI` e adicione ao `.env.local`:
  ```
  GOOGLE_SHEET_ID=1abc123...
  ```

### 3.4 Compartilhar
- Compartilhe a planilha com o e-mail usado no OAuth (o mesmo que autorizou no passo 2)
- Permissão: **Editor**

---

## 4. Google Drive

### 4.1 Criar pastas
1. Acesse [drive.google.com](https://drive.google.com)
2. Crie pasta: `Casamento Lucas & Beatriz` (ou outro nome)
3. Dentro dela, crie:
   - `Fotos` (pasta pai)
     - `Cerimonia`
     - `Recepcao`
     - `Cafe`
     - `Outros` (sem EXIF / fora do horário do evento)
   - `Audios`

### 4.2 Obter IDs das pastas
- Abra cada pasta no Drive
- A URL é: `https://drive.google.com/drive/folders/ID_DA_PASTA`
- Copie o ID de cada pasta

### 4.3 Adicionar ao .env.local
```
GOOGLE_DRIVE_FOLDER_FOTOS=1abc123...
GOOGLE_DRIVE_FOLDER_AUDIOS=1xyz789...
GOOGLE_DRIVE_FOLDER_CERIMONIA=...
GOOGLE_DRIVE_FOLDER_RECEPCAO=...
GOOGLE_DRIVE_FOLDER_CAFE=...
GOOGLE_DRIVE_FOLDER_OUTROS=...

# Classificação por EXIF (hora da foto, não do upload).
# Os três inícios são ordenados no tempo — Recepção pode vir antes da Cerimônia.
EVENT_DATE=2026-09-26
EVENT_TZ=America/Sao_Paulo
EVENT_CERIMONIA_INICIO=09:20
EVENT_RECEPCAO_INICIO=08:00
EVENT_CAFE_INICIO=10:10
```

Na planilha, aba **Uploads**, use cabeçalhos: `tipo | nome | arquivo | data | momento`.

### 4.4 Compartilhar pastas
- Compartilhe a pasta pai e as subpastas com o mesmo e-mail usado no OAuth (ou service account)
- Permissão: **Editor**

---

## 5. .env.local completo

Exemplo final:

```env
# Google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
GOOGLE_SHEET_ID=xxx
GOOGLE_DRIVE_FOLDER_FOTOS=xxx
GOOGLE_DRIVE_FOLDER_AUDIOS=xxx
GOOGLE_DRIVE_FOLDER_CERIMONIA=xxx
GOOGLE_DRIVE_FOLDER_RECEPCAO=xxx
GOOGLE_DRIVE_FOLDER_CAFE=xxx
GOOGLE_DRIVE_FOLDER_OUTROS=xxx

EVENT_DATE=2026-09-26
EVENT_TZ=America/Sao_Paulo
EVENT_CERIMONIA_INICIO=09:20
EVENT_RECEPCAO_INICIO=08:00
EVENT_CAFE_INICIO=10:10

# Tokens
EVENT_TOKEN=evt_xxx
ADMIN_PASSWORD=SuaSenhaForte
```

---

## ✅ Verificar

Depois de configurar, rode:

```cmd
npm run dev
```

E teste as APIs que usam o Google (após implementar as próximas fases).
