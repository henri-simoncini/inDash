"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import {
  setPasswordSchema,
  type SetPasswordValues,
} from "@/lib/validations/password";
import { setPassword } from "@/app/(auth)/actions";
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

export function PasswordSettings({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  function onSubmit(values: SetPasswordValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await setPassword(values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      reset({ password: "", confirm: "" });
      toast.success("Senha definida. Já dá para entrar com email e senha.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4" aria-hidden /> Senha de acesso
        </CardTitle>
        <CardDescription>
          Defina uma senha para entrar com <strong>{email}</strong> sem depender
          do Google. Se já tiver uma, isto a substitui.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:max-w-md"
        >
          <div className="grid gap-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirme a senha</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              {...register("confirm")}
            />
            {errors.confirm && (
              <p className="text-sm text-destructive">
                {errors.confirm.message}
              </p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar senha"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
