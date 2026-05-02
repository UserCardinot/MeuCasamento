import { Suspense } from "react";
import RecadosClient from "./RecadosClient";

function RecadosFallback() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
      <p className="font-sans text-stone-600">Carregando...</p>
    </main>
  );
}

export default function RecadosPage() {
  return (
    <Suspense fallback={<RecadosFallback />}>
      <RecadosClient />
    </Suspense>
  );
}
