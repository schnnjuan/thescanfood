"use client";

import Link from "next/link";
import seed from "@/data/seed.json";
import { ItemCount } from "@/components/ItemCount";

const STATIC_COUNT = seed.length;

const categories = [
  {
    label: "Comida",
    examples: "ketchup, maionese, leite, ovo, conserva",
  },
  {
    label: "Cosmetico",
    examples: "rimel, protetor solar, batom, shampoo",
  },
  {
    label: "Remedio",
    examples: "dipirona, ibuprofeno, colirio, pomada",
  },
  {
    label: "Limpeza",
    examples: "agua sanitaria, desinfetante, detergente",
  },
];

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-8 pt-0">

      <header className="flex items-center py-3">
        <span className="text-sm font-bold text-ink">thescan.<span className="text-accent">food</span></span>
        <span className="ml-auto text-xs text-muted">v1.0</span>
      </header>

      {/* hero */}
      <section className="flex flex-col gap-4 pt-6 pb-8">
        <h1 className="text-5xl font-extrabold leading-[1.05] text-ink">
          Ainda da<br />pra usar?
        </h1>
        <p className="text-sm leading-[1.6] text-muted">
          Ta vencido? Joga fora. Ta duvidando? Cheira.<br />
            3 segundos e voce descobre.
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/app"
            className="pressable flex h-11 items-center justify-center border border-ink bg-ink px-5 text-sm font-bold text-white"
          >
            Quero saber &rarr;
          </Link>
          <Link
            href="/app/scan"
            className="pressable flex h-11 items-center justify-center gap-1.5 border border-ink bg-white px-5 text-sm font-bold text-ink"
          >
            <span className="text-accent text-base leading-none">●</span>
            Escanear
          </Link>
        </div>
      </section>

      {/* stat bar */}
      <div className="flex items-center gap-3 py-3 text-xs text-muted border-t border-border">
        <ItemCount staticCount={STATIC_COUNT} />
      </div>

      {/* como funciona */}
      <section className="flex flex-col gap-3 border-t border-border py-7">
        <h2 className="text-sm font-bold text-ink">Como funciona</h2>
        <div className="flex flex-col gap-2">
          {[
            { step: "01", title: "Digita o item e a data", desc: "Autocomplete busca na base. Escolhe quando abriu ou a validade." },
            { step: "02", title: "Descobre se ainda presta", desc: "Semaforo verde/amarelo/vermelho + dias restantes + frase sincera." },
            { step: "03", title: "Compartilha (ou descarta)", desc: "Gera imagem 9:16 pro Instagram. Ou joga fora sem culpa." },
          ].map((s) => (
            <div key={s.step} className="flex gap-3 border border-border bg-white px-4 py-3">
              <span className="shrink-0 text-sm font-bold text-accent">{s.step}</span>
              <div>
                <p className="text-sm font-bold text-ink">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* categorias */}
      <section className="flex flex-col gap-3 border-t border-border py-7">
        <h2 className="text-sm font-bold text-ink">O que da pra checar</h2>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex flex-col border border-border bg-white px-4 py-3">
              <p className="text-sm font-bold text-ink">{cat.label}</p>
              <p className="mt-1 break-words text-xs text-muted">{cat.examples}</p>
            </div>
          ))}
        </div>
      </section>

      {/* cta final */}
      <section className="flex flex-col gap-4 border-t border-border py-7">
        <div className="flex flex-col gap-3 border border-ink bg-ink px-5 py-5">
          <p className="text-lg font-extrabold text-white">
            Para de duvidar.<br />Descobre.
          </p>
          <p className="text-xs text-white/70">
            <ItemCount staticCount={STATIC_COUNT} />. Gratis, sem cadastro.
          </p>
          <Link
            href="/app"
            className="pressable flex h-11 items-center justify-center border border-white bg-white text-sm font-bold text-ink"
          >
            Vem conferir
          </Link>
        </div>
      </section>

      <footer className="py-4 text-center text-xs text-muted">
        <p>Referencia geral — quando nao tem certeza, cheira.</p>
        <p className="mt-1">Nao substitui orientacao medica.</p>
      </footer>
    </div>
  );
}
