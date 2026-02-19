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

  let body: { token?: string; presente?: string; valor?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const { token, presente } = body;
  let { valor } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  if (!presente || typeof presente !== "string" || !presente.trim()) {
    return NextResponse.json({ erro: "Presente obrigatório" }, { status: 400 });
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

  if (valor && typeof valor === "string") {
    const digits = valor.replace(/\D/g, "");
    if (digits.length > 2) {
      valor = (Number(digits) / 100).toFixed(2).replace(".", ",");
    } else {
      valor = digits || "";
    }
  }

  try {
    const data = new Date().toLocaleString("pt-BR");
    await appendToSheet(sheetId, "Presentes!A:D", [
      [token, presente.trim(), valor || "", data],
    ]);
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao registrar Pix:", err);
    return NextResponse.json(
      { erro: "Erro ao salvar. Tente novamente." },
      { status: 500 }
    );
  }
}
