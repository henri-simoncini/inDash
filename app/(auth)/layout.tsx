import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Logo } from "@/components/logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Link href="/" aria-label="inDash — página inicial">
        <Logo size="lg" stacked tagline />
      </Link>
      {!isSupabaseConfigured && (
        <div
          role="alert"
          className="flex max-w-sm items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden
          />
          <p>
            <span className="font-medium">Login indisponível.</span> Este
            ambiente está sem as credenciais do Supabase, então o cadastro e o
            acesso não funcionam por enquanto.
          </p>
        </div>
      )}
      {children}
    </main>
  );
}
