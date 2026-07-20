import { redirect } from "next/navigation";

// Placeholder até a landing page (Fase 10): manda para o app.
// Deslogado, o proxy redireciona para /sign-in.
export default function HomePage() {
  redirect("/dashboard");
}
