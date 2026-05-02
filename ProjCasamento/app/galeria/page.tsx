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
  return <GaleriaClient eventToken={eventToken} />;
}
