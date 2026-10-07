"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            aria-label="Alternar tema"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="cursor-pointer inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-soft hover:text-foreground"
        >
            <Sun className="size-5 dark:hidden" />
            <Moon className="hidden size-5 dark:block" />
        </button>
    );
}