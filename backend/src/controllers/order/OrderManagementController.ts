// controllers/order/OrderManagementController.ts
import { Request, Response } from 'express';
import { OrderManagementService } from '../../services/order/OrderManagementService';
import prismaClient from '../../prisma';

export class OrderManagementController {
  private orderManagementService: OrderManagementService;

  constructor() {
    this.orderManagementService = new OrderManagementService();
  }

  // Deletar/cancelar item específico de um pedido
  async deleteOrderItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { organizationId, userId,order_id } = req.query;
      const { reason } = req.body;

      console.log('🗑️ Recebendo requisição para cancelar item:', {
        itemId,
        organizationId,
        userId,
        reason,
        order_id
      });

      // Validações
      if (!itemId) {
        return res.status(400).json({
          success: false,
          error: 'ID do item é obrigatório',
          code: 'MISSING_ITEM_ID'
        });
      }

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID é obrigatório',
          code: 'MISSING_ORGANIZATION_ID'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID é obrigatório para registro de histórico',
          code: 'MISSING_USER_ID'
        });
      }

      const result = await this.orderManagementService.deleteOrderItem({
        itemId,
        organizationId: organizationId as string,
        userId: userId as string,
        reason,
        

      });

      return res.status(200).json({
        success: true,
        message: 'Item cancelado com sucesso',
        data: result,
        details: result.stockReturned 
          ? 'Item cancelado e estoque devolvido' 
          : 'Item cancelado (pedido em draft)'
      });

    } catch (error: any) {
      console.error('❌ Erro ao cancelar item:', error.message);

      // Tratamento de erros específicos
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'ITEM_NOT_FOUND'
        });
      }

      if (error.message.includes('já foi preparado')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'ITEM_ALREADY_PREPARED'
        });
      }

      if (error.message.includes('já está cancelado')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'ITEM_ALREADY_CANCELED'
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao cancelar item',
        code: 'CANCEL_ITEM_ERROR'
      });
    }
  }

  // Atualizar quantidade de um item
  async updateItemQuantity(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { organizationId, userId } = req.query;
      const { newQuantity, reason } = req.body;

      console.log('🔄 Recebendo requisição para atualizar quantidade:', {
        itemId,
        newQuantity,
        organizationId,
        userId,
        reason
      });

      // Validações
      if (!itemId) {
        return res.status(400).json({
          success: false,
          error: 'ID do item é obrigatório',
          code: 'MISSING_ITEM_ID'
        });
      }

      if (!newQuantity || typeof newQuantity !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Nova quantidade é obrigatória e deve ser um número',
          code: 'INVALID_QUANTITY'
        });
      }

      if (newQuantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'A quantidade deve ser maior que zero',
          code: 'INVALID_QUANTITY_VALUE'
        });
      }

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID é obrigatório',
          code: 'MISSING_ORGANIZATION_ID'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID é obrigatório',
          code: 'MISSING_USER_ID'
        });
      }

      const result = await this.orderManagementService.updateItemQuantity({
        itemId,
        newQuantity,
        organizationId: organizationId as string,
        userId: userId as string,
        reason
      });

      return res.status(200).json({
        success: true,
        message: 'Quantidade atualizada com sucesso',
        data: result,
        details: result.difference > 0 
          ? `Quantidade aumentada em ${result.difference} unidades`
          : `Quantidade reduzida em ${Math.abs(result.difference)} unidades (estoque devolvido)`
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar quantidade:', error.message);

      // Tratamento de erros específicos
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'ITEM_NOT_FOUND'
        });
      }

      if (error.message.includes('já foi preparado')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'ITEM_ALREADY_PREPARED'
        });
      }

      if (error.message.includes('Estoque insuficiente')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao atualizar quantidade',
        code: 'UPDATE_QUANTITY_ERROR'
      });
    }
  }

  // Deletar/cancelar pedido completo
  async deleteCompleteOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { organizationId, userId } = req.query;
      const { reason } = req.body;

      console.log('🗑️ Recebendo requisição para cancelar pedido:', {
        orderId,
        organizationId,
        userId,
        reason
      });

      // Validações
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'ID do pedido é obrigatório',
          code: 'MISSING_ORDER_ID'
        });
      }

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID é obrigatório',
          code: 'MISSING_ORGANIZATION_ID'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID é obrigatório',
          code: 'MISSING_USER_ID'
        });
      }

      const result = await this.orderManagementService.deleteCompleteOrder({
        orderId,
        organizationId: organizationId as string,
        userId: userId as string,
        reason
      });

      return res.status(200).json({
        success: true,
        message: 'Pedido cancelado com sucesso',
        data: result,
        details: result.itemsReturned > 0 
          ? `${result.itemsReturned} itens devolvidos ao estoque`
          : 'Pedido cancelado (era um draft)'
      });

    } catch (error: any) {
      console.error('❌ Erro ao cancelar pedido:', error.message);

      // Tratamento de erros específicos
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'ORDER_NOT_FOUND'
        });
      }

      if (error.message.includes('já estão em preparação')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'ITEMS_IN_PREPARATION'
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao cancelar pedido',
        code: 'CANCEL_ORDER_ERROR'
      });
    }
  }

  // Restaurar item cancelado
  async restoreCanceledItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { organizationId, userId } = req.query;
      const { reason } = req.body;

      console.log('🔄 Recebendo requisição para restaurar item:', {
        itemId,
        organizationId,
        userId,
        reason
      });

      // Validações
      if (!itemId) {
        return res.status(400).json({
          success: false,
          error: 'ID do item é obrigatório',
          code: 'MISSING_ITEM_ID'
        });
      }

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID é obrigatório',
          code: 'MISSING_ORGANIZATION_ID'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID é obrigatório',
          code: 'MISSING_USER_ID'
        });
      }

      const result = await this.orderManagementService.restoreCanceledItem({
        itemId,
        organizationId: organizationId as string,
        userId: userId as string,
        reason
      });

      return res.status(200).json({
        success: true,
        message: 'Item restaurado com sucesso',
        data: result,
        details: 'Item restaurado e estoque reservado novamente'
      });

    } catch (error: any) {
      console.error('❌ Erro ao restaurar item:', error.message);

      // Tratamento de erros específicos
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'ITEM_NOT_FOUND'
        });
      }

      if (error.message.includes('não está cancelado')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'ITEM_NOT_CANCELED'
        });
      }

      if (error.message.includes('Estoque insuficiente')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao restaurar item',
        code: 'RESTORE_ITEM_ERROR'
      });
    }
  }

  // Listar histórico de alterações de estoque de um pedido
  async getOrderStockHistory(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { organizationId } = req.query;

      if (!orderId || !organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID e Organization ID são obrigatórios'
        });
      }

      // Verificar se o pedido existe
      const order = await prismaClient.order.findUnique({
        where: {
          id: orderId,
          organizationId: organizationId as string
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Pedido não encontrado'
        });
      }

      // Buscar histórico de estoque relacionado a este pedido
      const history = await prismaClient.stockHistory.findMany({
        where: {
          referenceId: orderId,
          organizationId: organizationId as string
        },
        include: {
          product: {
            select: {
              name: true,
              unit: true
            }
          },
          area: {
            select: {
              nome: true
            }
          },
          Lote: {
            select: {
              id: true,
              data_validade: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          orderId,
          orderStatus: order.status,
          orderDraft: order.draft,
          history,
          totalEntries: history.length
        }
      });

    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar histórico'
      });
    }
  }
}