import { parseAcompanhantesLista } from "@/lib/acompanhantes";

type Props = {
  nome: string;
  acompanhantesTexto: string;
  presencaConfirmada: boolean;
};

export default function ConviteResumoConvidado({ nome, acompanhantesTexto, presencaConfirmada }: Props) {
  const lista = parseAcompanhantesLista(acompanhantesTexto);
  if (!nome && lista.length === 0) return null;

  return (
    <div className="mx-auto mt-8 max-w-[22rem] border border-invite-olive/25 bg-invite-cream/60 px-5 py-5 text-center sm:max-w-[26rem] md:max-w-[28rem]">
      <p className="font-invite-caps text-[0.72rem] font-medium uppercase tracking-[0.18em] text-invite-olive/80">
        Seu convite
      </p>
      <p className="font-heading mt-2 text-lg italic text-invite-olive sm:text-xl">{nome}</p>
      {lista.length > 0 && (
        <div className="mt-4">
          <p className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.14em] text-invite-olive/70">
            {presencaConfirmada ? "Confirmados com você" : "Acompanhantes no convite"}
          </p>
          <ul className="font-sans mt-2 space-y-1 text-sm normal-case text-invite-olive/90">
            {lista.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
