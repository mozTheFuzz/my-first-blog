"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostInput } from "@/lib/posts";

type Props = { postId?: string; initial?: PostInput };

export default function PostForm({ postId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
      method: postId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, content }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "儲存失敗");
      return;
    }
    router.push(`/posts/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="post-form">
      <label>
        標題
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        摘要
        <input value={summary} onChange={(e) => setSummary(e.target.value)} required />
      </label>
      <label>
        內文
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? "儲存中…" : "儲存"}</button>
    </form>
  );
}
