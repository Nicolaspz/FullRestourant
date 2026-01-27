import { PedidosTable } from "@/components/dashboard/economato/PedidosTable";

export default function PedidosPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos de Transferência</h1>
        <p className="text-muted-foreground">
          Aprove ou rejeite solicitações de movimentação de stock entre áreas.
        </p>
      </div>

      <PedidosTable />
    </div>
  );
}
