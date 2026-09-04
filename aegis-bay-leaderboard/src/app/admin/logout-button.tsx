"use client";

import { startTransition } from "react";
import { logout } from "./actions";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-red-500 hover:text-red-400"
    >
      Log out
    </button>
  );
}
