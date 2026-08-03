"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";
import { playKey } from "@/lib/type-sound";

const SPEED_MS = 34;

// useLayoutEffect roda antes da primeira pintura, então o título já sai
// zerado sem piscar. No servidor ele não existe — daí o fallback.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Título que se digita quando entra na viewport (com som de teclas) e, ao
 * terminar, revela o conteúdo abaixo subindo de baixo para cima.
 *
 * O texto completo é renderizado no servidor e só é zerado no cliente antes
 * da primeira pintura: assim ele existe no HTML para busca e para quem está
 * sem JavaScript, sem causar flash.
 */
export function TypedBlock({
  title,
  accent,
  as: Tag = "h2",
  titleClassName,
  className,
  children,
}: {
  title: string;
  /** Trecho final destacado em azul (ex.: "de verdade.") */
  accent?: string;
  as?: "h1" | "h2" | "h3";
  titleClassName?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  // Pontuação cola no título; palavra ganha espaço antes
  const separator = accent && /^[.,;:!?)\]]/.test(accent) ? "" : " ";
  const full = accent ? `${title}${separator}${accent}` : title;

  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(full);
  const [done, setDone] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Documento oculto: o usuário não está vendo, e o áudio/engine não rodam.
    if (reduced || document.hidden) return;
    setTyped("");
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root) return;

    const reveal = () => {
      setTyped(full);
      setDone(true);
      if (body) body.style.opacity = "1";
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || document.hidden) {
      reveal();
      return;
    }

    let timer: number | undefined;
    let cancelled = false;

    const startTyping = () => {
      const chars = Array.from(full);
      let i = 0;
      const step = () => {
        if (cancelled) return;
        i++;
        setTyped(chars.slice(0, i).join(""));
        if (i % 2 === 0) playKey();
        if (i < chars.length) {
          timer = window.setTimeout(step, SPEED_MS);
        } else {
          setDone(true);
          if (body) {
            animate(body, {
              opacity: [0, 1],
              y: [16, 0],
              duration: 550,
              ease: "out(3)",
            });
          }
        }
      };
      step();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        startTyping();
      },
      // dispara quando o bloco passa de ~85% da altura da tela
      { rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [full]);

  // Divide o texto digitado entre a parte normal e o trecho em destaque
  const base = typed.slice(0, Math.min(typed.length, title.length));
  const highlighted = typed.length > title.length ? typed.slice(title.length) : "";

  return (
    <div ref={rootRef} className={className}>
      <Tag
        aria-label={full}
        className={cn(
          "font-heading text-3xl leading-tight tracking-tight sm:text-4xl",
          titleClassName
        )}
      >
        <span aria-hidden="true">
          {base}
          {highlighted && <span className="text-gradient">{highlighted}</span>}
          <span
            className="ml-0.5 inline-block w-[0.06em] self-stretch bg-primary align-[-0.08em] motion-safe:animate-caret"
            style={{ height: "0.9em" }}
          />
        </span>
      </Tag>
      {children && (
        <div
          ref={bodyRef}
          style={{ opacity: done ? 1 : 0 }}
          className="mt-3"
        >
          {children}
        </div>
      )}
    </div>
  );
}
