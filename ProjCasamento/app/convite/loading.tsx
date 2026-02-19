export default function ConviteLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="max-w-lg w-full text-center space-y-6 animate-pulse">
        <div className="h-6 bg-casamento-sage rounded w-32 mx-auto" />
        <div className="h-12 bg-casamento-sage rounded w-48 mx-auto" />
        <div className="h-4 bg-casamento-sage/70 rounded w-64 mx-auto" />
        <div className="h-16 bg-casamento-sage/50 rounded w-full" />
        <div className="h-10 bg-casamento-sage rounded w-40 mx-auto" />
      </div>
    </main>
  );
}
