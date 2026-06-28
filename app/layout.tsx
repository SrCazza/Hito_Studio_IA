import type { Metadata } from "next";
import { Calistoga, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hito IA Studio",
    template: "%s · Hito IA Studio",
  },
  description:
    "Tu asistente para el contenido pesado. La IA produce en volumen, lee tus datos y mejora tu marca; tú tienes el control y la última palabra con el semáforo.",
  applicationName: "Hito IA Studio",
  openGraph: {
    title: "Hito IA Studio",
    description:
      "Studio de contenido agéntico con humano-en-el-loop. La IA produce; tú apruebas con el semáforo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${calistoga.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
