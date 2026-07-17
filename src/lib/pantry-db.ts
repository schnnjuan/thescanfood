import { supabase, isSupabaseReady } from "./supabase";

export type PantryItem = {
  id: string;
  user_id: string;
  barcode: string;
  opened_date: string | null;
  expiry_date: string | null;
  after_open_days: number | null;
  added_at: string;
};

/** List pantry items for the current user. */
export async function listPantry(): Promise<PantryItem[]> {
  if (!isSupabaseReady()) return [];
  const { data } = await supabase!
    .from("pantry_items")
    .select("*")
    .order("added_at", { ascending: false });
  return data || [];
}

/** Add item to user's pantry. */
export async function addToPantry(params: {
  barcode: string;
  openedDate?: string;
  expiryDate?: string;
  afterOpenDays?: number;
}): Promise<PantryItem | null> {
  if (!isSupabaseReady()) return null;

  const user = (await supabase!.auth.getUser()).data.user;
  if (!user) return null;

  const { data } = await supabase!
    .from("pantry_items")
    .upsert(
      {
        user_id: user.id,
        barcode: params.barcode,
        opened_date: params.openedDate || null,
        expiry_date: params.expiryDate || null,
        after_open_days: params.afterOpenDays || null,
      },
      { onConflict: "user_id,barcode" },
    )
    .select()
    .maybeSingle();
  return data;
}

/** Remove item from user's pantry. */
export async function removeFromPantry(id: string): Promise<boolean> {
  if (!isSupabaseReady()) return false;
  const { error } = await supabase!.from("pantry_items").delete().eq("id", id);
  return !error;
}
