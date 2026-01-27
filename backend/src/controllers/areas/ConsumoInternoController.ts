import { Request, Response } from "express";
import prismaClient from "../../prisma";
import {
  RegistrarConsumoInternoService,
  ListarConsumosInternoService,
  RelatorioConsumoPorAreaService,
  ObterConsumoInternoService,
} from "../../services/area/consumoInternoService";

// ===== REGISTRAR CONSUMO INTERNO =====
class RegistrarConsumoInternoController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId, productId, quantity, motivo, observacoes, loteId } = req.body;
      const organizationId = req.query?.organizationId as string;
      const usuarioId = req.query.id as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      // Validações
      if (!areaId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID da área é obrigatório"
        });
      }

      if (!productId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID do produto é obrigatório"
        });
      }

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: "Quantidade deve ser maior que zero"
        });
      }

      if (!motivo?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Motivo do consumo é obrigatório"
        });
      }

      const registrarConsumoService = new RegistrarConsumoInternoService();
      const consumo = await registrarConsumoService.execute({
        areaId,
        productId,
        quantity,
        motivo,
        observacoes,
        usuarioId,
        loteId,
        organizationId,
      });

      return res.status(201).json({
        success: true,
        message: "Consumo interno registrado com sucesso",
        data: consumo,
      });
    } catch (error: any) {
      console.error("Erro ao registrar consumo interno:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao registrar consumo interno",
      });
    }
  }
}

// ===== LISTAR CONSUMOS =====
class ListarConsumosInternoController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId, productId, dataInicio, dataFim, page, limit } = req.query;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      // Converter datas
      let dataInicioDate: Date | undefined;
      let dataFimDate: Date | undefined;

      if (dataInicio) {
        dataInicioDate = new Date(dataInicio as string);
        if (isNaN(dataInicioDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Data início inválida"
          });
        }
      }

      if (dataFim) {
        dataFimDate = new Date(dataFim as string);
        if (isNaN(dataFimDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Data fim inválida"
          });
        }
      }

      // Paginação
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = parseInt(limit as string) || 20;
      const skip = (pageNumber - 1) * pageSize;

      const listarConsumosService = new ListarConsumosInternoService();
      const consumos = await listarConsumosService.execute({
        organizationId,
        areaId: areaId as string,
        productId: productId as string,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
      });

      // Aplicar paginação manualmente
      const total = consumos.length;
      const paginatedConsumos = consumos.slice(skip, skip + pageSize);

      const quantidadeTotal = consumos.reduce((sum, c) => sum + c.quantity, 0);

      return res.json({
        success: true,
        data: paginatedConsumos,
        paginacao: {
          page: pageNumber,
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
        quantidadeTotal,
        periodo: {
          dataInicio: dataInicioDate?.toISOString().split('T')[0],
          dataFim: dataFimDate?.toISOString().split('T')[0],
        },
      });
    } catch (error: any) {
      console.error("Erro ao listar consumos internos:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao listar consumos internos",
      });
    }
  }
}

// ===== RELATÓRIO DE CONSUMO POR ÁREA =====
class RelatorioConsumoPorAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim, areaId, productId } = req.query;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          success: false,
          error: "Data início e data fim são obrigatórias"
        });
      }

      const dataInicioDate = new Date(dataInicio as string);
      const dataFimDate = new Date(dataFim as string);

      if (isNaN(dataInicioDate.getTime()) || isNaN(dataFimDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Datas inválidas"
        });
      }

      if (dataInicioDate > dataFimDate) {
        return res.status(400).json({
          success: false,
          error: "Data início não pode ser maior que data fim"
        });
      }

      const relatorioService = new RelatorioConsumoPorAreaService();
      const relatorio = await relatorioService.execute({
        organizationId,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
      });

      // Filtrar por área se especificado
      let relatorioFiltrado = relatorio;
      if (areaId) {
        relatorioFiltrado = relatorio.filter(r => r.areaId === areaId);
      }

      // Filtrar por produto se especificado
      if (productId) {
        relatorioFiltrado = relatorioFiltrado.filter(r => r.productId === productId);
      }

      const consumoTotal = relatorioFiltrado.reduce((sum, r) => sum + (r.quantidadeTotal || 0), 0);
      const areasUnicas = [...new Set(relatorioFiltrado.map(r => r.areaNome))];
      const produtosUnicos = [...new Set(relatorioFiltrado.map(r => r.productNome))];

      return res.json({
        success: true,
        data: relatorioFiltrado,
        periodo: {
          dataInicio: dataInicioDate.toISOString().split('T')[0],
          dataFim: dataFimDate.toISOString().split('T')[0],
        },
        estatisticas: {
          totalRegistros: relatorioFiltrado.length,
          consumoTotal,
          areasEnvolvidas: areasUnicas.length,
          produtosConsumidos: produtosUnicos.length,
        },
        areas: areasUnicas,
        produtos: produtosUnicos,
      });
    } catch (error: any) {
      console.error("Erro ao gerar relatório de consumo:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao gerar relatório de consumo",
      });
    }
  }
}

// ===== OBTER CONSUMO =====
class ObterConsumoInternoController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      if (!id?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID do consumo é obrigatório"
        });
      }

      const obterConsumoService = new ObterConsumoInternoService();
      const consumo = await obterConsumoService.execute({
        id,
        organizationId,
      });

      return res.json({
        success: true,
        data: consumo,
      });
    } catch (error: any) {
      console.error("Erro ao obter consumo:", error);
      if (error.message === "Consumo não encontrado") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao obter consumo",
      });
    }
  }
}

// ===== ATUALIZAR CONSUMO =====
class AtualizarConsumoInternoController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo, observacoes } = req.body;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      if (!id?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID do consumo é obrigatório"
        });
      }

      // Primeiro verificar se existe
      const consumo = await prismaClient.consumoInterno.findFirst({
        where: { id, organizationId },
      });

      if (!consumo) {
        return res.status(404).json({
          success: false,
          error: "Consumo não encontrado"
        });
      }

      // Atualizar
      const updated = await prismaClient.consumoInterno.update({
        where: { id },
        data: {
          motivo: motivo || consumo.motivo,
          observacoes: observacoes !== undefined ? observacoes : consumo.observacoes,
         },
      });

      return res.json({
        success: true,
        message: "Consumo atualizado com sucesso",
        data: updated,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar consumo:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao atualizar consumo",
      });
    }
  }
}

// ===== DELETAR CONSUMO =====
class DeletarConsumoInternoController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      if (!id?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID do consumo é obrigatório"
        });
      }

      // Primeiro verificar se existe
      const consumo = await prismaClient.consumoInterno.findFirst({
        where: { id, organizationId },
      });

      if (!consumo) {
        return res.status(404).json({
          success: false,
          error: "Consumo não encontrado"
        });
      }

      // Deletar
      await prismaClient.consumoInterno.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: "Consumo deletado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao deletar consumo:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao deletar consumo",
      });
    }
  }
}

// ===== DASHBOARD CONSUMO =====
class DashboardConsumoController {
  async handle(req: Request, res: Response) {
    try {
        const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      // Consumo hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const consumoHoje = await prismaClient.consumoInterno.aggregate({
        where: {
          organizationId,
          criadoEm: {
            gte: hoje,
            lt: amanha,
          },
        },
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
      });

      // Consumo esta semana
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const consumoEstaSemana = await prismaClient.consumoInterno.aggregate({
        where: {
          organizationId,
          criadoEm: {
            gte: inicioSemana,
          },
        },
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
      });

      // Consumo este mês
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const consumoEsteMes = await prismaClient.consumoInterno.aggregate({
        where: {
          organizationId,
          criadoEm: {
            gte: inicioMes,
          },
        },
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
      });

      // Top áreas que mais consomem
      const topAreas = await prismaClient.consumoInterno.groupBy({
        by: ['areaId'],
        where: {
          organizationId,
          criadoEm: {
            gte: inicioMes,
          },
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      // Top produtos mais consumidos
      const topProdutos = await prismaClient.consumoInterno.groupBy({
        by: ['productId'],
        where: {
          organizationId,
          criadoEm: {
            gte: inicioMes,
          },
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      // Buscar nomes das áreas e produtos
      const areasComNomes = await Promise.all(
        topAreas.map(async (area) => {
          const areaInfo = await prismaClient.area.findFirst({
            where: { id: area.areaId },
            select: { nome: true },
          });
          return {
            areaId: area.areaId,
            areaNome: areaInfo?.nome || 'Desconhecida',
            quantidade: area._sum.quantity || 0,
          };
        })
      );

      const produtosComNomes = await Promise.all(
        topProdutos.map(async (produto) => {
          const produtoInfo = await prismaClient.product.findFirst({
            where: { id: produto.productId },
            select: { name: true, unit: true },
          });
          return {
            productId: produto.productId,
            productNome: produtoInfo?.name || 'Desconhecido',
            unit: produtoInfo?.unit || 'un',
            quantidade: produto._sum.quantity || 0,
          };
        })
      );

      return res.json({
        success: true,
        data: {
          consumoHoje: {
            quantidade: consumoHoje._sum.quantity || 0,
            registros: consumoHoje._count.id,
          },
          consumoEstaSemana: {
            quantidade: consumoEstaSemana._sum.quantity || 0,
            registros: consumoEstaSemana._count.id,
          },
          consumoEsteMes: {
            quantidade: consumoEsteMes._sum.quantity || 0,
            registros: consumoEsteMes._count.id,
          },
          topAreas: areasComNomes,
          topProdutos: produtosComNomes,
        },
      });
    } catch (error: any) {
      console.error("Erro ao gerar dashboard de consumo:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao gerar dashboard de consumo",
      });
    }
  }
}

export {
  RegistrarConsumoInternoController,
  ListarConsumosInternoController,
  RelatorioConsumoPorAreaController,
  ObterConsumoInternoController,
  AtualizarConsumoInternoController,
  DeletarConsumoInternoController,
  DashboardConsumoController,
};