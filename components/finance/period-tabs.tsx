"use client";

import { usePathname, useRouter } from "next/navigation";
import { PERIOD_LABELS, type FinancePeriod } from "@/lib/finance";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PeriodTabs({ period }: { period: FinancePeriod }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs
      value={period}
      onValueChange={(value) =>
        router.replace(`${pathname}?periodo=${value}`, { scroll: false })
      }
    >
      <TabsList>
        {(Object.keys(PERIOD_LABELS) as FinancePeriod[]).map((key) => (
          <TabsTrigger key={key} value={key}>
            {PERIOD_LABELS[key]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
