import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { presentesColuna } from "@/app/presentes/presentesTheme";
import { pickEventTokenParam } from "@/lib/auth";
import GaleriaClient from "./GaleriaClient";

export default function GaleriaPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const eventToken = pickEventTokenParam(searchParams) || "";
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center py-10 sm:py-14 md:py-16">
      <div className={`${presentesColuna} w-full`}>
        <GaleriaClient eventToken={eventToken} />
      </div>
    </InvitePageShell>
  );
}
