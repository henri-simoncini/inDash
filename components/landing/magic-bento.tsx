"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./magic-bento.css";

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
// Azul da marca (#2563EB) no formato que o componente espera
const DEFAULT_GLOW_COLOR = "37, 99, 235";
const MOBILE_BREAKPOINT = 768;

type Card = { title: string; description: string; label: string };

// Os módulos reais do inDash, no lugar do conteúdo de exemplo
const CARDS: Card[] = [
  {
    label: "Visão geral",
    title: "Dashboard",
    description: "Ganhos do mês, prazos no radar e próximos agendamentos.",
  },
  {
    label: "Entregas",
    title: "Projetos",
    description: "Do agendamento à entrega, com TO-DO list.",
  },
  {
    label: "Rotina",
    title: "Agenda",
    description: "Seus compromissos do mês num calendário limpo.",
  },
  {
    label: "Pessoas",
    title: "Clientes",
    description: "Contato, notas e histórico de cada um.",
  },
  {
    label: "Dinheiro",
    title: "Financeiro",
    description: "Pagamentos registrados e ganhos por período.",
  },
];

const createParticle = (x: number, y: number, color: string) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position:absolute;width:4px;height:4px;border-radius:50%;
    background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);
    pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
  return el;
};

function ParticleCard({
  children,
  className,
  style,
  disableAnimations,
  particleCount,
  glowColor,
  enableTilt,
  clickEffect,
  enableMagnetism,
}: {
  children: React.ReactNode;
  className: string;
  style: React.CSSProperties;
  disableAnimations: boolean;
  particleCount: number;
  glowColor: string;
  enableTilt: boolean;
  clickEffect: boolean;
  enableMagnetism: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const activeParticles = useRef<HTMLDivElement[]>([]);
  const timeouts = useRef<number[]>([]);
  const isHovered = useRef(false);
  const templates = useRef<HTMLDivElement[]>([]);

  const clearParticles = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    activeParticles.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.remove(),
      });
    });
    activeParticles.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    const card = cardRef.current;
    if (!card || !isHovered.current) return;

    if (templates.current.length === 0) {
      const { width, height } = card.getBoundingClientRect();
      templates.current = Array.from({ length: particleCount }, () =>
        createParticle(Math.random() * width, Math.random() * height, glowColor)
      );
    }

    templates.current.forEach((template, index) => {
      const id = window.setTimeout(() => {
        if (!isHovered.current || !cardRef.current) return;
        const clone = template.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        activeParticles.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);
      timeouts.current.push(id);
    });
  }, [particleCount, glowColor]);

  useEffect(() => {
    const el = cardRef.current;
    if (disableAnimations || !el) return;

    const onEnter = () => {
      isHovered.current = true;
      spawnParticles();
      if (enableTilt) {
        gsap.to(el, {
          rotateX: 4,
          rotateY: 4,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const onLeave = () => {
      isHovered.current = false;
      clearParticles();
      if (enableTilt) {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      }
      if (enableMagnetism) {
        gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -8,
          rotateY: ((x - cx) / cx) * 8,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        gsap.to(el, {
          x: (x - cx) * 0.04,
          y: (y - cy) * 0.04,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const max = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position:absolute;width:${max * 2}px;height:${max * 2}px;border-radius:50%;
        background:radial-gradient(circle, rgba(${glowColor},0.35) 0%, rgba(${glowColor},0.18) 30%, transparent 70%);
        left:${x - max}px;top:${y - max}px;pointer-events:none;z-index:3;`;
      el.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("click", onClick);

    return () => {
      isHovered.current = false;
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClick);
      clearParticles();
    };
  }, [
    spawnParticles,
    clearParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div ref={cardRef} className={className} style={style}>
      {children}
    </div>
  );
}

function GlobalSpotlight({
  gridRef,
  disabled,
  radius,
  glowColor,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>;
  disabled: boolean;
  radius: number;
  glowColor: string;
}) {
  useEffect(() => {
    if (disabled || !gridRef.current) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position:fixed;width:700px;height:700px;border-radius:50%;pointer-events:none;
      background:radial-gradient(circle,
        rgba(${glowColor},0.14) 0%, rgba(${glowColor},0.07) 18%,
        rgba(${glowColor},0.03) 35%, transparent 70%);
      z-index:20;opacity:0;transform:translate(-50%,-50%);`;
    document.body.appendChild(spotlight);

    const proximity = radius * 0.5;
    const fadeDistance = radius * 0.75;

    const onMove = (e: MouseEvent) => {
      const grid = gridRef.current;
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left - radius &&
        e.clientX <= rect.right + radius &&
        e.clientY >= rect.top - radius &&
        e.clientY <= rect.bottom + radius;

      const cards = grid.querySelectorAll<HTMLElement>(".magic-bento-card");

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((c) => c.style.setProperty("--glow-intensity", "0"));
        return;
      }

      let minDistance = Infinity;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const distance =
          Math.hypot(
            e.clientX - (r.left + r.width / 2),
            e.clientY - (r.top + r.height / 2)
          ) - Math.max(r.width, r.height) / 2;
        const effective = Math.max(0, distance);
        minDistance = Math.min(minDistance, effective);

        let intensity = 0;
        if (effective <= proximity) intensity = 1;
        else if (effective <= fadeDistance) {
          intensity = (fadeDistance - effective) / (fadeDistance - proximity);
        }

        card.style.setProperty(
          "--glow-x",
          `${((e.clientX - r.left) / r.width) * 100}%`
        );
        card.style.setProperty(
          "--glow-y",
          `${((e.clientY - r.top) / r.height) * 100}%`
        );
        card.style.setProperty("--glow-intensity", intensity.toString());
        card.style.setProperty("--glow-radius", `${radius}px`);
      });

      gsap.to(spotlight, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const target =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlight, {
        opacity: target,
        duration: target > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gridRef.current
        ?.querySelectorAll<HTMLElement>(".magic-bento-card")
        .forEach((c) => c.style.setProperty("--glow-intensity", "0"));
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out" });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      spotlight.remove();
    };
  }, [gridRef, disabled, radius, glowColor]);

  return null;
}

export function MagicBento({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}: {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(true);

  // Desliga em telas pequenas e para quem pediu menos movimento no sistema.
  // Começa desligado para não animar antes de saber onde estamos.
  useEffect(() => {
    const check = () =>
      setReduced(
        window.innerWidth <= MOBILE_BREAKPOINT ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const off = disableAnimations || reduced;

  const cardClass = [
    "magic-bento-card",
    textAutoHide && "magic-bento-card--text-autohide",
    enableBorderGlow && "magic-bento-card--border-glow",
  ]
    .filter(Boolean)
    .join(" ");

  const cardStyle = { "--glow-color": glowColor } as React.CSSProperties;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disabled={off}
          radius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div ref={gridRef} className="magic-bento">
        {CARDS.map((card) =>
          enableStars ? (
            <ParticleCard
              key={card.title}
              className={cardClass}
              style={cardStyle}
              disableAnimations={off}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <CardBody card={card} />
            </ParticleCard>
          ) : (
            <div key={card.title} className={cardClass} style={cardStyle}>
              <CardBody card={card} />
            </div>
          )
        )}
      </div>
    </>
  );
}

function CardBody({ card }: { card: Card }) {
  return (
    <>
      <div className="magic-bento-card__header">
        <span className="magic-bento-card__label">{card.label}</span>
      </div>
      <div className="magic-bento-card__content">
        <h3 className="magic-bento-card__title">{card.title}</h3>
        <p className="magic-bento-card__description">{card.description}</p>
      </div>
    </>
  );
}
