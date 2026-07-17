export type Category = "food" | "cosmetic" | "medicine" | "cleaning" | "other";

export type DateMode = "opened" | "expiry";

export type Status = "ok" | "warn" | "bad";

export type ShelfRule = {
  id: string;
  names: string[];
  label: string;
  category: Category;
  afterOpenDays?: number;
  tips: string[];
  disclaimer?: string;
};

export type CheckInput = {
  query: string;
  openedDate?: string; // YYYY-MM-DD, quando abriu
  expiryDate?: string; // YYYY-MM-DD, validade
};

export type CheckResult = {
  kind: "hit";
  rule: ShelfRule;
  status: Status;
  daysRemaining: number;
  daysSince: number;
  statusLabel: string;
  daysLabel: string;
  tone: string;
  decidingDate: string; // YYYY-MM-DD da data que determinou
  decidingMode: DateMode; // qual data "venceu"
};

export type CheckNotFound = {
  kind: "not_found";
  query: string;
  suggestions: ShelfRule[];
};

export type CheckOutcome = CheckResult | CheckNotFound;

// --- game / pantry ---

export type Source = "scan" | "manual";

export type PantryItem = {
  id: string;
  barcode?: string;
  name: string;
  category: Category;
  afterOpenDays: number;
  openedDate?: string;
  expiryDate?: string;
  source: Source;
  addedAt: string;
  imageUrl?: string;
  brand?: string;
};

export type BadgeId =
  | "first-scan"
  | "catalogo-cheio"
  | "dispensa-cheia"
  | "colecionador-laticinios"
  | "mestre-temperos"
  | "streak-7"
  | "streak-30"
  | "sobrevivente";

export type BadgeDefinition = {
  id: BadgeId;
  label: string;
  description: string;
  icon: string;
};

export type GameState = {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  badges: BadgeId[];
  totalScanned: number;
  totalManualAdds: number;
};
