import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TypedBlock } from "@/components/landing/typed-block";

// Ilustração do hero: três séries subindo sobre um histograma discreto
function HeroChart() {
  const bars = [
    12, 18, 10, 22, 16, 26, 20, 32, 24, 38, 30, 44, 34, 52, 40, 60, 46, 70, 54,
    82,
  ];

  return (
    <svg
      viewBox="0 0 320 200"
      className="h-auto w-full max-w-lg"
      aria-hidden="true"
    >
      <g opacity="0.55">
        {bars.map((h, i) => (
          <rect
            key={i}
            x={6 + i * 15.6}
            y={190 - h}
            width="9"
            height={h}
            rx="1.5"
            fill="#2563EB"
            opacity={0.35 + (i / bars.length) * 0.5}
          />
        ))}
      </g>
      <polyline
        points="10,150 60,120 105,135 150,95 195,110 240,60 290,30"
        fill="none"
        stroke="#22C55E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="10,170 60,145 105,158 150,120 195,140 240,95 290,58"
        fill="none"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="10,182 60,162 105,172 150,140 195,155 240,118 290,82"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M290 30 L278 44 L296 46 Z" fill="#22C55E" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <TypedBlock
          as="h1"
          title="Seus projetos, organizados"
          accent="de verdade."
          titleClassName="text-4xl sm:text-5xl lg:text-6xl"
        >
          <p className="max-w-md text-muted-foreground">
            Serviços, clientes, agenda, projetos e pagamentos em um painel —
            chega de planilhas e WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
              Começar agora <ArrowRight aria-hidden />
            </Link>
            <a
              href="#recursos"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Ver recursos
            </a>
          </div>
        </TypedBlock>

        <div className="flex justify-center lg:justify-end">
          <HeroChart />
        </div>
      </div>
    </section>
  );
}
