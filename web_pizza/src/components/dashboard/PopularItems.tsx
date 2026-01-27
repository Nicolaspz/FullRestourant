import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PopularItem {
  id?: string;
  name: string;
  sales?: number;     // API envia sales
  quantity?: number;  // Componente espera quantity
  revenue?: number;
}

interface PopularItemsProps {
  items?: PopularItem[];
}

export function PopularItems({ items = [] }: PopularItemsProps) {
  // Normaliza os dados da API
  const normalizedItems = items.map(item => ({
    id: item.id || `item-${item.name}`,
    name: item.name,
    quantity: item.quantity || item.sales || 0,
    revenue: item.revenue || 0
  }));

  if (!normalizedItems || normalizedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Itens Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum item vendido no período
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {normalizedItems.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">
                  {index + 1}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} vendas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {/* Mostra apenas a quantidade já que revenue vem 0 */}
                  {item.quantity} un.
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}