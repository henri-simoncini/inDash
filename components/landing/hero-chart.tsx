"use client";

import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";
import { createDrawable } from "animejs/svg";

// Mesma curva do gráfico de referência
const CURVE =
  "M0 460.694c6.6-3.13 19.8-11.272 33-15.654s19.8-2.814 33-6.257 19.8.365 33-10.955 19.8-32.07 33-45.643c13.2-13.572 19.8-16.08 33-22.22s19.8-5.647 33-8.48c13.2-2.832 19.8 5.901 33-5.68 13.2-11.582 19.8-37.759 33-52.226 13.2-14.468 19.8-28.263 33-20.112 13.2 8.15 19.8 59.038 33 60.863 13.2 1.824 19.8-43.269 33-51.741s19.8 24.488 33 9.38c13.2-15.11 19.8-81.825 33-84.923s19.8 54.76 33 69.432 19.8 34.912 33 3.931 19.8-148.752 33-158.837c13.2-10.086 19.8 111.943 33 108.409 13.2-3.535 19.8-97.635 33-126.082s19.8-7.562 33-16.152 26.4-21.438 33-26.798";

const AREA = `${CURVE}L653 465H0Z`;

// Quanto o cartão inclina nas bordas, em graus
const MAX_TILT = 9;

export function HeroChart() {
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Inclinação 3D acompanhando o cursor
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Em tela de toque não há hover — a inclinação só atrapalharia
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const onMove = (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      animate(card, {
        rotateX: -py * 2 * MAX_TILT,
        rotateY: px * 2 * MAX_TILT,
        scale: 1.02,
        duration: 400,
        ease: "out(3)",
      });
    };

    const onLeave = () => {
      animate(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 600,
        ease: "out(4)",
      });
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const line = lineRef.current;
    const area = areaRef.current;
    if (!line || !area) return;

    const show = () => {
      utils.set(area, { opacity: 1 });
      utils.set(line, { opacity: 1 });
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || document.hidden) {
      show();
      return;
    }

    try {
      utils.set(line, { opacity: 1 });

      // createDrawable transforma o traço num alvo com a propriedade "draw",
      // que é o equivalente do pathLength do framer-motion
      const [drawable] = createDrawable(line);
      const drawing = animate(drawable, {
        draw: ["0 0", "0 1"],
        duration: 1600,
        ease: "inOut(2)",
      });

      const filling = animate(area, {
        opacity: [0, 1],
        duration: 900,
        delay: 350,
        ease: "out(2)",
      });

      return () => {
        drawing.revert();
        filling.revert();
      };
    } catch {
      show();
    }
  }, []);

  return (
    // A perspectiva mora no pai: sem ela a rotação fica achatada, sem volume
    <div style={{ perspective: "1000px" }}>
      <div
        ref={cardRef}
        className="overflow-hidden rounded-xl border border-white/10 bg-card shadow-xl will-change-transform"
      >
        <div className="absolute p-4">
          <p className="text-sm font-medium text-muted-foreground">Este mês</p>
          <p className="font-heading text-4xl text-primary">+38%</p>
        </div>

        {/* Grade em CSS puro — dispensa o plugin bg-grid e o mini-svg-data-uri,
            que são API do Tailwind v3 e não valem num projeto v4. */}
        <div
          className="[background-size:32px_32px]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 653 465"
            className="w-full"
            aria-hidden="true"
          >
            <path
              ref={areaRef}
              d={AREA}
              className="fill-primary/25"
              style={{ opacity: 0 }}
            />
            <path
              ref={lineRef}
              d={CURVE}
              fill="none"
              className="stroke-primary"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ opacity: 0 }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
