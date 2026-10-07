"use client";

import { Bell, Menu, PanelLeft, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUIStore } from "@/stores/ui-store";

const iconButton =
    "inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-soft hover:text-foreground";

export function Header() {
    const { toggleCollapsed, setMobileOpen } = useUIStore();

    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
            <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setMobileOpen(true)}
                className={`${iconButton} lg:hidden`}
            >
                <Menu className="size-5" />
            </button>
            <button
                type="button"
                aria-label="Recolher menu"
                onClick={toggleCollapsed}
                className={`${iconButton} hidden lg:inline-flex`}
            >
                <PanelLeft className="size-5" />
            </button>

            <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Pesquisar..."
                    className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
            </div>

            <div className="ml-auto flex items-center gap-1">
                <ThemeToggle />
                <button type="button" aria-label="Notificações" className={iconButton}>
                    <Bell className="size-5" />
                </button>
                <div className="ml-2 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    A
                </div>
            </div>
        </header>
    );
}