export default function PresentesLoading() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-casamento-sage rounded w-24" />
        <div className="h-8 bg-casamento-sage rounded w-56" />
        <div className="h-4 bg-casamento-sage/70 rounded w-40" />
        <div className="h-48 bg-casamento-sage/50 rounded" />
        <div className="h-10 bg-casamento-sage rounded w-32" />
      </div>
    </main>
  );
}
