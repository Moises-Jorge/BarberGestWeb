import {
    LayoutDashboard,
    CalendarDays,
    Scissors,
    Users,
    ClipboardList,
    Wallet,
    FileBarChart,
    ScrollText,
    Settings,
    type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
    {
        title: "Geral",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Agendamentos", href: "/agendamentos", icon: CalendarDays },
        ],
    },
    {
        title: "Gestão",
        items: [
            { label: "Barbeiros", href: "/barbeiros", icon: Scissors },
            { label: "Clientes", href: "/clientes", icon: Users },
            { label: "Serviços", href: "/servicos", icon: ClipboardList },
            { label: "Pagamentos", href: "/pagamentos", icon: Wallet },
        ],
    },
    {
        title: "Sistema",
        items: [
            { label: "Relatórios", href: "/relatorios", icon: FileBarChart },
            { label: "Logs", href: "/logs", icon: ScrollText },
            { label: "Definições", href: "/definicoes", icon: Settings },
        ],
    },
];