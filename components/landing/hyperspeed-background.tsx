"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// three + postprocessing passam de 700KB: só entram depois que a página
// carrega, e nunca no HTML do servidor (o efeito depende de WebGL).
const Hyperspeed = dynamic(() => import("./hyperspeed"), { ssr: false });

// Referência estável: o componente recria toda a cena WebGL se o objeto mudar
const OPTIONS = {
  // Sem interação de acelerar: o fundo não captura clique
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 9,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x0a0d14,
    islandColor: 0x12151e,
    background: 0x0a0d14,
    shoulderLines: 0x54a3ed,
    brokenLines: 0x3a71fb,
    leftCars: [0x54a3ed, 0x3895ed, 0x7cc0ff],
    rightCars: [0x1660a6, 0x2563eb, 0x0f5698],
    sticks: 0x54a3ed,
  },
};

/**
 * Fundo animado do hero. Fica fora do fluxo e não captura clique, então o
 * conteúdo por cima continua utilizável.
 */
export function HyperspeedBackground() {
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-70">
        <Hyperspeed effectOptions={OPTIONS} />
      </div>
      {/* Esmaece o fundo nas bordas para o texto do hero continuar legível */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--background)_85%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
