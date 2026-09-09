/**
 * Integração com Google Sheets e Google Drive.
 *
 * Preferência: GOOGLE_SERVICE_ACCOUNT_JSON (JSON da service account completo) —
 * não depende de refresh token de usuário; ideal pra produção (Vercel, meses de uso).
 * Alternativa: GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN (OAuth).
 *
 * Com service account: compartilhe a planilha e as pastas do Drive com o e-mail ...@....iam.gserviceaccount.com (Editor ou conforme necessário).
 */

import { Readable } from "stream";
import { google } from "googleapis";
import type { JWT } from "google-auth-library";
import type { OAuth2Client } from "google-auth-library";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

let jwtClient: JWT | null = null;
let oauthSingleton: OAuth2Client | null = null;

async function getAuthClient(): Promise<JWT | OAuth2Client> {
  const saRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() ||
    (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim()
      ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.trim(), "base64").toString("utf8")
      : "");

  const saUsable =
    saRaw &&
    !saRaw.includes("[SENSITIVE]") &&
    saRaw.trim().startsWith("{");

  if (saUsable) {
    let creds: { client_email?: string; private_key?: string };
    try {
      creds = JSON.parse(saRaw) as { client_email?: string; private_key?: string };
    } catch {
      // Placeholder / JSON inválido → cai no OAuth abaixo
      creds = {};
    }
    if (creds.client_email && creds.private_key) {
      if (!jwtClient) {
        jwtClient = new google.auth.JWT({
          email: creds.client_email,
          key: creds.private_key,
          scopes: GOOGLE_SCOPES,
        });
        await jwtClient.authorize();
      }
      return jwtClient;
    }
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

  const oauthUsable =
    clientId &&
    clientSecret &&
    refreshToken &&
    !clientId.includes("[SENSITIVE]") &&
    !clientSecret.includes("[SENSITIVE]") &&
    !refreshToken.includes("[SENSITIVE]");

  if (!oauthUsable) {
    throw new Error(
      "Google: defina GOOGLE_SERVICE_ACCOUNT_JSON (recomendado) ou GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN válidos"
    );
  }

  if (!oauthSingleton) {
    oauthSingleton = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "urn:ietf:wg:oauth:2.0:oob"
    );
    oauthSingleton.setCredentials({ refresh_token: refreshToken });
  }
  return oauthSingleton;
}

/**
 * Aceita só o ID ou URL colada do Sheets
 * (ex.: .../d/ID/edit?gid=0 → ID).
 */
export function normalizeSpreadsheetId(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  const fromUrl = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl) return fromUrl[1];
  const withoutEdit = trimmed.split("/edit")[0]?.split("?")[0] ?? trimmed;
  return withoutEdit.trim();
}

function resolveSheetId(sheetId: string): string {
  return normalizeSpreadsheetId(sheetId);
}

/**
 * Adiciona linhas ao final de uma aba do Sheets
 */
export async function appendToSheet(
  sheetId: string,
  range: string,
  values: unknown[][]
): Promise<void> {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: resolveSheetId(sheetId),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

/**
 * Lê dados de uma aba do Sheets
 */
export async function readFromSheet(
  sheetId: string,
  range: string
): Promise<unknown[][]> {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: resolveSheetId(sheetId),
    range,
  });
  return (res.data.values as unknown[][]) || [];
}

/**
 * ID numérico da aba (para batchUpdate), pelo título exato.
 */
export async function getSheetIdByTitle(
  spreadsheetId: string,
  title: string
): Promise<number | null> {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: resolveSheetId(spreadsheetId) });
  const found = meta.data.sheets?.find((s) => s.properties?.title === title);
  const id = found?.properties?.sheetId;
  return id !== undefined && id !== null ? id : null;
}

/**
 * Remove a linha do convidado na aba Convidados (A:F = token, nome, acompanhantes, contato, data, origem; linha 1 = cabeçalho).
 * @param guestToken token na coluna A
 */
export async function deleteConvidadoRow(
  spreadsheetId: string,
  guestToken: string
): Promise<"deleted" | "not_found"> {
  const sheetTitle = "Convidados";
  const sheetId = await getSheetIdByTitle(spreadsheetId, sheetTitle);
  if (sheetId === null) {
    throw new Error(`Aba "${sheetTitle}" não encontrada na planilha`);
  }

  const rows = await readFromSheet(spreadsheetId, `${sheetTitle}!A2:F`);
  const tokenNorm = String(guestToken).trim().toLowerCase();
  const idx = rows.findIndex(
    (row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm
  );
  if (idx === -1) return "not_found";

  // Linha 1 da planilha (índice 0) = cabeçalho; primeira linha de dados A2 = índice 1
  const startIndex = idx + 1;

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: resolveSheetId(spreadsheetId),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex: startIndex + 1,
            },
          },
        },
      ],
    },
  });
  return "deleted";
}

/**
 * Atualiza nome, acompanhantes, contato e origem. Mantém token (col. A) e data de cadastro (col. E).
 */
export async function updateConvidadoRow(
  spreadsheetId: string,
  guestToken: string,
  fields: { nome: string; acompanhantes: string; contato: string; origem: string }
): Promise<"updated" | "not_found"> {
  const sheetTitle = "Convidados";
  const rows = await readFromSheet(spreadsheetId, `${sheetTitle}!A2:F`);
  const tokenNorm = String(guestToken).trim().toLowerCase();
  const idx = rows.findIndex(
    (row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm
  );
  if (idx === -1) return "not_found";

  const row = rows[idx] as unknown[];
  const token = String(row[0] ?? "");
  const dataCadastro = String(row[4] ?? "");

  const newRow = [
    token,
    fields.nome.trim(),
    fields.acompanhantes.trim(),
    fields.contato.trim(),
    dataCadastro,
    fields.origem.trim(),
  ];

  const sheetRow = idx + 2;
  const range = `${sheetTitle}!A${sheetRow}:F${sheetRow}`;

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: resolveSheetId(spreadsheetId),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRow] },
  });
  return "updated";
}

const CATALOGO_PRESENTES_SHEET = "CatalogoPresentes";

function findCatalogoPresenteRowIndex(rows: unknown[][], nomeOriginal: string): number {
  const key = nomeOriginal.trim();
  return rows.findIndex((row) => String(row[0] ?? "").trim() === key);
}

/**
 * Atualiza item do catálogo (A:E = nome | preco | url | imagem | ativo).
 * `nomeOriginal` identifica a linha; `fields.nome` é o novo nome exibido.
 */
export async function updateCatalogoPresenteRow(
  spreadsheetId: string,
  nomeOriginal: string,
  fields: { nome: string; preco: string; url: string; imagem: string; ativo: string }
): Promise<"updated" | "not_found" | "duplicate_nome"> {
  const sheetTitle = CATALOGO_PRESENTES_SHEET;
  const rows = await readFromSheet(spreadsheetId, `${sheetTitle}!A2:E`);
  const idx = findCatalogoPresenteRowIndex(rows, nomeOriginal);
  if (idx === -1) return "not_found";

  const novoNome = fields.nome.trim();
  const nomeAntigo = nomeOriginal.trim();
  if (novoNome !== nomeAntigo) {
    const duplicado = rows.some(
      (row, i) => i !== idx && String(row[0] ?? "").trim() === novoNome
    );
    if (duplicado) return "duplicate_nome";
  }

  const ativoNorm = fields.ativo.trim().toLowerCase().startsWith("s") ? "Sim" : "Não";
  const newRow = [novoNome, fields.preco.trim(), fields.url.trim(), fields.imagem.trim(), ativoNorm];

  const sheetRow = idx + 2;
  const range = `${sheetTitle}!A${sheetRow}:E${sheetRow}`;

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: resolveSheetId(spreadsheetId),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRow] },
  });
  return "updated";
}

/** Remove item do catálogo pelo nome (coluna A). */
export async function deleteCatalogoPresenteRow(
  spreadsheetId: string,
  nomeOriginal: string
): Promise<"deleted" | "not_found"> {
  const sheetTitle = CATALOGO_PRESENTES_SHEET;
  const sheetId = await getSheetIdByTitle(spreadsheetId, sheetTitle);
  if (sheetId === null) {
    throw new Error(`Aba "${sheetTitle}" não encontrada na planilha`);
  }

  const rows = await readFromSheet(spreadsheetId, `${sheetTitle}!A2:E`);
  const idx = findCatalogoPresenteRowIndex(rows, nomeOriginal);
  if (idx === -1) return "not_found";

  const startIndex = idx + 1;

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: resolveSheetId(spreadsheetId),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex: startIndex + 1,
            },
          },
        },
      ],
    },
  });
  return "deleted";
}

/**
 * Busca convidado pelo token na aba Convidados
 * Retorna a linha [token, nome, acompanhantes, contato, data, origem?] ou null
 */
export async function getConvidadoByToken(token: string): Promise<string[] | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;

  const rows = await readFromSheet(sheetId, "Convidados!A2:F");
  const tokenNorm = String(token).trim().toLowerCase();
  const found = rows.find((row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm);
  return found ? (found as string[]) : null;
}

/** Aba Presenças: A=token, B=confirmado, C=mensagem, D=acompanhantes, E=data (legado 4 col.: D=data) */
const PRESENCAS_SHEET = "Presenças";
const PRESENCAS_RANGE = `${PRESENCAS_SHEET}!A2:E`;

export function parsePresencaSheetRow(row: (string | number)[]) {
  const colD = String(row[3] ?? "").trim();
  const colE = String(row[4] ?? "").trim();
  if (colE) {
    return {
      mensagem: String(row[2] ?? "").trim(),
      nomesAcompanhantes: colD,
      data: colE,
    };
  }
  return {
    mensagem: String(row[2] ?? "").trim(),
    nomesAcompanhantes: "",
    data: colD,
  };
}

function parseConfirmadoCol(val: unknown): boolean {
  const col = String(val ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return col === "sim" || col.startsWith("sim ") || col.includes("estarei");
}

function findPresencaRowIndex(rows: unknown[][], token: string): number {
  const tokenNorm = String(token).trim().toLowerCase();
  return rows.findIndex((row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm);
}

/**
 * Cria ou atualiza a linha do convidado (uma linha por token).
 * Colunas: token | confirmado | mensagem | acompanhantes | data
 */
export async function upsertPresencaRow(
  spreadsheetId: string,
  guestToken: string,
  fields: { confirmado: boolean; mensagem?: string; nomesAcompanhantes?: string }
): Promise<"created" | "updated"> {
  const rows = await readFromSheet(spreadsheetId, PRESENCAS_RANGE);
  const idx = findPresencaRowIndex(rows, guestToken);
  const data = new Date().toLocaleString("pt-BR");
  const token = String(guestToken).trim();
  const newRow = [
    token,
    fields.confirmado ? "Sim" : "Não",
    (fields.mensagem ?? "").trim(),
    (fields.nomesAcompanhantes ?? "").trim(),
    data,
  ];

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  if (idx === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: resolveSheetId(spreadsheetId),
      range: `${PRESENCAS_SHEET}!A:E`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] },
    });
    return "created";
  }

  const sheetRow = idx + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: resolveSheetId(spreadsheetId),
    range: `${PRESENCAS_SHEET}!A${sheetRow}:E${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRow] },
  });
  return "updated";
}

/**
 * Busca o status de presença do convidado (uma linha por token).
 */
export async function getPresencaStatus(
  token: string
): Promise<{
  confirmado: boolean;
  mensagem?: string;
  nomesAcompanhantes?: string;
  data?: string;
} | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;

  const rows = await readFromSheet(sheetId, PRESENCAS_RANGE);
  const idx = findPresencaRowIndex(rows, token);
  if (idx === -1) return null;

  const row = rows[idx] as (string | number)[];
  const mapped = parsePresencaSheetRow(row);
  return {
    confirmado: parseConfirmadoCol(row[1]),
    mensagem: mapped.mensagem || undefined,
    nomesAcompanhantes: mapped.nomesAcompanhantes || undefined,
    data: mapped.data || undefined,
  };
}

/**
 * Busca o catálogo de presentes (aba CatalogoPresentes: nome | preco | url | imagem | ativo)
 */
export async function getCatalogoPresentes(): Promise<
  { nome: string; preco: string; url: string; imagem: string; ativo: string }[]
> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return [];

  try {
    const rows = await readFromSheet(sheetId, "CatalogoPresentes!A2:E");
    return (rows as (string | number)[][]).map((row) => ({
      nome: String(row[0] ?? ""),
      preco: String(row[1] ?? ""),
      url: String(row[2] ?? ""),
      imagem: String(row[3] ?? ""),
      ativo: String(row[4] ?? "Sim").toLowerCase(),
    })).filter((p) => p.ativo.includes("sim") && p.nome.trim());
  } catch {
    return [];
  }
}

/**
 * Verifica se o convidado já registrou algum presente
 */
export async function getPresenteRegistrado(
  token: string
): Promise<{ presente: string; valor?: string; data?: string } | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;

  const rows = await readFromSheet(sheetId, "Presentes!A2:D");
  const tokenNorm = String(token).trim().toLowerCase();
  const matching = rows.filter(
    (row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm
  );
  if (matching.length === 0) return null;

  const last = matching[matching.length - 1] as (string | number)[];
  return {
    presente: String(last[1] ?? ""),
    valor: last[2] ? String(last[2]) : undefined,
    data: last[3] ? String(last[3]) : undefined,
  };
}

/**
 * Faz upload de arquivo para o Google Drive
 * @param file Buffer do arquivo
 * @param folderId ID da pasta no Drive
 * @param fileName Nome do arquivo
 * @returns ID do arquivo criado (ou link compartilhável, dependendo da configuração)
 */
export async function uploadToDrive(
  file: Buffer,
  folderId: string,
  fileName: string,
  mimeType = "application/octet-stream"
): Promise<string> {
  return uploadToDriveStream(Readable.from(file), folderId, fileName, mimeType);
}

/**
 * Upload por stream (não carrega o arquivo inteiro na RAM).
 * Essencial para vídeos grandes no celular.
 */
export async function uploadToDriveStream(
  body: Readable,
  folderId: string,
  fileName: string,
  mimeType = "application/octet-stream"
): Promise<string> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.create(
    {
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body,
      },
      fields: "id",
      supportsAllDrives: true,
    },
    {
      // axios / gaxios — arquivos grandes
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    } as { maxContentLength: number; maxBodyLength: number }
  );

  return response.data.id || "";
}
