"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger, utils } from "animejs";

const MESES = [
  { label: "Mai", altura: 42 },
  { label: "Jun", altura: 58 },
  { label: "Jul", altura: 48 },
  { label: "Ago", altura: 68 },
  { label: "Set", altura: 62 },
  { label: "Out", altura: 92 },
];

const CARDS = [
  { label: "Recebido no mês", valor: "R$ 4.320,00", destaque: true },
  { label: "A receber", valor: "R$ 1.800,00", destaque: false },
  { label: "Em andamento", valor: "5 projetos", destaque: false },
];

/**
 * Gráfico da seção "Gerencie seus projetos".
 *
 * As barras crescem atreladas ao scroll (sync), então Mai→Out aparecem
 * conforme o usuário desce. Quando a última completa, os cards de resumo
 * entram de uma vez só.
 */
export function ScrollChart() {
  const rootRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const bars = barsRef.current;
    const cards = cardsRef.current;
    if (!root || !bars || !cards) return;

    const barEls = Array.from(
      bars.querySelectorAll<HTMLElement>("[data-bar]")
    );
    const cardEls = Array.from(
      cards.querySelectorAll<HTMLElement>("[data-card]")
    );

    const showAll = () => {
      utils.set(barEls, { scaleY: 1, opacity: 1 });
      utils.set(cardEls, { opacity: 1, y: 0 });
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || document.hidden) {
      showAll();
      return;
    }

    try {
      const barsAnimation = animate(barEls, {
        scaleY: [0, 1],
        opacity: [0.25, 1],
        duration: 1000,
        // cada barra ocupa uma fatia do percurso: viram Mai, Jun, Jul...
        delay: stagger(700),
        ease: "out(2)",
        autoplay: onScroll({
          target: root,
          // percurso do scrub: do bloco entrando até ele centralizado
          enter: "bottom-=10% top",
          leave: "center center",
          sync: 0.35,
          onSyncComplete: () => {
            animate(cardEls, {
              opacity: [0, 1],
              y: [18, 0],
              duration: 520,
              delay: stagger(70),
              ease: "out(3)",
            });
          },
        }),
      });

      return () => {
        barsAnimation.revert();
      };
    } catch {
      showAll();
    }
  }, []);

  return (
    <div
      ref={rootRef}
      className="rounded-2xl border border-white/10 bg-card p-5 shadow-xl"
    >
      <p className="text-sm text-muted-foreground">Ganhos nos últimos 6 meses</p>

      <div ref={barsRef} className="mt-5">
        <div className="flex h-40 items-end gap-3">
          {MESES.map((mes) => (
            <div
              key={mes.label}
              data-bar
              className="bg-gradient-brand flex-1 origin-bottom rounded-t-md"
              style={{ height: `${mes.altura}%`, opacity: 0 }}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-3">
          {MESES.map((mes) => (
            <span
              key={mes.label}
              className="flex-1 text-center text-xs text-muted-foreground"
            >
              {mes.label}
            </span>
          ))}
        </div>
      </div>

      <div ref={cardsRef} className="mt-5 grid gap-3 sm:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.label}
            data-card
            style={{ opacity: 0 }}
            className="rounded-xl border border-white/10 bg-background/60 p-3"
          >
            <p className="text-[0.7rem] text-muted-foreground">{card.label}</p>
            <p
              className={`mt-1 font-heading text-2xl ${
                card.destaque ? "text-gradient" : ""
              }`}
            >
              {card.valor}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
