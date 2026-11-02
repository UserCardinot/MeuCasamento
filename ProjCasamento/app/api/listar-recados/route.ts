import { NextRequest, NextResponse } from "next/server";
import { resolverConvidado } from "@/lib/convidado-atual";
import { listarRecados } from "@/lib/repo/recados";
import { formatarDataHoraRegistro } from "@/lib/evento";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ctx = await resolverConvidado(request.nextUrl.searchParams.get("token"));
  if (!ctx) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  try {
    const rows = await listarRecados(ctx.evento.id);
    const recados = rows.map((r) => ({
      nome: r.nome || "Anônimo",
      mensagem: r.mensagem,
      data: formatarDataHoraRegistro(r.criadoEm),
    }));
    return NextResponse.json({ recados });
  } catch (err) {
    console.error("Erro ao listar recados:", err);
    return NextResponse.json({ erro: "Erro ao carregar recados" }, { status: 500 });
  }
}
