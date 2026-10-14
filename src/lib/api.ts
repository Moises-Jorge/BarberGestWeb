const API_URL = process.env.NEXT_PUBLIC_API_URL;
import type { Cliente, Barbeiro, Servico } from '@/lib/types';

export async function getTodosClients(): Promise<Cliente[]> {
    const response = await fetch(`${API_URL}/clientes`);

    if (!response.ok)
        throw Error('Erro ao buscar clientes');

    return response.json();
}

export async function getTodosServicos(): Promise<Servico[]> {
    const response = await fetch(`${API_URL}/servicos`);

    if (!response.ok)
        throw Error('Erro ao buscar serviços');

    return response.json();
}

export async function getTodosBarbeiros(): Promise<Barbeiro[]> {
    const response = await fetch(`${API_URL}/barbeiros`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar barbeiros');

    return response.json();
}

export type BarbeiroInput = Pick<Barbeiro, 'nome' | 'telefone' | 'h_entrada' | 'h_saida' | 'isAdmin'> & {
    senha?: string;
};

export async function getBarbeiroById(id: string): Promise<Barbeiro> {
    const response = await fetch(`${API_URL}/barbeiros/${encodeURIComponent(id)}`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar barbeiro');

    return response.json();
}

export async function createBarbeiro(input: BarbeiroInput): Promise<void> {
    const response = await fetch(`${API_URL}/barbeiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao criar barbeiro');

}

export async function updateBarbeiro(id: string, input: BarbeiroInput): Promise<void> {
    const response = await fetch(`${API_URL}/barbeiros/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao atualizar barbeiro');

}

export async function deleteBarbeiro(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/barbeiros/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });

    if (!response.ok)
        throw Error('Erro ao remover barbeiro');
}
