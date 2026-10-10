import Link from "next/link";
import PostForm from "@/components/PostForm";

export default function NewPostPage() {
  return (
    <>
      <p><Link href="/">← 返回列表</Link></p>
      <h1>新增文章</h1>
      <PostForm />
    </>
  );
}
