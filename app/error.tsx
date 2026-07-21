"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-10 text-destructive" aria-hidden />
      <h1 className="text-xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Aconteceu um erro inesperado. Tente de novo — se persistir, recarregue a
        página.
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
