"use client";

import { useEffect, useState } from "react";

const CUSTOM_RULES_KEY = "aindada-custom-rules";

type Props = {
  staticCount: number;
};

export function ItemCount({ staticCount }: Props) {
  const [total, setTotal] = useState(staticCount);

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

  return <span>{total.toLocaleString("pt-BR")} itens na base</span>;
}
