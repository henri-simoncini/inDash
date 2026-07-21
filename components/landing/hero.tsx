import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// Mockup do dashboard feito em CSS — não envelhece como screenshot
function DashboardMockup() {
  const bars = [35, 55, 40, 70, 60, 90];
  return (
    <div
      className="mx-auto w-full max-w-3xl rounded-xl border bg-card p-4 shadow-lg sm:p-6"
      aria-hidden
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Recebido no mês", value: "R$ 4.250", accent: true },
          { label: "A receber", value: "R$ 1.800" },
          { label: "Em andamento", value: "5 projetos" },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border p-3 text-left">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p
              className={`mt-1 text-lg font-bold tabular-nums ${
                card.accent ? "text-emerald-600 dark:text-emerald-400" : ""
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border p-3">
        <p className="text-left text-xs text-muted-foreground">
          Ganhos dos últimos 6 meses
        </p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {bars.map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-emerald-600/80 dark:bg-emerald-500/80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="px-4 pb-20 pt-16 text-center sm:pt-24">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Seus freelas, organizados{" "}
          <span className="text-primary">de verdade</span>.
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Serviços, clientes, agenda, projetos e pagamentos num painel só —
          feito pra quem hoje se vira com planilha e WhatsApp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Começar agora <ArrowRight aria-hidden />
          </Link>
          <a
            href="#recursos"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Ver recursos
          </a>
        </div>
      </div>
      <div className="mt-14">
        <DashboardMockup />
      </div>
    </section>
  );
}
