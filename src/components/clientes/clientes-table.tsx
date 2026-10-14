'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Eye, LoaderCircle, Pencil, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import { createCliente, deleteCliente, getTodosClients, updateCliente, type ClienteInput } from '@/lib/api';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { Cliente } from '@/lib/types';

type FormValues = {
    nome: string;
    telefone: string;
    senha: string;
};

const emptyForm: FormValues = { nome: '', telefone: '', senha: '' };

function getInitials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

export function ClientesTable() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Cliente | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<FormValues>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setClientes(await getTodosClients());
        } catch {
            setError('Não foi possível carregar os clientes. Confirme a ligação à API e tente novamente.');
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

    function openEditForm(cliente: Cliente) {
        setEditing(cliente);
        setForm({ nome: cliente.nome, telefone: cliente.telefone, senha: '' });
        setIsFormOpen(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);

        const input: ClienteInput = {
            nome: form.nome.trim(),
            telefone: form.telefone.trim(),
            ...(form.senha ? { senha: form.senha } : {}),
        };

        try {
            if (editing) await updateCliente(editing.id, input);
            else await createCliente(input);
            setIsFormOpen(false);
            await refresh();
        } catch {
            setError(editing ? 'Não foi possível atualizar este cliente.' : 'Não foi possível criar o cliente.');
        } finally {
            setIsSaving(false);
        }
    }

    function openDeleteDialog(cliente: Cliente) {
        setDeleteError(null);
        setClienteToDelete(cliente);
    }

    async function confirmDelete() {
        if (!clienteToDelete) return;
        const cliente = clienteToDelete;
        setBusyId(cliente.id);
        try {
            await deleteCliente(cliente.id);
            setClientes((current) => current.filter((item) => item.id !== cliente.id));
            setClienteToDelete(null);
        } catch {
            setDeleteError('Não foi possível remover este cliente. Tente novamente.');
        } finally {
            setBusyId(null);
        }
    }

    const filteredClientes = clientes.filter((cliente) => {
        const query = search.trim().toLocaleLowerCase('pt-PT');
        return `${cliente.nome} ${cliente.telefone}`.toLocaleLowerCase('pt-PT').includes(query);
    });

    return (
        <section className="mt-7 space-y-4" aria-label="Lista de clientes">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Pesquisar por nome ou telefone"
                        aria-label="Pesquisar clientes"
                        className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                </div>
                <button type="button" onClick={openCreateForm} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    <Plus className="size-4" />Adicionar cliente
                </button>
            </div>

            {error && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm">
                    <span>{error}</span>
                    <button type="button" onClick={() => void refresh()} className="font-medium text-primary hover:underline">Tentar novamente</button>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-160 text-left text-sm">
                        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
                                <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
                                <th scope="col" className="px-4 py-3 font-medium">Registado em</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">A carregar clientes...</td></tr>
                            ) : filteredClientes.length > 0 ? filteredClientes.map((cliente) => (
                                <tr key={cliente.id} className="transition-colors hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {cliente.imagemUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={cliente.imagemUrl} alt="" className="size-9 shrink-0 rounded-full border border-border object-cover" />
                                            ) : (
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{getInitials(cliente.nome)}</span>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{cliente.nome}</p>
                                                <Link href={`/clientes/${encodeURIComponent(cliente.id)}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">Ver perfil <ArrowUpRight className="size-3" /></Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{cliente.telefone}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {cliente.createdAt && !Number.isNaN(new Date(cliente.createdAt).getTime())
                                            ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(cliente.createdAt))
                                            : 'Data indisponível'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/clientes/${encodeURIComponent(cliente.id)}`} aria-label={`Ver detalhes de ${cliente.nome}`} title="Ver detalhes" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary"><Eye className="size-4" /></Link>
                                            <button type="button" onClick={() => openEditForm(cliente)} aria-label={`Editar ${cliente.nome}`} title="Editar cliente" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary"><Pencil className="size-4" /></button>
                                            <button type="button" onClick={() => openDeleteDialog(cliente)} disabled={busyId === cliente.id} aria-label={`Remover ${cliente.nome}`} title="Remover cliente" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50">{busyId === cliente.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="px-4 py-12 text-center">
                                    <p className="font-medium">{search ? 'Nenhum cliente encontrado' : 'Ainda não há clientes'}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{search ? 'Experimente outro nome ou telefone.' : 'Adicione um cliente para começar.'}</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'}{search ? ' encontrados' : ' registados'}</div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false);
                }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="cliente-form-title" className="my-auto w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
                        <div className="flex items-start justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 id="cliente-form-title" className="text-lg font-semibold">{editing ? 'Editar cliente' : 'Adicionar cliente'}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Preencha os dados de contacto e acesso.</p>
                            </div>
                            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} aria-label="Fechar formulário" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <label className="block space-y-1.5 text-sm font-medium">Nome<input required maxLength={120} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="block space-y-1.5 text-sm font-medium">Telefone<input required type="tel" maxLength={30} value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="block space-y-1.5 text-sm font-medium">Palavra-passe {editing ? <span className="font-normal text-muted-foreground">(deixe vazia para manter)</span> : null}<input required={!editing} type="password" autoComplete="new-password" minLength={6} value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <div className="flex justify-end gap-2 border-t border-border pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">{isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}{editing ? 'Guardar alterações' : 'Criar cliente'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteDialog
                open={clienteToDelete !== null}
                itemName={clienteToDelete?.nome ?? ''}
                itemType="cliente"
                isDeleting={clienteToDelete !== null && busyId === clienteToDelete.id}
                errorMessage={deleteError}
                onConfirm={() => void confirmDelete()}
                onClose={() => {
                    if (busyId !== clienteToDelete?.id) {
                        setClienteToDelete(null);
                        setDeleteError(null);
                    }
                }}
            />
        </section>
    );
}
