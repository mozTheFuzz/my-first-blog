import Link from "next/link";
import { listPosts } from "@/lib/posts";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, session] = await Promise.all([listPosts(), getSession()]);
  return (
    <>
      <div className="toolbar">
        <h1>文章列表</h1>
        {session && <Link href="/posts/new" className="button">新增文章</Link>}
      </div>
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
