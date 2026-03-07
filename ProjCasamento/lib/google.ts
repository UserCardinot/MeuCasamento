/**
 * Integração com Google Sheets e Google Drive
 * Usa OAuth2 com refresh token para autenticação
 */

import { Readable } from "stream";
import { google } from "googleapis";

function getAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Variáveis Google (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) não configuradas");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "urn:ietf:wg:oauth:2.0:oob");
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

/**
 * Adiciona linhas ao final de uma aba do Sheets
 */
export async function appendToSheet(
  sheetId: string,
  range: string,
  values: unknown[][]
): Promise<void> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
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
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return (response.data.values as unknown[][]) || [];
}

/**
 * Busca convidado pelo token na aba Convidados
 * Retorna a linha [token, nome, acompanhantes, contato, data] ou null
 */
export async function getConvidadoByToken(token: string): Promise<string[] | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;

  const rows = await readFromSheet(sheetId, "Convidados!A2:E");
  const tokenNorm = String(token).trim().toLowerCase();
  const found = rows.find((row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm);
  return found ? (found as string[]) : null;
}

/**
 * Busca o status de presença mais recente do convidado
 * Retorna { confirmado, telefone, data } ou null se nunca confirmou
 */
export async function getPresencaStatus(
  token: string
): Promise<{ confirmado: boolean; telefone?: string; data?: string } | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;

  const rows = await readFromSheet(sheetId, "Presenças!A2:F");
  const tokenNorm = String(token).trim().toLowerCase();
  const matching = rows.filter(
    (row) => String(row[0] ?? "").trim().toLowerCase() === tokenNorm
  );
  if (matching.length === 0) return null;

  const last = matching[matching.length - 1] as (string | number)[];
  const confirmado = String(last[1] ?? "").toLowerCase().includes("sim");
  const dataCol = last[5] ?? last[3];
  return {
    confirmado,
    telefone: last[2] ? String(last[2]) : undefined,
    data: dataCol ? String(dataCol) : undefined,
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
  fileName: string
): Promise<string> {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "application/octet-stream",
      body: Readable.from(file),
    },
  });

  return response.data.id || "";
}
