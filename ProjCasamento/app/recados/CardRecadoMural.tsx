"use client";

type Props = {
  nome: string;
  data?: string;
  onClick: () => void;
};

export default function CardRecadoMural({ nome, data, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden border border-invite-olive/20 bg-white text-center shadow-[0_2px_12px_rgba(75,83,32,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-invite-olive/35 hover:shadow-[0_6px_20px_rgba(75,83,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive"
    >
      <div className="relative bg-gradient-to-b from-invite-olive/12 to-invite-olive/5 px-4 py-4">
        <span
          className="font-heading pointer-events-none block text-2xl leading-none text-invite-olive/15"
          aria-hidden
        >
          “
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-5">
        <p className="font-invite-caps text-[0.58rem] font-medium uppercase tracking-[0.16em] text-invite-olive/50">
          Recado de
        </p>
        <p className="font-heading line-clamp-2 min-h-[2.5rem] text-base italic leading-snug text-invite-olive sm:text-[1.05rem]">
          {nome}
        </p>
        {data && (
          <p className="font-sans mt-1 max-w-full truncate text-[0.65rem] text-invite-olive/45">{data}</p>
        )}
      </div>

      <div className="border-t border-invite-olive/12 bg-invite-cream/80 px-3 py-3 transition-colors group-hover:bg-invite-olive group-hover:text-white">
        <span className="font-invite-caps text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-invite-olive/75 group-hover:text-white">
          Ler mensagem →
        </span>
      </div>
    </button>
  );
}
