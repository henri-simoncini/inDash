import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { ManagementSection } from "@/components/landing/management-section";
import { Features } from "@/components/landing/features";
import { SoundGate } from "@/components/landing/sound-gate";
import ClickSpark from "@/components/landing/click-spark";
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
    // A landing é sempre escura, como no design — não segue o tema da conta.
    <div className="landing-root dark flex min-h-svh flex-col bg-background text-foreground">
      {/* O wrapper é escuro, mas o body continuaria claro e apareceria no
          overscroll — daí pintar a raiz enquanto a landing está montada. */}
      <style>{`html,body{background-color:oklch(0.159 0.016 266.59);color-scheme:dark}`}</style>
      {/* Sem JS o Anime.js nunca revela os blocos — devolve a visibilidade. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      {/* Envolve a página inteira: as faíscas nascem onde o clique acontece,
          em qualquer seção. O canvas fica por cima, mas ignora ponteiro. */}
      <ClickSpark
        sparkColor="#54A3ED"
        sparkSize={12}
        sparkRadius={18}
        sparkCount={8}
        duration={450}
      >
        <LandingHeader />
        <main id="conteudo" className="flex-1">
          <Hero />
          <ManagementSection />
          <Features />
          <AboutDeveloper />
          <FinalCta />
        </main>
        <LandingFooter />
      </ClickSpark>
      <SoundGate />
    </div>
  );
}
