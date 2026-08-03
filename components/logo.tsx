import { cn } from "@/lib/utils";

/**
 * Marca do inDash: barra prateada do "i", o "D" em degradê azul e a seta
 * branca de crescimento atravessando — a seta é a união de um cantoneira
 * em L (a ponta) com a faixa diagonal (a haste).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 104 100"
      className={cn("h-7 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="indash-d" x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#57A8F0" />
          <stop offset="55%" stopColor="#2E86DC" />
          <stop offset="100%" stopColor="#1B69BC" />
        </linearGradient>
        <linearGradient id="indash-bar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2F2F2" />
          <stop offset="100%" stopColor="#C4C4C4" />
        </linearGradient>
        <linearGradient id="indash-arrow" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D8DCE0" />
        </linearGradient>
      </defs>
      <rect x="2" y="18" width="20" height="74" rx="2" fill="url(#indash-bar)" />
      <path fill="url(#indash-d)" d="M30 5 H55 A45 45 0 0 1 55 95 H30 Z" />
      <g fill="url(#indash-arrow)">
        <path d="M38 22 H78 V62 H64 V36 H38 Z" />
        <path d="M65.05 25.05 L74.95 34.95 L26.95 82.95 L17.05 73.05 Z" />
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
