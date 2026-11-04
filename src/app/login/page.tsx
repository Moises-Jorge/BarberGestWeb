'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Scissors, LoaderCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
	const router = useRouter();
	const login = useAuthStore((state) => state.login);
	const status = useAuthStore((state) => state.status);
	const [telefone, setTelefone] = useState('');
	const [senha, setSenha] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'authenticated') router.replace('/dashboard');
	}, [router, status]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			await login(telefone.trim(), senha);
			const currentStatus = useAuthStore.getState().status;
			if (currentStatus !== 'authenticated') {
				setError('Telefone ou palavra-passe inválidos.');
			}
		} catch {
			setError('Não foi possível iniciar sessão. Verifique os seus dados e tente novamente.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-8">
			<div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary-soft/70 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-accent/10 blur-3xl" />

			<section className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
				<div className="mb-8 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
						<Scissors className="size-6" />
					</div>
					<p className="mt-5 text-sm font-medium text-primary">BarberGest</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight">Iniciar sessão</h1>
					<p className="mt-2 text-sm text-muted-foreground">Entre no painel de gestão da sua barbearia.</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					{error && (
						<div role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<span>{error}</span>
						</div>
					)}

					<label className="block space-y-1.5 text-sm font-medium">
						Número de telefone
						<input
							required
							autoFocus
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							value={telefone}
							onChange={(event) => setTelefone(event.target.value)}
							placeholder="Ex.: 912 345 678"
							className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
						/>
					</label>

					<label className="block space-y-1.5 text-sm font-medium">
						Palavra-passe
						<span className="relative block">
							<input
								required
								minLength={6}
								type={showPassword ? 'text' : 'password'}
								autoComplete="current-password"
								value={senha}
								onChange={(event) => setSenha(event.target.value)}
								className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-11 text-sm font-normal outline-none transition-colors focus:border-primary"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((visible) => !visible)}
								aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
								className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-primary-soft hover:text-foreground"
							>
								{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
							</button>
						</span>
					</label>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
						{isSubmitting ? 'A entrar...' : 'Entrar'}
					</button>
				</form>

				<p className="mt-8 text-center text-xs text-muted-foreground">Acesso reservado à equipa da barbearia</p>
			</section>
		</main>
	);
}