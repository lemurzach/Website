"use client";

import { startTransition } from "react";
import { deleteVillain } from "./actions";

export function DeleteVillainButton({ id, name }: { id: number; name: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`Remove ${name} from the bounty board?`)) {
          startTransition(() => deleteVillain(id));
        }
      }}
      className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-400"
    >
      Delete
    </button>
  );
}
