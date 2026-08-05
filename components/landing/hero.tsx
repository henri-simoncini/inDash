import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TypedBlock } from "@/components/landing/typed-block";
import { LiquidEtherBackground } from "@/components/landing/liquid-ether-background";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden px-4 py-24 sm:py-32"
    >
      <LiquidEtherBackground />
      <div className="relative mx-auto max-w-3xl text-center">
        <TypedBlock
          as="h1"
          title="Seus projetos, organizados"
          accent="de verdade."
          titleClassName="text-4xl sm:text-5xl lg:text-6xl"
        >
          <p className="mx-auto max-w-xl text-muted-foreground">
            Serviços, clientes, agenda, projetos e pagamentos em um painel —
            chega de planilhas e WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-md border border-[#0F5698] bg-[linear-gradient(to_bottom,#3895ED,#1660A6)] px-8 py-4 font-heading text-2xl font-normal leading-none text-white transition-all duration-200 ease-[ease] hover:opacity-90"
            >
              Começar agora <ArrowRight className="size-5" aria-hidden />
            </Link>
            <a
              href="#recursos"
              className="inline-flex items-center rounded-md border border-[#454545] bg-[#202030] px-8 py-4 font-heading text-2xl font-normal leading-none text-white transition-all duration-200 ease-[ease] hover:border-white/40"
            >
              Ver recursos
            </a>
          </div>
        </TypedBlock>
      </div>
    </section>
  );
}
