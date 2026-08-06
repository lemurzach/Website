import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DraftEditor from "./DraftEditor";

export default async function ProspectPage({
  params,
}: PageProps<"/prospects/[id]">) {
  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { insights: true, drafts: { orderBy: { createdAt: "desc" } } },
  });

  if (!prospect) notFound();

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← All prospects
      </Link>
      <h1>{prospect.companyName}</h1>
      <p className="subtitle">
        {prospect.website} · <span className={`badge badge-${prospect.status}`}>{prospect.status}</span>
      </p>

      {prospect.status === "FAILED" && (
        <p style={{ color: "#9b2226", marginBottom: "1.5rem" }}>
          Analysis failed: {prospect.errorMessage}
        </p>
      )}

      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Insights</h2>
      {prospect.insights.length === 0 ? (
        <p className="empty-state">No insights yet.</p>
      ) : (
        prospect.insights.map((insight) => (
          <div className="insight" key={insight.id}>
            <div className="category">{insight.category}</div>
            <div>{insight.summary}</div>
          </div>
        ))
      )}

      <h2 style={{ fontSize: "1.05rem", marginTop: "2rem", marginBottom: "0.75rem" }}>
        Email draft
      </h2>
      {prospect.drafts.length === 0 ? (
        <p className="empty-state">No draft yet.</p>
      ) : (
        <DraftEditor prospectId={prospect.id} draft={prospect.drafts[0]} />
      )}
    </div>
  );
}
