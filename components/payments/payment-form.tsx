"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { dayKey } from "@/lib/agenda";
import {
  PAYMENT_METHODS,
  paymentSchema,
  type PaymentValues,
} from "@/lib/validations/payment";
import { createPayment } from "@/app/dashboard/financeiro/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaymentForm({
  open,
  onOpenChange,
  projectId,
  suggestedAmount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  suggestedAmount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      status: "pago",
      paidAt: dayKey(new Date()),
      method: "Pix",
    },
  });

  const status = watch("status");
  const method = watch("method");

  useEffect(() => {
    if (open) {
      setServerError(undefined);
      reset({
        amount: suggestedAmount,
        status: "pago",
        paidAt: dayKey(new Date()),
        method: "Pix",
      });
    }
  }, [open, suggestedAmount, reset]);

  function onSubmit(values: PaymentValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createPayment(projectId, values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      toast.success(
        values.status === "pago"
          ? "Pagamento registrado. 💰"
          : "Pagamento pendente registrado."
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            Registre o valor recebido (ou combine um pagamento pendente).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="payment-amount">Valor (R$)</Label>
            <Input
              id="payment-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Sugerido a partir do que ainda falta do preço do projeto.
            </p>
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", (value ?? "pago") as PaymentValues["status"])
                }
              >
                <SelectTrigger id="payment-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Método</Label>
              <Select
                value={method || "Pix"}
                onValueChange={(value) => setValue("method", value ?? "Pix")}
              >
                <SelectTrigger id="payment-method" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "pago" && (
            <div className="grid gap-2">
              <Label htmlFor="payment-date">Data do pagamento</Label>
              <Input id="payment-date" type="date" {...register("paidAt")} />
              <p className="text-xs text-muted-foreground">
                As estatísticas do Financeiro usam essa data.
              </p>
            </div>
          )}

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
