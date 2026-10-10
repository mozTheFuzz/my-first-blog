"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Session } from "@/lib/session";

export default function AuthBar({ session }: { session: Session | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "登入失敗");
      return;
    }
    setName("");
    router.refresh();
  }

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
    <form onSubmit={login} className="auth-bar">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="輸入暱稱登入"
        required
        maxLength={30}
      />
      <button type="submit" disabled={busy} className="button-small">登入</button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}
