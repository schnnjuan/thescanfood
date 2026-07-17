export type NativeAd = {
  id: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
  /** Categoria opcional pra contextual */
  category?: "food" | "cosmetic" | "medicine" | "cleaning" | "general";
};

/**
 * Pool de anuncios nativos.
 * Rotaciona pra evitar sempre o mesmo.
 * Substituir os hrefs por links de afiliado (Amazon, ML, etc).
 */
const pool: NativeAd[] = [
  {
    id: "ad-repo",
    headline: "Precisa repor?",
    body: "Ketchup, maionese, temperos. Entrega rapida.",
    cta: "Ver precos",
    href: "https://amzn.to/4cYexample",
    category: "food",
  },
  {
    id: "ad-cosmetic",
    headline: "Cosmeticos com desconto",
    body: "Protetor solar, rimel, batom. Frete gratis.",
    cta: "Conferir",
    href: "https://amzn.to/4cYexample",
    category: "cosmetic",
  },
  {
    id: "ad-farma",
    headline: "Farmacia online",
    body: "Dipirona, ibuprofeno e mais. Sem sair de casa.",
    cta: "Ver remedios",
    href: "https://amzn.to/4cYexample",
    category: "medicine",
  },
  {
    id: "ad-limpeza",
    headline: "Produtos de limpeza",
    body: "Agua sanitaria, desinfetante, detergente. Oferta.",
    cta: "Ver ofertas",
    href: "https://amzn.to/4cYexample",
    category: "cleaning",
  },
  {
    id: "ad-geral",
    headline: "Mercado online",
    body: "Tudo que voce precisa, entregue em casa.",
    cta: "Fazer compras",
    href: "https://amzn.to/4cYexample",
    category: "general",
  },
];

let cursor = 0;

/** Pega o proximo ad do pool (round-robin). */
export function nextAd(category?: string): NativeAd {
  // tenta achar um ad da categoria, senao peqa o proximo
  const catMatch = category
    ? pool.find((a, i) => i >= cursor && a.category === category)
    : null;

  const ad = catMatch ?? pool[cursor % pool.length];
  cursor = (cursor + 1) % pool.length;
  return ad;
}
