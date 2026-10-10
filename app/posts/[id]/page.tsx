import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  return (
    <article>
      <p className="toolbar">
        <Link href="/">← 返回列表</Link>
        <Link href={`/posts/${post.id}/edit`} className="button">編輯文章</Link>
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
    </article>
  );
}
