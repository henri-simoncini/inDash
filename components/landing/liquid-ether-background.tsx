"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// three passa de 600KB: só entra depois que a página carrega, e nunca no
// HTML do servidor (o efeito depende de WebGL).
const LiquidEther = dynamic(() => import("./liquid-ether"), { ssr: false });

// Referência estável: o array entra na lista de dependências do efeito, então
// um literal aqui dentro remontaria toda a cena WebGL a cada render.
// Azuis da marca, do mais escuro ao mais claro — o shader mapeia a velocidade
// do fluido sobre a paleta, então parado fica transparente e o movimento acende.
const COLORS = ["#1660A6", "#3895ED", "#54A3ED"];

/**
 * Fundo animado do hero. Fica fora do fluxo e não captura clique, então o
 * conteúdo por cima continua utilizável.
 */
export function LiquidEtherBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // WebGL contínuo é caro: fora em telas pequenas e para quem pediu menos
    // movimento no sistema. Reavaliar a cada mudança, e não só na montagem,
    // porque a janela pode ser redimensionada depois.
    const small = window.matchMedia("(max-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(!small.matches && !reduced.matches);
    sync();

    small.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      small.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    // pointer-events-none aqui é o que mantém o hero usável: o CSS do
    // componente traz touch-action: none, que em tela de toque seguraria o
    // scroll por cima do hero. O fluido não perde nada — ele escuta mouse e
    // toque na window e testa se o ponto caiu dentro da área.
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-60">
        <LiquidEther
          colors={COLORS}
          mouseForce={20}
          cursorSize={100}
          resolution={0.5}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      {/* Esmaece o fundo nas bordas para o texto do hero continuar legível */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--background)_85%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
