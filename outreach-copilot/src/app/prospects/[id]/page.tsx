import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOrgSession } from "@/lib/session";
import DraftEditor from "./DraftEditor";
import StatusPoller from "./StatusPoller";
import ContactEditor from "./ContactEditor";

export default async function ProspectPage({
  params,
}: PageProps<"/prospects/[id]">) {
  const { id } = await params;
  const { organizationId } = await requireOrgSession();

  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { insights: true, drafts: { orderBy: { createdAt: "desc" } } },
  });

  if (!prospect || prospect.organizationId !== organizationId) notFound();

  const isInFlight = prospect.status === "PENDING" || prospect.status === "ANALYZING";

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← All prospects
      </Link>
      <h1>{prospect.companyName}</h1>
      <p className="subtitle">
        {prospect.website} · <span className={`badge badge-${prospect.status}`}>{prospect.status}</span>
      </p>

      <ContactEditor
        prospectId={prospect.id}
        contactName={prospect.contactName}
        contactEmail={prospect.contactEmail}
      />

      {isInFlight && <StatusPoller />}

      {prospect.status === "FAILED" && (
        <p style={{ color: "#9b2226", marginBottom: "1.5rem" }}>
          Analysis failed: {prospect.errorMessage}
        </p>
      )}

      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Insights</h2>
      {prospect.insights.length === 0 ? (
        <p className="empty-state">
          {isInFlight ? "Analyzing…" : "No insights yet."}
        </p>
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
        <p className="empty-state">{isInFlight ? "Drafting…" : "No draft yet."}</p>
      ) : (
        <DraftEditor
          prospectId={prospect.id}
          draft={prospect.drafts[0]}
          contactEmail={prospect.contactEmail}
        />
      )}
    </div>
  );
}
