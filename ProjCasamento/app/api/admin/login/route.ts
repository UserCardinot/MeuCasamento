import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { verificarSenha } from "@/lib/senha";
import { getEventoAtual } from "@/lib/evento-atual";
import {
  COOKIE_SESSAO,
  cookieSessaoOpcoes,
  criarValorSessao,
  podeAdministrar,
} from "@/lib/admin-sessao";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { allowed } = checkRateLimit(`login:${getClientIp(request)}`);
  if (!allowed) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
  }

  let body: { login?: string; senha?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const login = body.login?.trim().toLowerCase();
  const senha = body.senha ?? "";
  if (!login || !senha) {
    return NextResponse.json({ erro: "Informe usuário e senha." }, { status: 400 });
  }

  const [usuario, evento] = await Promise.all([
    getDb().query.usuarios.findFirst({ where: eq(schema.usuarios.login, login) }),
    getEventoAtual(),
  ]);

  if (!usuario || !verificarSenha(senha, usuario.senhaHash)) {
    return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  }
  if (!evento || !podeAdministrar(usuario, evento)) {
    return NextResponse.json(
      { erro: "Este usuário não tem acesso a este convite." },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ sucesso: true, trocarSenha: usuario.trocarSenha });
  response.cookies.set(COOKIE_SESSAO, criarValorSessao(usuario.id), cookieSessaoOpcoes(request));
  return response;
}
