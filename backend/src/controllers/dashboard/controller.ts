import { Request, Response } from 'express';
import { DashboardService } from '../../services/dashboard/service'; 
import { DashboardFilters } from '../../interfaces/dashboard.interface';

const dashboardService = new DashboardService();

class DashboardController {
  async getDashboardData(req: Request, res: Response) {
    try {
      // Obter organizationId dos parâmetros da rota
      const { organizationId } = req.params;
      
      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required as route parameter' });
      }

      const filters: DashboardFilters = {
        startDate: req.query.startDate as string || new Date().toISOString().split('T')[0],
        endDate: req.query.endDate as string || new Date().toISOString().split('T')[0],
        timeRange: req.query.timeRange as 'today' | 'week' | 'month' || 'today'
      };

      const data = await dashboardService.getDashboardData(organizationId, filters);
      res.json(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
export {DashboardController}