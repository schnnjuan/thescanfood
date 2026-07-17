import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ADSENSE } from "@/lib/ads";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AindaDa — Ainda da pra usar?",
  description:
    "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
  metadataBase: new URL("https://aindada.app"),
  openGraph: {
    title: "AindaDa — Ainda da pra usar?",
    description:
      "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
    locale: "pt_BR",
    type: "website",
    siteName: "AindaDa",
  },
  twitter: {
    card: "summary_large_image",
    title: "AindaDa — Ainda da pra usar?",
    description:
      "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink overflow-x-hidden">
        {children}
        {ADSENSE.client && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.client}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
