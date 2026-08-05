"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "inicio", label: "Início" },
  { id: "recursos", label: "Recursos" },
  { id: "sobre", label: "Sobre" },
];

export function LandingHeader() {
  const [active, setActive] = useState("inicio");

  // Marca no menu a seção que está ocupando a tela
  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      // a faixa central da tela decide qual seção está "ativa"
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* O header só existe na landing, então o href aponta para a página
            atual e o Next resolveria com navegação client-side — nada visível
            aconteceria. Recarregar de fato é o que se espera ao clicar na logo. */}
        <Link
          href="/"
          aria-label="inDash — recarregar a página inicial"
          onClick={(event) => {
            event.preventDefault();
            window.location.reload();
          }}
          className="rounded-md transition-opacity duration-200 ease-[ease] hover:opacity-80"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm sm:flex">
          {SECTIONS.map((section) => {
            const isActive = active === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "border-b-2 pb-0.5 transition-all duration-200 ease-[ease]",
                  isActive
                    ? "border-primary text-white"
                    : "border-transparent text-[#C0C0C0] hover:text-white"
                )}
              >
                {section.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-[#C0C0C0] transition-all duration-200 ease-[ease] hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md border-[3px] border-[#3895ED] bg-transparent px-6 py-2 font-heading text-xl font-normal leading-none text-[#3895ED] transition-all duration-200 ease-[ease] hover:border-transparent hover:bg-[linear-gradient(to_bottom,#3895ED,#1660A6)] hover:text-white"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </header>
  );
}
