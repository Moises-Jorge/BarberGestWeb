export default function DashboardPage() {
    const kpis = ["Agendamentos hoje", "Receita", "Clientes novos", "Taxa de cancelamento"];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((label) => (
                    <div key={label} className="rounded-xl border border-border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="mt-2 text-2xl font-semibold">—</p>
                    </div>
                ))}
            </div>
        </div>
    );
}