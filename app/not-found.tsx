import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-bold tracking-tight">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O endereço pode ter mudado ou nunca existiu. Sem crise — o caminho de
        volta está aqui embaixo.
      </p>
      <div className="flex gap-2">
        <Link href="/dashboard" className={buttonVariants()}>
          Ir para o painel
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Página inicial
        </Link>
      </div>
    </div>
  );
}
