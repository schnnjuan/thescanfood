import type { Status, Category } from "@/lib/types";

const pools: Record<Status, string[]> = {
  ok: [
    "Tá na luta.",
    "Relaxa, ainda dá.",
    "De boa, pode usar.",
    "Só sucesso.",
    "Nem ferrou, ainda presta.",
    "Ta novo ainda, parceiro.",
    "Pode mandar ver.",
    "Zero preocupação.",
    "Tá sussa, pode usar.",
    "Vai fundo, ta safe.",
  ],
  warn: [
    "Corre que ainda dá tempo.",
    "Usa logo, porra.",
    "Não deixa passar, caralho.",
    "É agora ou nunca, amigo.",
    "Aproveita enquanto dá, porra.",
    "Já ta na hora, acorda.",
    "Se não usar agora, vai pro lixo.",
    "Para de enrolando e usa.",
    "Vai perder, coração.",
    "Último aviso, parceiro.",
  ],
  bad: [
    "Descarta essa merda.",
    "Já era, amigo.",
    "Passou da hora, caralho.",
    "Tá podre, joga fora.",
    "Não arrisca, descarta.",
    "Tá no lixo, irmão.",
    "Perdeu, playboy.",
    "Já foi pro saco.",
    "Ta morto, enterra.",
    "Deu ruim, descarta.",
  ],
};

const categorySpecific: Record<Status, Partial<Record<Category, string[]>>> = {
  ok: {},
  warn: {},
  bad: {
    food: [
      "Barriga vai agradecer se descartar.",
      "Intoxicação alimentar não é meme.",
    ],
    cosmetic: [
      "Passar isso no rosto agora é crime.",
      "Tá vencido, não adianta passar.",
    ],
    medicine: [
      "Remédio vencido não faz efeito, descarta.",
      "Não brinca com remédio vencido.",
    ],
  },
};

let counter = 0;

export function pickPhrase(status: Status, category?: Category): string {
  const catPool = category
    ? categorySpecific[status]?.[category] ?? []
    : [];
  const mainPool = pools[status];
  const combined = [...catPool, ...mainPool];

  // Deterministic-ish rotation so user sees diff phrases each check
  counter = (counter + 1) % combined.length;
  return combined[counter] ?? mainPool[0] ?? "";
}

export function pickSharePhrase(status: Status): string {
  const share = {
    ok: [
      "Ainda dá, relaxa 👌",
      "Ta safe ainda 👊",
      "Pode usar sem medo ✅",
    ],
    warn: [
      "Usa logo senão perde ⚠️",
      "Corre que ainda dá ⏰",
    ],
    bad: [
      "Descarta isso antes que exploda 💀",
      "Já era, pro lixo 🗑️",
    ],
  };
  const p = share[status];
  return p[counter % p.length];
}
