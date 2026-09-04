"use client";

import { useActionState } from "react";
import type { Villain } from "@prisma/client";
import type { VillainFormState } from "./actions";

export function VillainForm({
  villain,
  action,
}: {
  villain?: Villain;
  action: (
    state: VillainFormState,
    formData: FormData
  ) => Promise<VillainFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Real name">
          <input
            name="name"
            required
            defaultValue={villain?.name}
            className={inputClass}
          />
        </Field>
        <Field label="Alias">
          <input
            name="alias"
            required
            defaultValue={villain?.alias}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Bounty ($)">
          <input
            name="bounty"
            type="number"
            min={0}
            required
            defaultValue={villain?.bounty}
            className={inputClass}
          />
        </Field>
        <Field label="Danger level">
          <select
            name="dangerLevel"
            defaultValue={villain?.dangerLevel ?? "MODERATE"}
            className={inputClass}
          >
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="EXTREME">Extreme</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={villain?.status ?? "AT_LARGE"}
            className={inputClass}
          >
            <option value="AT_LARGE">At large</option>
            <option value="CAPTURED">Captured</option>
          </select>
        </Field>
      </div>

      <Field label="Last known location (optional)">
        <input
          name="lastKnownLocation"
          defaultValue={villain?.lastKnownLocation ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Image URL (optional)">
        <input
          name="imageUrl"
          defaultValue={villain?.imageUrl ?? ""}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      <Field label="Quirk name">
        <input
          name="quirk"
          required
          defaultValue={villain?.quirk}
          className={inputClass}
        />
      </Field>

      <Field label="Quirk description">
        <textarea
          name="quirkDescription"
          required
          rows={3}
          defaultValue={villain?.quirkDescription}
          className={inputClass}
        />
      </Field>

      <Field label="Bio">
        <textarea
          name="bio"
          required
          rows={5}
          defaultValue={villain?.bio}
          className={inputClass}
        />
      </Field>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {pending ? "Saving…" : villain ? "Save changes" : "Add villain"}
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
