"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { isNavItemActive, navItems } from "@/components/nav-items";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" aria-label="inDash — ir para o dashboard">
          <Logo size="sm" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              data-tour={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
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
    </aside>
  );
}
