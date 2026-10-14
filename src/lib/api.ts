const API_URL = process.env.NEXT_PUBLIC_API_URL;
import type { Cliente } from '@/lib/types';

export async function getTodosClients() : Promise<Cliente[]> {
    const response = await fetch(`${API_URL}/clientes`);

    if (!response.ok)
        throw Error('Erro ao buscar clientes');
    
    return response.json();
}