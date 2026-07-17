import type { BadgeDefinition, BadgeId, GameState } from "@/lib/types";
import { getPantry } from "@/lib/pantry";

const KEY = "aindada-game";

const XP_SCAN = 10;
const XP_MANUAL = 5;
const XP_DAILY = 3;

export function defaultGame(): GameState {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: "",
    badges: [],
    totalScanned: 0,
    totalManualAdds: 0,
  };
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameState) : defaultGame();
  } catch {
    return defaultGame();
  }
}

function save(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // silencioso
  }
}

function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const BADGES: BadgeDefinition[] = [
  { id: "first-scan", label: "Primeiro Scan", description: "Escaneou o primeiro produto", icon: "📸" },
  { id: "catalogo-cheio", label: "Catálogo Cheio", description: "10 itens na dispensa", icon: "📦" },
  { id: "dispensa-cheia", label: "Dispensa Cheia", description: "50 itens na dispensa", icon: "🏪" },
  { id: "colecionador-laticinios", label: "Colecionador de Laticínios", description: "5 laticínios catalogados", icon: "🧀" },
  { id: "mestre-temperos", label: "Mestre dos Temperos", description: "5 temperos catalogados", icon: "🧂" },
  { id: "streak-7", label: "Streak 7", description: "7 dias consecutivos", icon: "🔥" },
  { id: "streak-30", label: "Streak 30", description: "30 dias consecutivos", icon: "💎" },
  { id: "sobrevivente", label: "Sobrevivente", description: "Item com mais de 1 ano vencido", icon: "🧟" },
];

function checkBadges(state: GameState): BadgeId[] {
  const newBadges: BadgeId[] = [];
  const pantry = getPantry();

  if (state.totalScanned >= 1 && !state.badges.includes("first-scan")) newBadges.push("first-scan");
  if (pantry.length >= 10 && !state.badges.includes("catalogo-cheio")) newBadges.push("catalogo-cheio");
  if (pantry.length >= 50 && !state.badges.includes("dispensa-cheia")) newBadges.push("dispensa-cheia");

  const dairyCount = pantry.filter((i) => i.category === "food" && i.name.toLowerCase().includes("leite")).length; // simplificado
  if (dairyCount >= 5 && !state.badges.includes("colecionador-laticinios")) newBadges.push("colecionador-laticinios");

  if (state.streak >= 7 && !state.badges.includes("streak-7")) newBadges.push("streak-7");
  if (state.streak >= 30 && !state.badges.includes("streak-30")) newBadges.push("streak-30");

  return newBadges;
}

export function addXp(amount: number): { state: GameState; newBadges: BadgeId[] } {
  const state = load();
  state.xp += amount;
  state.level = levelFromXp(state.xp);
  const newBadges = checkBadges(state);
  state.badges = [...state.badges, ...newBadges];
  save(state);
  return { state, newBadges };
}

export function recordScan(source: "scan" | "manual"): { state: GameState; newBadges: BadgeId[] } {
  const state = load();
  if (source === "scan") state.totalScanned += 1;
  else state.totalManualAdds += 1;

  const t = today();
  if (state.lastActiveDate !== t) {
    state.streak += 1;
    state.lastActiveDate = t;
    state.xp += XP_DAILY;
  }

  state.xp += source === "scan" ? XP_SCAN : XP_MANUAL;
  state.level = levelFromXp(state.xp);
  const newBadges = checkBadges(state);
  state.badges = [...state.badges, ...newBadges];
  save(state);
  return { state, newBadges };
}

export function getGame(): GameState {
  return load();
}
