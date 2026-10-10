import Link from "next/link";
import { listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await listPosts();
  return (
    <>
      <h1>文章列表</h1>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-card">
            <h2>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p>{post.summary}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
