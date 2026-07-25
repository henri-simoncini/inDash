"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { isNavItemActive, navItems } from "@/components/nav-items";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileHeader({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu ao navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:hidden">
      <Link href="/dashboard" aria-label="inDash — ir para o dashboard">
        <Logo size="sm" />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menu de navegação"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex h-14 items-center border-b px-4">
            <Logo size="sm" />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isNavItemActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <div className="mb-2 min-w-0 px-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
              >
                <LogOut className="size-4" aria-hidden />
                Sair
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
