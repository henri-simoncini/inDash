"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ogl é pequeno perto do three, mas o efeito depende de WebGL: fora do HTML
// do servidor de qualquer jeito.
const MoltenMetal = dynamic(() => import("./molten-metal"), { ssr: false });

/**
 * Fundo animado do hero. Fica fora do fluxo, atrás do conteúdo, que continua
 * recebendo clique normalmente por vir depois no DOM.
 */
export function MoltenMetalBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Ao contrário dos fundos anteriores não há corte por tamanho de tela:
    // isto é um único passe de fragment shader, sem simulação multi-passe nem
    // render target float, então roda bem em celular. Só respeita quem pediu
    // menos movimento no sistema.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(!reduced.matches);
    sync();

    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sem pointer-events-none aqui: este componente escuta o mouse no
          próprio canvas, então bloquear o ponteiro desligaria o drift em
          silêncio. O conteúdo do hero vem depois no DOM e continua ganhando
          o clique onde os dois se sobrepõem. */}
      <div className="absolute inset-0">
        <MoltenMetal
          color1="#1660A6"
          color2="#54A3ED"
          color3="#FFFFFF"
          speed={0.35}
          scale={4}
          detail={3}
          glow={1.6}
          coreSize={0.1}
          swirl={1}
          fold={-0.2}
          blackPoint={0.05}
          brightness={1.3}
          colorMode="molten"
          grain
          grainIntensity={0.05}
          mouseInteraction
          mouseStrength={0.3}
          opacity={0.8}
        />
      </div>
      {/* Esmaece o fundo nas bordas para o texto do hero continuar legível.
          Estas camadas cobrem o canvas inteiro, então precisam deixar o
          ponteiro passar — senão comeriam o mousemove antes dele chegar lá. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--background)_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
