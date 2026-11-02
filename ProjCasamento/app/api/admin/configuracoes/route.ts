import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Evento } from "@/db/schema";
import { exigirAdmin } from "@/lib/admin-sessao";
import { cifrar } from "@/lib/cripto";
import { limparCacheEventos } from "@/lib/evento-atual";

export const dynamic = "force-dynamic";

const CAMPOS_TEXTO = [
  "titulo",
  "anfitrioes",
  "data",
  "hora",
  "localNome",
  "localEndereco",
  "localCidade",
  "localMapUrl",
  "mensagemConvite",
  "textoCapa",
  "whatsappTemplate",
  "pixChave",
  "pixNome",
  "pixCidade",
  "mpTaxaPercent",
  "prazoConfirmacao",
] as const satisfies readonly (keyof Evento)[];

type CampoTexto = (typeof CAMPOS_TEXTO)[number];

function serializar(ev: Evento) {
  const out: Record<string, unknown> = {
    slug: ev.slug,
    dominio: ev.dominio,
    tipo: ev.tipo,
    tema: ev.tema,
    mpSandbox: ev.mpSandbox,
    listaPresentes: ev.listaPresentes,
    mpConfigurado: !!ev.mpAccessTokenEnc,
  };
  for (const c of CAMPOS_TEXTO) out[c] = ev[c];
  return out;
}

export async function GET() {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;
  return NextResponse.json({
    evento: serializar(admin.evento),
    usuario: {
      login: admin.usuario.login,
      nome: admin.usuario.nome,
      papel: admin.usuario.papel,
      trocarSenha: admin.usuario.trocarSenha,
    },
  });
}

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const set: Partial<Evento> = {};
  for (const c of CAMPOS_TEXTO) {
    const v = body[c];
    if (typeof v === "string") (set as Record<CampoTexto, string>)[c] = v.trim();
  }

  if (set.data && !/^\d{4}-\d{2}-\d{2}$/.test(set.data)) {
    return NextResponse.json({ erro: "Data inválida (use o seletor de data)." }, { status: 400 });
  }
  if (set.hora && !/^\d{2}:\d{2}$/.test(set.hora)) {
    return NextResponse.json({ erro: "Hora inválida (use o seletor de hora)." }, { status: 400 });
  }

  if (set.prazoConfirmacao && !/^\d{4}-\d{2}-\d{2}$/.test(set.prazoConfirmacao)) {
    return NextResponse.json({ erro: "Prazo de confirmação inválido (use o seletor de data)." }, { status: 400 });
  }

  if (typeof body.mpSandbox === "boolean") set.mpSandbox = body.mpSandbox;
  if (typeof body.listaPresentes === "boolean") set.listaPresentes = body.listaPresentes;
  if (body.mpRemoverToken === true) {
    set.mpAccessTokenEnc = "";
  } else if (typeof body.mpAccessToken === "string" && body.mpAccessToken.trim()) {
    set.mpAccessTokenEnc = cifrar(body.mpAccessToken.trim());
  }

  if (admin.usuario.papel === "super") {
    if (body.tema === "mickey" || body.tema === "oliva") set.tema = body.tema;
    if (body.tipo === "convite_completo" || body.tipo === "so_presentes") set.tipo = body.tipo;
  }

  const [atualizado] = await getDb()
    .update(schema.eventos)
    .set(set)
    .where(eq(schema.eventos.id, admin.evento.id))
    .returning();
  limparCacheEventos();

  return NextResponse.json({ sucesso: true, evento: serializar(atualizado) });
}
