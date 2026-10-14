'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, CalendarClock, ClipboardList, RefreshCw, Scissors, Users } from 'lucide-react';
import { getTodosBarbeiros, getTodosClients, getTodosServicos } from '@/lib/api';
import type { Barbeiro, Cliente, Servico } from '@/lib/types';

type DashboardData = {
    clientes: Cliente[];
    barbeiros: Barbeiro[];
    servicos: Servico[];
};

async function fetchDashboardData(): Promise<DashboardData> {
    const [clientes, barbeiros, servicos] = await Promise.all([
        getTodosClients(),
        getTodosBarbeiros(),
        getTodosServicos(),
    ]);

    return { clientes, barbeiros, servicos };
}

function formatDate(value: Date) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Data indisponível';

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setData(await fetchDashboardData());
        } catch {
            setError('Não foi possível carregar os dados. Verifique a ligação à API e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshDashboard();
    }, [refreshDashboard]);

    const stats = [
        { label: 'Clientes', value: data?.clientes.length, icon: Users, detail: 'Registados na plataforma' },
        { label: 'Barbeiros', value: data?.barbeiros.length, icon: Scissors, detail: 'Na equipa' },
        { label: 'Serviços', value: data?.servicos.length, icon: ClipboardList, detail: 'No catálogo' },
        {
            label: 'Serviços ativos',
            value: data?.servicos.filter((servico) => servico.ativo).length,
            icon: Activity,
            detail: 'Disponíveis para marcação',
        },
    ];

    const sections = data
        ? [
              {
                  title: 'Clientes recentes',
                  icon: Users,
                  records: [...data.clientes]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((cliente) => ({
                          id: cliente.id,
                          name: cliente.nome,
                          detail: cliente.telefone,
                          date: cliente.createdAt,
                      })),
              },
              {
                  title: 'Equipa de barbeiros',
                  icon: Scissors,
                  records: [...data.barbeiros]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((barbeiro) => ({
                          id: barbeiro.id,
                          name: barbeiro.nome,
                          detail: `${barbeiro.h_entrada}–${barbeiro.h_saida}`,
                          date: barbeiro.createdAt,
                      })),
              },
              {
                  title: 'Catálogo de serviços',
                  icon: ClipboardList,
                  records: [...data.servicos]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((servico) => ({
                          id: servico.id,
                          name: servico.nome,
                          detail: `${servico.duracao} min · ${servico.ativo ? 'Ativo' : 'Inativo'}`,
                          date: servico.createdAt,
                      })),
              },
          ]
        : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-primary">BarberGest</p>
                    <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Visão geral dos dados da barbearia</p>
                </div>
                <button
                    type="button"
                    onClick={() => void refreshDashboard()}
                    disabled={isLoading}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />
                    <div className="min-w-0 flex-1">
                        <p className="font-medium">Falha ao carregar o dashboard</p>
                        <p className="mt-1 text-muted-foreground">{error}</p>
                    </div>
                    <button type="button" onClick={() => void refreshDashboard()} className="shrink-0 font-medium text-primary hover:underline">
                        Tentar novamente
                    </button>
                </div>
            )}

            <section aria-label="Indicadores" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, detail }) => (
                    <div key={label} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                                <Icon className="size-4" />
                            </span>
                        </div>
                        <p aria-live="polite" className="mt-4 text-3xl font-semibold tabular-nums">
                            {isLoading && value === undefined ? <span className="text-muted-foreground">—</span> : value ?? '—'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                    </div>
                ))}
            </section>

            <section aria-labelledby="recent-heading" className="space-y-4">
                <div className="flex items-center gap-2">
                    <CalendarClock className="size-5 text-primary" />
                    <h2 id="recent-heading" className="text-lg font-semibold">Dados recentes</h2>
                </div>
                {isLoading && !data ? (
                    <div className="grid gap-6 xl:grid-cols-3" aria-label="A carregar dados">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="space-y-4 border-t border-border pt-4">
                                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                                {[0, 1, 2].map((row) => <div key={row} className="h-12 animate-pulse rounded bg-muted" />)}
                            </div>
                        ))}
                    </div>
                ) : data ? (
                    <div className="grid gap-6 xl:grid-cols-3">
                        {sections.map(({ title, icon: Icon, records }) => (
                            <div key={title} className="min-w-0 border-t border-border pt-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold">
                                    <Icon className="size-4 text-muted-foreground" />
                                    {title}
                                </h3>
                                {records.length > 0 ? (
                                    <ul className="mt-2 divide-y divide-border">
                                        {records.map((record) => (
                                            <li key={record.id} className="flex min-w-0 items-center justify-between gap-3 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{record.name}</p>
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.detail}</p>
                                                </div>
                                                <time className="shrink-0 text-xs text-muted-foreground" dateTime={new Date(record.date).toISOString()}>
                                                    {formatDate(record.date)}
                                                </time>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="py-6 text-sm text-muted-foreground">Ainda não há registos.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : !error ? (
                    <p className="py-6 text-sm text-muted-foreground">A carregar dados...</p>
                ) : null}
            </section>
        </div>
    );
}