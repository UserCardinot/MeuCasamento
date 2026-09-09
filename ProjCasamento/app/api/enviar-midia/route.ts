import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { appendToSheet, uploadToDrive, uploadToDriveStream } from "@/lib/google";
import { validateEventToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { resolvePhotoUpload } from "@/lib/photo-moment";

export const runtime = "nodejs";
/** Uploads grandes na VPS — Vercel ainda corta ~4,5MB. */
export const maxDuration = 900;

/** Só freio na Vercel; na VPS não limitamos tamanho no app. */
const VERCEL_SAFE_BYTES = 4.2 * 1024 * 1024;

const FOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/3gpp"];
const AUDIO_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"];

function rateLimited(ip: string) {
  const { allowed } = checkRateLimit(ip, { limit: 300 });
  if (!allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 }
    );
  }
  return null;
}

function folderForTipo(tipo: string): { folderId: string; momento: string } | { erro: string } {
  if (tipo === "video") {
    const folderId =
      process.env.GOOGLE_DRIVE_FOLDER_OUTROS?.trim() ||
      process.env.GOOGLE_DRIVE_FOLDER_FOTOS?.trim() ||
      "";
    if (!folderId) return { erro: "Configuração do servidor" };
    return { folderId, momento: "video" };
  }
  if (tipo === "audio") {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_AUDIOS?.trim() || "";
    if (!folderId) return { erro: "Configuração do servidor" };
    return { folderId, momento: "audio" };
  }
  return { erro: "Tipo inválido" };
}

async function finishSheet(
  tipo: string,
  nome: string,
  fileId: string,
  momento: string
) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID ausente");
  const link = fileId ? `https://drive.google.com/file/d/${fileId}/view` : fileId;
  const data = new Date().toLocaleString("pt-BR", {
    timeZone: process.env.EVENT_TZ?.trim() || "America/Sao_Paulo",
  });
  await appendToSheet(sheetId, "Uploads!A:E", [[tipo, nome, link, data, momento]]);
}

function errorHint(err: unknown) {
  const msg = err instanceof Error ? err.message : "";
  console.error("Erro ao enviar mídia:", err);
  if (/timeout|ETIMEDOUT|ECONNRESET|fetch failed|aborted|socket/i.test(msg)) {
    return "A conexão caiu no meio do envio. Mantenha a tela ligada e tente de novo no Wi‑Fi.";
  }
  if (/quota|storage|403|401|invalid_grant/i.test(msg)) {
    return "Falha ao salvar no Google Drive. Avise os noivos.";
  }
  if (/heap|ENOMEM|out of memory/i.test(msg)) {
    return "Arquivo grande demais para processar agora. Tente um vídeo um pouco menor ou envie pelo computador.";
  }
  return "Erro ao enviar. Verifique sua conexão e tente novamente.";
}

/**
 * Upload cru (corpo = bytes do arquivo). Usado para vídeos grandes:
 * não passa por FormData/arrayBuffer (que dobram a RAM).
 */
async function handleRawUpload(request: NextRequest) {
  const limited = rateLimited(getClientIp(request));
  if (limited) return limited;

  const eventToken = request.headers.get("x-event-token") || "";
  let tipo = (request.headers.get("x-tipo") || "").toLowerCase();
  const nome = decodeURIComponent(request.headers.get("x-nome") || "").trim() || "Anônimo";
  const fileNameHeader = decodeURIComponent(request.headers.get("x-filename") || "").trim();
  const mime =
    request.headers.get("x-mime") ||
    request.headers.get("content-type") ||
    "application/octet-stream";

  if (!eventToken || !validateEventToken(eventToken)) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  if (tipo === "foto" && VIDEO_TYPES.includes(mime)) tipo = "video";
  if (tipo !== "video" && tipo !== "audio") {
    return NextResponse.json(
      { erro: "Envio direto só para vídeo ou áudio. Use o formulário para fotos." },
      { status: 400 }
    );
  }

  const isValid =
    (tipo === "video" && (VIDEO_TYPES.includes(mime) || mime.startsWith("video/"))) ||
    (tipo === "audio" && (AUDIO_TYPES.includes(mime) || mime.startsWith("audio/")));

  if (!isValid) {
    return NextResponse.json(
      { erro: tipo === "video" ? "Use MP4, MOV ou WebM." : "Use formato de áudio válido." },
      { status: 400 }
    );
  }

  const size = Number(request.headers.get("content-length") || "0");
  if (process.env.VERCEL && size > VERCEL_SAFE_BYTES) {
    return NextResponse.json(
      { erro: "Arquivo grande demais neste host (Vercel). Use meucasamento.lumenemotion.com.br." },
      { status: 413 }
    );
  }

  if (!request.body) {
    return NextResponse.json({ erro: "Arquivo obrigatório" }, { status: 400 });
  }

  const dest = folderForTipo(tipo);
  if ("erro" in dest) {
    return NextResponse.json({ erro: dest.erro }, { status: 500 });
  }

  const ext =
    fileNameHeader.split(".").pop() ||
    (tipo === "video" ? "mp4" : "webm");
  const fileName = `${Date.now()}-${nome.replace(/\W/g, "_")}.${ext}`;

  try {
    // Web ReadableStream → Node Readable (sem bufferizar o arquivo inteiro)
    const nodeStream = Readable.fromWeb(
      request.body as import("stream/web").ReadableStream
    );
    const fileId = await uploadToDriveStream(
      nodeStream,
      dest.folderId,
      fileName,
      mime
    );
    await finishSheet(tipo, nome, fileId, dest.momento);
    return NextResponse.json({ sucesso: true, momento: dest.momento, tipo });
  } catch (err) {
    return NextResponse.json({ erro: errorHint(err) }, { status: 500 });
  }
}

async function handleFormUpload(request: NextRequest) {
  const limited = rateLimited(getClientIp(request));
  if (limited) return limited;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const eventToken = formData.get("eventToken")?.toString();
  let tipo = formData.get("tipo")?.toString();
  const nome = formData.get("nome")?.toString()?.trim() || "Anônimo";
  const captureAt = formData.get("captureAt")?.toString()?.trim() || null;
  const file = formData.get("file");

  if (!eventToken || !validateEventToken(eventToken)) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ erro: "Arquivo obrigatório" }, { status: 400 });
  }

  if (tipo === "foto" && VIDEO_TYPES.includes(file.type)) tipo = "video";
  if (tipo === "video" && FOTO_TYPES.includes(file.type)) tipo = "foto";

  if (tipo !== "foto" && tipo !== "video" && tipo !== "audio") {
    return NextResponse.json({ erro: "Tipo inválido" }, { status: 400 });
  }

  const isValidType =
    (tipo === "foto" && (FOTO_TYPES.includes(file.type) || file.type.startsWith("image/"))) ||
    (tipo === "video" && (VIDEO_TYPES.includes(file.type) || file.type.startsWith("video/"))) ||
    (tipo === "audio" && AUDIO_TYPES.includes(file.type));

  if (!isValidType) {
    return NextResponse.json(
      {
        erro:
          tipo === "foto"
            ? "Use JPG, PNG, WebP ou GIF."
            : tipo === "video"
              ? "Use MP4, MOV ou WebM."
              : "Use formato de áudio válido.",
      },
      { status: 400 }
    );
  }

  if (process.env.VERCEL && file.size > VERCEL_SAFE_BYTES) {
    return NextResponse.json(
      {
        erro:
          tipo === "video"
            ? "Vídeo grande demais para este host. Use meucasamento.lumenemotion.com.br."
            : "Arquivo grande demais neste host (Vercel).",
      },
      { status: 413 }
    );
  }

  if (!process.env.GOOGLE_SHEET_ID) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    // Fotos: ainda precisam de buffer p/ EXIF. Vídeos/áudios: stream.
    if (tipo === "foto") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${nome.replace(/\W/g, "_")}.${ext}`;
      const resolved = await resolvePhotoUpload(buffer, captureAt);
      const fileId = await uploadToDrive(
        buffer,
        resolved.folderId,
        fileName,
        file.type || "image/jpeg"
      );
      await finishSheet(tipo, nome, fileId, resolved.momento);
      return NextResponse.json({ sucesso: true, momento: resolved.momento, tipo });
    }

    const dest = folderForTipo(tipo);
    if ("erro" in dest) {
      return NextResponse.json({ erro: dest.erro }, { status: 500 });
    }

    const ext =
      file.name.split(".").pop() || (tipo === "video" ? "mp4" : "webm");
    const fileName = `${Date.now()}-${nome.replace(/\W/g, "_")}.${ext}`;
    const nodeStream = Readable.fromWeb(
      file.stream() as unknown as import("stream/web").ReadableStream
    );
    const fileId = await uploadToDriveStream(
      nodeStream,
      dest.folderId,
      fileName,
      file.type || "application/octet-stream"
    );
    await finishSheet(tipo, nome, fileId, dest.momento);
    return NextResponse.json({ sucesso: true, momento: dest.momento, tipo });
  } catch (err) {
    return NextResponse.json({ erro: errorHint(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("x-raw-upload") === "1") {
    return handleRawUpload(request);
  }
  return handleFormUpload(request);
}
