import seed from "@/data/seed.json";
import type {
  CheckInput,
  CheckOutcome,
  CheckResult,
  DateMode,
  ShelfRule,
  Status,
} from "@/lib/types";

const rules = seed as ShelfRule[];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreName(query: string, name: string): number {
  const q = normalize(query);
  const n = normalize(name);
  if (!q || !n) return 0;
  if (q === n) return 100;
  if (n.includes(q) || q.includes(n)) return 80;
  const qTokens = q.split(" ");
  const nTokens = n.split(" ");
  const overlap = qTokens.filter((t) => nTokens.some((nt) => nt.includes(t) || t.includes(nt)));
  if (overlap.length === 0) return 0;
  return 40 + (overlap.length / Math.max(qTokens.length, nTokens.length)) * 30;
}

export function searchItems(query: string, limit = 6): ShelfRule[] {
  const q = normalize(query);
  if (!q || q.length < 1) return [];
  return rules
    .map((rule) => ({
      rule,
      score: Math.max(...rule.names.map((n) => scoreName(q, n)), scoreName(q, rule.label)),
    }))
    .filter((x) => x.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.rule);
}

export function popularItems(): ShelfRule[] {
  const ids = ["ketchup", "rimel", "leite", "maionese", "protetor-solar"];
  return ids
    .map((id) => rules.find((r) => r.id === id))
    .filter((r): r is ShelfRule => Boolean(r));
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(from: Date, to: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / ms);
}

function statusFromDays(daysRemaining: number, totalWindow: number): Status {
  if (daysRemaining < 0) return "bad";
  if (daysRemaining === 0) return "warn";
  if (daysRemaining <= Math.max(2, Math.floor(totalWindow * 0.15))) return "warn";
  return "ok";
}

function labels(status: Status, daysRemaining: number): Pick<
  CheckResult,
  "statusLabel" | "daysLabel" | "tone"
> {
  if (status === "ok") {
    return {
      statusLabel: "Ainda dá",
      daysLabel: `${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}`,
      tone: "Tá na luta.",
    };
  }
  if (status === "warn") {
    if (daysRemaining === 0) {
      return {
        statusLabel: "Atenção",
        daysLabel: "usa hoje",
        tone: "Usa logo.",
      };
    }
    if (daysRemaining < 0) {
      return {
        statusLabel: "Não dá mais",
        daysLabel: `venceu há ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? "dia" : "dias"}`,
        tone: "Descarta. Zero drama.",
      };
    }
    return {
      statusLabel: "Atenção",
      daysLabel: `${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}`,
      tone: "Usa logo.",
    };
  }
  return {
    statusLabel: "Não dá mais",
    daysLabel: `venceu há ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? "dia" : "dias"}`,
    tone: "Descarta. Zero drama.",
  };
}

const severityOrder: Record<Status, number> = { ok: 0, warn: 1, bad: 2 };
function worse(a: Status, b: Status): Status {
  return severityOrder[a] >= severityOrder[b] ? a : b;
}

export function checkItem(input: CheckInput): CheckOutcome {
  const hits = searchItems(input.query, 1);
  if (hits.length === 0) {
    const partial = searchItems(input.query.slice(0, 3), 4);
    return {
      kind: "not_found",
      query: input.query,
      suggestions: partial.length ? partial : popularItems().slice(0, 4),
    };
  }

  const rule = hits[0];
  const today = new Date();

  // avalia cada data fornecida e pega a pior
  let best: { status: Status; daysRemaining: number; daysSince: number; windowDays: number; decidingDate: string; decidingMode: DateMode } | null = null;

  function evalDate(dateIso: string, mode: DateMode) {
    const ref = parseLocalDate(dateIso);
    let daysR: number;
    let daysS: number;
    let win: number;
    if (mode === "expiry") {
      daysR = daysBetween(today, ref);
      daysS = daysBetween(ref, today);
      win = Math.max(1, Math.abs(daysR) || 1);
    } else {
      const openDays = rule.afterOpenDays ?? 7;
      daysS = daysBetween(ref, today);
      daysR = openDays - daysS;
      win = openDays;
    }
    const st = statusFromDays(daysR, win);
    if (!best || severityOrder[st] > severityOrder[best.status]) {
      best = { status: st, daysRemaining: daysR, daysSince: daysS, windowDays: win, decidingDate: dateIso, decidingMode: mode };
    }
  }

  if (input.openedDate) evalDate(input.openedDate, "opened");
  if (input.expiryDate) evalDate(input.expiryDate, "expiry");

  // se nenhuma data fornecida, assume aberto hoje
  if (!best) {
    const hoje = new Date();
    const iso = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
    evalDate(iso, "opened");
  }

  const { status, daysRemaining, decidingDate, decidingMode } = best!;
  const { statusLabel, daysLabel, tone } = labels(status, daysRemaining);

  return {
    kind: "hit",
    rule,
    status,
    daysRemaining,
    daysSince: best!.daysSince,
    statusLabel,
    daysLabel,
    tone,
    decidingDate,
    decidingMode,
  };
}

export { rules };
