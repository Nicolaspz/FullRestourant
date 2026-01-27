import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentOrder {
  id: string;
  customer?: string;      // Torna opcional
  customerName?: string;  // Mantém compatibilidade
  amount?: number;        // API envia amount
  total?: number;         // Componente espera total
  status: string;
  time?: string;
  createdAt?: string;
}

interface RecentOrdersTableProps {
  orders?: RecentOrder[];
}

export function RecentOrdersTable({ orders = [] }: RecentOrdersTableProps) {
  const formatCurrency = (value: number | undefined) => {
    const amount = value || 0;
    return amount.toLocaleString('pt-AO', { 
      style: 'currency', 
      currency: 'AOA',
      minimumFractionDigits: 2 
    });
  };

  // Normaliza os dados da API
  const normalizedOrders = orders.map(order => ({
    id: order.id,
    customerName: order.customerName || order.customer || 'Cliente não identificado',
    total: order.total || order.amount || 0,
    status: order.status,
    createdAt: order.createdAt || order.time || ''
  }));

  if (!normalizedOrders || normalizedOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum pedido recente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {normalizedOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt}
                  </p>
                </div>
                <Badge variant={
                  order.status === 'Preparando' ? 'secondary' : 
                  order.status === 'Entregue' ? 'default' : 'outline'
                }>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}