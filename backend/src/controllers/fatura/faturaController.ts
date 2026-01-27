import { Request, Response } from 'express';
import { FaturaService } from '../../services/fatura/faturaService'; 
import { FaturaStatus } from '@prisma/client';

const faturaService = new FaturaService();

export class FaturaController {
  
  async getFaturas(req: Request, res: Response) {
    try {
      const { status, dataInicio, dataFim, mesaId, organizationId } = req.query;

      if (!organizationId) {
        return res.status(400).json({ error: 'organizationId é obrigatório' });
      }

      const filters = {
        organizationId: organizationId as string,
        status: status as FaturaStatus,
        dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim: dataFim ? new Date(dataFim as string) : undefined,
        mesaId: mesaId as string
      };

      const faturas = await faturaService.getFaturas(filters);
      res.json(faturas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFatura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { organizationId } = req.query;

      if (!organizationId) {
        return res.status(400).json({ error: 'organizationId é obrigatório' });
      }

      const fatura = await faturaService.getFaturaById(id, organizationId as string);
      
      if (!fatura) {
        return res.status(404).json({ error: 'Fatura não encontrada' });
      }

      res.json(fatura);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async processarPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { organizationId } = req.query;
      const pagamentoData = req.body;

      if (!organizationId) {
        return res.status(400).json({ error: 'organizationId é obrigatório' });
      }

      const fatura = await faturaService.processarPagamento(id, organizationId as string, pagamentoData);
      res.json(fatura);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelarFatura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const { organizationId } = req.query;

      if (!organizationId) {
        return res.status(400).json({ error: 'organizationId é obrigatório' });
      }

      const fatura = await faturaService.cancelarFatura(id, organizationId as string, motivo);
      res.json(fatura);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEstatisticas(req: Request, res: Response) {
    try {
      const { inicio, fim, organizationId } = req.query;

      if (!organizationId) {
        return res.status(400).json({ error: 'organizationId é obrigatório' });
      }

      const periodo = {
        inicio: inicio ? new Date(inicio as string) : new Date(new Date().setHours(0, 0, 0, 0)),
        fim: fim ? new Date(fim as string) : new Date(new Date().setHours(23, 59, 59, 999))
      };

      const estatisticas = await faturaService.getEstatisticasVendas(organizationId as string, periodo);
      res.json(estatisticas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}