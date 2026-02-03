import { Request, Response } from "express";
import {
  CriarPedidoAreaService,
  ListarPedidosAreaService,
  ObterPedidoAreaService,
  ProcessarPedidoAreaService,
} from "../../services/area/pedidoAreaService";

// ===== CRIAR PEDIDO =====
class CriarPedidoAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { areaOrigemId, areaDestinoId, observacoes, itens } = req.body;
      const organizationId = req.query.organizationId as string;
      const usuarioId = req.query.id as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      // Validações
      if (!areaDestinoId?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Áreas de origem e destino são obrigatórias"
        });
      }

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          success: false,
          error: "O pedido deve conter pelo menos um item"
        });
      }

      const criarPedidoService = new CriarPedidoAreaService();
      const pedido = await criarPedidoService.execute({
        areaOrigemId,
        areaDestinoId,
        observacoes,
        itens,
        usuarioId,
        organizationId,
      });

      return res.status(201).json({
        success: true,
        message: "Pedido de transferência criado com sucesso",
        data: pedido,
      });
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao criar pedido",
      });
    }
  }
}

// ===== LISTAR PEDIDOS =====
class ListarPedidosAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { status, areaOrigemId, areaDestinoId } = req.query;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID não encontrado" 
        });
      }

      const listarPedidosService = new ListarPedidosAreaService();
      const pedidos = await listarPedidosService.execute({
        organizationId,
        status: status as string,
        areaOrigemId: areaOrigemId as string,
        areaDestinoId: areaDestinoId as string,
      });

      return res.json({
        success: true,
        data: pedidos,
        count: pedidos.length,
      });
    } catch (error: any) {
      console.error("Erro ao listar pedidos:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao listar pedidos",
      });
    }
  }
}

// ===== OBTER PEDIDO =====
class ObterPedidoAreaController {
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

      const obterPedidoService = new ObterPedidoAreaService();
      const pedido = await obterPedidoService.execute({
        id,
        organizationId,
      });

      return res.json({
        success: true,
        data: pedido,
      });
    } catch (error: any) {
      console.error("Erro ao obter pedido:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao obter pedido",
      });
    }
  }
}

// ===== PROCESSAR PEDIDO =====
class ProcessarPedidoAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params; // pedidoId
      const { status, observacoes } = req.body;
      const organizationId = req.query.organizationId as string;
      
      // Obter userId do req (setado pelo middleware)
      const usuarioId = req.user_id;

      console.log("Processando pedido:", {
        pedidoId: id,
        status,
        organizationId,
        usuarioId,
        body: req.body
      });

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID é obrigatório" 
        });
      }

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          error: "Usuário não autenticado"
        });
      }

      if (!["aprovado", "rejeitado", "processado", "cancelado"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status inválido. Use: aprovado, rejeitado, processado ou cancelado"
        });
      }

      const processarPedidoService = new ProcessarPedidoAreaService();
      const pedido = await processarPedidoService.execute({
        pedidoId: id,
        status,
        observacoes: observacoes || null,
        usuarioId,
        organizationId,
      });

      return res.json({
        success: true,
        message: `Pedido ${status} com sucesso`,
        data: pedido,
      });
    } catch (error: any) {
      console.error("Erro ao processar pedido:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao processar pedido",
      });
    }
  }
}

// ===== CONFIRMAR PEDIDO (RECEBIMENTO) =====
import { ConfirmarPedidoService } from "../../services/area/ConfirmarPedidoService";

class ConfirmarPedidoAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params; // pedidoId
      const { code } = req.body;
      const organizationId = req.query.organizationId as string;
      
      // Obter userId do req (setado pelo middleware)
      const usuarioId = req.user_id;

      console.log("Confirmando pedido:", {
        pedidoId: id,
        code,
        organizationId,
        usuarioId,
        body: req.body
      });

      if (!organizationId) {
        return res.status(400).json({ 
          success: false,
          error: "Organization ID é obrigatório" 
        });
      }

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          error: "Usuário não autenticado"
        });
      }

      if (!code) {
        return res.status(400).json({
          success: false,
          error: "Código de confirmação é obrigatório"
        });
      }

      const confirmarPedidoService = new ConfirmarPedidoService();
      const pedido = await confirmarPedidoService.execute({
        pedidoId: id,
        code,
        usuarioId,
        organizationId,
      });

      return res.json({
        success: true,
        message: "Recebimento confirmado e stock atualizado",
        data: pedido,
      });
    } catch (error: any) {
      console.error("Erro ao confirmar pedido:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao confirmar pedido",
      });
    }
  }
}

export {
  CriarPedidoAreaController,
  ListarPedidosAreaController,
  ObterPedidoAreaController,
  ProcessarPedidoAreaController,
  ConfirmarPedidoAreaController
};