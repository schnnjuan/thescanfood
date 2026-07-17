import { describe, it, expect } from "vitest";
import { searchItems, checkItem, popularItems } from "./match";
import type { ShelfRule } from "./types";

describe("searchItems", () => {
  it("returns exact match first", () => {
    const hits = searchItems("ketchup");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBe("ketchup");
  });

  it("returns match for lowercase query", () => {
    const hits = searchItems("KETCHUP");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBe("ketchup");
  });

  it("returns match with diacritics normalized", () => {
    const hits = searchItems("maionese");
    expect(hits.some((h) => h.id === "maionese")).toBe(true);
  });

  it("returns empty for gibberish", () => {
    const hits = searchItems("xyzxyzxyz");
    expect(hits.length).toBe(0);
  });

  it("includes extraRules when provided", () => {
    const custom: ShelfRule = {
      id: "custom-unique-123",
      names: ["produto ultra especifico teste"],
      label: "Produto Teste",
      category: "other",
      afterOpenDays: 7,
      tips: [],
    };
    const hits = searchItems("produto ultra especifico teste", 6, [custom]);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBe("custom-unique-123");

    const hits2 = searchItems("ketchup", 6, [custom]);
    expect(hits2.length).toBeGreaterThan(0);
    expect(hits2[0].id).toBe("ketchup");
  });

  it("respects limit", () => {
    const hits = searchItems("leite", 2);
    expect(hits.length).toBeLessThanOrEqual(2);
  });

  it("returns empty for empty query", () => {
    const hits = searchItems("");
    expect(hits.length).toBe(0);
  });
});

describe("checkItem", () => {
  it("returns hit for known item", () => {
    const result = checkItem({ query: "ketchup", openedDate: "2026-07-01" });
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.rule.id).toBe("ketchup");
    }
  });

  it("returns not_found for unknown item", () => {
    const result = checkItem({ query: "xyzxyzxyz", openedDate: "2026-07-01" });
    expect(result.kind).toBe("not_found");
    if (result.kind === "not_found") {
      expect(result.suggestions.length).toBeGreaterThan(0);
    }
  });

  it("uses extraRules for matching", () => {
    const custom: ShelfRule = {
      id: "custom-1",
      names: ["meu-item-custom"],
      label: "Meu Item Custom",
      category: "other",
      afterOpenDays: 30,
      tips: [],
    };
    const result = checkItem({ query: "meu-item-custom", openedDate: "2026-07-01" }, [custom]);
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.rule.id).toBe("custom-1");
    }
  });

  it("returns not_found even with extraRules when unknown", () => {
    const custom: ShelfRule = {
      id: "custom-1",
      names: ["meu-item"],
      label: "Meu Item",
      category: "other",
      afterOpenDays: 30,
      tips: [],
    };
    const result = checkItem({ query: "zyxwv", openedDate: "2026-07-01" }, [custom]);
    expect(result.kind).toBe("not_found");
  });

  it("returns bad status for expired item", () => {
    const result = checkItem({ query: "ketchup", openedDate: "2020-01-01" });
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.status).toBe("bad");
      expect(result.daysRemaining).toBeLessThan(0);
    }
  });

  it("returns ok for recently opened item", () => {
    const result = checkItem({ query: "ketchup", openedDate: "2026-07-16" });
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.daysRemaining).toBeGreaterThan(0);
    }
  });

  it("uses fallback today if no date provided", () => {
    const result = checkItem({ query: "ketchup" });
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.decidingMode).toBe("opened");
    }
  });
});

describe("popularItems", () => {
  it("returns array of items", () => {
    const items = popularItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(5);
  });

  it("each item has required fields", () => {
    const items = popularItems();
    for (const item of items) {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.names.length).toBeGreaterThan(0);
    }
  });
});
