import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { resolverConvidado } from "@/lib/convidado-atual";
import { baseUrlDoEvento } from "@/lib/evento-atual";
import { getMpConfigEvento } from "@/lib/mercadopago-evento";
import { getCatalogoPublico } from "@/lib/repo/catalogo";
import {
  buildMercadoPagoLineItems,
  parsePresentesBody,
  resolvePresentesCatalogItems,
} from "@/lib/presentes-checkout";
import {
  buildExternalReference,
  canUseMercadoPagoAutoReturn,
  formatMercadoPagoApiError,
  parseCatalogPreco,
  isMercadoPagoSandboxCheckoutUrl,
  mercadoPagoCollectorIdFromAccessToken,
  mercadoPagoCollectorIdFromPreferenceId,
  resolveMercadoPagoInitPoint,
} from "@/lib/mercadopago-shared";

export const dynamic = "force-dynamic";

function itemIdFromTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || "presente";
}

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

  const mp = getMpConfigEvento(ctx.evento);
  if (!mp) {
    return NextResponse.json(
      { erro: "Pagamento com cartão não está disponível. Use o Pix." },
      { status: 503 }
    );
  }
  const { accessToken, sandbox } = mp;

  const catalog = await getCatalogoPublico(ctx.evento.id);
  const resolved = resolvePresentesCatalogItems(catalog, nomes);
  if ("error" in resolved) {
    return NextResponse.json({ erro: resolved.error }, { status: 400 });
  }

  const taxaCartaoPercent = mp.taxaPercent;
  const lineItems = buildMercadoPagoLineItems(resolved.items, itemIdFromTitle, taxaCartaoPercent);
  if ("error" in lineItems) {
    return NextResponse.json({ erro: lineItems.error }, { status: 400 });
  }

  const subtotalCatalogo = resolved.items.reduce((s, it) => {
    const n = parseCatalogPreco(it.preco);
    return s + (n ?? 0);
  }, 0);

  let externalReference: string;
  try {
    externalReference = buildExternalReference(token, nomes);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Referência inválida";
    return NextResponse.json({ erro: msg }, { status: 400 });
  }

  const base = baseUrlDoEvento(ctx.evento);
  const tokenQ = encodeURIComponent(token.trim());
  const useAutoReturn = canUseMercadoPagoAutoReturn(base);
  const backUrls = {
    success: `${base}/presentes?token=${tokenQ}&mp=success`,
    pending: `${base}/presentes?token=${tokenQ}&mp=pending`,
    failure: `${base}/presentes?token=${tokenQ}&mp=failure`,
  };

  const testBuyerEmail = process.env.MERCADOPAGO_TEST_BUYER_EMAIL?.trim();

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: lineItems.items,
        external_reference: externalReference,
        statement_descriptor: "PRESENTE",
        payment_methods: {
          installments: 12,
          default_installments: 1,
        },
        back_urls: backUrls,
        ...(sandbox
          ? {
              payer: {
                ...(testBuyerEmail ? { email: testBuyerEmail } : {}),
                identification: { type: "CPF", number: "12345678909" },
              },
            }
          : {}),
        ...(useAutoReturn ? { auto_return: "approved" as const } : {}),
        ...(useAutoReturn ? { notification_url: `${base}/api/webhooks/mercadopago` } : {}),
      },
    });
    const initPoint = resolveMercadoPagoInitPoint(result, sandbox);

    if (!initPoint) {
      console.error("Mercado Pago: preferência sem init_point", result.id, { sandbox });
      const erroSandbox =
        sandbox
          ? "Checkout de teste indisponível. Confira o Access Token de teste nas Configurações do painel."
          : "Não foi possível abrir o checkout. Tente novamente.";
      return NextResponse.json({ erro: erroSandbox }, { status: 502 });
    }

    if (sandbox && !isMercadoPagoSandboxCheckoutUrl(initPoint)) {
      console.error("Mercado Pago: SANDBOX ativo mas URL de produção", initPoint);
      return NextResponse.json(
        {
          erro:
            "Configuração de teste incorreta (URL de produção). Use o Access Token de teste no modo teste.",
        },
        { status: 502 }
      );
    }

    const collectorId =
      mercadoPagoCollectorIdFromPreferenceId(result.id) ??
      mercadoPagoCollectorIdFromAccessToken(accessToken);

    const total = lineItems.items.reduce((s, it) => s + it.unit_price, 0);
    const subtotal = Math.round(subtotalCatalogo * 100) / 100;
    const checkoutHost = new URL(initPoint).hostname;

    return NextResponse.json({
      init_point: initPoint,
      preference_id: result.id,
      sandbox,
      checkout_host: checkoutHost,
      collector_id: collectorId,
      total,
      subtotal,
      taxa_cartao_percent: taxaCartaoPercent,
      taxa_cartao_valor: Math.round((total - subtotal) * 100) / 100,
      quantidade: nomes.length,
    });
  } catch (err) {
    const detalhe = formatMercadoPagoApiError(err);
    console.error("Mercado Pago preferência:", detalhe, err);
    const msg =
      process.env.NODE_ENV === "development"
        ? detalhe
        : "Erro ao criar pagamento. Tente novamente.";
    return NextResponse.json({ erro: msg }, { status: 502 });
  }
}
