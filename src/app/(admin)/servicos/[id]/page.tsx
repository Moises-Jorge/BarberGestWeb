'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Clock3, ClipboardList, LoaderCircle, Tag } from 'lucide-react';
import { getServicoById } from '@/lib/api';
import type { Servico } from '@/lib/types';

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

function formatPrice(price: number) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
}

export default function ServicoDetailsPage() {
    const params = useParams<{ id: string }>();
    const [servico, setServico] = useState<Servico | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadServico = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setServico(await getServicoById(params.id));
        } catch {
            setError('Não foi possível carregar este serviço. O registo pode ter sido removido ou a API está indisponível.');
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        void loadServico();
    }, [loadServico]);

    if (isLoading) {
        return <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />A carregar serviço...</div>;
    }

    if (error || !servico) {
        return (
            <div className="max-w-2xl space-y-4">
                <Link href="/servicos" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar aos serviços</Link>
                <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-5">
                    <p className="font-medium">Serviço indisponível</p>
                    <p className="mt-1 text-sm text-muted-foreground">{error ?? 'Este serviço não foi encontrado.'}</p>
                    <button type="button" onClick={() => void loadServico()} className="mt-3 text-sm font-medium text-primary hover:underline">Tentar novamente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-7">
            <Link href="/servicos" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar aos serviços</Link>

            <section className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center">
                {servico.imagemUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={servico.imagemUrl} alt={`Imagem de ${servico.nome}`} className="size-20 rounded-lg border border-border object-cover" />
                ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><ClipboardList className="size-8" /></div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">BarberGest / Catálogo</p>
                    <h1 className="mt-1 truncate text-2xl font-semibold">{servico.nome}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Tag className="size-4" />{formatPrice(servico.preco)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" />{servico.duracao} min</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${servico.ativo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{servico.ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                </div>
            </section>

            <section aria-labelledby="service-details-heading" className="space-y-4">
                <h2 id="service-details-heading" className="text-lg font-semibold">Informações do serviço</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <Tag className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Preço</dt><dd className="mt-1 text-sm font-medium">{formatPrice(servico.preco)}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Duração</dt><dd className="mt-1 text-sm font-medium">{servico.duracao} minutos</dd></div>
                    </div>
                    <div className="border-t border-border py-4 sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">Descrição</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm">{servico.descricao?.trim() || 'Sem descrição.'}</dd>
                    </div>
                    <div className="flex items-start gap-3 border-t border-border py-4">
                        <ClipboardList className="mt-0.5 size-4 text-muted-foreground" />
                        <div><dt className="text-xs text-muted-foreground">Estado</dt><dd className="mt-1 text-sm font-medium">{servico.ativo ? 'Ativo, disponível para marcação' : 'Inativo, indisponível para marcação'}</dd></div>
                    </div>
                    <div className="border-t border-border py-4">
                        <dt className="text-xs text-muted-foreground">Identificador</dt>
                        <dd className="mt-1 font-mono text-sm">{servico.id}</dd>
                    </div>
                </dl>
            </section>

            <section aria-labelledby="service-record-heading" className="space-y-4">
                <h2 id="service-record-heading" className="text-lg font-semibold">Registo</h2>
                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="border-t border-border py-4"><dt className="text-xs text-muted-foreground">Criado em</dt><dd className="mt-1 text-sm font-medium">{formatDate(servico.created_at)}</dd></div>
                    <div className="border-t border-border py-4"><dt className="text-xs text-muted-foreground">Última atualização</dt><dd className="mt-1 text-sm font-medium">{formatDate(servico.updated_at)}</dd></div>
                </dl>
            </section>
        </div>
    );
}
