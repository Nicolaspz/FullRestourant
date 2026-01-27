'use client';

import React, { useContext, useEffect, useState } from "react";
import { 
  DollarSign, 
  Coffee, 
  Users, 
  Clock,
  Utensils,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import dayjs from "dayjs";

// Componentes reutilizáveis
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { PopularItems } from "@/components/dashboard/PopularItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface DashboardData {
  metrics: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    averageTicket: number;
    averageTicketChange: number;
    pendingOrders: number;
    occupiedTables: number;
    totalTables: number;
  };
  charts: {
    hourlySales: {
      labels: string[];
      data: number[];
    };
    paymentMethods: {
      labels: string[];
      data: number[];
    };
  };
  popularItems: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  criticalStock: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
  }>;
}

// Dados padrão quando não há dados da API
const defaultDashboardData: DashboardData = {
  metrics: {
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    averageTicket: 0,
    averageTicketChange: 0,
    pendingOrders: 0,
    occupiedTables: 0,
    totalTables: 0
  },
  charts: {
    hourlySales: {
      labels: [],
      data: []
    },
    paymentMethods: {
      labels: [],
      data: []
    }
  },
  popularItems: [],
  recentOrders: [],
  criticalStock: []
};

export default function Dashboard() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<string>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const apiClient = setupAPIClient();
  

  // Função para calcular o range de datas
  const getDateRange = (range: string) => {
    const today = dayjs();
    switch (range) {
      case "today":
        return {
          startDate: today.format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD")
        };
      case "week":
        return {
          startDate: today.startOf('week').format("YYYY-MM-DD"),
          endDate: today.endOf('week').format("YYYY-MM-DD")
        };
      case "month":
        return {
          startDate: today.startOf('month').format("YYYY-MM-DD"),
          endDate: today.endOf('month').format("YYYY-MM-DD")
        };
      default:
        return {
          startDate: today.format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD")
        };
    }
  };

  const [dateRange, setDateRange] = useState(getDateRange(timeRange));

  const fetchDashboard = async () => {
    if (!user?.organizationId || !user?.token) {
      setIsLoading(false);
      // Se não tem usuário, usa dados padrão
      setDashboardData(defaultDashboardData);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    try {
      const response = await apiClient.get(
        `/dash/${user.organizationId}`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Se a resposta vier vazia ou com estrutura incompleta, usa dados padrão
      const data = response.data || defaultDashboardData;
      console.log("dados dash", data)
      setDashboardData({
        ...defaultDashboardData,
        ...data,
        metrics: {
          ...defaultDashboardData.metrics,
          ...data.metrics
        },
        charts: {
          ...defaultDashboardData.charts,
          ...data.charts
        }
      });
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      setHasError(true);
      // Em caso de erro, usa dados padrão
      setDashboardData(defaultDashboardData);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza o dateRange quando timeRange muda
  useEffect(() => {
    setDateRange(getDateRange(timeRange));
  }, [timeRange]);

  // Monitora mudanças na autenticação e no dateRange
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboard();
    } else {
      // Se não está autenticado, usa dados padrão
      setDashboardData(defaultDashboardData);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, dateRange]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Usar dados reais ou padrão
  const displayData = dashboardData || defaultDashboardData;

  // Se não estiver autenticado, mostra loading
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de tempo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {timeRange === "today" && "Visão geral das vendas de hoje"}
            {timeRange === "week" && "Visão geral das vendas desta semana"}
            {timeRange === "month" && "Visão geral das vendas deste mês"}
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      {/* Conteúdo principal */}
      {isLoading ? (
        <LoadingState />
      ) : hasError ? (
        <ErrorState onRetry={fetchDashboard} />
      ) : (
        <div className="space-y-6">
          {/* Métricas principais - SEMPRE MOSTRA OS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Faturamento Total"
              value={`${(displayData.metrics.totalRevenue || 0).toLocaleString('pt-AO', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} kz`}
              change={displayData.metrics.revenueChange || 0}
              icon={<DollarSign className="text-muted-foreground" size={20} />}
            />
            <MetricCard
              title="Total de Pedidos"
              value={(displayData.metrics.totalOrders || 0).toLocaleString()}
              change={displayData.metrics.ordersChange || 0}
              icon={<Coffee className="text-muted-foreground" size={20} />}
            />
            <MetricCard
              title="Ticket Médio"
              value={`${(displayData.metrics.averageTicket || 0).toLocaleString('pt-AO', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} kz`}
              change={displayData.metrics.averageTicketChange || 0}
              icon={<Users className="text-muted-foreground" size={20} />}
            />
            <MetricCard
              title="Pedidos Pendentes"
              value={(displayData.metrics.pendingOrders || 0).toString()}
              icon={<Clock className="text-muted-foreground" size={20} />}
            />
          </div>

          {/* Métricas secundárias - Mesas - SEMPRE MOSTRA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <MetricCard
              title="Mesas Ocupadas"
              value={`${displayData.metrics.occupiedTables || 0}/${displayData.metrics.totalTables || 0}`}
              description={displayData.metrics.totalTables ? 
                `${(((displayData.metrics.occupiedTables || 0) / displayData.metrics.totalTables) * 100).toFixed(1)}% de ocupação` : 
                'Nenhuma mesa configurada'
              }
              icon={<Utensils className="text-muted-foreground" size={20} />}
            />
            <MetricCard
              title="Taxa de Ocupação"
              value={displayData.metrics.totalTables ? 
                `${(((displayData.metrics.occupiedTables || 0) / displayData.metrics.totalTables) * 100).toFixed(1)}%` : 
                '0%'
              }
              icon={<TrendingUp className="text-muted-foreground" size={20} />}
            />
          </div>

          {/* Gráficos - SEMPRE MOSTRA */}
          <ChartsSection 
            hourlySales={displayData.charts.hourlySales} 
            paymentMethods={displayData.charts.paymentMethods} 
          />

          {/* Tabelas e itens populares - SEMPRE MOSTRA (mesmo vazios) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PopularItems items={displayData.popularItems || []} />
            <div className="lg:col-span-2">
              <RecentOrdersTable orders={displayData.recentOrders || []} />
            </div>
          </div>

          {/* Estoque Crítico - SÓ MOSTRA SE HOUVER ITENS */}
          
{displayData.criticalStock && displayData.criticalStock.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="text-red-600">Estoque Crítico</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.criticalStock.map((item, index) => (
          <div 
            key={item.id || `critical-stock-${index}`} 
            className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
          >
            <div>
              <p className="font-medium text-red-800">{item.name}</p>
              <p className="text-sm text-red-600">
                Estoque: {item.currentStock} / Mínimo: {item.minStock}
              </p>
            </div>
            <TrendingDown className="text-red-600" size={20} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}
        </div>
      )}
    </div>
  );
}