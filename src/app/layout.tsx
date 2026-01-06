import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "@/src/components/SidebarLayout";

export const metadata: Metadata = {
  title: "Formulários",
  description: "Sistema de autenticação com Next.js e Cloudflare D1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
