"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <TriangleAlert className="size-10 text-destructive" aria-hidden />
      <h1 className="text-xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground">
        Não conseguimos carregar esta tela. Seus dados estão seguros — tente de
        novo.
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
