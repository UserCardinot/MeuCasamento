import { NextRequest, NextResponse } from "next/server";
import { appendToSheet } from "@/lib/google";
import { validateGuestToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 }
    );
  }

  let body: { token?: string; mensagem?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const { token, mensagem } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  const msg = typeof mensagem === "string" ? mensagem.trim() : "";
  if (!msg || msg.length > 500) {
    return NextResponse.json({ erro: "Mensagem obrigatória (máx. 500 caracteres)" }, { status: 400 });
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const { getConvidadoByToken } = await import("@/lib/google");
  const convidado = await getConvidadoByToken(token);
  const nome = convidado?.[1] || "Anônimo";

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const data = new Date().toLocaleString("pt-BR");
    await appendToSheet(sheetId, "Recados!A:D", [[token, nome, msg, data]]);
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao salvar recado:", err);
    return NextResponse.json({ erro: "Erro ao enviar. Tente novamente." }, { status: 500 });
  }
}
