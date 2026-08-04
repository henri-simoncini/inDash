"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { QrCode, Trash2 } from "lucide-react";
import { PIX_KEY_TYPE_LABELS, type PixKeyType } from "@/lib/pix";
import {
  pixSettingsSchema,
  type PixSettingsValues,
} from "@/lib/validations/pix";
import {
  removePixSettings,
  updatePixSettings,
} from "@/app/dashboard/configuracoes/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLACEHOLDERS: Record<PixKeyType, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
  email: "voce@exemplo.com",
  telefone: "(11) 99999-9999",
  aleatoria: "00000000-0000-0000-0000-000000000000",
};

export function PixSettings({ initial }: { initial: PixSettingsValues | null }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();
  const [saved, setSaved] = useState(Boolean(initial));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PixSettingsValues>({
    resolver: zodResolver(pixSettingsSchema),
    defaultValues: initial ?? {
      keyType: "email",
      key: "",
      name: "",
      city: "",
    },
  });

  const keyType = watch("keyType");

  function onSubmit(values: PixSettingsValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await updatePixSettings(values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setSaved(true);
      toast.success("Chave Pix salva.");
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removePixSettings();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      reset({ keyType: "email", key: "", name: "", city: "" });
      setSaved(false);
      toast.success("Chave Pix removida.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-4" aria-hidden /> Recebimento por Pix
        </CardTitle>
        <CardDescription>
          Com a chave cadastrada, cada projeto gera um QR de cobrança já com o
          valor. O inDash não recebe aviso do banco — a confirmação do
          pagamento continua sendo sua.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:max-w-md"
        >
          <div className="grid gap-2">
            <Label htmlFor="pix-type">Tipo de chave</Label>
            <Select
              value={keyType}
              onValueChange={(value) =>
                setValue("keyType", (value ?? "email") as PixKeyType)
              }
            >
              <SelectTrigger id="pix-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PIX_KEY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pix-key">Chave</Label>
            <Input
              id="pix-key"
              placeholder={PLACEHOLDERS[keyType]}
              {...register("key")}
            />
            {errors.key && (
              <p className="text-sm text-destructive">{errors.key.message}</p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pix-name">Nome do recebedor</Label>
              <Input id="pix-name" maxLength={25} {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pix-city">Cidade</Label>
              <Input id="pix-city" maxLength={15} {...register("city")} />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Nome e cidade são exigidos pelo padrão do Banco Central e aparecem
            para o cliente na hora de pagar.
          </p>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar chave"}
            </Button>
            {saved && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={isPending}
              >
                <Trash2 /> Remover
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
