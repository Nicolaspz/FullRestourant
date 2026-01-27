import { Request, Response } from "express";
import {
  AdicionarProdutoAreaService,
  ListarStockAreaService,
  TransferirEntreAreasService,
  AjustarStockService,
  ObterAlertasStockService,
  ObterStockProdutoService,
} from "../../services/area/economatoService";
import prismaClient from "../../prisma";

// ===== ADICIONAR PRODUTO AO ECONOMATO =====
class AdicionarProdutoController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId, productId, quantity, minQuantity, maxQuantity } = req.body;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const adicionarProdutoService = new AdicionarProdutoAreaService();
      const resultado = await adicionarProdutoService.execute({
        areaId,
        productId,
        quantity,
        minQuantity,
        maxQuantity,
        organizationId,
      });

      return res.status(201).json({
        success: true,
        message: "Produto adicionado ao economato com sucesso",
        data: resultado,
      });
    } catch (error: any) {
      console.error("Erro ao adicionar produto ao economato:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao adicionar produto ao economato",
      });
    }
  }
}

// ===== LISTAR STOCK DA ÁREA =====
class ListarStockAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId } = req.params;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const listarStockService = new ListarStockAreaService();
      const stock = await listarStockService.execute({
        areaId,
        organizationId,
      });

      const totalQuantidade = stock.reduce((sum, item) => sum + item.quantity, 0);

      return res.json({
        success: true,
        data: stock,
        count: stock.length,
        totalQuantidade,
      });
    } catch (error: any) {
      console.error("Erro ao listar stock da área:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao listar stock da área",
      });
    }
  }
}

class AjustarStockController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId, productId, novaQuantidade, motivo, observacoes } = req.body;
      const organizationId = req.query.organizationId as string;
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

      if (typeof novaQuantidade !== "number" || novaQuantidade < 0) {
        return res.status(400).json({
          success: false,
          error: "Nova quantidade deve ser um número não negativo"
        });
      }

      if (!motivo?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Motivo do ajuste é obrigatório"
        });
      }

      const ajustarStockService = new AjustarStockService();
      const resultado = await ajustarStockService.execute({
        areaId,
        productId,
        novaQuantidade,
        motivo,
        observacoes,
        usuarioId,
        organizationId,
      });

      return res.json({
        success: true,
        ...resultado,
      });
    } catch (error: any) {
      console.error("Erro ao ajustar stock:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao ajustar stock",
      });
    }
  }
}

// ===== OBTER ALERTAS DE STOCK =====
class ObterAlertasStockController {
  async handle(req: Request, res: Response) {
    try {
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      const alertasService = new ObterAlertasStockService();
      const alertas = await alertasService.execute(organizationId);

      const criticos = alertas.filter((a) => a.nivel === "CRITICO");
      const moderados = alertas.filter((a) => a.nivel === "MODERADO");

      return res.json({
        success: true,
        data: alertas,
        count: alertas.length,
        criticos: criticos.length,
        moderados: moderados.length,
        temAlertasCriticos: criticos.length > 0,
        temAlertas: alertas.length > 0,
      });
    } catch (error: any) {
      console.error("Erro ao obter alertas de stock:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao obter alertas de stock",
      });
    }
  }
}

// ===== OBTER STOCK POR PRODUTO =====
class ObterStockProdutoController {
  async handle(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      if (!productId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID do produto é obrigatório"
        });
      }

      const obterStockProdutoService = new ObterStockProdutoService();
      const resultado = await obterStockProdutoService.execute({
        productId,
        organizationId,
      });

      return res.json({
        success: true,
        data: resultado.stockPorArea,
        total: resultado.total,
        quantidadeAreas: resultado.quantidadeAreas,
        message: resultado.quantidadeAreas > 0 
          ? "Stock encontrado em " + resultado.quantidadeAreas + " área(s)"
          : "Produto não encontrado em nenhuma área",
      });
    } catch (error: any) {
      console.error("Erro ao obter stock por produto:", error);
      if (error.message.includes("não encontrado")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao obter stock por produto",
      });
    }
  }
}

// ===== REMOVER PRODUTO DO ECONOMATO =====
interface RemoverProdutoParams {
  areaId: string;
  productId: string;
  quantity: number;
}

class RemoverProdutoController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId, productId, quantity, motivo, observacoes } = req.body;
      const organizationId = req.query.organizationId as string;
      const usuarioId = req.query.id as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      // Usar o serviço de ajuste para remover
      const ajustarStockService = new AjustarStockService();
      
      // Primeiro obter stock atual
      const listarStockService = new ListarStockAreaService();
      const stock = await listarStockService.execute({ areaId, organizationId });
      
      const produtoStock = stock.find(item => item.productId === productId);
      const stockAtual = produtoStock ? produtoStock.quantity : 0;
      const novaQuantidade = Math.max(0, stockAtual - quantity);

      const resultado = await ajustarStockService.execute({
        areaId,
        productId,
        novaQuantidade,
        motivo: motivo || "Remoção manual",
        observacoes: observacoes || `Removido ${quantity} unidades`,
        usuarioId,
        organizationId,
      });

      return res.json({
        success: true,
        ...resultado,
        removido: quantity,
        stockAnterior: stockAtual,
        stockAtual: novaQuantidade,
      });
    } catch (error: any) {
      console.error("Erro ao remover produto do economato:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao remover produto do economato",
      });
    }
  }
}

// ===== ATUALIZAR CONFIGURAÇÕES DO ECONOMATO =====
class AtualizarConfigEconomatoController {
  async handle(req: Request, res: Response) {
    try {
      const { areaId, productId, minQuantity, maxQuantity } = req.body;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      if (!areaId?.trim() || !productId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID da área e ID do produto são obrigatórios"
        });
      }

      // Verificar se existe no economato
      const economato = await prismaClient.economato.findFirst({
        where: {
          areaId,
          productId,
          organizationId,
        },
      });

      if (!economato) {
        return res.status(404).json({
          success: false,
          error: "Produto não encontrado no economato desta área"
        });
      }

      // Atualizar configurações
      const updated = await prismaClient.economato.update({
        where: { id: economato.id },
        data: {
          minQuantity: minQuantity !== undefined ? minQuantity : economato.minQuantity,
          maxQuantity: maxQuantity !== undefined ? maxQuantity : economato.maxQuantity,
        },
      });

      return res.json({
        success: true,
        message: "Configurações atualizadas com sucesso",
        data: updated,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar configurações:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao atualizar configurações",
      });
    }
  }
}
class TransferirProdutoController {
  async handle(req: Request, res: Response) {
    try {
      const { areaOrigemId, areaDestinoId, productId, quantity, observacoes } = req.body;
      const organizationId = req.query.organizationId as string;
      const usuarioId = req.query.id as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      // Validações básicas
      if (!areaOrigemId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID da área de origem é obrigatório"
        });
      }

      if (!areaDestinoId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "ID da área de destino é obrigatório"
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

      const transferirService = new TransferirEntreAreasService();
      const resultado = await transferirService.execute({
        areaOrigemId,
        areaDestinoId,
        productId,
        quantity,
        observacoes,
        usuarioId,
        organizationId,
      });

      return res.json({
        success: true,
        ...resultado,
      });
    } catch (error: any) {
      console.error("Erro ao transferir produto:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao transferir produto",
      });
    }
  }
}

export {
  AdicionarProdutoController,
  ListarStockAreaController,
  TransferirProdutoController,
  AjustarStockController,
  ObterAlertasStockController,
  ObterStockProdutoController,
  RemoverProdutoController,
  AtualizarConfigEconomatoController,
};