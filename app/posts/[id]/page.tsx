import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import { listComments } from "@/lib/comments";
import { getPost } from "@/lib/posts";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const [comments, session] = await Promise.all([listComments(id), getSession()]);
  return (
    <article>
      <p className="toolbar">
        <Link href="/">← 返回列表</Link>
        {session && <Link href={`/posts/${post.id}/edit`} className="button">編輯文章</Link>}
      </p>
      <h1>{post.title}</h1>
      <p className="summary">{post.summary}</p>
      <div className="content">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <p>
        <Link href="/">← 返回列表</Link>
      </p>
      <CommentSection postId={post.id} comments={comments} session={session} />
    </article>
  );
}
