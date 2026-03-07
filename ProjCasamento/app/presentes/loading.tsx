export default function PresentesLoading() {
  return (
    <main className="min-h-screen px-6 sm:px-12 py-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-3 bg-stone-200 rounded w-28" />
        <div className="h-12 bg-stone-200 rounded w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-stone-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
