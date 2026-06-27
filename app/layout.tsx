import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio de Contenido IA",
  description: "Studio de contenido agéntico con humano-en-el-loop.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
