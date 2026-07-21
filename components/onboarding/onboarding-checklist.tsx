"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Circle, CircleCheckBig, PartyPopper, X } from "lucide-react";
import { dismissOnboarding } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  id: string;
  label: string;
  href: string | null;
  done: boolean;
};

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const [isPending, startTransition] = useTransition();

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const progress = Math.round((doneCount / steps.length) * 100);

  function dismiss() {
    startTransition(async () => {
      await dismissOnboarding();
    });
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            {allDone ? (
              <>
                <PartyPopper className="size-5 text-primary" aria-hidden />
                Você dominou o inDash!
              </>
            ) : (
              "Como usar o inDash"
            )}
          </CardTitle>
          <CardDescription>
            {allDone
              ? "Todos os passos concluídos — o painel é todo seu."
              : `${doneCount} de ${steps.length} passos — cada um se marca sozinho quando você faz a ação.`}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          disabled={isPending}
          aria-label="Dispensar checklist"
          title="Dispensar (dá pra reabrir nas Configurações)"
        >
          <X />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} aria-label="Progresso do onboarding" />
        <ol className="space-y-1">
          {steps.map((step, index) => (
            <li key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5",
                  !step.done && "hover:bg-muted/60"
                )}
              >
                {step.done ? (
                  <CircleCheckBig
                    className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "flex-1 text-sm",
                    step.done && "text-muted-foreground line-through"
                  )}
                >
                  {index + 1}. {step.label}
                </span>
                {!step.done && step.href && (
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Ir <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
