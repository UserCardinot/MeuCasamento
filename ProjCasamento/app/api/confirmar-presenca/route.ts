import { NextRequest, NextResponse } from "next/server";
import { resolverConvidado } from "@/lib/convidado-atual";
import { upsertPresenca } from "@/lib/repo/presencas";
import { atualizarConvidado } from "@/lib/repo/convidados";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { formatarPrazoConfirmacao, prazoConfirmacaoEncerrado } from "@/lib/evento";

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
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
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

  const ctx = await resolverConvidado(token);
  if (!ctx) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  if (prazoConfirmacaoEncerrado(ctx.evento)) {
    return NextResponse.json(
      { erro: `O prazo para confirmar presença terminou em ${formatarPrazoConfirmacao(ctx.evento)}.` },
      { status: 403 }
    );
  }

  try {
    const listaAcompanhantes = nomesAcompanhantes?.trim() ?? "";

    const acao = await upsertPresenca(ctx.evento.id, ctx.convidado.id, {
      confirmado,
      mensagem: mensagem?.trim() ?? "",
      nomesAcompanhantes: confirmado ? listaAcompanhantes : "",
    });

    if (confirmado) {
      await atualizarConvidado(ctx.evento.id, ctx.convidado.token, {
        acompanhantes: listaAcompanhantes,
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
