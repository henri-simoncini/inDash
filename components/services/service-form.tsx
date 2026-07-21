"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { serviceSchema, type ServiceValues } from "@/lib/validations/service";
import { createService, updateService } from "@/app/dashboard/servicos/actions";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Service = Tables<"services">;

export function ServiceForm({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
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
  } = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", description: "", basePrice: 0, active: true },
  });

  const active = watch("active");

  useEffect(() => {
    if (open) {
      setServerError(undefined);
      reset({
        name: service?.name ?? "",
        description: service?.description ?? "",
        basePrice: service?.base_price ?? 0,
        active: service?.active ?? true,
      });
    }
  }, [open, service, reset]);

  function onSubmit(values: ServiceValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = service
        ? await updateService(service.id, values)
        : await createService(values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      toast.success(service ? "Serviço atualizado." : "Serviço criado.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          <DialogDescription>
            {service
              ? "Altere os dados do serviço. Projetos existentes não mudam de preço."
              : "Cadastre um serviço que você oferece aos seus clientes."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="service-name">Nome</Label>
            <Input
              id="service-name"
              placeholder="Ex.: Logo + identidade visual"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service-description">
              Descrição{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="service-description"
              rows={3}
              placeholder="O que está incluso nesse serviço?"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service-price">Preço base (R$)</Label>
            <Input
              id="service-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              {...register("basePrice", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Ponto de partida do preço. Os fatores multiplicativos ajustam esse
              valor em cada projeto.
            </p>
            {errors.basePrice && (
              <p className="text-sm text-destructive">
                {errors.basePrice.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="service-active">Serviço ativo</Label>
              <p className="text-xs text-muted-foreground">
                Serviços inativos não aparecem ao criar projetos.
              </p>
            </div>
            <Switch
              id="service-active"
              checked={active}
              onCheckedChange={(checked) => setValue("active", checked)}
            />
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
                : service
                  ? "Salvar alterações"
                  : "Criar serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
