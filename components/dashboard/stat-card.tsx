import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  hintClassName,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  hintClassName?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="pb-0">
        <CardDescription className="flex items-center gap-1.5">
          <Icon className="size-4" aria-hidden /> {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className={cn("font-heading text-4xl leading-none", valueClassName)}>
          {value}
        </p>
        {hint && (
          <p className={cn("text-xs text-muted-foreground", hintClassName)}>
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
