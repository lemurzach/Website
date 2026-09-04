"use client";

import { startTransition } from "react";
import { deleteHero } from "./actions";

export function DeleteHeroButton({ id, name }: { id: number; name: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`Remove ${name} from the leaderboard?`)) {
          startTransition(() => deleteHero(id));
        }
      }}
      className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-400"
    >
      Delete
    </button>
  );
}
