import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { getEventoAtual } from "@/lib/evento-atual";
import { formatarDataEvento, nomeDestaque } from "@/lib/evento";

export const dynamic = "force-dynamic";

export default async function Home() {
  const evento = await getEventoAtual();

  return (
    <InvitePageShell className="flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg space-y-6 text-center">
        {evento ? (
          <>
            {evento.titulo ? (
              <p className="font-invite-caps text-sm uppercase tracking-[0.24em] text-invite-olive/80">
                {evento.titulo}
              </p>
            ) : null}
            <h1 className="font-nomes-noivos text-[clamp(3.5rem,14vw,5.5rem)] leading-none text-invite-olive">
              {nomeDestaque(evento)}
            </h1>
            {formatarDataEvento(evento) ? (
              <p className="font-invite-caps text-base uppercase tracking-[0.12em] text-invite-olive">
                {formatarDataEvento(evento)}
              </p>
            ) : null}
          </>
        ) : null}
        <p className="font-sans text-lg leading-relaxed text-invite-olive/85">
          Para confirmar presença, ver a lista de presentes e deixar recados, abra o link
          personalizado que você recebeu no WhatsApp.
        </p>
      </div>
    </InvitePageShell>
  );
}
