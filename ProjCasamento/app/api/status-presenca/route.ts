import { NextRequest, NextResponse } from "next/server";
import { resolverConvidado } from "@/lib/convidado-atual";
import { getPresenca } from "@/lib/repo/presencas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  const ctx = await resolverConvidado(token);
  if (!ctx) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const presenca = await getPresenca(ctx.convidado.id);
  return NextResponse.json({
    respondeu: presenca !== null,
    confirmado: presenca?.confirmado === true,
  });
}
