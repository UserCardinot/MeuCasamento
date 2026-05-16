import { presentesColuna, presentesCard } from "./presentesTheme";

export default function PresentesLoading() {
  return (
    <main className="invite-wall-texture-bg min-h-screen py-12 sm:py-16">
      <div className={`${presentesColuna} animate-pulse`}>
        <div className="mb-10 h-4 w-32 bg-invite-olive/15" />
        <div className={`${presentesCard} space-y-8 px-6 py-10 sm:px-10`}>
          <div className="mx-auto h-8 w-48 bg-invite-olive/15" />
          <div className="mx-auto h-12 w-64 bg-invite-olive/10" />
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 border border-invite-olive/15 bg-white/50" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
