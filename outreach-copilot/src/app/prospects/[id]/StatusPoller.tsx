"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatusPoller() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [router]);

  return <p className="subtitle">Refreshing automatically while this runs…</p>;
}
