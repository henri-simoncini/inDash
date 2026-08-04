"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { formatBRL, formatFactor } from "@/lib/format";
import {
  projectSchema,
  type ProjectValues,
} from "@/lib/validations/project";
import {
  createProject,
  updateProject,
} from "@/app/dashboard/projetos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type Client = Pick<Tables<"clients">, "id" | "name">;
type Service = Pick<Tables<"services">, "id" | "name" | "base_price">;
type Multiplier = Tables<"multipliers">;
type Project = Tables<"projects">;

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

export function ProjectForm({
  open,
  onOpenChange,
  clients,
  services,
  multipliers,
  project,
  snapshotProduct,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  services: Service[];
  multipliers: Multiplier[];
  // Edição: serviço e fatores ficam travados (snapshot preservado)
  project?: Project | null;
  snapshotProduct?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      clientId: "",
      serviceId: "",
      basePrice: 0,
      scheduledAt: "",
      deadline: "",
      multiplierIds: [],
    },
  });

  const clientId = watch("clientId");
  const serviceId = watch("serviceId");
  const basePrice = watch("basePrice");
  const multiplierIds = watch("multiplierIds");

  useEffect(() => {
    if (open) {
      setServerError(undefined);
      reset({
        title: project?.title ?? "",
        clientId: project?.client_id ?? "",
        serviceId: project?.service_id ?? "",
        basePrice: project?.base_price ?? 0,
        scheduledAt: toDatetimeLocal(project?.scheduled_at ?? null),
        deadline: toDateInput(project?.deadline ?? null),
        multiplierIds: [],
      });
    }
  }, [open, project, reset]);

  const applicable = useMemo(
    () =>
      multipliers.filter(
        (m) => m.service_id === null || m.service_id === serviceId
      ),
    [multipliers, serviceId]
  );

  const factorProduct = useMemo(() => {
    if (project) return snapshotProduct ?? 1;
    return applicable
      .filter((m) => multiplierIds.includes(m.id))
      .reduce((total, m) => total * m.factor, 1);
  }, [project, snapshotProduct, applicable, multiplierIds]);

  const finalPrice =
    Math.round((Number.isNaN(basePrice) ? 0 : basePrice) * factorProduct * 100) /
    100;

  function onServiceChange(value: string | null) {
    const id = value ?? "";
    setValue("serviceId", id);
    const service = services.find((s) => s.id === id);
    if (service && !project) {
      setValue("basePrice", service.base_price);
    }
    // Remove fatores que não valem para o novo serviço
    setValue(
      "multiplierIds",
      multiplierIds.filter((mid) => {
        const m = multipliers.find((item) => item.id === mid);
        return m && (m.service_id === null || m.service_id === id);
      })
    );
  }

  function toggleMultiplier(id: string, checked: boolean) {
    setValue(
      "multiplierIds",
      checked
        ? [...multiplierIds, id]
        : multiplierIds.filter((mid) => mid !== id)
    );
  }

  function onSubmit(values: ProjectValues) {
    setServerError(undefined);
    startTransition(async () => {
      if (project) {
        const result = await updateProject(project.id, values);
        if (result?.error) {
          setServerError(result.error);
          return;
        }
        toast.success("Projeto atualizado.");
        onOpenChange(false);
      } else {
        const result = await createProject(values);
        if (result?.error) {
          setServerError(result.error);
          return;
        }
        toast.success("Projeto criado.");
        onOpenChange(false);
        if (result.id) router.push(`/dashboard/projetos/${result.id}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {project ? "Editar projeto" : "Novo projeto"}
          </DialogTitle>
          <DialogDescription>
            {project
              ? "Serviço e fatores aplicados não mudam na edição — o preço final é recalculado a partir do preço base."
              : "Escolha cliente, serviço e fatores — o preço é calculado na hora."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="project-title">Título</Label>
            <Input
              id="project-title"
              placeholder="Ex.: Logo da Padaria Estrela"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-client">Cliente</Label>
              <Select
                value={clientId || undefined}
                onValueChange={(value) => setValue("clientId", value ?? "")}
              >
                <SelectTrigger id="project-client" className="w-full">
                  <SelectValue placeholder="Escolha o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum cliente ativo — cadastre um na aba Clientes.
                </p>
              )}
              {errors.clientId && (
                <p className="text-sm text-destructive">
                  {errors.clientId.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-service">Serviço</Label>
              <Select
                value={serviceId || undefined}
                onValueChange={onServiceChange}
                disabled={Boolean(project)}
              >
                <SelectTrigger id="project-service" className="w-full">
                  <SelectValue placeholder="Escolha o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!project && services.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum serviço ativo — cadastre um na aba Serviços.
                </p>
              )}
              {errors.serviceId && (
                <p className="text-sm text-destructive">
                  {errors.serviceId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-scheduled">
                Agendado para{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                id="project-scheduled"
                type="datetime-local"
                {...register("scheduledAt")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-deadline">
                Prazo de entrega{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                id="project-deadline"
                type="date"
                {...register("deadline")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-price">Preço base (R$)</Label>
            <Input
              id="project-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              {...register("basePrice", { valueAsNumber: true })}
            />
            {!project && (
              <p className="text-xs text-muted-foreground">
                Preenchido a partir do serviço — ajuste se negociou outro valor.
              </p>
            )}
            {errors.basePrice && (
              <p className="text-sm text-destructive">
                {errors.basePrice.message}
              </p>
            )}
          </div>

          {!project && (
            <div className="grid gap-2">
              <Label>
                Fatores multiplicativos{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              {serviceId === "" ? (
                <p className="text-xs text-muted-foreground">
                  Escolha um serviço para ver os fatores aplicáveis.
                </p>
              ) : applicable.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum fator cadastrado para este serviço. Crie na aba
                  Serviços.
                </p>
              ) : (
                <div className="grid gap-2 rounded-lg border p-3">
                  {applicable.map((multiplier) => (
                    <div
                      key={multiplier.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`mult-${multiplier.id}`}
                          checked={multiplierIds.includes(multiplier.id)}
                          onCheckedChange={(checked) =>
                            toggleMultiplier(multiplier.id, checked === true)
                          }
                        />
                        <Label
                          htmlFor={`mult-${multiplier.id}`}
                          className="font-normal"
                        >
                          {multiplier.name}
                        </Label>
                      </div>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {formatFactor(multiplier.factor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Preço final</span>
              <span className="font-heading text-[1.35rem]">
                {formatBRL(finalPrice)}
              </span>
            </div>
            {factorProduct !== 1 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatBRL(Number.isNaN(basePrice) ? 0 : basePrice)} ×{" "}
                {formatFactor(factorProduct).replace("×", "")} ={" "}
                {formatBRL(finalPrice)}
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
                : project
                  ? "Salvar alterações"
                  : "Criar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
