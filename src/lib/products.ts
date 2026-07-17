import { supabase, isSupabaseReady } from "./supabase";
import type { OFFProduct } from "./openfoodfacts";

export type Product = {
  barcode: string;
  name: string;
  category: string;
  after_open_days: number | null;
  brand: string | null;
  image_url: string | null;
  quantity: string | null;
  first_scanned_by: string | null;
  created_at: string;
  updated_at: string;
};

/** Look up a product by barcode in the global registry. */
export async function getProduct(barcode: string): Promise<Product | null> {
  if (!isSupabaseReady()) return null;
  const { data } = await supabase!
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();
  return data;
}

/** Create a new product from OFF data + barcode. */
export async function createProduct(
  barcode: string,
  off: OFFProduct | null,
  userId?: string,
): Promise<Product | null> {
  if (!isSupabaseReady()) return null;

  const now = new Date().toISOString();
  const product = {
    barcode,
    name: off?.name || barcode,
    category: off?.category || "food",
    after_open_days: categoryDefaultDays(off?.category || "food"),
    brand: off?.brand || null,
    image_url: off?.imageUrl || null,
    quantity: off?.quantity || null,
    first_scanned_by: userId || null,
    created_at: now,
    updated_at: now,
  };

  const { data } = await supabase!
    .from("products")
    .upsert(product, { onConflict: "barcode" })
    .select()
    .maybeSingle();
  return data;
}

function categoryDefaultDays(cat: string): number {
  switch (cat) {
    case "food": return 7;
    case "cosmetic": return 180;
    case "medicine": return 30;
    case "cleaning": return 90;
    default: return 30;
  }
}
