export interface DashboardData {
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
    name: string;
    sales: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    time: string;
  }>;
  criticalStock: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  timeRange?: 'today' | 'week' | 'month';
}