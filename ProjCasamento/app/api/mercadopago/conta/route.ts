import { NextResponse } from "next/server";
import {
  mercadoPagoCollectorIdFromAccessToken,
  shouldUseMercadoPagoSandbox,
} from "@/lib/mercadopago-shared";

export const dynamic = "force-dynamic";

type MpUserMe = {
  id?: number;
  nickname?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  country_id?: string;
  site_id?: string;
  tags?: string[];
  status?: {
    site_status?: string;
    list?: unknown;
    billing?: unknown;
    buy?: unknown;
    sell?: unknown;
    immediate_payment?: unknown;
  };
  company?: { corporate_name?: string; brand_name?: string };
  address?: { address?: string; city?: string; state?: string };
  phone?: { area_code?: string; number?: string };
};

function maskEmail(email: string | undefined): string | undefined {
  if (!email?.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

/** Diagnóstico da conta vendedor (token do servidor). Não expõe o Access Token. */
export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json({ configurado: false, erro: "MERCADOPAGO_ACCESS_TOKEN não definido." });
  }

  const sandbox = shouldUseMercadoPagoSandbox(accessToken);
  const collector_id = mercadoPagoCollectorIdFromAccessToken(accessToken);

  let res: Response;
  try {
    res = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { configurado: true, sandbox, collector_id, erro: "Falha ao consultar Mercado Pago." },
      { status: 502 }
    );
  }

  let data: MpUserMe & { message?: string; error?: string };
  try {
    data = (await res.json()) as MpUserMe & { message?: string; error?: string };
  } catch {
    return NextResponse.json(
      { configurado: true, sandbox, collector_id, erro: "Resposta inválida do Mercado Pago." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        configurado: true,
        sandbox,
        collector_id,
        erro: data.message || data.error || `Mercado Pago retornou HTTP ${res.status}`,
      },
      { status: res.status >= 500 ? 502 : res.status }
    );
  }

  const siteStatus = data.status?.site_status;
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const pendencias: string[] = [];

  if (siteStatus && siteStatus !== "active") {
    pendencias.push(`site_status: ${siteStatus} (esperado: active)`);
  }
  if (tags.some((t) => /pending|validation|incomplete|restricted/i.test(String(t)))) {
    pendencias.push(`tags com possível pendência: ${tags.filter((t) => /pending|validation|incomplete|restricted/i.test(String(t))).join(", ")}`);
  }
  if (!data.address?.state) {
    pendencias.push("endereço incompleto na conta MP");
  }
  if (!data.phone?.number) {
    pendencias.push("telefone não cadastrado na conta MP");
  }

  const razao =
    data.company?.brand_name ||
    data.company?.corporate_name ||
    "Comercio padrao LTDA (nome padrão — personalize no painel)";

  const podeReceber =
    !sandbox &&
    siteStatus === "active" &&
    pendencias.length === 0;

  return NextResponse.json({
    configurado: true,
    sandbox,
    collector_id: collector_id ?? (data.id != null ? String(data.id) : null),
    ambiente: sandbox ? "teste" : "producao",
    conta: {
      id: data.id,
      nickname: data.nickname,
      email: maskEmail(data.email),
      nome: [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined,
      pais: data.country_id,
      site_id: data.site_id,
      razao_exibida_checkout: razao,
    },
    status: {
      site_status: siteStatus ?? "desconhecido",
      tags,
    },
    pendencias,
    indicador: podeReceber
      ? "conta_parece_ativa"
      : sandbox
        ? "modo_teste_nao_serve_para_pagamento_real"
        : pendencias.length > 0
          ? "revise_pendencias_no_app_mercado_pago"
          : "confirme_cadastro_e_conta_bancaria_no_app",
    links: {
      app_inicio: "https://www.mercadopago.com.br/home",
      dados_conta: "https://www.mercadopago.com.br/settings/account",
      negocio: "https://www.mercadopago.com.br/business",
      integracoes: "https://www.mercadopago.com.br/developers/panel/app",
      ajuda_receber: "https://www.mercadopago.com.br/ajuda/receber-pagamentos-online_446",
    },
  });
}
