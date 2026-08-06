"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Draft {
  id: string;
  subject: string;
  body: string;
  status: string;
  errorMessage?: string | null;
}

export default function DraftEditor({
  prospectId,
  draft,
  contactEmail,
}: {
  prospectId: string;
  draft: Draft;
  contactEmail: string | null;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function save(status?: string) {
    setSaving(true);
    try {
      await fetch(`/api/prospects/${prospectId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id, subject, body, status }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    setSending(true);
    setSendError(null);
    try {
      await save(); // persist any unsaved edits first
      const res = await fetch(`/api/prospects/${prospectId}/draft/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to send");
      router.refresh();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const alreadySent = draft.status === "SENT";

  return (
    <div className="draft-editor">
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={alreadySent}
      />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} disabled={alreadySent} />
      <div className="draft-actions">
        <span className={`badge badge-${draft.status}`} style={{ alignSelf: "center" }}>
          {draft.status}
        </span>
        {!alreadySent && (
          <>
            <button onClick={() => save()} disabled={saving || sending}>
              Save
            </button>
            <button
              className="primary"
              onClick={handleSend}
              disabled={saving || sending || !contactEmail}
              title={!contactEmail ? "Add a contact email for this prospect first" : undefined}
            >
              {sending ? "Sending…" : "Send from my Gmail"}
            </button>
          </>
        )}
      </div>
      {!contactEmail && !alreadySent && (
        <p className="subtitle" style={{ marginTop: "0.5rem" }}>
          No contact email on file for this prospect — add one from the dashboard before sending.
        </p>
      )}
      {(sendError || draft.errorMessage) && (
        <p style={{ color: "#9b2226", marginTop: "0.5rem" }}>{sendError || draft.errorMessage}</p>
      )}
    </div>
  );
}
