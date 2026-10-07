"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { navGroups } from "./nav-items";

function SidebarContent({
    collapsed,
    onNavigate,
}: {
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    const pathname = usePathname();

    return (
        <>
            <div className="flex h-16 items-center gap-2 px-5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Scissors className="size-4" />
                </div>
                {!collapsed && <span className="text-lg font-semibold">BarberGest</span>}
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                {navGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                        {!collapsed && (
                            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {group.title}
                            </p>
                        )}
                        {group.items.map(({ label, href, icon: Icon }) => {
                            const active = pathname === href || pathname.startsWith(`${href}/`);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    title={collapsed ? label : undefined}
                                    onClick={onNavigate}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        collapsed && "justify-center",
                                        active
                                            ? "bg-primary-soft text-primary"
                                            : "text-muted-foreground hover:bg-primary-soft hover:text-foreground"
                                    )}
                                >
                                    <Icon className="size-5 shrink-0" />
                                    {!collapsed && <span>{label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </>
    );
}

export function Sidebar() {
    const { collapsed, mobileOpen, setMobileOpen } = useUIStore();

    return (
        <>
            {/* Desktop */}
            <aside
                className={cn(
                    "hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
                    collapsed ? "w-[72px]" : "w-64"
                )}
            >
                <SidebarContent collapsed={collapsed} />
            </aside>

            {/* Mobile: overlay + drawer */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </aside>
        </>
    );
}