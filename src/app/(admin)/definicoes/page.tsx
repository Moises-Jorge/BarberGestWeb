'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, Clock3, LoaderCircle, LockKeyhole, Phone, Save, UserRound } from 'lucide-react';
import { getBarbeiroById, updateBarbeiro } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Barbeiro } from '@/lib/types';

type FormValues = {
    nome: string;
    telefone: string;
    h_entrada: string;
    h_saida: string;
    senha: string;
};

function toFormValues(barbeiro: Barbeiro): FormValues {
    return {
        nome: barbeiro.nome,
        telefone: barbeiro.telefone,
        h_entrada: barbeiro.h_entrada.slice(0, 5),
        h_saida: barbeiro.h_saida.slice(0, 5),
        senha: '',
    };
}

export default function DefinicoesPage() {
    const user = useAuthStore((state) => state.data);
    const setUser = useAuthStore((state) => state.setUser);
    const [barbeiro, setBarbeiro] = useState<Barbeiro | null>(null);
    const [form, setForm] = useState<FormValues | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const profile = await getBarbeiroById(user.id);
            setBarbeiro(profile);
            setForm(toFormValues(profile));
        } catch {
            setError('Não foi possível carregar os seus dados. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!barbeiro || !form) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await updateBarbeiro(barbeiro.id, {
                nome: form.nome.trim(),
                telefone: form.telefone.trim(),
                h_entrada: form.h_entrada,
                h_saida: form.h_saida,
                isAdmin: barbeiro.isAdmin,
                ...(form.senha ? { senha: form.senha } : {}),
            });

            const updatedProfile = await getBarbeiroById(barbeiro.id);
            setBarbeiro(updatedProfile);
            setForm(toFormValues(updatedProfile));
            setUser({
                id: updatedProfile.id,
                nome: updatedProfile.nome,
                telefone: updatedProfile.telefone,
                imagemUrl: updatedProfile.imagemUrl,
                role: 'BARBEIRO',
                isAdmin: updatedProfile.isAdmin,
            });
            setSuccess('Os seus dados foram atualizados.');
        } catch {
            setError('Não foi possível guardar as alterações. Verifique os dados e tente novamente.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-3xl space-y-7">
            <div>
                <p className="text-sm font-medium text-primary">BarberGest</p>
                <h1 className="mt-1 text-2xl font-semibold">Definições</h1>
                <p className="mt-1 text-sm text-muted-foreground">Gerir os seus dados pessoais e horário de trabalho</p>
            </div>

            {isLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />A carregar os seus dados...</div>
            ) : !user ? (
                <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">Sessão indisponível. Volte a iniciar sessão.</div>
            ) : form ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>}
                    {success && <div role="status" className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success"><Check className="size-4" />{success}</div>}

                    <section className="rounded-lg border border-border bg-card">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold"><UserRound className="size-4 text-primary" />Dados pessoais</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Estes dados são apresentados no seu perfil.</p>
                        </div>
                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <label className="block space-y-1.5 text-sm font-medium sm:col-span-2">Nome<input required maxLength={120} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="block space-y-1.5 text-sm font-medium sm:col-span-2">Número de telefone<span className="relative block"><Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input required type="tel" maxLength={30} value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 font-normal outline-none focus:border-primary" /></span></label>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-card">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold"><Clock3 className="size-4 text-primary" />Horário de trabalho</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Defina o seu horário habitual na barbearia.</p>
                        </div>
                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <label className="block space-y-1.5 text-sm font-medium">Hora de entrada<input required type="time" value={form.h_entrada} onChange={(event) => setForm({ ...form, h_entrada: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="block space-y-1.5 text-sm font-medium">Hora de saída<input required type="time" value={form.h_saida} onChange={(event) => setForm({ ...form, h_saida: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-card">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-4 text-primary" />Segurança</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Deixe vazio para manter a palavra-passe atual.</p>
                        </div>
                        <div className="p-5">
                            <label className="block max-w-md space-y-1.5 text-sm font-medium">Nova palavra-passe<input type="password" autoComplete="new-password" minLength={6} value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {isSaving ? 'A guardar...' : 'Guardar alterações'}
                        </button>
                    </div>
                </form>
            ) : null}
        </div>
    );
}
