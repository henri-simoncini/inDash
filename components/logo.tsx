import Image from "next/image";
import { cn } from "@/lib/utils";

/** Marca do inDash — arquivo oficial do imagotipo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/img/logo.png"
      alt=""
      width={344}
      height={317}
      priority
      className={cn("h-7 w-auto", className)}
    />
  );
}

const SIZES = {
  sm: { mark: "h-6", text: "text-xl" },
  md: { mark: "h-7", text: "text-2xl" },
  lg: { mark: "h-16", text: "text-4xl" },
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
        <span className={cn("font-sans font-bold tracking-tight", s.text)}>
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
