import type { DangerLevel, HeroStatus, VillainStatus } from "@prisma/client";

const heroStatusStyles: Record<HeroStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  RETIRED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  MISSING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const heroStatusLabels: Record<HeroStatus, string> = {
  ACTIVE: "Active",
  RETIRED: "Retired",
  MISSING: "Missing",
};

export function HeroStatusBadge({ status }: { status: HeroStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${heroStatusStyles[status]}`}
    >
      {heroStatusLabels[status]}
    </span>
  );
}

const villainStatusStyles: Record<VillainStatus, string> = {
  AT_LARGE: "bg-red-500/15 text-red-400 border-red-500/30",
  CAPTURED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const villainStatusLabels: Record<VillainStatus, string> = {
  AT_LARGE: "At large",
  CAPTURED: "Captured",
};

export function VillainStatusBadge({ status }: { status: VillainStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${villainStatusStyles[status]}`}
    >
      {villainStatusLabels[status]}
    </span>
  );
}

const dangerStyles: Record<DangerLevel, string> = {
  LOW: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  MODERATE: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  EXTREME: "bg-red-500/15 text-red-400 border-red-500/30",
};

const dangerLabels: Record<DangerLevel, string> = {
  LOW: "Low danger",
  MODERATE: "Moderate danger",
  HIGH: "High danger",
  EXTREME: "Extreme danger",
};

export function DangerBadge({ level }: { level: DangerLevel }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${dangerStyles[level]}`}
    >
      {dangerLabels[level]}
    </span>
  );
}
