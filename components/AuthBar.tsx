"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Session } from "@/lib/session";

export default function AuthBar({ session }: { session: Session | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  if (session) {
    return (
      <div className="auth-bar">
        <span>嗨，<strong>{session.name}</strong></span>
        <button onClick={logout} disabled={busy} className="button-small">登出</button>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      <a href="/api/auth/line" className="button-small line-button">使用 LINE 登入</a>
    </div>
  );
}
