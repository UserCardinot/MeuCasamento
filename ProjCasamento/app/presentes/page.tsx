import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { resolverConvidado } from "@/lib/convidado-atual";
import { getCatalogoPublico } from "@/lib/repo/catalogo";
import { getUltimoPresenteDoConvidado } from "@/lib/repo/presentes-recebidos";
import { nomeDestaque } from "@/lib/evento";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";
import ConfirmarRetornoMP from "./ConfirmarRetornoMP";
import ListaPresentesConvidado from "./ListaPresentesConvidado";
import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { presentesLayoutLoja, presentesCard, presentesLinkVoltar } from "./presentesTheme";

export const dynamic = "force-dynamic";

type SearchParams = {
  token?: string | string[];
  mp?: string | string[];
  payment_id?: string | string[];
  collection_id?: string | string[];
  external_reference?: string | string[];
  status?: string | string[];
};

type Props = {
  searchParams: Promise<SearchParams> | SearchParams;
};

function pickParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  if (Array.isArray(v)) return v[0]?.toString().trim() || undefined;
  return undefined;
}

function ErroPresentes({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center justify-center py-16">
      <div className={presentesLayoutLoja}>
        <div className={`${presentesCard} px-8 py-12 text-center`}>
          <p className="font-invite-caps text-lg font-medium tracking-wide text-invite-olive">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </InvitePageShell>
  );
}

function AvisoPagamento({ tipo, children }: { tipo: "success" | "pending" | "failure"; children: ReactNode }) {
  const estilos = {
    success: "border-invite-olive/35 bg-invite-olive/10 text-invite-olive",
    pending: "border-invite-olive/25 bg-white/60 text-invite-olive/90",
    failure: "border-red-300/50 bg-red-50/80 text-red-800",
  };
  return (
    <div className={`mb-8 border px-5 py-4 font-sans text-sm leading-relaxed ${estilos[tipo]}`} role="status">
      {children}
    </div>
  );
}

export default async function PresentesPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.token;
  const token = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  const mpStatus = pickParam(params?.mp);

  if (!token) {
    return <ErroPresentes mensagem="Link inválido." detalhe="Acesse através do link do seu convite." />;
  }

  const ctx = await resolverConvidado(token);
  if (!ctx) {
    return (
      <ErroPresentes
        mensagem="Link inválido ou expirado."
        detalhe="Fale com quem enviou o convite se acredita que isso é um erro."
      />
    );
  }
  const { evento, convidado } = ctx;

  const paymentId =
    pickParam(params?.payment_id) || pickParam(params?.collection_id);
  const externalReference = pickParam(params?.external_reference);
  const mpPaymentStatus = pickParam(params?.status);
  const deveRegistrar =
    mpStatus === "success" ||
    mpPaymentStatus === "approved" ||
    mpPaymentStatus === "success";
  if (deveRegistrar && (paymentId || externalReference)) {
    const reg = await registrarPagamentoMercadoPago(evento, {
      paymentId,
      externalReference,
    });
    if (!reg.ok) {
      console.warn("Presentes: registro MP no retorno:", reg.erro);
    }
  }

  const [presenteRegistrado, catalogo] = await Promise.all([
    getUltimoPresenteDoConvidado(evento.id, convidado.token),
    getCatalogoPublico(evento.id),
  ]);
  const nome = convidado.nome || "Convidado";
  const destaque = nomeDestaque(evento);

  return (
    <InvitePageShell className="py-8 sm:py-10 md:py-12">
      <div className={`${presentesLayoutLoja} w-full`}>
        <Link href={`/convite?token=${encodeURIComponent(token)}`} className={presentesLinkVoltar}>
          ← Voltar
        </Link>

        <div className={`${presentesCard} px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-11`}>
          <header className="mb-6 border-b border-invite-olive/15 pb-6 text-center lg:mb-8 lg:text-left">
            <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.24em] text-invite-olive/80 sm:text-xs">
              Lista de presentes
            </p>
            <h1 className="font-heading mt-2 text-[1.5rem] italic leading-snug text-invite-olive sm:text-[1.75rem] lg:text-[2rem]">
              Olá, {nome}
            </h1>
            <p className="font-invite-caps mt-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-invite-olive sm:text-xs">
              {destaque}
            </p>
            <p className="font-sans mx-auto mt-3 max-w-xl text-sm leading-relaxed text-invite-olive/80 lg:mx-0">
              Escolha os itens na lista e abra o carrinho pelo ícone no topo — Pix ou cartão.
            </p>
          </header>

          {(mpStatus === "success" || mpPaymentStatus === "approved") && (
            <AvisoPagamento tipo="success">
              <p className="font-medium">Pagamento aprovado no Mercado Pago.</p>
              <p className="mt-2 text-invite-olive/85">
                Seu presente é registrado automaticamente. Se ainda não aparecer, aguarde alguns segundos ou
                recarregue esta página.
              </p>
              <Suspense fallback={null}>
                <ConfirmarRetornoMP token={token} mpStatus={mpStatus} />
              </Suspense>
            </AvisoPagamento>
          )}
          {mpStatus === "pending" && (
            <AvisoPagamento tipo="pending">
              Pagamento pendente. Assim que for confirmado, registraremos seu presente.
            </AvisoPagamento>
          )}
          {mpStatus === "failure" && (
            <AvisoPagamento tipo="failure">
              Não foi possível concluir o pagamento. Você pode tentar de novo ou usar o Pix.
            </AvisoPagamento>
          )}

          <ListaPresentesConvidado
            token={token}
            catalog={catalogo}
            presenteRegistrado={presenteRegistrado}
          />
        </div>
      </div>
    </InvitePageShell>
  );
}
