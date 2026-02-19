import { NextRequest, NextResponse } from "next/server";
import { appendToSheet } from "@/lib/google";
import { validateEventToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_FOTO_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;  // 5MB

const FOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
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
  const tipo = formData.get("tipo")?.toString();
  const nome = formData.get("nome")?.toString()?.trim() || "Anônimo";
  const file = formData.get("file");

  if (!eventToken || !validateEventToken(eventToken)) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  if (tipo !== "foto" && tipo !== "audio") {
    return NextResponse.json({ erro: "Tipo inválido" }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ erro: "Arquivo obrigatório" }, { status: 400 });
  }

  const isValidType =
    (tipo === "foto" && FOTO_TYPES.includes(file.type)) ||
    (tipo === "audio" && AUDIO_TYPES.includes(file.type));

  if (!isValidType) {
    return NextResponse.json(
      { erro: tipo === "foto" ? "Use JPG, PNG, WebP ou GIF." : "Use formato de áudio válido." },
      { status: 400 }
    );
  }

  const maxSize = tipo === "foto" ? MAX_FOTO_BYTES : MAX_AUDIO_BYTES;
  if (file.size > maxSize) {
    return NextResponse.json(
      { erro: `Arquivo muito grande. Máximo ${tipo === "foto" ? 10 : 5}MB.` },
      { status: 400 }
    );
  }

  const folderId =
    tipo === "foto"
      ? process.env.GOOGLE_DRIVE_FOLDER_FOTOS
      : process.env.GOOGLE_DRIVE_FOLDER_AUDIOS;

  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!folderId || !sheetId) {
    return NextResponse.json(
      { erro: "Configuração do servidor" },
      { status: 500 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = tipo === "foto" ? file.name.split(".").pop() || "jpg" : "webm";
    const fileName = `${Date.now()}-${nome.replace(/\W/g, "_")}.${ext}`;

    const { uploadToDrive } = await import("@/lib/google");
    const fileId = await uploadToDrive(buffer, folderId, fileName);

    const link = fileId
      ? `https://drive.google.com/file/d/${fileId}/view`
      : fileId;

    const data = new Date().toLocaleString("pt-BR");
    await appendToSheet(sheetId, "Uploads!A:D", [
      [tipo, nome, link, data],
    ]);

    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao enviar mídia:", err);
    return NextResponse.json(
      { erro: "Erro ao enviar. Verifique sua conexão e tente novamente." },
      { status: 500 }
    );
  }
}
