import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "My First Blog",
  description: "一個可以讓會員留言的部落格",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="site-header">
          <Link href="/" className="site-title">My First Blog</Link>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
