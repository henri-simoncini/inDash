import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="inDash — página inicial">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#recursos" className="transition-colors hover:text-foreground">
            Recursos
          </a>
          <a href="#sobre" className="transition-colors hover:text-foreground">
            Sobre
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Entrar
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            Começar agora
          </Link>
        </div>
      </div>
    </header>
  );
}
