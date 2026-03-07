export default function ConviteLoading() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-32 animate-pulse">
        <div className="h-3 bg-stone-200 rounded w-32 mb-8" />
        <div className="h-20 sm:h-28 bg-stone-200 rounded w-64 sm:w-80" />
        <div className="h-4 bg-stone-100 rounded w-72 mt-8" />
      </section>
      <section className="px-6 py-24 border-t border-stone-200">
        <div className="max-w-3xl mx-auto flex justify-center gap-4 sm:gap-8 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-24 sm:w-24 sm:h-28 bg-stone-100 rounded-2xl" />
          ))}
        </div>
      </section>
    </main>
  );
}
