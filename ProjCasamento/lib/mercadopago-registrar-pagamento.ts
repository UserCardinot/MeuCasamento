import { MercadoPagoConfig, Payment } from "mercadopago";
import type { Evento } from "@/db/schema";
import { formatPresentesRegistro } from "@/lib/presentes-checkout";
import { parseExternalReference } from "@/lib/mercadopago-shared";
import { getMpConfigEvento } from "@/lib/mercadopago-evento";
import { getConvidado } from "@/lib/repo/convidados";
import { registrarPresenteRecebido } from "@/lib/repo/presentes-recebidos";

export type RegistrarPagamentoResult =
  | { ok: true; jaRegistrado: boolean; paymentId: string }
  | { ok: false; erro: string };

export type ResolverPagamentoInput = {
  paymentId?: string;
  externalReference?: string;
};

/** Busca ID de pagamento aprovado por external_reference (retorno MP sem payment_id). */
async function resolverPaymentIdAprovado(
  accessToken: string,
  input: ResolverPagamentoInput
): Promise<string | null> {
  const direct = input.paymentId?.trim();
  if (direct) return direct;

  const ref = input.externalReference?.trim();
  if (!ref) return null;

  try {
    const url = new URL("https://api.mercadopago.com/v1/payments/search");
    url.searchParams.set("sort", "date_created");
    url.searchParams.set("criteria", "desc");
    url.searchParams.set("external_reference", ref);
    url.searchParams.set("status", "approved");
    url.searchParams.set("range", "date_created");
    url.searchParams.set("begin_date", "NOW-30DAYS");
    url.searchParams.set("end_date", "NOW");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("MP search payments:", res.status, ref);
      return null;
    }
    const data = (await res.json()) as { results?: { id?: number | string }[] };
    const first = data.results?.[0];
    if (first?.id != null) return String(first.id);
  } catch (e) {
    console.error("MP search payments:", e);
  }
  return null;
}

/** Grava o presente quando o pagamento MP está aprovado (webhook ou retorno do checkout). */
export async function registrarPagamentoMercadoPago(
  evento: Evento,
  paymentIdOrInput: string | ResolverPagamentoInput
): Promise<RegistrarPagamentoResult> {
  const mp = getMpConfigEvento(evento);
  if (!mp) return { ok: false, erro: "Mercado Pago não configurado para este evento" };

  const resolvedId =
    typeof paymentIdOrInput === "string"
      ? paymentIdOrInput.trim()
      : await resolverPaymentIdAprovado(mp.accessToken, paymentIdOrInput);

  const id = resolvedId?.trim();
  if (!id) {
    return {
      ok: false,
      erro: "Pagamento aprovado não encontrado. Use o ID do pagamento no painel do Mercado Pago.",
    };
  }

  const paymentApi = new Payment(new MercadoPagoConfig({ accessToken: mp.accessToken }));

  let pay: Awaited<ReturnType<Payment["get"]>>;
  try {
    pay = await paymentApi.get({ id });
  } catch {
    return { ok: false, erro: "Pagamento não encontrado no Mercado Pago" };
  }

  if (pay.status !== "approved") {
    return {
      ok: false,
      erro:
        pay.status === "pending"
          ? "Pagamento ainda pendente. Aguarde a confirmação."
          : "Pagamento não aprovado.",
    };
  }

  const parsed = parseExternalReference(pay.external_reference);
  if (!parsed) {
    console.error("MP registrar: external_reference inválido", pay.id, pay.external_reference);
    return { ok: false, erro: "Referência do presente inválida" };
  }

  const amount = pay.transaction_amount;
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { ok: false, erro: "Valor do pagamento inválido" };
  }

  const convidado = await getConvidado(evento.id, parsed.token);

  try {
    const { criado } = await registrarPresenteRecebido({
      eventoId: evento.id,
      convidadoToken: parsed.token,
      convidadoNome: convidado?.nome ?? "",
      presente: formatPresentesRegistro(parsed.presentes, "cartão"),
      valor: amount.toFixed(2).replace(".", ","),
      metodo: "cartao",
      mpPaymentId: String(id),
    });
    return { ok: true, jaRegistrado: !criado, paymentId: String(id) };
  } catch (e) {
    console.error("MP registrar: erro ao gravar", e);
    return { ok: false, erro: "Erro ao salvar o presente" };
  }
}
