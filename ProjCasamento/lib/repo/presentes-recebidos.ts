import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { formatarDataHoraRegistro } from "@/lib/evento";

const { presentesRecebidos } = schema;

export async function registrarPresenteRecebido(dados: {
  eventoId: number;
  convidadoToken: string;
  convidadoNome: string;
  presente: string;
  valor: string;
  metodo: "pix" | "cartao";
  mpPaymentId?: string | null;
}): Promise<{ criado: boolean }> {
  const rows = await getDb()
    .insert(presentesRecebidos)
    .values({
      ...dados,
      convidadoToken: dados.convidadoToken.trim().toLowerCase(),
      mpPaymentId: dados.mpPaymentId || null,
    })
    .onConflictDoNothing({ target: presentesRecebidos.mpPaymentId })
    .returning({ id: presentesRecebidos.id });
  return { criado: rows.length > 0 };
}

export async function getUltimoPresenteDoConvidado(
  eventoId: number,
  token: string
): Promise<{ presente: string; valor?: string; data?: string } | null> {
  const row = await getDb().query.presentesRecebidos.findFirst({
    where: and(
      eq(presentesRecebidos.eventoId, eventoId),
      eq(presentesRecebidos.convidadoToken, token.trim().toLowerCase())
    ),
    orderBy: desc(presentesRecebidos.criadoEm),
  });
  if (!row) return null;
  return {
    presente: row.presente,
    valor: row.valor || undefined,
    data: formatarDataHoraRegistro(row.criadoEm),
  };
}

export async function listarPresentesRecebidos(eventoId: number) {
  return getDb()
    .select()
    .from(presentesRecebidos)
    .where(eq(presentesRecebidos.eventoId, eventoId))
    .orderBy(desc(presentesRecebidos.criadoEm));
}
