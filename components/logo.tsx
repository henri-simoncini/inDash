import { cn } from "@/lib/utils";

/**
 * Marca do inDash: "D alado" em gradiente azul, com as fendas do contorno,
 * o furo circular e a seta ciano de crescimento atravessando.
 *
 * O contorno é um traçado único que entra nas fendas (em vez de recortá-las
 * por cima), então elas encostam na borda diagonal sem deixar fiapo nem
 * vazar para fora do corpo. O furo é o segundo subcaminho, com evenodd.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 156 100"
      className={cn("h-7 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="indash-logo-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="55%" stopColor="#3B5BE8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      <path
        fillRule="evenodd"
        fill="url(#indash-logo-body)"
        d="M40 96 L29.65 68 L64 68 L70 54 L24.48 54 L18.57 38 L80 38 L86 24
           L13.39 24 L6 4 L104 4 A46 46 0 0 1 104 96 Z
           M87 50 a19 19 0 1 0 38 0 a19 19 0 1 0 -38 0 Z"
      />

      {/* lasca ciano na ponta da asa de baixo */}
      <path fill="#22D3EE" d="M46 76 H58 L52 90 H40 Z" />

      {/* seta de crescimento: passa pelo centro do furo e escapa pela borda */}
      <path
        d="M72 86 L124 30"
        stroke="#22D3EE"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path fill="#22D3EE" d="M140 14 L135.97 40.33 L114.03 19.87 Z" />
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
        <span className={cn("font-bold tracking-tight", s.text)}>
          in<span className="text-primary">Dash</span>
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
