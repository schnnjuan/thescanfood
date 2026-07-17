const BASE = "https://world.openfoodfacts.org/api/v2";

export type OFFProduct = {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  quantity?: string;
};

type OFFResponse = {
  status: number;
  code: string;
  product?: {
    product_name?: string;
    product_name_pt?: string;
    brands?: string;
    categories_tags?: string[];
    image_url?: string;
    image_small_url?: string;
    quantity?: string;
  };
};

const CAT_MAP: Record<string, string> = {
  "en:beverages": "food",
  "en:dairy": "food",
  "en:meats": "food",
  "en:vegetables": "food",
  "en:fruits": "food",
  "en:snacks": "food",
  "en:condiments": "food",
  "en:cereals": "food",
  "en:chocolates": "food",
  "en:oils": "food",
  "en:sugary-snacks": "food",
  "en:salted": "food",
  "en:pet-food": "other",
};

export async function fetchByBarcode(barcode: string): Promise<OFFProduct | null> {
  try {
    const res = await fetch(`${BASE}/product/${barcode}.json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data: OFFResponse = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name = p.product_name_pt || p.product_name || "";
    if (!name) return null;

    const catTag = p.categories_tags?.find((t) => CAT_MAP[t]);
    const category = catTag ? CAT_MAP[catTag] : "food";

    return {
      barcode: data.code,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      brand: p.brands || undefined,
      category,
      imageUrl: p.image_small_url || p.image_url || undefined,
      quantity: p.quantity || undefined,
    };
  } catch {
    return null;
  }
}
