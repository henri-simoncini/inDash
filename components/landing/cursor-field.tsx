"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// R3F carrega em cima do three: só entra depois da página, e nunca no servidor
const Antigravity = dynamic(() => import("./antigravity"), { ssr: false });

/**
 * Campo de partículas que acompanha o cursor na landing.
 *
 * Fica em overlay por cima de tudo, ignorando cliques — por isso a Canvas
 * escuta os eventos do documento em vez dos próprios.
 */
export function CursorField() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Sem cursor não há o que seguir: fora em tela de toque. Também fora
    // para quem pediu menos movimento. Reavaliado a cada mudança, e não só
    // na montagem, porque a janela pode ser redimensionada depois.
    const coarse = window.matchMedia("(pointer: coarse)");
    const small = window.matchMedia("(max-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () =>
      setEnabled(!coarse.matches && !small.matches && !reduced.matches);
    sync();

    coarse.addEventListener("change", sync);
    small.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      coarse.removeEventListener("change", sync);
      small.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <Antigravity
        eventSource={document.body}
        count={220}
        magnetRadius={9}
        ringRadius={5}
        waveSpeed={0.5}
        waveAmplitude={1}
        particleSize={1.1}
        lerpSpeed={0.08}
        color="#54A3ED"
        autoAnimate
        particleVariance={1}
        rotationSpeed={0.15}
        pulseSpeed={3}
        particleShape="capsule"
        fieldStrength={12}
      />
    </div>
  );
}
