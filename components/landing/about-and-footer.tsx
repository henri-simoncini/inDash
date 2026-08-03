import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/landing/reveal";

export function AboutDeveloper() {
  return (
    <section id="sobre" className="border-t border-white/5 px-4 py-16">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Sobre o desenvolvedor
        </h2>
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-2 sm:flex-row sm:text-left">
            <span
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary"
              aria-hidden
            >
              HS
            </span>
            <div className="space-y-2">
              <p className="font-semibold">Henrique Simoncini</p>
              <p className="text-sm text-muted-foreground">
                Desenvolvedor. Criei o inDash para resolver um problema que
                conheço de perto: freelancer bom no que faz, mas gerenciando
                tudo na planilha e no WhatsApp.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm sm:justify-start">
                <a
                  href="https://henri-simoncini.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                >
                  Portfólio <ExternalLink className="size-3.5" aria-hidden />
                </a>
                <a
                  href="https://github.com/henri-simoncini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                >
                  GitHub <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="border-t border-white/5 px-4 py-20">
      <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-gradient font-heading text-4xl tracking-tight sm:text-5xl">
          Chega de planilha.
        </h2>
        <p className="text-muted-foreground">
          Crie sua conta e organize seus freelas em minutos.
        </p>
        <div className="pt-2">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md border border-[#0F5698] bg-[linear-gradient(to_bottom,#3895ED,#1660A6)] px-7 py-3.5 font-heading text-lg leading-none text-white transition-opacity hover:opacity-90"
          >
            Começar agora <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-2">
          <Logo size="sm" /> · {new Date().getFullYear()}
        </p>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="transition-colors hover:text-foreground"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </footer>
  );
}
