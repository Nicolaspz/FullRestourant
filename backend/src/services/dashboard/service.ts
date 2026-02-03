
import prismaClient from "../../prisma";
import { DashboardData,DashboardFilters } from "../../interfaces/dashboard.interface";


export class DashboardService {
  async getDashboardData(organizationId: string, filters: DashboardFilters): Promise<DashboardData> {
    const { startDate, endDate } = this.normalizeDates(filters);
    
    const [
      metrics,
      hourlySales,
      paymentMethods,
      popularItems,
      recentOrders,
      criticalStock,
      tablesData
    ] = await Promise.all([
      this.getMetrics(organizationId, startDate, endDate),
      this.getHourlySales(organizationId, startDate, endDate),
      this.getPaymentMethods(organizationId, startDate, endDate),
      this.getPopularItems(organizationId, startDate, endDate),
      this.getRecentOrders(organizationId),
      this.getCriticalStock(organizationId),
      this.getTablesData(organizationId)
    ]);

    return {
      metrics: {
        ...metrics,
        occupiedTables: tablesData.activeSessions,
        totalTables: tablesData.totalTables
      },
      charts: {
        hourlySales,
        paymentMethods
      },
      popularItems,
      recentOrders,
      criticalStock
    };
  }

  private normalizeDates(filters: DashboardFilters): { startDate: Date; endDate: Date } {
  let startDate = new Date(filters.startDate);
  let endDate = new Date(filters.endDate);

  // Garantir início do dia para startDate
  startDate.setHours(0, 0, 0, 0);

  // Fim do dia para endDate
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

  private async getMetrics(organizationId: string, startDate: Date, endDate: Date) {
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    
    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      averageTicket,
      previousAverageTicket,
      pendingOrders
    ] = await Promise.all([
      this.getTotalRevenue(organizationId, startDate, endDate),
      this.getTotalRevenue(organizationId, previousPeriod.startDate, previousPeriod.endDate),
      this.getTotalOrders(organizationId, startDate, endDate),
      this.getTotalOrders(organizationId, previousPeriod.startDate, previousPeriod.endDate),
      this.getAverageTicket(organizationId, startDate, endDate),
      this.getAverageTicket(organizationId, previousPeriod.startDate, previousPeriod.endDate),
      this.getPendingOrders(organizationId, startDate, endDate)
    ]);

    return {
      totalRevenue: currentRevenue,
      revenueChange: this.calculateChange(currentRevenue, previousRevenue),
      totalOrders: currentOrders,
      ordersChange: this.calculateChange(currentOrders, previousOrders),
      averageTicket: averageTicket,
      averageTicketChange: this.calculateChange(averageTicket, previousAverageTicket),
      pendingOrders: pendingOrders
    };
  }

  private async getTotalRevenue(organizationId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await prismaClient.fatura.aggregate({
      _sum: { valorTotal: true },
      where: {
        session: {
          organizationId,
          abertaEm: { gte: startDate, lte: endDate }
        },
        status: 'paga'
      }
    });
    return result._sum.valorTotal || 0;
  }

  private async getTotalOrders(organizationId: string, startDate: Date, endDate: Date): Promise<number> {
    return prismaClient.order.count({
      where: {
        organizationId,
        draft: false,
        created_at: { gte: startDate, lte: endDate }
      }
    });
  }

  private async getAverageTicket(organizationId: string, startDate: Date, endDate: Date): Promise<number> {
  const result = await prismaClient.$queryRaw<{ avg: number }[]>`
    SELECT AVG(valorTotal) as avg
    FROM faturas
    WHERE 
      sessionId IN (SELECT id FROM sessions WHERE organizationId = ${organizationId})
      AND status = 'paga'
      AND criadaEm >= ${startDate}
      AND criadaEm <= ${endDate}
  `;
  return result[0]?.avg || 0;
}

  private async getPendingOrders(organizationId: string, startDate: Date, endDate: Date): Promise<number> {
    return prismaClient.order.count({
      where: {
        organizationId,
        draft: false,
        status: false,
        created_at: { gte: startDate, lte: endDate }
      }
    });
  }

  private async getHourlySales(organizationId: string, startDate: Date, endDate: Date) {
  const result = await prismaClient.$queryRaw<{ hour: number; total: number }[]>`
    SELECT 
      HOUR(s.abertaEm) as hour,
      SUM(f.valorTotal) as total
    FROM faturas f
    JOIN sessions s ON f.sessionId = s.id
    WHERE 
      s.organizationId = ${organizationId}
      AND f.status = 'paga'
      AND s.abertaEm >= ${startDate}
      AND s.abertaEm <= ${endDate}
    GROUP BY HOUR(s.abertaEm)
    ORDER BY hour ASC
  `;

  return {
    labels: result.map(item => `${item.hour}:00`),
    data: result.map(item => item.total)
  };
}

  private async getPaymentMethods(organizationId: string, startDate: Date, endDate: Date) {
    const result = await prismaClient.fatura.groupBy({
      by: ['metodoPagamento'],
      _sum: { valorTotal: true },
      where: {
        session: {
          organizationId,
          abertaEm: { gte: startDate, lte: endDate }
        },
        status: 'paga'
      }
    });

    return {
      labels: result.map(item => item.metodoPagamento || 'Não informado'),
      data: result.map(item => item._sum.valorTotal || 0)
    };
  }

  private async getPopularItems(organizationId: string, startDate: Date, endDate: Date) {
    const result = await prismaClient.item.groupBy({
      by: ['productId'],
      _sum: { amount: true },
      where: {
        organizationId,
        Order: {
          draft: false,
          created_at: { gte: startDate, lte: endDate }
        }
      },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    const itemsWithNames = await Promise.all(
      result.map(async item => {
        const product = await prismaClient.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        return {
          name: product?.name || 'Produto desconhecido',
          sales: item._sum.amount || 0
        };
      })
    );

    return itemsWithNames;
  }

  private async getRecentOrders(organizationId: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const orders = await prismaClient.order.findMany({
      where: {
        organizationId,
        draft: false,
        created_at: { gte: yesterday }
      },
      include: {
        items: {
          include: {
            Product: { select: { name: true, PrecoVenda: { orderBy: { data_inicio: 'desc' }, take: 1 } } }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    return orders.map(order => ({
      id: `#${order.id.slice(0, 4)}`,
      customer: order.name || 'Cliente não identificado',
      amount: order.items.reduce((sum, item) => {
        const price = item.Product.PrecoVenda[0]?.preco_venda || 0;
        return sum + (item.amount * price);
      }, 0),
      status: order.status ? 'Entregue' : 'Preparando',
      time: this.formatTimeDifference(order.created_at)
    }));
  }

  private async getCriticalStock(organizationId: string) {
    const result = await prismaClient.stock.findMany({
      where: {
        organizationId,
        totalQuantity: { lt: 5 }
      },
      include: {
        product: { select: { name: true, unit: true } }
      },
      orderBy: { totalQuantity: 'asc' },
      take: 5
    });

    return result.map(item => ({
      name: item.product.name,
      quantity: item.totalQuantity,
      unit: item.product.unit
    }));
  }

  private async getTablesData(organizationId: string) {
    const [activeSessions, totalTables] = await Promise.all([
      prismaClient.session.count({
        where: {
          organizationId,
          status: true
        }
      }),
      prismaClient.mesa.count({
        where: { organizationId }
      })
    ]);

    return { activeSessions, totalTables };
  }

  private getPreviousPeriod(startDate: Date, endDate: Date) {
    const periodDays = this.differenceInDays(endDate, startDate);
    return {
      startDate: this.subDays(startDate, periodDays),
      endDate: this.subDays(endDate, periodDays)
    };
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  }

  private formatTimeDifference(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours} h ${minutes} min`;
    }
  }

  private differenceInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private subDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }
}