'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, ClipboardList, Eye, LoaderCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { createServico, deleteServico, getTodosServicos, updateServico, type ServicoInput } from '@/lib/api';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { Servico } from '@/lib/types';

type FormValues = {
    nome: string;
    descricao: string;
    preco: string;
    duracao: string;
    ativo: boolean;
};

const emptyForm: FormValues = { nome: '', descricao: '', preco: '', duracao: '', ativo: true };

function formatPrice(price: number) {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(price);
}

function formatDate(value: string | null | undefined) {
    if (!value) return 'Data indisponível';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data indisponível';
    return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function ServicosTable() {
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Servico | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<FormValues>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [servicoToDelete, setServicoToDelete] = useState<Servico | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setServicos(await getTodosServicos());
        } catch {
            setError('Não foi possível carregar os serviços. Confirme a ligação à API e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    function openCreateForm() {
        setEditing(null);
        setForm(emptyForm);
        setIsFormOpen(true);
    }

    function openEditForm(servico: Servico) {
        setEditing(servico);
        setForm({
            nome: servico.nome,
            descricao: servico.descricao ?? '',
            preco: String(servico.preco),
            duracao: String(servico.duracao),
            ativo: servico.ativo,
        });
        setIsFormOpen(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);

        const input: ServicoInput = {
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            preco: Number(form.preco),
            duracao: Number(form.duracao),
            ativo: form.ativo,
        };

        try {
            if (editing) await updateServico(editing.id, input);
            else await createServico(input);
            setIsFormOpen(false);
            await refresh();
        } catch {
            setError(editing ? 'Não foi possível atualizar este serviço.' : 'Não foi possível criar o serviço.');
        } finally {
            setIsSaving(false);
        }
    }

    async function toggleActive(servico: Servico) {
        setBusyId(servico.id);
        setError(null);
        try {
            await updateServico(servico.id, {
                nome: servico.nome,
                descricao: servico.descricao ?? null,
                preco: servico.preco,
                duracao: servico.duracao,
                ativo: !servico.ativo,
            });
            setServicos((current) => current.map((item) => item.id === servico.id ? { ...item, ativo: !item.ativo } : item));
        } catch {
            setError('Não foi possível alterar o estado deste serviço.');
        } finally {
            setBusyId(null);
        }
    }

    function openDeleteDialog(servico: Servico) {
        setDeleteError(null);
        setServicoToDelete(servico);
    }

    async function confirmDelete() {
        if (!servicoToDelete) return;
        const servico = servicoToDelete;
        setBusyId(servico.id);
        try {
            await deleteServico(servico.id);
            setServicos((current) => current.filter((item) => item.id !== servico.id));
            setServicoToDelete(null);
        } catch {
            setDeleteError('Não foi possível remover este serviço. Tente novamente.');
        } finally {
            setBusyId(null);
        }
    }

    const filteredServicos = servicos.filter((servico) => {
        const query = search.trim().toLocaleLowerCase('pt-PT');
        return `${servico.nome} ${servico.descricao ?? ''}`.toLocaleLowerCase('pt-PT').includes(query);
    });

    return (
        <section className="mt-7 space-y-4" aria-label="Catálogo de serviços">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar serviços" aria-label="Pesquisar serviços" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <button type="button" onClick={openCreateForm} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"><Plus className="size-4" />Adicionar serviço</button>
            </div>

            {error && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm">
                    <span>{error}</span>
                    <button type="button" onClick={() => void refresh()} className="font-medium text-primary hover:underline">Tentar novamente</button>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-left text-sm">
                        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium">Serviço</th>
                                <th scope="col" className="px-4 py-3 font-medium">Preço</th>
                                <th scope="col" className="px-4 py-3 font-medium">Duração</th>
                                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">A carregar serviços...</td></tr>
                            ) : filteredServicos.length > 0 ? filteredServicos.map((servico) => (
                                <tr key={servico.id} className="transition-colors hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {servico.imagemUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={servico.imagemUrl} alt="" className="size-9 shrink-0 rounded-md border border-border object-cover" />
                                            ) : (
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"><ClipboardList className="size-4" /></span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{servico.nome}</p>
                                                <Link href={`/servicos/${servico.id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">Ver perfil <ArrowUpRight className="size-3" /></Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(servico.preco)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{servico.duracao} min</td>
                                    <td className="px-4 py-3">
                                        <button type="button" onClick={() => void toggleActive(servico)} disabled={busyId === servico.id} aria-pressed={servico.ativo} title={servico.ativo ? 'Desativar serviço' : 'Ativar serviço'} className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${servico.ativo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                            <span className={`size-1.5 rounded-full ${servico.ativo ? 'bg-success' : 'bg-muted-foreground'}`} />{servico.ativo ? 'Ativo' : 'Inativo'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/servicos/${servico.id}`} aria-label={`Ver detalhes de ${servico.nome}`} title="Ver detalhes" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary"><Eye className="size-4" /></Link>
                                            <button type="button" onClick={() => openEditForm(servico)} aria-label={`Editar ${servico.nome}`} title="Editar serviço" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary"><Pencil className="size-4" /></button>
                                            <button type="button" onClick={() => openDeleteDialog(servico)} disabled={busyId === servico.id} aria-label={`Remover ${servico.nome}`} title="Remover serviço" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50">{busyId === servico.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-4 py-12 text-center">
                                    <p className="font-medium">{search ? 'Nenhum serviço encontrado' : 'Ainda não há serviços'}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{search ? 'Experimente outro termo de pesquisa.' : 'Adicione o primeiro serviço ao catálogo.'}</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{filteredServicos.length} {filteredServicos.length === 1 ? 'serviço' : 'serviços'}{search ? ' encontrados' : ' no catálogo'}</div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false);
                }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="servico-form-title" className="my-auto w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
                        <div className="flex items-start justify-between border-b border-border px-5 py-4">
                            <div><h2 id="servico-form-title" className="text-lg font-semibold">{editing ? 'Editar serviço' : 'Adicionar serviço'}</h2><p className="mt-1 text-sm text-muted-foreground">Defina o nome, preço e duração do serviço.</p></div>
                            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} aria-label="Fechar formulário" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <label className="block space-y-1.5 text-sm font-medium">Nome<input required maxLength={120} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="block space-y-1.5 text-sm font-medium">Descrição <span className="font-normal text-muted-foreground">(opcional)</span><textarea rows={3} maxLength={1000} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-normal outline-none focus:border-primary" /></label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block space-y-1.5 text-sm font-medium">Preço (Kz)<input required type="number" min="0" step="0.01" value={form.preco} onChange={(event) => setForm({ ...form, preco: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                                <label className="block space-y-1.5 text-sm font-medium">Duração (min)<input required type="number" min="1" step="1" value={form.duracao} onChange={(event) => setForm({ ...form, duracao: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            </div>
                            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
                                <input type="checkbox" checked={form.ativo} onChange={(event) => setForm({ ...form, ativo: event.target.checked })} className="size-4 accent-primary" />
                                <span className="flex-1"><span className="block font-medium">Serviço ativo</span><span className="mt-0.5 block text-xs text-muted-foreground">Serviços inativos não estão disponíveis para marcação.</span></span>
                                {form.ativo ? <Check className="size-4 text-primary" /> : null}
                            </label>
                            <div className="flex justify-end gap-2 border-t border-border pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">{isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}{editing ? 'Guardar alterações' : 'Criar serviço'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteDialog
                open={servicoToDelete !== null}
                itemName={servicoToDelete?.nome ?? ''}
                itemType="serviço"
                isDeleting={servicoToDelete !== null && busyId === servicoToDelete.id}
                errorMessage={deleteError}
                onConfirm={() => void confirmDelete()}
                onClose={() => {
                    if (busyId !== servicoToDelete?.id) {
                        setServicoToDelete(null);
                        setDeleteError(null);
                    }
                }}
            />
        </section>
    );
}
