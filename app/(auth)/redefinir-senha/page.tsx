import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Nova senha — inDash" };

export default async function RedefinirSenhaPage() {
  if (!isSupabaseConfigured) redirect("/sign-in");

  // O link de recuperação cria uma sessão temporária; sem ela não há o que
  // redefinir — provavelmente o link expirou ou foi aberto direto.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/recuperar-senha?expirado=1");

  return <ResetPasswordForm email={user.email ?? ""} />;
}
