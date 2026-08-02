"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, utils } from "animejs";

type Direction = "up" | "left" | "right";

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 32 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
};

/**
 * Revela o conteúdo quando ele entra na viewport durante o scroll.
 *
 * O bloco nasce com opacity 0 no HTML para não piscar antes da animação — e
 * é justamente por isso que todo caminho que não anima precisa devolver a
 * visibilidade, senão a landing fica em branco:
 *  - sem JS: <noscript> no app/page.tsx
 *  - prefers-reduced-motion: regra no globals.css e o atalho aqui embaixo
 *  - aba em segundo plano: o Anime.js pausa a engine com o documento oculto,
 *    então nem a animação nem o observador rodariam
 *  - erro inesperado do Anime.js: try/catch
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => utils.set(el, { opacity: 1, x: 0, y: 0 });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced || document.hidden) {
      show();
      return;
    }

    try {
      const { x, y } = OFFSETS[direction];
      const animation = animate(el, {
        opacity: [0, 1],
        x: [x, 0],
        y: [y, 0],
        duration: 700,
        delay,
        ease: "out(3)",
        autoplay: onScroll({
          target: el,
          // dispara quando o topo do bloco passa de ~85% da altura da tela
          enter: "bottom-=15% top",
          // uma vez só: reanimar a cada passagem vira distração
          repeat: false,
        }),
      });

      return () => {
        animation.revert();
      };
    } catch {
      show();
    }
  }, [direction, delay]);

  return (
    <div ref={ref} data-reveal className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
