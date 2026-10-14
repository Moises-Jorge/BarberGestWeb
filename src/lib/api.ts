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
    const response = await fetch(`${API_URL}/barbeiros`);

    if (!response.ok)
        throw Error('Erro ao buscar barbeiros');

    return response.json();
}
