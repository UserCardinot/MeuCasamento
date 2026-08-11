import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { presentesColuna } from "@/app/presentes/presentesTheme";
import GaleriaClient from "./GaleriaClient";

function pickParam(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

export default function GaleriaPage({
  searchParams,
}: {
  searchParams: { eventToken?: string | string[] };
}) {
  const eventToken = pickParam(searchParams.eventToken);
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center py-10 sm:py-14 md:py-16">
      <div className={`${presentesColuna} w-full`}>
        <GaleriaClient eventToken={eventToken} />
      </div>
    </InvitePageShell>
  );
}
