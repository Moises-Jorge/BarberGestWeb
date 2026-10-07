import { create } from "zustand";

type UIState = {
    collapsed: boolean;
    mobileOpen: boolean;
    toggleCollapsed: () => void;
    setMobileOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
    collapsed: false,
    mobileOpen: false,
    toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
    setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));