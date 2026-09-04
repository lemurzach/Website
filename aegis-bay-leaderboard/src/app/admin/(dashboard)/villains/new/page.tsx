import { VillainForm } from "../villain-form";
import { createVillain } from "../actions";

export default function NewVillainPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-100">Add a villain</h2>
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <VillainForm action={createVillain} />
      </div>
    </div>
  );
}
