import { NextRequest, NextResponse } from "next/server";
import { getConvidadoByToken, updateConvidadoRow, upsertPresencaRow } from "@/lib/google";
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

  let body: { token?: string; confirmado?: boolean; mensagem?: string; nomesAcompanhantes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Dados inválidos" },
      { status: 400 }
    );
  }

  const { token, confirmado, mensagem, nomesAcompanhantes } = body;

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
    const listaAcompanhantes = nomesAcompanhantes?.trim() ?? "";

    const acao = await upsertPresencaRow(sheetId, token, {
      confirmado,
      mensagem: mensagem?.trim() || undefined,
      nomesAcompanhantes: confirmado ? listaAcompanhantes || undefined : undefined,
    });

    const convidado = await getConvidadoByToken(token);
    if (convidado) {
      await updateConvidadoRow(sheetId, token, {
        nome: String(convidado[1] ?? ""),
        acompanhantes: confirmado ? listaAcompanhantes : String(convidado[2] ?? ""),
        contato: String(convidado[3] ?? ""),
        origem: String(convidado[5] ?? ""),
      });
    }

    return NextResponse.json({ sucesso: true, acao });
  } catch (err) {
    console.error("Erro ao salvar presença:", err);
    return NextResponse.json(
      { erro: "Erro ao salvar. Tente novamente." },
      { status: 500 }
    );
  }
}
