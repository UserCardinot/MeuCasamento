import { NextRequest, NextResponse } from "next/server";
import { appendToSheet } from "@/lib/google";
import { validateEventToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { resolvePhotoUpload } from "@/lib/photo-moment";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FOTO_BYTES = 10 * 1024 * 1024; // 10MB
/** Na Vercel Hobby o body ~4,5MB; local aceita mais. */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const VERCEL_SAFE_BYTES = 4.2 * 1024 * 1024;

const FOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/3gpp"];
const AUDIO_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"];

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 }
    );
  }

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

  // Inferir tipo se o cliente mandar "foto" com vídeo (ou vice-versa)
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

  const maxSize =
    tipo === "foto" ? MAX_FOTO_BYTES : tipo === "video" ? MAX_VIDEO_BYTES : MAX_AUDIO_BYTES;
  if (file.size > maxSize) {
    const mb = tipo === "foto" ? 10 : tipo === "video" ? 50 : 5;
    return NextResponse.json(
      { erro: `Arquivo muito grande. Máximo ${mb}MB.` },
      { status: 400 }
    );
  }

  // Em produção (Vercel), body acima de ~4,5MB costuma falhar antes — avisa cedo se chegou grande
  if (process.env.VERCEL && file.size > VERCEL_SAFE_BYTES) {
    return NextResponse.json(
      {
        erro:
          tipo === "video"
            ? "Vídeo grande demais para enviar pelo celular neste momento. Tente um vídeo mais curto (até ~20s) ou envie pelo computador."
            : "Arquivo ainda grande demais após o envio. Tente outra foto ou use o Wi‑Fi.",
      },
      { status: 413 }
    );
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json(
      { erro: "Configuração do servidor" },
      { status: 500 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext =
      file.name.split(".").pop() ||
      (tipo === "foto" ? "jpg" : tipo === "video" ? "mp4" : "webm");
    const fileName = `${Date.now()}-${nome.replace(/\W/g, "_")}.${ext}`;

    let folderId: string;
    let momento: string;

    if (tipo === "foto") {
      const resolved = await resolvePhotoUpload(buffer, captureAt);
      folderId = resolved.folderId;
      momento = resolved.momento;
    } else if (tipo === "video") {
      // Vídeo raramente tem EXIF de foto → Outros (ou pasta pai de fotos)
      folderId =
        process.env.GOOGLE_DRIVE_FOLDER_OUTROS?.trim() ||
        process.env.GOOGLE_DRIVE_FOLDER_FOTOS?.trim() ||
        "";
      momento = "video";
      if (!folderId) {
        return NextResponse.json(
          { erro: "Configuração do servidor" },
          { status: 500 }
        );
      }
    } else {
      const audios = process.env.GOOGLE_DRIVE_FOLDER_AUDIOS?.trim();
      if (!audios) {
        return NextResponse.json(
          { erro: "Configuração do servidor" },
          { status: 500 }
        );
      }
      folderId = audios;
      momento = "audio";
    }

    const { uploadToDrive } = await import("@/lib/google");
    const fileId = await uploadToDrive(buffer, folderId, fileName);

    const link = fileId
      ? `https://drive.google.com/file/d/${fileId}/view`
      : fileId;

    const data = new Date().toLocaleString("pt-BR", {
      timeZone: process.env.EVENT_TZ?.trim() || "America/Sao_Paulo",
    });
    await appendToSheet(sheetId, "Uploads!A:E", [
      [tipo, nome, link, data, momento],
    ]);

    return NextResponse.json({ sucesso: true, momento, tipo });
  } catch (err) {
    console.error("Erro ao enviar mídia:", err);
    const msg = err instanceof Error ? err.message : "";
    const hint =
      /timeout|ETIMEDOUT|ECONNRESET|fetch failed/i.test(msg)
        ? "A conexão caiu no meio do envio. Tente de novo no Wi‑Fi."
        : /quota|storage|403|401|invalid_grant/i.test(msg)
          ? "Falha ao salvar no Google Drive. Avise os noivos."
          : "Erro ao enviar. Verifique sua conexão e tente novamente.";
    return NextResponse.json({ erro: hint }, { status: 500 });
  }
}
