import Link from "next/link";
import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import { getPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  return (
    <>
      <p><Link href={`/posts/${id}`}>← 返回文章</Link></p>
      <h1>編輯文章</h1>
      <PostForm postId={id} initial={{ title: post.title, summary: post.summary, content: post.content }} />
    </>
  );
}
