import Link from "next/link";
import { Logo } from "@/components/logo";

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
      {children}
    </main>
  );
}
