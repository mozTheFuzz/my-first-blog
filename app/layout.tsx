import type { Metadata } from "next";
import Link from "next/link";
import AuthBar from "@/components/AuthBar";
import { getSession } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "My First Blog",
  description: "一個可以讓會員留言的部落格",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="zh-Hant">
      <body>
        <header className="site-header">
          <Link href="/" className="site-title">My First Blog</Link>
          <AuthBar session={session} />
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
