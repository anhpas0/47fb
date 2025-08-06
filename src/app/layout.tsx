import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Import Link

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Công cụ đăng bài",
  description: "Tạo bởi Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          <header className="pb-4 mb-6 border-b">
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-blue-600 hover:underline font-bold">Công cụ đăng bài</Link>
              <Link href="/admin" className="text-blue-600 hover:underline font-bold">Quản trị (Admin)</Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}