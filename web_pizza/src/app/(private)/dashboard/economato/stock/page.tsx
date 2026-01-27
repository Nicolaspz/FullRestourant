import { StockTable } from "@/components/dashboard/economato/StockTable";

export default function StockPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Controle de Stock</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie o stock de produtos em cada área do restaurante.
        </p>
      </div>

      <StockTable />
    </div>
  );
}
