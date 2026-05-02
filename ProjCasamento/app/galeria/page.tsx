import { Suspense } from "react";
import GaleriaClient from "./GaleriaClient";

function GaleriaFallback() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
      <p className="font-sans text-stone-600">Carregando...</p>
    </main>
  );
}

export default function GaleriaPage() {
  return (
    <Suspense fallback={<GaleriaFallback />}>
      <GaleriaClient />
    </Suspense>
  );
}
