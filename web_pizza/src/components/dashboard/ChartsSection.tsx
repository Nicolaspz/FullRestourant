import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartsSectionProps {
  hourlySales: any;
  paymentMethods: any;
}

export function ChartsSection({ hourlySales, paymentMethods }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Vendas por Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground border rounded-lg">
            {hourlySales?.data?.length > 0 ? (
              "Gráfico de Vendas por Hora - Dados disponíveis"
            ) : (
              "Sem dados de vendas por hora"
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground border rounded-lg">
            {paymentMethods?.data?.length > 0 ? (
              "Gráfico de Métodos de Pagamento - Dados disponíveis"
            ) : (
              "Sem dados de métodos de pagamento"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}