"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import {
  multiplierSchema,
  type MultiplierValues,
} from "@/lib/validations/service";
import {
  createMultiplier,
  updateMultiplier,
} from "@/app/dashboard/servicos/actions";
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

type Multiplier = Tables<"multipliers">;
type Service = Tables<"services">;

export const KIND_LABELS: Record<Multiplier["kind"], string> = {
  complexity: "Complexidade",
  deadline: "Prazo",
  custom: "Personalizado",
};

export function MultiplierForm({
  open,
  onOpenChange,
  multiplier,
  services,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multiplier?: Multiplier | null;
  services: Service[];
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
  } = useForm<MultiplierValues>({
    resolver: zodResolver(multiplierSchema),
    defaultValues: { name: "", kind: "custom", factor: 1, serviceId: "global" },
  });

  const kind = watch("kind");
  const serviceId = watch("serviceId");

  useEffect(() => {
    if (open) {
      setServerError(undefined);
      reset({
        name: multiplier?.name ?? "",
        kind: multiplier?.kind ?? "custom",
        factor: multiplier?.factor ?? 1,
        serviceId: multiplier?.service_id ?? "global",
      });
    }
  }, [open, multiplier, reset]);

  function onSubmit(values: MultiplierValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = multiplier
        ? await updateMultiplier(multiplier.id, values)
        : await createMultiplier(values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      toast.success(multiplier ? "Fator atualizado." : "Fator criado.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {multiplier ? "Editar fator" : "Novo fator multiplicativo"}
          </DialogTitle>
          <DialogDescription>
            {multiplier
              ? "Projetos que já usam este fator mantêm o valor da época."
              : "Um fator ajusta o preço base ao criar um projeto. Ex.: Urgente ×1,5."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="multiplier-name">Nome</Label>
            <Input
              id="multiplier-name"
              placeholder="Ex.: Urgente, Alta complexidade"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="multiplier-kind">Tipo</Label>
              <Select
                value={kind}
                onValueChange={(value) =>
                  setValue("kind", (value ?? "custom") as MultiplierValues["kind"])
                }
              >
                <SelectTrigger id="multiplier-kind" className="w-full">
                  <SelectValue placeholder="Escolha o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KIND_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kind && (
                <p className="text-sm text-destructive">{errors.kind.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="multiplier-factor">Fator</Label>
              <Input
                id="multiplier-factor"
                type="number"
                inputMode="decimal"
                step="0.05"
                min="0.05"
                {...register("factor", { valueAsNumber: true })}
              />
              {errors.factor && (
                <p className="text-sm text-destructive">
                  {errors.factor.message}
                </p>
              )}
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            O preço é multiplicado por esse valor: 1,5 aumenta 50%; 0,8 dá 20%
            de desconto.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="multiplier-scope">Escopo</Label>
            <Select
              value={serviceId}
              onValueChange={(value) => setValue("serviceId", value ?? "global")}
            >
              <SelectTrigger id="multiplier-scope" className="w-full">
                <SelectValue placeholder="Escolha o escopo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  Global — todos os serviços
                </SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-sm text-destructive">
                {errors.serviceId.message}
              </p>
            )}
          </div>
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
              {isPending
                ? "Salvando..."
                : multiplier
                  ? "Salvar alterações"
                  : "Criar fator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
