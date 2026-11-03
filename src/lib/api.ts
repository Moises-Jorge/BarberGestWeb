import type { Cliente, Barbeiro, Servico } from '@/lib/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = 'BarberAppToken';

function getAuthHeaders(headers?: HeadersInit): Headers {
    const requestHeaders = new Headers(headers);

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    return requestHeaders;
}

function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    return fetch(input, {
        ...init,
        headers: getAuthHeaders(init.headers),
    });
}

export async function getTodosClients(): Promise<Cliente[]> {
    const response = await apiFetch(`${API_URL}/clientes`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar clientes');

    const clientes: ClienteApiResponse[] = await response.json();
    return clientes.map(normalizeCliente);
}

type ClienteApiResponse = Omit<Cliente, 'createdAt' | 'updatedAt'> & {
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
};

function normalizeCliente(cliente: ClienteApiResponse): Cliente {
    return {
        ...cliente,
        createdAt: cliente.createdAt ?? cliente.created_at ?? '',
        updatedAt: cliente.updatedAt ?? cliente.updated_at ?? '',
    };
}

export type ClienteInput = Pick<Cliente, 'nome' | 'telefone'> & {
    senha?: string;
};

export async function getClienteById(id: string): Promise<Cliente> {
    const response = await apiFetch(`${API_URL}/clientes/${encodeURIComponent(id)}`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar cliente');

    const cliente: ClienteApiResponse = await response.json();
    return normalizeCliente(cliente);
}

export async function createCliente(input: ClienteInput): Promise<void> {
    const response = await apiFetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao criar cliente');
}

export async function updateCliente(id: string, input: ClienteInput): Promise<void> {
    const response = await apiFetch(`${API_URL}/clientes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao atualizar cliente');
}

export async function deleteCliente(id: string): Promise<void> {
    const response = await apiFetch(`${API_URL}/clientes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });

    if (!response.ok)
        throw Error('Erro ao remover cliente');
}

export async function getTodosServicos(): Promise<Servico[]> {
    const response = await apiFetch(`${API_URL}/servicos`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar serviços');

    const servicos: ServicoApiResponse[] = await response.json();
    return servicos.map(normalizeServico);
}

type ServicoApiResponse = Omit<Servico, 'created_at' | 'updated_at'> & {
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
};

function normalizeServico(servico: ServicoApiResponse): Servico {
    return {
        ...servico,
        created_at: servico.created_at ?? servico.createdAt ?? '',
        updated_at: servico.updated_at ?? servico.updatedAt ?? '',
    };
}

export type ServicoInput = Pick<Servico, 'nome' | 'descricao' | 'preco' | 'duracao' | 'ativo'>;

export async function getServicoById(id: number | string): Promise<Servico> {
    const response = await apiFetch(`${API_URL}/servicos/${encodeURIComponent(id)}`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar serviço');

    const servico: ServicoApiResponse = await response.json();
    return normalizeServico(servico);
}

export async function createServico(input: ServicoInput): Promise<void> {
    const response = await apiFetch(`${API_URL}/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao criar serviço');
}

export async function updateServico(id: number, input: ServicoInput): Promise<void> {
    const response = await apiFetch(`${API_URL}/servicos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao atualizar serviço');
}

export async function deleteServico(id: number): Promise<void> {
    const response = await apiFetch(`${API_URL}/servicos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });

    if (!response.ok)
        throw Error('Erro ao remover serviço');
}

export async function getTodosBarbeiros(): Promise<Barbeiro[]> {
    const response = await apiFetch(`${API_URL}/barbeiros`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar barbeiros');

    return response.json();
}

export type BarbeiroInput = Pick<Barbeiro, 'nome' | 'telefone' | 'h_entrada' | 'h_saida' | 'isAdmin'> & {
    senha?: string;
};

export async function getBarbeiroById(id: string): Promise<Barbeiro> {
    const response = await apiFetch(`${API_URL}/barbeiros/${encodeURIComponent(id)}`, { cache: 'no-store' });

    if (!response.ok)
        throw Error('Erro ao buscar barbeiro');

    return response.json();
}

export async function createBarbeiro(input: BarbeiroInput): Promise<void> {
    const response = await apiFetch(`${API_URL}/barbeiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao criar barbeiro');

}

export async function updateBarbeiro(id: string, input: BarbeiroInput): Promise<void> {
    const response = await apiFetch(`${API_URL}/barbeiros/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (!response.ok)
        throw Error('Erro ao atualizar barbeiro');

}

export async function deleteBarbeiro(id: string): Promise<void> {
    const response = await apiFetch(`${API_URL}/barbeiros/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });

    if (!response.ok)
        throw Error('Erro ao remover barbeiro');
}
