import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FluxFX — Currency Studio",
  description: "Все курсы мира, история обменов и AI-помощник",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
