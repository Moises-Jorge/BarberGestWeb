'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, LoaderCircle, Phone, UserRound } from 'lucide-react';
import { getClienteById } from '@/lib/api';
import type { Cliente } from '@/lib/types';

function formatDate(value: string | null | undefined) {
    if (!value) return 'Data indisponível';

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

export default function ClienteDetailsPage() {
    const params = useParams<{ id: string }>();
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCliente = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setCliente(await getClienteById(params.id));
        } catch {
            setError('Não foi possível carregar este cliente. O registo pode ter sido removido ou a API está indisponível.');
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        void loadCliente();
    }, [loadCliente]);

    if (isLoading) {
        return <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />A carregar perfil...</div>;
    }

    if (error || !cliente) {
        return (
            <div className="max-w-2xl space-y-4">
                <Link href="/clientes" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar aos clientes</Link>
                <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-5">
                    <p className="font-medium">Perfil indisponível</p>
                    <p className="mt-1 text-sm text-muted-foreground">{error ?? 'Este cliente não foi encontrado.'}</p>
                    <button type="button" onClick={() => void loadCliente()} className="mt-3 text-sm font-medium text-primary hover:underline">Tentar novamente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-7">
            <Link href="/clientes" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar aos clientes</Link>

            <section className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center">
                {cliente.imagemUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cliente.imagemUrl} alt={`Fotografia de ${cliente.nome}`} className="size-20 rounded-full border border-border object-cover" />
                ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xl font-semibold text-primary">{getInitials(cliente.nome)}</div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">BarberGest / Clientes</p>
                    <h1 className="mt-1 truncate text-2xl font-semibold">{cliente.nome}</h1>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="size-4" />{cliente.telefone}</p>
                </div>
            </section>

            <section aria-labelledby="client-details-heading" className="space-y-4">
                <h2 id="client-details-heading" className="text-lg font-semibold">Informações do perfil</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Nome</dt><dd className="mt-1 text-sm font-medium">{cliente.nome}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <Phone className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Telefone</dt><dd className="mt-1 text-sm font-medium">{cliente.telefone}</dd></div>
                    </div>
                    <div className="border-t border-border py-4 sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">Identificador</dt>
                        <dd className="mt-1 break-all font-mono text-sm">{cliente.id}</dd>
                    </div>
                </dl>
            </section>

            <section aria-labelledby="client-record-heading" className="space-y-4">
                <h2 id="client-record-heading" className="text-lg font-semibold">Registo</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="border-t border-border py-4"><dt className="text-xs text-muted-foreground">Criado em</dt><dd className="mt-1 text-sm font-medium">{formatDate(cliente.createdAt)}</dd></div>
                    <div className="border-t border-border py-4"><dt className="text-xs text-muted-foreground">Última atualização</dt><dd className="mt-1 text-sm font-medium">{formatDate(cliente.updatedAt)}</dd></div>
                </dl>
            </section>
        </div>
    );
}
