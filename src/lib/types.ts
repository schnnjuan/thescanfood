export type Category = "food" | "cosmetic" | "medicine" | "cleaning" | "other";

export type DateMode = "opened" | "expiry";

export type Status = "ok" | "warn" | "bad";

export type ShelfRule = {
  id: string;
  names: string[];
  label: string;
  category: Category;
  afterOpenDays?: number;
  unopenedShelfDays?: number;
  fridgeRequired?: boolean;
  tips: string[];
  sources?: string[];
  disclaimer?: string;
};

export type CheckInput = {
  query: string;
  date: string; // YYYY-MM-DD
  mode: DateMode;
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
};

export type CheckNotFound = {
  kind: "not_found";
  query: string;
  suggestions: ShelfRule[];
};

export type CheckOutcome = CheckResult | CheckNotFound;
