import { BarbeirosTable } from '@/components/barbeiros/barbeiros-table';

export default function BarbeirosPage() {
	return (
		<div>
			<p className="text-sm font-medium text-primary">BarberGest</p>
			<h1 className="mt-1 text-2xl font-semibold">Barbeiros</h1>
			<p className="mt-1 text-sm text-muted-foreground">Gerir a equipa de barbeiros</p>
			<BarbeirosTable />
		</div>
	);
}