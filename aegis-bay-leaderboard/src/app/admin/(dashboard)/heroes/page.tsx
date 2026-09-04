import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteHeroButton } from "./delete-hero-button";

export default async function AdminHeroesPage() {
  const heroes = await prisma.hero.findMany({ orderBy: { rank: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Heroes</h2>
        <Link
          href="/admin/heroes/new"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          + Add hero
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Hero</th>
              <th className="px-4 py-3">Quirk</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {heroes.map((hero) => (
              <tr key={hero.id} className="bg-slate-950/40">
                <td className="px-4 py-3 font-mono text-amber-400">
                  #{hero.rank}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-100">
                    {hero.heroName}
                  </div>
                  <div className="text-xs text-slate-500">{hero.name}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">{hero.quirk}</td>
                <td className="px-4 py-3 text-slate-300">{hero.status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/heroes/${hero.id}/edit`}
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-amber-500 hover:text-amber-400"
                    >
                      Edit
                    </Link>
                    <DeleteHeroButton id={hero.id} name={hero.heroName} />
                  </div>
                </td>
              </tr>
            ))}
            {heroes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No heroes yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
