import { NextRequest, NextResponse } from "next/server";
import { resolverConvidado } from "@/lib/convidado-atual";
import { registrarPresenteRecebido } from "@/lib/repo/presentes-recebidos";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { formatPresentesRegistro, parsePresentesBody } from "@/lib/presentes-checkout";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 }
    );
  }

  let body: { token?: string; presente?: string; presentes?: string[]; valor?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const { token } = body;
  const nomes = parsePresentesBody(body);
  let { valor } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  if (nomes.length === 0) {
    return NextResponse.json({ erro: "Selecione ao menos um presente." }, { status: 400 });
  }

  const ctx = await resolverConvidado(token);
  if (!ctx) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
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
    await registrarPresenteRecebido({
      eventoId: ctx.evento.id,
      convidadoToken: ctx.convidado.token,
      convidadoNome: ctx.convidado.nome,
      presente: formatPresentesRegistro(nomes),
      valor: valor || "",
      metodo: "pix",
    });
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao registrar Pix:", err);
    return NextResponse.json(
      { erro: "Erro ao salvar. Tente novamente." },
      { status: 500 }
    );
  }
}
