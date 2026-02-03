import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ChartsSectionProps {
  hourlySales: {
    labels: string[];
    data: number[];
  };
  paymentMethods: {
    labels: string[];
    data: number[];
  };
}

export function ChartsSection({ hourlySales, paymentMethods }: ChartsSectionProps) {
  const hourlySalesData = {
    labels: hourlySales?.labels || [],
    datasets: [
      {
        label: "Vendas (AKZ)",
        data: hourlySales?.data || [],
        backgroundColor: "rgba(99, 102, 241, 0.7)"
      }
    ]
  };

  const paymentMethodsData = {
    labels: paymentMethods?.labels || [],
    datasets: [
      {
        label: "Vendas por Método (AKZ)",
        data: paymentMethods?.data || [],
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)"
        ]
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Vendas por Hora</CardTitle>
        </CardHeader>
        <CardContent>
          {hourlySales?.data?.length > 0 ? (
            <Bar data={hourlySalesData} options={{ responsive: true }} />
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground border rounded-lg">
              Sem dados de vendas por hora
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods?.data?.length > 0 ? (
            <Pie data={paymentMethodsData} options={{ responsive: true }} />
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground border rounded-lg">
              Sem dados de métodos de pagamento
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
