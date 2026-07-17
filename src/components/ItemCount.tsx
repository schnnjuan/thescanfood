"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

const CUSTOM_RULES_KEY = "aindada-custom-rules";

type Props = {
  staticCount: number;
};

export function ItemCount({ staticCount }: Props) {
  const [total, setTotal] = useState(staticCount);
  const prevTotal = useRef(staticCount);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_RULES_KEY);
      if (raw) {
        const custom = JSON.parse(raw);
        setTotal(staticCount + (Array.isArray(custom) ? custom.length : 0));
      }
    } catch {
      // ignore
    }
  }, [staticCount]);

  const motionValue = useMotionValue(prevTotal.current);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });
  const rounded = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(total);
    prevTotal.current = total;
  }, [total, motionValue]);

  return (
    <motion.span>
      <motion.span key={total}>{rounded}</motion.span> itens na base
    </motion.span>
  );
}
