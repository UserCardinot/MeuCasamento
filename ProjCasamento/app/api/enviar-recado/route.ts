import { NextRequest, NextResponse } from "next/server";
import { resolverConvidado } from "@/lib/convidado-atual";
import { criarRecado } from "@/lib/repo/recados";
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

  const ctx = await resolverConvidado(token);
  if (!ctx) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  try {
    await criarRecado({
      eventoId: ctx.evento.id,
      convidadoToken: ctx.convidado.token,
      nome: ctx.convidado.nome || "Anônimo",
      mensagem: msg,
    });
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao salvar recado:", err);
    return NextResponse.json({ erro: "Erro ao enviar. Tente novamente." }, { status: 500 });
  }
}
