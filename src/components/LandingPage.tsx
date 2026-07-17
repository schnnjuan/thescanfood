import Link from "next/link";
import { NativeAd } from "@/components/NativeAd";

const categories = [
  {
    label: "Comida",
    emoji: null,
    examples: "ketchup, maionese, leite, ovo, conserva",
  },
  {
    label: "Cosmetico",
    emoji: null,
    examples: "rimel, protetor solar, batom, shampoo",
  },
  {
    label: "Remedio",
    emoji: null,
    examples: "dipirona, ibuprofeno, colirio, pomada",
  },
  {
    label: "Limpeza",
    emoji: null,
    examples: "agua sanitaria, desinfetante, detergente",
  },
];

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-8 pt-1">
      {/* header */}
      <header className="flex items-center py-3">
        <span className="text-base font-semibold tracking-tight text-ink">
          AindaDa
        </span>
      </header>

      <main className="flex flex-1 flex-col gap-14 pt-8">
        {/* hero */}
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-ink leading-tight">
              Ainda da pra usar?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda presta.
            </p>
          </div>

          <Link
            href="/app"
            className="pressable flex h-12 w-full items-center justify-center rounded-xl bg-cta text-base font-semibold text-cta-on"
          >
            Quero saber &rarr;
          </Link>

          <p className="text-xs text-muted">
            Gratis, sem cadastro. Milhares de itens na base.
          </p>
        </section>

        {/* como funciona */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-ink">Como funciona</h2>
          <div className="flex flex-col gap-3">
            {[
              { step: "1", title: "Digita o item e a data", desc: "Autocomplete busca na base. Escolhe data de abertura ou validade." },
              { step: "2", title: "Descobre se ainda presta", desc: "Semaforo verde/amarelo/vermelho + dias restantes + frase sincera." },
              { step: "3", title: "Compartilha (ou descarta)", desc: "Gera imagem 9:16 pro Instagram. Ou joga fora sem culpa." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 rounded-xl border border-border bg-surface px-4 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-bold text-cta-on">
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ad slot — AdSense nativo */}
        <NativeAd slot="lp" />

        {/* categorias */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-ink">O que da pra checar</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.label} className="rounded-xl border border-border bg-surface px-4 py-4">
                <p className="font-semibold text-ink">{cat.label}</p>
                <p className="mt-1 text-xs text-muted">{cat.examples}</p>
              </div>
            ))}
          </div>
        </section>

        {/* cta final */}
        <section className="flex flex-col gap-5 rounded-2xl bg-ink px-6 py-8 text-center">
          <h2 className="text-balance text-2xl font-bold text-cta-on">
            Para de duvidar. Descobre.
          </h2>
          <p className="text-sm text-white/70">
            Milhares de itens na base. Gratis, sem cadastro, sem frescura.
          </p>
          <Link
            href="/app"
            className="pressable flex h-12 w-full items-center justify-center rounded-xl bg-white text-base font-semibold text-ink"
          >
            Vem conferir
          </Link>
        </section>
      </main>

      {/* footer */}
      <footer className="mt-14 text-center text-xs text-muted">
        <p>
          Referencia geral &mdash; rotulo e bom senso mandam. Quando nao tem certeza, cheira.
        </p>
        <p className="mt-2">
          Nao substitui orientacao medica ou farmaceutica.
        </p>
      </footer>
    </div>
  );
}
