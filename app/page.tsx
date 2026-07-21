import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import {
  AboutDeveloper,
  FinalCta,
  LandingFooter,
} from "@/components/landing/about-and-footer";

export const metadata: Metadata = {
  title: "inDash — Gestão para freelancers",
  description:
    "Serviços, clientes, agenda, projetos e pagamentos num painel só. Feito para freelancers que hoje se viram com planilha e WhatsApp.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      <LandingHeader />
      <main id="conteudo" className="flex-1">
        <Hero />
        <Features />
        <AboutDeveloper />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
