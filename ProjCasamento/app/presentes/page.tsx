import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresenteRegistrado, getCatalogoPresentes } from "@/lib/google";
import { EVENTO } from "@/lib/evento";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";
import ConfirmarRetornoMP from "./ConfirmarRetornoMP";
import ListaPresentesConvidado from "./ListaPresentesConvidado";
import { presentesColuna, presentesCard, presentesLinkVoltar } from "./presentesTheme";

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
    <main className="invite-wall-texture-bg flex min-h-screen flex-col items-center justify-center py-16">
      <div className={presentesColuna}>
        <div className={`${presentesCard} px-8 py-12 text-center`}>
          <p className="font-invite-caps text-lg font-medium tracking-wide text-invite-olive">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </main>
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

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <ErroPresentes
        mensagem="Link inválido ou expirado."
        detalhe="Entre em contato com os noivos se acredita que isso é um erro."
      />
    );
  }

  const paymentId =
    pickParam(params?.payment_id) || pickParam(params?.collection_id);
  const externalReference = pickParam(params?.external_reference);
  const mpPaymentStatus = pickParam(params?.status);
  const deveRegistrar =
    mpStatus === "success" ||
    mpPaymentStatus === "approved" ||
    mpPaymentStatus === "success";
  if (deveRegistrar && (paymentId || externalReference)) {
    const reg = await registrarPagamentoMercadoPago({
      paymentId,
      externalReference,
    });
    if (!reg.ok) {
      console.warn("Presentes: registro MP no retorno:", reg.erro);
    }
  }

  const [convidado, presenteRegistrado, catalogo] = await Promise.all([
    getConvidadoByToken(token),
    getPresenteRegistrado(token),
    getCatalogoPresentes(),
  ]);
  const nome = convidado?.[1] || "Convidado";
  const { primeiro, segundo } = EVENTO.noivos;

  return (
    <main className="invite-wall-texture-bg min-h-screen py-12 sm:py-16 md:py-20 lg:py-24">
      <div className={`${presentesColuna} w-full`}>
        <Link href={`/convite?token=${encodeURIComponent(token)}`} className={presentesLinkVoltar}>
          ← Voltar ao convite
        </Link>

        <div className={`${presentesCard} px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-14`}>
          <header className="mb-10 text-center md:mb-12">
            <p className="font-invite-caps text-[0.72rem] font-medium uppercase tracking-[0.28em] text-invite-olive/80 sm:text-xs md:tracking-[0.32em]">
              Lista de presentes
            </p>
            <h1 className="font-heading mt-4 text-[1.65rem] italic leading-snug text-invite-olive sm:text-[1.85rem] md:text-[2.35rem]">
              Olá, {nome}
            </h1>
            <p className="font-invite-caps mt-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-invite-olive sm:text-[0.72rem] md:text-sm md:tracking-[0.24em]">
              {primeiro} & {segundo}
            </p>
            <p className="font-sans mx-auto mt-6 max-w-md text-sm leading-relaxed text-invite-olive/80 md:text-base">
              Sua presença já é o maior presente. Se desejar contribuir, escolha um ou mais itens abaixo — Pix ou cartão.
            </p>
          </header>

          {(mpStatus === "success" || mpPaymentStatus === "approved") && (
            <AvisoPagamento tipo="success">
              <p className="font-medium">Pagamento aprovado no Mercado Pago.</p>
              <p className="mt-2 text-invite-olive/85">
                Sua contribuição é registrada na planilha automaticamente. Se o histórico dos noivos ainda não
                atualizou, aguarde alguns segundos ou recarregue esta página.
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
    </main>
  );
}
