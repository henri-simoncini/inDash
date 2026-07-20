export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <h1 className="text-2xl font-bold tracking-tight">inDash</h1>
      {children}
    </main>
  );
}
