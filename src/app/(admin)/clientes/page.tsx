import { ClientesTable } from '@/components/clientes/clientes-table';

export default function ClientesPage() {
    return (
        <div>
            <p className="text-sm font-medium text-primary">BarberGest</p>
            <h1 className="mt-1 text-2xl font-semibold">Clientes</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerir os clientes da barbearia</p>
            <ClientesTable />
        </div>
    );
}
