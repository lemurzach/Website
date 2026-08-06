"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProspectListItem {
  id: string;
  companyName: string;
  website: string;
  status: string;
  drafts: { id: string; status: string }[];
}

export default function Home() {
  const [prospects, setProspects] = useState<ProspectListItem[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProspects(): Promise<ProspectListItem[]> {
    const res = await fetch("/api/prospects");
    return res.json();
  }

  useEffect(() => {
    let ignore = false;
    fetchProspects().then((data) => {
      if (!ignore) setProspects(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, website }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to add prospect");
      setCompanyName("");
      setWebsite("");
      setProspects(await fetchProspects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>Outreach Copilot</h1>
      <p className="subtitle">
        Add a prospect. It scrapes their site, checks SEO and ad activity, then drafts a
        personalized email grounded in what it actually finds.
      </p>

      <form className="add-prospect" onSubmit={handleSubmit}>
        <input
          placeholder="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          placeholder="Website (e.g. example.com)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Analyzing… (this can take up to a minute)" : "Add prospect"}
        </button>
      </form>
      {error && <p style={{ color: "#9b2226", marginBottom: "1rem" }}>{error}</p>}

      {prospects.length === 0 ? (
        <p className="empty-state">No prospects yet. Add one above to get started.</p>
      ) : (
        <div className="prospect-list">
          {prospects.map((p) => (
            <Link key={p.id} href={`/prospects/${p.id}`} className="prospect-card">
              <div>
                <div className="prospect-name">{p.companyName}</div>
                <div className="prospect-site">{p.website}</div>
              </div>
              <span className={`badge badge-${p.status}`}>{p.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
