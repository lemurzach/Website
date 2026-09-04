import Link from "next/link";
import { verifyAdmin } from "@/lib/dal";
import { LogoutButton } from "@/app/admin/logout-button";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-400">
              Aegis Bay Command
            </p>
            <h1 className="text-lg font-bold text-slate-100">Admin Panel</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/admin/heroes"
              className="text-slate-300 transition hover:text-amber-400"
            >
              Heroes
            </Link>
            <Link
              href="/admin/villains"
              className="text-slate-300 transition hover:text-amber-400"
            >
              Bounties &amp; Villains
            </Link>
            <Link
              href="/"
              className="text-slate-300 transition hover:text-amber-400"
            >
              View site
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
