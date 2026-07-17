/**
 * Configuracao de anuncios reais.
 * Preencher variaveis de ambiente ou editar os valores abaixo.
 */

export const ADSENSE = {
  /** Ex: "ca-pub-1234567890123456" */
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  /** Slot da LP (entre categorias) */
  slotLP: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LP || "XXXXXX",
  /** Slot do resultado (entre card e share) */
  slotResult: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT || "XXXXXX",
};

export const AMAZON = {
  /** Ex: "seunome-20" */
  tag: process.env.NEXT_PUBLIC_AMAZON_TAG || "aindada-20",
};

export function amazonSearchUrl(product: string): string {
  const q = encodeURIComponent(product);
  return `https://www.amazon.com.br/s/?field-keywords=${q}&tag=${AMAZON.tag}`;
}
