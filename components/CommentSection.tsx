"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Comment } from "@/lib/comments";
import { formatDateTime } from "@/lib/format";
import type { Session } from "@/lib/session";

type Props = { postId: string; comments: Comment[]; session: Session | null };

export default function CommentSection({ postId, comments, session }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "留言失敗");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <section className="comments">
      <h2>留言（{comments.length}）</h2>
      {comments.length === 0 ? (
        <p className="muted">還沒有留言，來搶頭香吧。</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-meta">
                <strong>{c.authorName}</strong>
                <time dateTime={c.createdAt}>
                  {formatDateTime(c.createdAt)}
                </time>
              </div>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      {session ? (
        <form onSubmit={onSubmit} className="post-form">
          <p className="muted">
            以 <strong>{session.name}</strong> 的身分留言
          </p>
          <label>
            留言
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              required
              maxLength={2000}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={saving}>
            {saving ? "送出中…" : "送出留言"}
          </button>
        </form>
      ) : (
        <p className="muted">請先在頁首登入，才能留言。</p>
      )}
    </section>
  );
}
