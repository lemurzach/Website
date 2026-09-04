import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800/80 bg-[#0a0e18]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Aegis Bay
            </p>
            <p className="text-lg font-bold text-slate-100 group-hover:text-amber-300">
              Hero Registry
            </p>
          </Link>
          <nav className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1 text-sm font-medium">
            <Link
              href="/"
              className="rounded-full px-4 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-amber-300"
            >
              Heroes
            </Link>
            <Link
              href="/villains"
              className="rounded-full px-4 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-amber-300"
            >
              Bounties &amp; Villains
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-600">
        Aegis Bay Hero Public Safety Commission
      </footer>
    </div>
  );
}
