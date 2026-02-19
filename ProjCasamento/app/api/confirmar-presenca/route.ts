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

  let body: { token?: string; confirmado?: boolean; telefone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Dados inválidos" },
      { status: 400 }
    );
  }

  const { token, confirmado, telefone } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  if (typeof confirmado !== "boolean") {
    return NextResponse.json(
      { erro: "Confirmação obrigatória (sim/não)" },
      { status: 400 }
    );
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json(
      { erro: "Configuração do servidor" },
      { status: 500 }
    );
  }

  try {
    const data = new Date().toLocaleString("pt-BR");
    await appendToSheet(sheetId, "Presenças!A:D", [
      [token, confirmado ? "Sim" : "Não", telefone || "", data],
    ]);
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao salvar presença:", err);
    return NextResponse.json(
      { erro: "Erro ao salvar. Tente novamente." },
      { status: 500 }
    );
  }
}
