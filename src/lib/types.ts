export interface Cliente {
    id: string;
    nome: string;
    telefone: string;
    senha?: string;
    imagemUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
