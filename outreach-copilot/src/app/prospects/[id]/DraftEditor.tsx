"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Draft {
  id: string;
  subject: string;
  body: string;
  status: string;
}

export default function DraftEditor({
  prospectId,
  draft,
}: {
  prospectId: string;
  draft: Draft;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="draft-editor">
      <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="draft-actions">
        <span className={`badge badge-${draft.status}`} style={{ alignSelf: "center" }}>
          {draft.status}
        </span>
        <button onClick={() => save()} disabled={saving}>
          Save
        </button>
        <button className="primary" onClick={() => save("APPROVED")} disabled={saving}>
          Approve
        </button>
      </div>
    </div>
  );
}
