export const springs = {
  snappy: { type: "spring" as const, stiffness: 300, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 10 },
  instant: { type: "spring" as const, stiffness: 600, damping: 35 },
  release: { type: "spring" as const, stiffness: 200, damping: 20, restDelta: 0.001 },
};

export const duration = {
  instant: 0.08,
  fast: 0.18,
  normal: 0.35,
  slow: 0.6,
  crawl: 1.0,
};

export const distance = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 48,
};

export const scale = {
  subtle: 0.98,
  press: 0.95,
  pop: 1.04,
};
