"use client";

import { useState, useTransition } from "react";
import { CircleCheckBig, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { formatBRL } from "@/lib/format";
import {
  deletePayment,
  markPaymentPaid,
} from "@/app/dashboard/financeiro/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PaymentForm } from "@/components/payments/payment-form";

type Payment = Tables<"payments">;

export function ProjectPayments({
  projectId,
  finalPrice,
  payments,
}: {
  projectId: string;
  finalPrice: number;
  payments: Payment[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalPaid = payments
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRegistered = payments.reduce((sum, p) => sum + p.amount, 0);
  const suggested = Math.max(
    Math.round((finalPrice - totalRegistered) * 100) / 100,
    0
  );
  const progress =
    finalPrice > 0 ? Math.min((totalPaid / finalPrice) * 100, 100) : 0;

  function handleMarkPaid(payment: Payment) {
    startTransition(async () => {
      const result = await markPaymentPaid(payment.id, projectId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pagamento confirmado. 💰");
      }
    });
  }

  function handleDelete(payment: Payment) {
    startTransition(async () => {
      const result = await deletePayment(payment.id, projectId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pagamento excluído.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Recebido</span>
          <span className="font-heading text-[1.2rem]">
            {formatBRL(totalPaid)}{" "}
            <span className="font-normal text-muted-foreground">
              de {formatBRL(finalPrice)}
            </span>
          </span>
        </div>
        <Progress value={progress} aria-label="Percentual recebido" />
      </div>

      {payments.length > 0 && (
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="font-heading text-[1.2rem]">
                  {formatBRL(payment.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {payment.status === "pago" && payment.paid_at
                    ? new Date(payment.paid_at).toLocaleDateString("pt-BR")
                    : "Aguardando"}
                  {payment.method && ` · ${payment.method}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {payment.status === "pago" ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Pago
                  </Badge>
                ) : (
                  <>
                    <Badge variant="outline">Pendente</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleMarkPaid(payment)}
                      disabled={isPending}
                      aria-label="Marcar como pago"
                      title="Marcar como pago"
                    >
                      <CircleCheckBig className="size-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleDelete(payment)}
                  disabled={isPending}
                  aria-label="Excluir pagamento"
                  title="Excluir pagamento"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setFormOpen(true)}
      >
        <Plus /> Registrar pagamento
      </Button>

      <PaymentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        suggestedAmount={suggested > 0 ? suggested : finalPrice}
      />
    </div>
  );
}
