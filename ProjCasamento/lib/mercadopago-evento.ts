import type { Evento } from "@/db/schema";
import { decifrar } from "@/lib/cripto";
import { isMercadoPagoTestToken, parseTaxaCartaoPercent } from "@/lib/mercadopago-shared";

export type MpConfigEvento = {
  accessToken: string;
  sandbox: boolean;
  taxaPercent: number;
};

/** Credenciais do Mercado Pago do evento (null se não configurado). */
export function getMpConfigEvento(evento: Evento): MpConfigEvento | null {
  const accessToken = decifrar(evento.mpAccessTokenEnc).trim();
  if (!accessToken) return null;
  return {
    accessToken,
    sandbox: evento.mpSandbox || isMercadoPagoTestToken(accessToken),
    taxaPercent: parseTaxaCartaoPercent(evento.mpTaxaPercent),
  };
}
