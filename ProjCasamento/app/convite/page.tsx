import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresencaStatus } from "@/lib/google";
import StatusPresenca from "./StatusPresenca";
import ContagemRegressiva from "./ContagemRegressiva";
import { EVENTO } from "@/lib/evento";

/** Cantos: peônias — flores cheias e redondas, pétalas sobrepostas (estilo diferente de rosa) */
function FloralCorner({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        {/* Peônia principal — flor cheia, redonda, várias camadas de “voltas” */}
        <circle cx="36" cy="36" r="18" fill="currentColor" fillOpacity="0.08" />
        <circle cx="36" cy="36" r="14" fill="currentColor" fillOpacity="0.1" />
        <circle cx="36" cy="36" r="10" fill="currentColor" fillOpacity="0.14" />
        <circle cx="36" cy="36" r="6" fill="currentColor" fillOpacity="0.18" />
        <circle cx="36" cy="36" r="3" fill="currentColor" fillOpacity="0.22" />
        {/* Pétalas externas (arcos ao redor) */}
        {[0, 72, 144, 216, 288].map((rot, i) => (
          <ellipse key={i} cx="36" cy="36" rx="14" ry="8" fill="currentColor" fillOpacity={0.06 + i * 0.02} stroke="currentColor" strokeWidth="0.4" opacity="0.85" transform={`rotate(${rot} 36 36)`} />
        ))}
        {[36, 108, 180, 252, 324].map((rot, i) => (
          <ellipse key={i} cx="36" cy="36" rx="11" ry="6" fill="currentColor" fillOpacity={0.08 + i * 0.015} stroke="currentColor" strokeWidth="0.35" opacity="0.9" transform={`rotate(${rot} 36 36)`} />
        ))}
        {/* Segunda peônia (botão / semiaberta) */}
        <circle cx="72" cy="26" r="10" fill="currentColor" fillOpacity="0.12" />
        <circle cx="72" cy="26" r="6" fill="currentColor" fillOpacity="0.16" />
        <ellipse cx="72" cy="26" rx="8" ry="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.35" transform="rotate(-20 72 26)" />
        <ellipse cx="72" cy="26" rx="8" ry="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.35" transform="rotate(40 72 26)" />
        {/* Folhas grandes e arredondadas (típicas de peônia) */}
        <path d="M16 90 Q20 70 38 52 Q50 44 62 38" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
        <ellipse cx="28" cy="68" rx="12" ry="7" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" transform="rotate(-50 28 68)" />
        <ellipse cx="50" cy="48" rx="10" ry="5" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="0.45" transform="rotate(-25 50 48)" />
      </svg>
    </div>
  );
}

/** Ramo de eucalipto — só folhagem alongada e frutinhas, sem flores (estilo moderno) */
function FloralRamo({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* Caule principal */}
        <path d="M40 70 Q38 45 44 22" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M40 68 Q42 38 48 18" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.4" />
        {/* Folhas de eucalipto — alongadas, em forma de foice/lua */}
        <path d="M44 18 Q52 22 54 28 Q52 34 44 32 Q42 26 44 18" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="0.4" strokeLinejoin="round" />
        <path d="M42 28 Q48 32 50 38 Q48 44 42 42 Q40 36 42 28" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.35" strokeLinejoin="round" />
        <path d="M40 38 Q46 42 48 48 Q46 54 40 52 Q38 46 40 38" fill="currentColor" fillOpacity="0.11" stroke="currentColor" strokeWidth="0.35" strokeLinejoin="round" />
        <path d="M36 22 Q30 26 28 32 Q30 38 36 36 Q38 30 36 22" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.4" strokeLinejoin="round" transform="translate(54,0) scale(-1,1)" />
        <path d="M38 32 Q32 36 30 42 Q32 48 38 46 Q40 40 38 32" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.35" strokeLinejoin="round" transform="translate(54,0) scale(-1,1)" />
        {/* Frutinhas / “berries” do eucalipto */}
        <circle cx="50" cy="16" r="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="46" cy="24" r="2" fill="currentColor" fillOpacity="0.18" />
        <circle cx="34" cy="20" r="2" fill="currentColor" fillOpacity="0.18" />
        <circle cx="42" cy="34" r="2" fill="currentColor" fillOpacity="0.16" />
      </svg>
    </div>
  );
}

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

function ErroConvite({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 lg:px-24 py-24 bg-[#FAFAFA]">
      <div className="max-w-lg text-center space-y-4">
        <p className="font-sans text-stone-600 text-xl font-medium">{mensagem}</p>
        {detalhe && <p className="text-stone-500">{detalhe}</p>}
      </div>
    </main>
  );
}

export default async function ConvitePage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.token;
  const token = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  if (!token) {
    return <ErroConvite mensagem="Link inválido." detalhe="Acesse através do link do seu convite." />;
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <ErroConvite
        mensagem="Link inválido ou expirado."
        detalhe="Entre em contato com os noivos se acredita que isso é um erro."
      />
    );
  }

  const [convidado, presenca] = await Promise.all([
    getConvidadoByToken(token),
    getPresencaStatus(token),
  ]);
  const nome = convidado?.[1] || "Convidado";
  const jaConfirmou = presenca?.confirmado === true;

  /* Papel vergê: textura sutil em tons de creme/oliva */
  const papelVergeStyle = {
    backgroundColor: "#F5F2EB",
    backgroundImage: [
      "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(74,93,58,0.03) 2px, rgba(74,93,58,0.03) 3px)",
      "repeating-linear-gradient(90deg, transparent 0px, transparent 24px, rgba(74,93,58,0.02) 24px, rgba(74,93,58,0.02) 25px)",
    ].join(", "),
  };

  return (
    <main>
      {/* Convite — papel vergê + florais em tela cheia */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-16 sm:py-20 overflow-hidden"
        style={papelVergeStyle}
      >
        {/* Florais nos quatro cantos da tela */}
        <FloralCorner className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-casamento-oliva-escuro/60" />
        <FloralCorner className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-casamento-oliva-escuro/60 scale-x-[-1]" />
        <FloralCorner className="absolute bottom-0 left-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-casamento-oliva-escuro/60 scale-y-[-1]" />
        <FloralCorner className="absolute bottom-0 right-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-casamento-oliva-escuro/60 scale-x-[-1] scale-y-[-1]" />

        {/* Conteúdo central do convite */}
        <div className="relative z-10 max-w-2xl mx-auto w-full text-center">
          <p className="font-sans text-casamento-oliva-escuro text-sm uppercase tracking-[0.3em] mb-6">
            Você está convidado(a)
          </p>

          {/* Nomes em verde com flores ao redor */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-2">
            <FloralRamo className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-casamento-oliva-escuro/70 shrink-0" />
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light text-casamento-oliva-escuro tracking-tight">
              Lucas <span className="font-normal">&</span> Beatriz
            </h1>
            <FloralRamo className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-casamento-oliva-escuro/70 shrink-0 scale-x-[-1]" />
          </div>
          <p className="font-sans text-stone-500 mt-6 text-base sm:text-lg max-w-md mx-auto">
            Convidam para a celebração do nosso casamento
          </p>

          <div className="flex items-center justify-center gap-4 my-12 sm:my-14" aria-hidden>
            <span className="w-12 h-px bg-stone-300" />
            <span className="text-casamento-oliva-escuro/50 text-xl">✦</span>
            <span className="w-12 h-px bg-stone-300" />
          </div>

          {/* Data e Local com flores em volta */}
          <div className="relative max-w-lg mx-auto">
            <FloralRamo className="absolute -top-2 -left-4 sm:-left-6 w-10 h-10 sm:w-14 sm:h-14 text-casamento-oliva-escuro/60" />
            <FloralRamo className="absolute -top-2 -right-4 sm:-right-6 w-10 h-10 sm:w-14 sm:h-14 text-casamento-oliva-escuro/60 scale-x-[-1]" />
            <FloralRamo className="absolute -bottom-2 -left-4 sm:-left-6 w-10 h-10 sm:w-14 sm:h-14 text-casamento-oliva-escuro/60 scale-y-[-1]" />
            <FloralRamo className="absolute -bottom-2 -right-4 sm:-right-6 w-10 h-10 sm:w-14 sm:h-14 text-casamento-oliva-escuro/60 scale-x-[-1] scale-y-[-1]" />
            <div className="grid sm:grid-cols-2 gap-10 sm:gap-14 px-6 sm:px-8">
              <div className="text-center sm:text-left">
                <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">Data</p>
                <p className="font-heading text-xl sm:text-2xl text-stone-800">{EVENTO.dataFormatada}</p>
                <p className="font-sans text-stone-500 mt-2">às {EVENTO.horaFormatada}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">Local</p>
                <p className="font-sans text-stone-800 font-medium">{EVENTO.local.nome}</p>
                <p className="font-sans text-stone-500 text-sm mt-2">{EVENTO.local.endereco}</p>
                {EVENTO.local.mapUrl && (
                  <a
                    href={EVENTO.local.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 font-sans text-casamento-oliva-escuro text-sm font-medium hover:underline focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 rounded"
                  >
                    Ver no mapa
                    <span aria-hidden>→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contagem regressiva */}
      <section className="px-6 sm:px-12 lg:px-24 py-16 sm:py-24 bg-[#FAFAFA] border-t border-stone-200">
        <ContagemRegressiva />
      </section>

      {/* Ações */}
      <section className="px-6 sm:px-12 lg:px-24 py-20 sm:py-28 bg-[#FAFAFA] border-t border-stone-200">
        <div className="max-w-xl mx-auto space-y-12">
          <p className="font-sans text-stone-600 text-center">
            Com muito carinho, <span className="font-medium text-stone-800">{nome}</span>.
          </p>

          <div className="space-y-6">
            {jaConfirmou ? (
              <StatusPresenca token={token} />
            ) : (
              <Link
                href={`/confirmacao?token=${token}`}
                className="block w-full py-4 px-8 bg-casamento-oliva-escuro text-white font-sans font-medium text-center rounded-2xl hover:bg-casamento-oliva transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
              >
                Confirmar presença
              </Link>
            )}

            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <Link
                href={`/presentes?token=${token}`}
                className="font-sans text-stone-600 hover:text-casamento-oliva-escuro text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span aria-hidden>🎁</span>
                Lista de presentes
              </Link>
              <Link
                href={`/recados?token=${token}`}
                className="font-sans text-stone-600 hover:text-casamento-oliva-escuro text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span aria-hidden>✉</span>
                Deixar recado
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
