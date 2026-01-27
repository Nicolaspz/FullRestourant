import { ConsumoTable } from "@/components/dashboard/economato/ConsumoTable";

export default function ConsumoPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consumo Interno e Quebras</h1>
        <p className="text-muted-foreground">
          Gestão de saídas de stock que não são vendas (quebras, staff, etc).
        </p>
      </div>

      <ConsumoTable />
    </div>
  );
}
