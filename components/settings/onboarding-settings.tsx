"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, MapPinned } from "lucide-react";
import { toast } from "sonner";
import { reopenOnboarding, reopenTour } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OnboardingSettings() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTour() {
    startTransition(async () => {
      const result = await reopenTour();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.push("/dashboard");
    });
  }

  function handleChecklist() {
    startTransition(async () => {
      const result = await reopenOnboarding();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Checklist de volta no Dashboard.");
      router.push("/dashboard");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajuda e onboarding</CardTitle>
        <CardDescription>
          Reveja o tour pela interface ou o checklist de primeiros passos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleTour} disabled={isPending}>
          <MapPinned /> Rever tour de interface
        </Button>
        <Button variant="outline" onClick={handleChecklist} disabled={isPending}>
          <ListChecks /> Reexibir checklist
        </Button>
      </CardContent>
    </Card>
  );
}
