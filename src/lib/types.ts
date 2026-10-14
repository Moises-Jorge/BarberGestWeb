export interface Cliente {
    id: string;
    nome: string;
    telefone: string;
    senha?: string;
    imagemUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}


export interface Barbeiro {
    id: string;
    nome: string;
    telefone: string;
    h_entrada: string;
    h_saida: string;
    senha?: string;
    imagemUrl?: string | null;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Servico {
    id: number;
    nome: string;
    descricao?: string | null;
    preco: number;
    duracao: number;
    imagemUrl?: string | null;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}