import type { Metadata } from "next";
import { AindaDaApp } from "@/components/AindaDaApp";

export const metadata: Metadata = {
  title: "AindaDa — Checar item",
  description:
    "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
  openGraph: {
    title: "AindaDa — Checar item",
    description:
      "Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda da pra usar.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function AppPage() {
  return <AindaDaApp />;
}
