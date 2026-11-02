import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

const { recados } = schema;

export async function criarRecado(dados: {
  eventoId: number;
  convidadoToken: string;
  nome: string;
  mensagem: string;
}): Promise<void> {
  await getDb().insert(recados).values(dados);
}

export async function listarRecados(eventoId: number) {
  return getDb()
    .select()
    .from(recados)
    .where(eq(recados.eventoId, eventoId))
    .orderBy(desc(recados.criadoEm));
}
