import { create } from 'zustand';
import { API_URL } from '@/lib/api';

const TOKEN_KEY = 'BarberAppToken';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';


export interface User {
	id: string;
	nome: string;
	telefone: string;
	imagemUrl?: string | null;
	role: "BARBEIRO";
	isAdmin: boolean;
}

export interface ResponseLogin {
	accessToken: string;
	user: User | null;
}

interface AuthState {
	data: User | null;
	token: string | null;
	status: AuthStatus;
	init: () => Promise<void>;
	setUser: (user: User | null) => void;
	login: (telefone: string, senha: string) => Promise<void>;
	setStatus: (status: AuthStatus) => void;
	logout: () => void;
};

export const useAuthStore = create<AuthState>()((set) => {

	return {
		data: null,
		token: null,
		status: 'loading',
		init: async () => {
			const token = localStorage.getItem(TOKEN_KEY);
			if (token) {
				// Pegar os dados do usuário com o token, se necessário
				const data = await fetch(`${API_URL}/auth/me`, {
					headers: { 'Authorization': `Bearer ${token}` },
				});
				if (data.ok) {
					const userData: User = await data.json();
					set({ token, data: userData, status: 'authenticated' });
				} else {
					set({ status: 'unauthenticated' });
				}
			} else {
				set({ status: 'unauthenticated' });
			}
		},
		setUser: (user) => set({ data: user }),
		login: async (telefone, senha) => {
			try {
				const response = await fetch(`${API_URL}/auth/login/barbeiro`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ telefone, senha }),
				});
				if (!response.ok) throw new Error('Login failed');
				const data: ResponseLogin = await response.json();
				if (!data.user?.isAdmin) {
					throw new Error('Acesso negado. Apenas administradores podem aceder a esta área.');
				}
				localStorage.setItem(TOKEN_KEY, data.accessToken);
				set({ token: data.accessToken, data: data.user, status: 'authenticated' });
			} catch (error) {
				set({ status: 'unauthenticated' });
				throw error;
			}
		},
		setStatus: (status) => set({ status }),
		logout: () => {
			localStorage.removeItem(TOKEN_KEY);
			set({ token: null, data: null, status: 'unauthenticated' });
		},
	}
});