"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactEditor({
  prospectId,
  contactName,
  contactEmail,
}: {
  prospectId: string;
  contactName: string | null;
  contactEmail: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(contactName ?? "");
  const [email, setEmail] = useState(contactEmail ?? "");
  const [editing, setEditing] = useState(!contactEmail);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName: name, contactEmail: email }),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <p className="subtitle">
        Contact: {contactName || "—"} · {contactEmail}{" "}
        <button className="link-button" onClick={() => setEditing(true)}>
          edit
        </button>
      </p>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
      <input
        placeholder="Contact name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.4rem 0.6rem", border: "1px solid #ccc", borderRadius: 6 }}
      />
      <input
        placeholder="Contact email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "0.4rem 0.6rem", border: "1px solid #ccc", borderRadius: 6 }}
      />
      <button onClick={save} disabled={saving}>
        Save
      </button>
    </div>
  );
}
