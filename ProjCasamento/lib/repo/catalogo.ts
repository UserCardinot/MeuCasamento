import { and, asc, eq, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { CatalogoPresente } from "@/db/schema";

const { catalogoPresentes } = schema;

export type CamposPresente = {
  nome: string;
  preco: string;
  url: string;
  imagem: string;
  ativo: boolean;
};

export async function listarCatalogo(
  eventoId: number,
  opts: { apenasAtivos?: boolean } = {}
): Promise<CatalogoPresente[]> {
  const where = opts.apenasAtivos
    ? and(eq(catalogoPresentes.eventoId, eventoId), eq(catalogoPresentes.ativo, true))
    : eq(catalogoPresentes.eventoId, eventoId);
  return getDb()
    .select()
    .from(catalogoPresentes)
    .where(where)
    .orderBy(asc(catalogoPresentes.ordem), asc(catalogoPresentes.id));
}

/** Formato usado pela lista do convidado e pelo checkout. */
export async function getCatalogoPublico(eventoId: number) {
  const rows = await listarCatalogo(eventoId, { apenasAtivos: true });
  return rows.map((r) => ({
    nome: r.nome,
    preco: r.preco,
    url: r.url,
    imagem: r.imagem,
    ativo: "Sim",
  }));
}

async function nomeEmUso(eventoId: number, nome: string, excetoId?: number): Promise<boolean> {
  const conds = [eq(catalogoPresentes.eventoId, eventoId), eq(catalogoPresentes.nome, nome)];
  if (excetoId) conds.push(ne(catalogoPresentes.id, excetoId));
  const row = await getDb().query.catalogoPresentes.findFirst({ where: and(...conds) });
  return !!row;
}

export async function criarPresente(
  eventoId: number,
  campos: CamposPresente
): Promise<"created" | "duplicate_nome"> {
  if (await nomeEmUso(eventoId, campos.nome)) return "duplicate_nome";
  await getDb().insert(catalogoPresentes).values({ eventoId, ...campos });
  return "created";
}

export async function atualizarPresente(
  eventoId: number,
  nomeOriginal: string,
  campos: CamposPresente
): Promise<"updated" | "not_found" | "duplicate_nome"> {
  const atual = await getDb().query.catalogoPresentes.findFirst({
    where: and(eq(catalogoPresentes.eventoId, eventoId), eq(catalogoPresentes.nome, nomeOriginal)),
  });
  if (!atual) return "not_found";
  if (campos.nome !== nomeOriginal && (await nomeEmUso(eventoId, campos.nome, atual.id))) {
    return "duplicate_nome";
  }
  await getDb().update(catalogoPresentes).set(campos).where(eq(catalogoPresentes.id, atual.id));
  return "updated";
}

export async function removerPresente(eventoId: number, nome: string): Promise<boolean> {
  const rows = await getDb()
    .delete(catalogoPresentes)
    .where(and(eq(catalogoPresentes.eventoId, eventoId), eq(catalogoPresentes.nome, nome)))
    .returning({ id: catalogoPresentes.id });
  return rows.length > 0;
}
