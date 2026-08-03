import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TypedBlock } from "@/components/landing/typed-block";
import { HeroChart } from "@/components/landing/hero-chart";

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

        <div className="relative w-full">
          <HeroChart />
        </div>
      </div>
    </section>
  );
}
