import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appendToSheet } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";
import { generateGuestToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token || !validateAdminSessionToken(token)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: { nome?: string; acompanhantes?: string; contato?: string; origem?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const nome = body?.nome?.trim();
  if (!nome) {
    return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  const guestToken = generateGuestToken();
  const acompanhantes = body?.acompanhantes?.trim() || "";
  const contato = body?.contato?.trim() || "";
  const origem = body?.origem?.trim() || "";
  const data = new Date().toLocaleString("pt-BR");

  try {
    await appendToSheet(sheetId, "Convidados!A:F", [
      [guestToken, nome, acompanhantes, contato, data, origem],
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const link = `${baseUrl}/convite?token=${guestToken}`;

    return NextResponse.json({
      sucesso: true,
      token: guestToken,
      link,
    });
  } catch (err) {
    console.error("Erro ao adicionar convidado:", err);
    return NextResponse.json(
      { erro: "Erro ao salvar. Tente novamente." },
      { status: 500 }
    );
  }
}
