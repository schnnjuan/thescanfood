import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AppRoot } from "@/components/AppRoot";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "thescan.food — Ainda da pra usar?",
  description:
    "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
  metadataBase: new URL("https://thescan.food"),
  openGraph: {
    title: "thescan.food — Ainda da pra usar?",
    description:
      "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
    locale: "pt_BR",
    type: "website",
    siteName: "thescan.food",
  },
  twitter: {
    card: "summary_large_image",
    title: "thescan.food — Ainda da pra usar?",
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
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener("touchstart",function(e){let t=e.target.closest(".pressable");if(t){t.dataset.pressed="true"}},{passive:true});document.addEventListener("touchend",function(e){let t=e.target.closest(".pressable");if(t){t.dataset.pressed=""}},{passive:true});document.addEventListener("touchcancel",function(e){let t=e.target.closest(".pressable");if(t){t.dataset.pressed=""}},{passive:true});`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink overflow-x-hidden">
        <AppRoot>{children}</AppRoot>
      </body>
    </html>
  );
}
