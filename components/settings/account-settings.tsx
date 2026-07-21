"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  profileNameSchema,
  type ProfileNameValues,
} from "@/lib/validations/preferences";
import { updateProfileName } from "@/app/dashboard/configuracoes/actions";
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

export function AccountSettings({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileNameValues>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { fullName },
  });

  function onSubmit(values: ProfileNameValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await updateProfileName(values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      toast.success("Nome atualizado.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conta</CardTitle>
        <CardDescription>Seus dados de acesso.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:max-w-md"
        >
          <div className="grid gap-2">
            <Label htmlFor="account-name">Nome de exibição</Label>
            <Input id="account-name" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="account-email">Email</Label>
            <Input id="account-email" value={email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              O email de acesso não pode ser alterado por aqui.
            </p>
          </div>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar nome"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
