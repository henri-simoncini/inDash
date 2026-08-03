import { cn } from "@/lib/utils";

/**
 * Marca do inDash: monograma "iD" em itálico, com face em degradê,
 * borda de bisel clara e sombra que dá o volume 3D.
 *
 * As quatro subformas (barra do i, barra alta, corpo do D e a contraforma)
 * vivem num caminho só: com evenodd a contraforma vira furo, então o vazado
 * assume a cor do fundo e a marca funciona no tema claro e no escuro.
 */
const SHAPES = [
  "M0 46.3 H21.3 V102 H0 Z",
  "M31.1 16.2 H67.7 V102 H31.1 Z",
  "M78.6 2 H107.3 A50 50 0 0 1 107.3 102 H78.6 Z",
  "M108.6 23.5 A20.8 26.75 0 0 1 108.6 77 Z",
].join(" ");

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 174 106"
      className={cn("h-7 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="indash-logo-face" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#5B96FF" />
          <stop offset="42%" stopColor="#3070EE" />
          <stop offset="44%" stopColor="#2159DF" />
          <stop offset="100%" stopColor="#1233A6" />
        </linearGradient>
      </defs>
      <g transform="translate(24 0) skewX(-12.5)">
        <g transform="translate(2.2 2.2)">
          <path fillRule="evenodd" fill="#0A1E63" d={SHAPES} />
        </g>
        <path
          fillRule="evenodd"
          fill="url(#indash-logo-face)"
          stroke="#9CC4FF"
          strokeWidth="1.1"
          d={SHAPES}
        />
      </g>
    </svg>
  );
}

const SIZES = {
  sm: { mark: "h-6", text: "text-base" },
  md: { mark: "h-7", text: "text-lg" },
  lg: { mark: "h-16", text: "text-3xl" },
} as const;

export function Logo({
  size = "md",
  stacked = false,
  tagline = false,
  className,
}: {
  size?: keyof typeof SIZES;
  /** Marca acima do nome (lockup vertical da identidade) */
  stacked?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <span
      className={cn(
        "inline-flex",
        stacked ? "flex-col items-center gap-2" : "items-center gap-2",
        className
      )}
    >
      <LogoMark className={s.mark} />
      <span className={cn("flex flex-col items-center")}>
        <span className={cn("font-heading tracking-tight", s.text)}>
          in<span className="text-gradient">Dash</span>
        </span>
        {tagline && (
          <span className="mt-0.5 text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            Organize<span className="text-cyan-500">.</span> Gerencie
            <span className="text-cyan-500">.</span> Cresça
            <span className="text-cyan-500">.</span>
          </span>
        )}
      </span>
    </span>
  );
}
