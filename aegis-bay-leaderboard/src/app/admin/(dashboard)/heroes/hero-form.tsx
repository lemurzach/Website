"use client";

import { useActionState } from "react";
import type { Hero } from "@prisma/client";
import type { HeroFormState } from "./actions";

export function HeroForm({
  hero,
  action,
}: {
  hero?: Hero;
  action: (state: HeroFormState, formData: FormData) => Promise<HeroFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rank (1 = top)">
          <input
            name="rank"
            type="number"
            min={1}
            required
            defaultValue={hero?.rank}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={hero?.status ?? "ACTIVE"}
            className={inputClass}
          >
            <option value="ACTIVE">Active</option>
            <option value="RETIRED">Retired</option>
            <option value="MISSING">Missing</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Real name">
          <input
            name="name"
            required
            defaultValue={hero?.name}
            className={inputClass}
          />
        </Field>
        <Field label="Hero name">
          <input
            name="heroName"
            required
            defaultValue={hero?.heroName}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Agency / affiliation (optional)">
        <input
          name="agency"
          defaultValue={hero?.agency ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Image URL (optional)">
        <input
          name="imageUrl"
          defaultValue={hero?.imageUrl ?? ""}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      <Field label="Quirk name">
        <input
          name="quirk"
          required
          defaultValue={hero?.quirk}
          className={inputClass}
        />
      </Field>

      <Field label="Quirk description">
        <textarea
          name="quirkDescription"
          required
          rows={3}
          defaultValue={hero?.quirkDescription}
          className={inputClass}
        />
      </Field>

      <Field label="Bio">
        <textarea
          name="bio"
          required
          rows={5}
          defaultValue={hero?.bio}
          className={inputClass}
        />
      </Field>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {pending ? "Saving…" : hero ? "Save changes" : "Add hero"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500";
