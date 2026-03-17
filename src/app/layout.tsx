import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RedNote Translate - 小红书体翻译器",
  description:
    "把普通文字翻译成小红书风格文案，支持种草体、探店体、情感体、干货体、炫富体等多种风格",
  keywords: ["小红书", "文案", "翻译器", "种草", "爆款"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
