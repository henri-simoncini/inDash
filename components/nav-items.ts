import {
  BarChart3,
  Briefcase,
  Calendar,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Compartilhado entre a sidebar (desktop) e o menu drawer (mobile)
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/servicos", label: "Serviços", icon: Briefcase },
  { href: "/dashboard/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export function isNavItemActive(href: string, pathname: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}
