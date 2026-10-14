'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Eye, LoaderCircle, Pencil, Plus, Search, Shield, ShieldOff, Trash2, X } from 'lucide-react';
import { createBarbeiro, deleteBarbeiro, getTodosBarbeiros, updateBarbeiro, type BarbeiroInput } from '@/lib/api';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { Barbeiro } from '@/lib/types';

type FormValues = {
    nome: string;
    telefone: string;
    h_entrada: string;
    h_saida: string;
    senha: string;
    isAdmin: boolean;
};

const emptyForm: FormValues = {
    nome: '',
    telefone: '',
    h_entrada: '09:00',
    h_saida: '18:00',
    senha: '',
    isAdmin: false,
};

function getInitials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

export function BarbeirosTable() {
    const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Barbeiro | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<FormValues>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [barbeiroToDelete, setBarbeiroToDelete] = useState<Barbeiro | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            setBarbeiros(await getTodosBarbeiros());
        } catch {
            setError('Não foi possível carregar a equipa. Confirme a ligação à API e tente novamente.');
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

    function openEditForm(barbeiro: Barbeiro) {
        setEditing(barbeiro);
        setForm({
            nome: barbeiro.nome,
            telefone: barbeiro.telefone,
            h_entrada: barbeiro.h_entrada.slice(0, 5),
            h_saida: barbeiro.h_saida.slice(0, 5),
            senha: '',
            isAdmin: barbeiro.isAdmin,
        });
        setIsFormOpen(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);
        const input: BarbeiroInput = {
            nome: form.nome.trim(),
            telefone: form.telefone.trim(),
            h_entrada: form.h_entrada,
            h_saida: form.h_saida,
            isAdmin: form.isAdmin,
            ...(form.senha ? { senha: form.senha } : {}),
        };

        try {
            if (editing) await updateBarbeiro(editing.id, input);
            else await createBarbeiro(input);
            setIsFormOpen(false);
            await refresh();
        } catch {
            setError(editing ? 'Não foi possível atualizar este barbeiro.' : 'Não foi possível criar o barbeiro.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAdminToggle(barbeiro: Barbeiro) {
        setBusyId(barbeiro.id);
        setError(null);
        try {
            await updateBarbeiro(barbeiro.id, {
                nome: barbeiro.nome,
                telefone: barbeiro.telefone,
                h_entrada: barbeiro.h_entrada,
                h_saida: barbeiro.h_saida,
                isAdmin: !barbeiro.isAdmin,
            });
            await refresh();
        } catch {
            setError('Não foi possível alterar as permissões deste barbeiro.');
        } finally {
            setBusyId(null);
        }
    }

    function handleDelete(barbeiro: Barbeiro) {
        setDeleteError(null);
        setBarbeiroToDelete(barbeiro);
    }

    async function confirmDelete() {
        if (!barbeiroToDelete) return;

        const barbeiro = barbeiroToDelete;
        setBusyId(barbeiro.id);
        try {
            await deleteBarbeiro(barbeiro.id);
            setBarbeiros((current) => current.filter((item) => item.id !== barbeiro.id));
            setBarbeiroToDelete(null);
        } catch {
            setDeleteError('Não foi possível remover este barbeiro. Tente novamente.');
        } finally {
            setBusyId(null);
        }
    }

    const filteredBarbeiros = barbeiros.filter((barbeiro) => {
        const query = search.trim().toLocaleLowerCase('pt-PT');
        return `${barbeiro.nome} ${barbeiro.telefone}`.toLocaleLowerCase('pt-PT').includes(query);
    });

    return (
        <section className="mt-7 space-y-4" aria-label="Equipa de barbeiros">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por nome ou telefone" aria-label="Pesquisar barbeiros" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <button type="button" onClick={openCreateForm} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    <Plus className="size-4" />Adicionar barbeiro
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
                    <table className="w-full min-w-190 text-left text-sm">
                        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium">Barbeiro</th>
                                <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
                                <th scope="col" className="px-4 py-3 font-medium">Horário</th>
                                <th scope="col" className="px-4 py-3 font-medium">Permissão</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">A carregar barbeiros...</td></tr>
                            ) : filteredBarbeiros.length > 0 ? filteredBarbeiros.map((barbeiro) => (
                                <tr key={barbeiro.id} className="transition-colors hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{getInitials(barbeiro.nome)}</span>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{barbeiro.nome}</p>
                                                <Link href={`/barbeiros/${encodeURIComponent(barbeiro.id)}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">Ver perfil <ArrowUpRight className="size-3" /></Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{barbeiro.telefone}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{barbeiro.h_entrada.slice(0, 5)}–{barbeiro.h_saida.slice(0, 5)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${barbeiro.isAdmin ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {barbeiro.isAdmin ? <Shield className="size-3.5" /> : null}{barbeiro.isAdmin ? 'Administrador' : 'Barbeiro'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/barbeiros/${encodeURIComponent(barbeiro.id)}`} aria-label={`Ver detalhes de ${barbeiro.nome}`} title="Ver detalhes" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary"><Eye className="size-4" /></Link>
                                            <button type="button" onClick={() => openEditForm(barbeiro)} aria-label={`Editar ${barbeiro.nome}`} title="Editar barbeiro" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary"><Pencil className="size-4" /></button>
                                            <button type="button" onClick={() => void handleAdminToggle(barbeiro)} disabled={busyId === barbeiro.id} aria-label={barbeiro.isAdmin ? `Remover administração de ${barbeiro.nome}` : `Tornar ${barbeiro.nome} administrador`} title={barbeiro.isAdmin ? 'Remover administração' : 'Tornar administrador'} className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-soft hover:text-primary disabled:opacity-50">{barbeiro.isAdmin ? <ShieldOff className="size-4" /> : <Shield className="size-4" />}</button>
                                            <button type="button" onClick={() => void handleDelete(barbeiro)} disabled={busyId === barbeiro.id} aria-label={`Remover ${barbeiro.nome}`} title="Remover barbeiro" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50">{busyId === barbeiro.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-4 py-12 text-center">
                                    <p className="font-medium">{search ? 'Nenhum barbeiro encontrado' : 'Ainda não há barbeiros'}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{search ? 'Experimente outro nome ou telefone.' : 'Adicione o primeiro membro da equipa para começar.'}</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{filteredBarbeiros.length} {filteredBarbeiros.length === 1 ? 'barbeiro' : 'barbeiros'}{search ? ' encontrados' : ' na equipa'}</div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false);
                }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="barbeiro-form-title" className="my-auto w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
                        <div className="flex items-start justify-between border-b border-border px-5 py-4">
                            <div><h2 id="barbeiro-form-title" className="text-lg font-semibold">{editing ? 'Editar barbeiro' : 'Adicionar barbeiro'}</h2><p className="mt-1 text-sm text-muted-foreground">Preencha os dados de acesso e horário de trabalho.</p></div>
                            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} aria-label="Fechar formulário" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <label className="block space-y-1.5 text-sm font-medium">Nome<input required maxLength={120} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="block space-y-1.5 text-sm font-medium">Telefone<input required type="tel" maxLength={30} value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block space-y-1.5 text-sm font-medium">Entrada<input required type="time" value={form.h_entrada} onChange={(event) => setForm({ ...form, h_entrada: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                                <label className="block space-y-1.5 text-sm font-medium">Saída<input required type="time" value={form.h_saida} onChange={(event) => setForm({ ...form, h_saida: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            </div>
                            <label className="block space-y-1.5 text-sm font-medium">Palavra-passe {editing ? <span className="font-normal text-muted-foreground">(deixe vazia para manter)</span> : null}<input required={!editing} type="password" autoComplete="new-password" minLength={6} value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
                                <input type="checkbox" checked={form.isAdmin} onChange={(event) => setForm({ ...form, isAdmin: event.target.checked })} className="size-4 accent-primary" />
                                <span className="flex-1"><span className="block font-medium">Permissões de administrador</span><span className="mt-0.5 block text-xs text-muted-foreground">Permite gerir as áreas administrativas.</span></span>
                                {form.isAdmin ? <Check className="size-4 text-primary" /> : null}
                            </label>
                            <div className="flex justify-end gap-2 border-t border-border pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">{isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}{editing ? 'Guardar alterações' : 'Criar barbeiro'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteDialog
                open={barbeiroToDelete !== null}
                itemName={barbeiroToDelete?.nome ?? ''}
                itemType="barbeiro"
                isDeleting={barbeiroToDelete !== null && busyId === barbeiroToDelete.id}
                errorMessage={deleteError}
                onConfirm={() => void confirmDelete()}
                onClose={() => {
                    if (busyId !== barbeiroToDelete?.id) {
                        setBarbeiroToDelete(null);
                        setDeleteError(null);
                    }
                }}
            />
        </section>
    );
}