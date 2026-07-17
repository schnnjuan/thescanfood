import type { Category, PantryItem, Source } from "@/lib/types";

const KEY = "aindada-pantry";

function load(): PantryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: PantryItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silencioso
  }
}

export function getPantry(): PantryItem[] {
  return load().sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}

export function addItem(input: {
  barcode?: string;
  name: string;
  category: Category;
  afterOpenDays: number;
  openedDate?: string;
  expiryDate?: string;
  source: Source;
  imageUrl?: string;
  brand?: string;
}): PantryItem {
  const items = load();
  const item: PantryItem = {
    id: `pantry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    barcode: input.barcode,
    name: input.name,
    category: input.category,
    afterOpenDays: input.afterOpenDays,
    openedDate: input.openedDate,
    expiryDate: input.expiryDate,
    source: input.source,
    addedAt: new Date().toISOString(),
    imageUrl: input.imageUrl,
    brand: input.brand,
  };
  items.unshift(item);
  save(items);
  return item;
}

export function removeItem(id: string): void {
  const items = load().filter((i) => i.id !== id);
  save(items);
}

export function clearPantry(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function pantryCount(): number {
  return load().length;
}
