import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 py-24 bg-[#FAFAFA]">
      <div className="text-center max-w-md space-y-6">
        <h1 className="font-heading text-8xl font-light text-casamento-oliva-escuro">404</h1>
        <p className="font-sans text-stone-600 text-xl">Página não encontrada.</p>
        <p className="font-sans text-stone-500">
          O link pode estar incorreto ou a página foi movida.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-8 py-4 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva transition-all duration-200 shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
