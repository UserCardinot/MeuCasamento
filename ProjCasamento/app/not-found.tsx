import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-6xl font-bold text-casamento-verde">404</h1>
        <p className="mt-4 text-stone-600 text-lg">Página não encontrada.</p>
        <p className="mt-2 text-stone-500 text-sm">
          O link pode estar incorreto ou a página foi movida.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block px-6 py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 transition"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
