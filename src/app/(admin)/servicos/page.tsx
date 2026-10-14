import { ServicosTable } from '@/components/servicos/servicos-table';

export default function ServicosPage() {
    return (
        <div>
            <p className="text-sm font-medium text-primary">BarberGest</p>
            <h1 className="mt-1 text-2xl font-semibold">Serviços</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerir o catálogo de serviços da barbearia</p>
            <ServicosTable />
        </div>
    );
}
