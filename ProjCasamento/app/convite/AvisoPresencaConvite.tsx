import Link from "next/link";

type Props = {
  token: string;
  confirmado: boolean;
};

export default function AvisoPresencaConvite({ token, confirmado }: Props) {
  const hrefConfirmacao = `/confirmacao?token=${encodeURIComponent(token)}`;

  if (confirmado) {
    return (
      <div
        className="mx-auto max-w-[24rem] border border-invite-olive/30 bg-invite-cream/80 px-5 py-5 text-center sm:max-w-[26rem] sm:px-6 md:max-w-[28rem]"
        role="status"
      >
        <p className="font-invite-caps text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-invite-olive sm:text-[0.9rem]">
          Sua presença está confirmada
        </p>
        <p className="font-sans mt-2 text-sm normal-case tracking-normal text-invite-olive/75">
          Estamos ansiosos para celebrar com você.
        </p>
        <Link
          href={hrefConfirmacao}
          className="font-invite-caps mt-4 inline-block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive/70 underline-offset-4 hover:text-invite-olive hover:underline"
        >
          Alterar minha resposta
        </Link>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-[24rem] border border-invite-olive/25 bg-white/50 px-5 py-5 text-center sm:max-w-[26rem] sm:px-6 md:max-w-[28rem]"
      role="status"
    >
      <p className="font-invite-caps text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-invite-olive sm:text-[0.9rem]">
        Você informou que não poderá ir
      </p>
      <p className="font-sans mt-2 text-sm normal-case leading-relaxed tracking-normal text-invite-olive/80">
        Ainda dá tempo de confirmar sua presença — altere sua resposta quando quiser.
      </p>
      <Link
        href={hrefConfirmacao}
        className="font-invite-caps mt-4 inline-block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive underline-offset-4 hover:underline"
      >
        Confirmar presença
      </Link>
    </div>
  );
}
