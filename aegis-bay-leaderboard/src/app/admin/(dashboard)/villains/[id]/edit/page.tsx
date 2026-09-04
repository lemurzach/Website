import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VillainForm } from "../../villain-form";
import { updateVillain } from "../../actions";

export default async function EditVillainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const villain = await prisma.villain.findUnique({
    where: { id: Number(id) },
  });

  if (!villain) notFound();

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-100">
        Edit {villain.alias}
      </h2>
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <VillainForm
          villain={villain}
          action={updateVillain.bind(null, villain.id)}
        />
      </div>
    </div>
  );
}
