import { HeroForm } from "../hero-form";
import { createHero } from "../actions";

export default function NewHeroPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-100">Add a hero</h2>
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <HeroForm action={createHero} />
      </div>
    </div>
  );
}
