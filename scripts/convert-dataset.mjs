#!/usr/bin/env node
/**
 * Convert dataset JSON to ShelfRule format and merge with seed.json
 * Usage: bun scripts/convert-dataset.mjs path/to/dataset.json
 *        bun scripts/convert-dataset.mjs path/to/dataset.json --dry-run
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const SEED_PATH = resolve(import.meta.dirname, "../src/data/seed.json");

const CAT_MAP = {
  alimentos: "food",
  bebidas: "food",
  laticinios: "food",
  laticínios: "food",
  carnes: "food",
  hortifruti: "food",
  hortifrúti: "food",
  graos: "food",
  grãos: "food",
  conservas: "food",
  congelados: "food",
  doces: "food",
  temperos: "food",
  molhos: "food",
  massas: "food",
  padaria: "food",
  frutas: "food",
  legumes: "food",
  verduras: "food",
  enlatados: "food",
  "leites e bebidas lacteas": "food",
  cosmeticos: "cosmetic",
  cosméticos: "cosmetic",
  "higiene pessoal": "cosmetic",
  "beleza e higiene": "cosmetic",
  beleza: "cosmetic",
  cabelo: "cosmetic",
  pele: "cosmetic",
  maquiagem: "cosmetic",
  cuidados: "cosmetic",
  higiene: "cosmetic",
  perfumaria: "cosmetic",
  medicamentos: "medicine",
  medicamento: "medicine",
  farmacia: "medicine",
  farmácia: "medicine",
  remedios: "medicine",
  remédios: "medicine",
  limpeza: "cleaning",
  "produtos de limpeza": "cleaning",
};

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapCategory(cat) {
  const key = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CAT_MAP[key] || "other";
}

function convertItem(item) {
  const r = {
    id: `item-${item.id}`,
    names: [item.nome.toLowerCase(), ...item.nome.toLowerCase().split(" ")],
    label: item.nome,
    category: mapCategory(item.categoria),
    tips: item.dicas || [],
  };

  // deduplicate names
  r.names = [...new Set(r.names)];

  if (item.tipo_data === "abertura" && item.dias_apos_abertura != null) {
    r.afterOpenDays = item.dias_apos_abertura;
  }

  if (item.categoria?.toLowerCase().includes("medic")) {
    r.disclaimer = "Nao substitui orientacao medica ou o rotulo do produto.";
  }

  return r;
}

function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const dryRun = args.includes("--dry-run");

  if (!filePath) {
    console.error("Usage: bun scripts/convert-dataset.mjs path/to/dataset.json [--dry-run]");
    process.exit(1);
  }

  // read dataset
  const raw = readFileSync(filePath, "utf-8");
  const dataset = JSON.parse(raw);
  const items = dataset.itens || dataset;
  console.error(`Read ${items.length} items from dataset`);

  // convert
  const converted = items.map(convertItem);
  console.error(`Converted ${converted.length} items`);

  // deduplicate by normalized label among converted
  const seen = new Set();
  const unique = converted.filter((item) => {
    const key = normalize(item.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.error(`After dedup within dataset: ${unique.length}`);

  // read existing seed
  const existing = existsSync(SEED_PATH) ? JSON.parse(readFileSync(SEED_PATH, "utf-8")) : [];
  console.error(`Existing seed items: ${existing.length}`);

  // filter new items that don't overlap with existing (by normalized label)
  const existingLabels = new Set(existing.map((r) => normalize(r.label)));
  const newItems = unique.filter((item) => !existingLabels.has(normalize(item.label)));
  console.error(`New unique items (not in seed): ${newItems.length}`);

  const merged = [...existing, ...newItems];

  if (dryRun) {
    console.log(JSON.stringify(newItems.slice(0, 5), null, 2));
    console.error(`--- Dry run complete. Would add ${newItems.length} new items.`);
  } else {
    writeFileSync(SEED_PATH, JSON.stringify(merged, null, 2) + "\n");
    console.error(`Wrote ${merged.length} items to ${SEED_PATH}`);
  }
}

main();
