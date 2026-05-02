import RecadosClient from "./RecadosClient";

function pickParam(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

export default function RecadosPage({
  searchParams,
}: {
  searchParams: { token?: string | string[] };
}) {
  const token = pickParam(searchParams.token);
  return <RecadosClient token={token} />;
}
