"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

// Restaura a sessão uma vez, quando a app abre
export default function AuthInit() {
	useEffect(() => {
		void useAuthStore.getState().init();
	}, []);
	return null;
}