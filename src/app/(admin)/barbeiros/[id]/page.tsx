'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Clock3, LoaderCircle, Phone, Shield, UserRound } from 'lucide-react';
import { getBarbeiroById } from '@/lib/api';
import type { Barbeiro } from '@/lib/types';

function formatDate(value: Date) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data indisponível';

    return new Intl.DateTimeFormat('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getInitials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

export default function BarbeiroDetailsPage() {
    const params = useParams<{ id: string }>();
    const [barbeiro, setBarbeiro] = useState<Barbeiro | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBarbeiro = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setBarbeiro(await getBarbeiroById(params.id));
        } catch {
            setError('Não foi possível carregar este barbeiro. O registo pode ter sido removido ou a API está indisponível.');
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        void loadBarbeiro();
    }, [loadBarbeiro]);

    if (isLoading) {
        return <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />A carregar perfil...</div>;
    }

    if (error || !barbeiro) {
        return (
            <div className="max-w-2xl space-y-4">
                <Link href="/barbeiros" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar à equipa</Link>
                <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-5">
                    <p className="font-medium">Perfil indisponível</p>
                    <p className="mt-1 text-sm text-muted-foreground">{error ?? 'Este barbeiro não foi encontrado.'}</p>
                    <button type="button" onClick={() => void loadBarbeiro()} className="mt-3 text-sm font-medium text-primary hover:underline">Tentar novamente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-7">
            <Link href="/barbeiros" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar à equipa</Link>

            <section className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center">
                {barbeiro.imagemUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={barbeiro.imagemUrl} alt={`Fotografia de ${barbeiro.nome}`} className="size-20 rounded-full border border-border object-cover" />
                ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">{getInitials(barbeiro.nome)}</div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">BarberGest / Equipa</p>
                    <h1 className="mt-1 truncate text-2xl font-semibold">{barbeiro.nome}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Phone className="size-4" />{barbeiro.telefone}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${barbeiro.isAdmin ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {barbeiro.isAdmin ? <Shield className="size-3.5" /> : <UserRound className="size-3.5" />}
                            {barbeiro.isAdmin ? 'Administrador' : 'Barbeiro'}
                        </span>
                    </div>
                </div>
            </section>

            <section aria-labelledby="profile-details-heading" className="space-y-4">
                <h2 id="profile-details-heading" className="text-lg font-semibold">Informações do perfil</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <Phone className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Telefone</dt><dd className="mt-1 text-sm font-medium">{barbeiro.telefone}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Horário de trabalho</dt><dd className="mt-1 text-sm font-medium">{barbeiro.h_entrada.slice(0, 5)}–{barbeiro.h_saida.slice(0, 5)}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        {barbeiro.isAdmin ? <Shield className="mt-0.5 size-4 text-muted-foreground" /> : <UserRound className="mt-0.5 size-4 text-muted-foreground" />}
                        <div><dt className="text-xs text-muted-foreground">Nível de acesso</dt><dd className="mt-1 text-sm font-medium">{barbeiro.isAdmin ? 'Administrador' : 'Barbeiro'}</dd></div>
                    </div>
                    <div className="border-t border-border py-4 sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">Identificador</dt>
                        <dd className="mt-1 break-all font-mono text-sm">{barbeiro.id}</dd>
                    </div>
                </dl>
            </section>

            <section aria-labelledby="profile-record-heading" className="space-y-4">
                <h2 id="profile-record-heading" className="text-lg font-semibold">Registo</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="border-t border-border py-4"><dt className="text-xs text-muted-foreground">Criado em</dt><dd className="mt-1 text-sm font-medium">{formatDate(barbeiro.createdAt)}</dd></div>
                    <div className="border-t border-border py-4"><dt className="text-xs text-muted-foreground">Última atualização</dt><dd className="mt-1 text-sm font-medium">{formatDate(barbeiro.updatedAt)}</dd></div>
                </dl>
            </section>
        </div>
    );
}