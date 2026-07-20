import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Entrar — inDash" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <SignInForm
      callbackError={
        error === "auth"
          ? "Não foi possível concluir o login. Tente novamente."
          : undefined
      }
    />
  );
}
