import type { Status, Category } from "@/lib/types";

const pools: Record<Status, string[]> = {
  ok: [
    "Ta na luta.",
    "Relaxa, ainda da.",
    "De boa, pode usar.",
    "So sucesso.",
    "Nem ferrou, ainda presta.",
    "Ta novo ainda, parceiro.",
    "Pode mandar ver.",
    "Zero preocupacao.",
    "Suave na nave.",
    "Ta sussa, pode usar.",
    "Ta tranquilao, fecha.",
    "Ta no grau, coracao.",
    "Sangue bom, ta novo.",
    "Pode ir sem medo.",
    "Ta conservado, confia.",
  ],
  warn: [
    "Corre que ainda da tempo.",
    "Usa logo, porra.",
    "Nao deixa passar, caralho.",
    "E agora ou nunca, amigo.",
    "Aproveita enquanto da, porra.",
    "Ja ta na hora, acorda.",
    "Se nao usar agora, vai pro lixo.",
    "Para de enrolando e usa.",
    "Vai perder, coracao.",
    "Ultimo aviso, parceiro.",
    "Ta na corda bamba, usa logo.",
    "Ja ta esticando, nao da mole.",
    "Ta nos ultimos suspiros, parça.",
    "Se pah, usa hoje.",
    "Relogio ta correndo, irmao.",
  ],
  bad: [
    "Descarta essa merda.",
    "Ja era, amigo.",
    "Passou da hora, caralho.",
    "Ta podre, joga fora.",
    "Nao arrisca, descarta.",
    "Ta no lixo, irmao.",
    "Perdeu, playboy.",
    "Ja foi pro saco.",
    "Ta morto, enterra.",
    "Deu ruim, descarta.",
    "Ta vencido, nao adianta insistir.",
    "Agir como se ainda prestasse e escolha sua.",
    "Meteu essa? Ta vencido, po.",
    "Ta mais vencido que casamento de quem trai.",
    "Passou da validade e do bom senso.",
  ],
};

const categorySpecific: Record<Status, Partial<Record<Category, string[]>>> = {
  ok: {},
  warn: {},
  bad: {
    food: [
      "Barriga vai agradecer se descartar.",
      "Intoxicacao alimentar nao e meme.",
      "Ta mofado? Ja era, descarta.",
    ],
    cosmetic: [
      "Passar isso no rosto agora e crime.",
      "Ta vencido, nao adianta passar.",
      "Sua pele merece coisa melhor, descarta.",
    ],
    medicine: [
      "Remedio vencido nao faz efeito, descarta.",
      "Nao brinca com remedio vencido.",
      "Melhor ir no medico do que se automedicar.",
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

  counter = (counter + 1) % combined.length;
  return combined[counter] ?? mainPool[0] ?? "";
}
