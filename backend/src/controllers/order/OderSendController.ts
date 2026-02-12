import { Request, Response } from 'express';
import { OrderServices } from '../../services/order/OderSendServices';
import prismaClient from '../../prisma';
import { getIO } from '../../socket_io';

class OrderSendController {
  async createWithStockUpdate(request: Request, response: Response) {
    try {
      const {
        tableNumber,
        items,
        customerName,
        organizationId,
        clientToken
      } = request.body;

      console.log('📦 Recebendo pedido:', {
        tableNumber,
        organizationId,
        itemsCount: items?.length || 0,
        hasClientToken: !!clientToken,
        customerName
      });

      // Validação dos dados
      if (!tableNumber && tableNumber !== 0) {
        return response.status(400).json({
          success: false,
          error: 'Número da mesa é obrigatório',
          code: 'MISSING_TABLE_NUMBER'
        });
      }

      if (tableNumber < 0) {
        return response.status(400).json({
          success: false,
          error: 'Número da mesa inválido',
          code: 'INVALID_TABLE_NUMBER'
        });
      }

      if (!organizationId) {
        return response.status(400).json({
          success: false,
          error: 'Organization ID é obrigatório',
          code: 'MISSING_ORGANIZATION_ID'
        });
      }

      if (!items || !Array.isArray(items)) {
        return response.status(400).json({
          success: false,
          error: 'Itens do pedido são obrigatórios e devem ser um array',
          code: 'INVALID_ITEMS_FORMAT'
        });
      }

      if (items.length === 0) {
        return response.status(400).json({
          success: false,
          error: 'Nenhum item no pedido',
          code: 'EMPTY_ORDER'
        });
      }

      // Validar cada item
      const invalidItems = items.filter(item =>
        !item.productId ||
        !item.amount ||
        typeof item.amount !== 'number' ||
        item.amount <= 0
      );

      if (invalidItems.length > 0) {
        return response.status(400).json({
          success: false,
          error: 'Itens do pedido inválidos',
          invalidItems,
          code: 'INVALID_ORDER_ITEMS'
        });
      }

      if (!clientToken || typeof clientToken !== 'string') {
        return response.status(400).json({
          success: false,
          error: 'Token do cliente é obrigatório',
          code: 'MISSING_CLIENT_TOKEN'
        });
      }

      const orderServices = new OrderServices();

      const result = await orderServices.createCompleteOrderWithStockUpdate({
        tableNumber: Number(tableNumber),
        organizationId,
        items,
        customerName: customerName ||
          (tableNumber === 0 ? 'Pedido Takeaway' : `Pedido Mesa ${tableNumber}`),
        clientToken
      });

      console.log('✅ Pedido criado com sucesso:', {
        orderId: result.orderId,
        sessionId: result.sessionId,
        mesaId: result.mesaId
      });

      try {
        const io = getIO();
        io.emit('orders_refresh', { organizationId });
      } catch (error) {
        console.error("Erro ao emitir evento de socket:", error);
      }

      return response.json({
        success: true,
        orderId: result.orderId,
        sessionId: result.sessionId,
        mesaId: result.mesaId,
        clientToken: result.clientToken, // Incluir o token para referência
        message: 'Pedido criado e estoque atualizado com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', {
        message: error.message,
        code: error.code,
        existingClientToken: error.existingClientToken,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      // Tratamento específico para conflito de sessão
      if (error.name === 'SessionConflictError' || error.code === 'SESSION_CONFLICT') {
        return response.status(409).json({
          success: false,
          error: error.message || 'Esta mesa já está ocupada por outro cliente',
          existingClientToken: error.existingClientToken,
          sessionId: error.sessionId,
          mesaId: error.mesaId,
          code: 'SESSION_CONFLICT',
          suggestion: 'Use o token fornecido para se juntar à sessão existente'
        });
      }

      // Tratamento para estoque insuficiente
      if (error.message?.includes('Estoque insuficiente') || error.code === 'INSUFFICIENT_STOCK') {
        return response.status(400).json({
          success: false,
          error: error.message || 'Estoque insuficiente para um ou mais produtos',
          code: 'INSUFFICIENT_STOCK',
          suggestion: 'Verifique a disponibilidade dos produtos'
        });
      }

      // Tratamento para produtos não encontrados
      if (error.message?.includes('Produtos não encontrados') || error.code === 'PRODUCTS_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: error.message || 'Um ou mais produtos não foram encontrados',
          code: 'PRODUCTS_NOT_FOUND',
          suggestion: 'Verifique os IDs dos produtos'
        });
      }

      // Tratamento para mesa não encontrada
      if (error.message?.includes('Mesa não encontrada') || error.code === 'TABLE_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: error.message || `Mesa ${request.body.tableNumber} não encontrada`,
          code: 'TABLE_NOT_FOUND',
          suggestion: 'Verifique o número da mesa'
        });
      }

      // Tratamento para organização não encontrada
      if (error.message?.includes('Organização não encontrada') || error.code === 'ORGANIZATION_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: error.message || 'Organização não encontrada',
          code: 'ORGANIZATION_NOT_FOUND',
          suggestion: 'Verifique o ID da organização'
        });
      }

      // Tratamento para transação falhou
      if (error.code === 'P2025' || error.message?.includes('registro não encontrado')) {
        return response.status(404).json({
          success: false,
          error: 'Um ou mais registros não foram encontrados durante a transação',
          code: 'TRANSACTION_FAILED',
          suggestion: 'Recarregue a página e tente novamente'
        });
      }

      // Tratamento para timeout da transação
      if (error.code === 'P2028' || error.message?.includes('timeout')) {
        return response.status(408).json({
          success: false,
          error: 'Tempo esgotado ao processar o pedido',
          code: 'TRANSACTION_TIMEOUT',
          suggestion: 'Tente novamente em alguns instantes'
        });
      }

      // Erro geral
      return response.status(400).json({
        success: false,
        error: error.message || 'Erro ao processar pedido',
        code: 'GENERAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }


  async ChekVerify(request: Request, response: Response) {
    try {
      const {
        tableNumber,
        organizationId,
        clientToken
      } = request.body;

      console.log('📦 Verificando token:', {
        tableNumber,
        organizationId,
        hasClientToken: !!clientToken
      });

      // Validação dos dados
      if (!tableNumber && tableNumber !== 0) {
        return response.status(400).json({
          success: false,
          error: 'Número da mesa é obrigatório',
          code: 'MISSING_TABLE_NUMBER'
        });
      }

      if (tableNumber < 0) {
        return response.status(400).json({
          success: false,
          error: 'Número da mesa inválido',
          code: 'INVALID_TABLE_NUMBER'
        });
      }

      if (!organizationId) {
        return response.status(400).json({
          success: false,
          error: 'Organization ID é obrigatório',
          code: 'MISSING_ORGANIZATION_ID'
        });
      }

      if (!clientToken || typeof clientToken !== 'string') {
        return response.status(400).json({
          success: false,
          error: 'Token do cliente é obrigatório',
          code: 'MISSING_CLIENT_TOKEN'
        });
      }

      const orderServices = new OrderServices();

      const result = await orderServices.veryfiToken({
        tableNumber: Number(tableNumber),
        organizationId,
        clientToken
      });

      return response.json({
        success: true,
        sessionId: result.sessionId,
        mesaId: result.mesaId,
        clientToken: result.clientToken,
        message: 'Sessão verificada/criada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao verificar token:', {
        message: error.message,
        name: error.name,
        code: error.code,
        existingClientToken: error.existingClientToken,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      // Tratamento específico para conflito de sessão
      if (error.name === 'SessionConflictError' || error.code === 'SESSION_CONFLICT') {
        return response.status(409).json({
          success: false,
          error: error.message || 'Esta mesa já está ocupada por outro cliente',
          existingClientToken: error.existingClientToken,
          sessionId: error.sessionId,
          mesaId: error.mesaId,
          code: 'SESSION_CONFLICT',
          suggestion: 'Use o token fornecido para se juntar à sessão existente'
        });
      }

      // Tratamento para mesa não encontrada
      if (error.message?.includes('Mesa') && error.message?.includes('não encontrada')) {
        return response.status(404).json({
          success: false,
          error: error.message,
          code: 'TABLE_NOT_FOUND',
          suggestion: 'Verifique o número da mesa'
        });
      }

      // Tratamento básico de erros de validação
      if (
        error.message?.includes('Número da mesa inválido') ||
        error.message?.includes('Organization ID é obrigatório') ||
        error.message?.includes('Token do cliente é obrigatório')
      ) {
        return response.status(400).json({
          success: false,
          error: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      // Tratamento para timeout da transação
      if (error.code === 'P2028' || error.message?.includes('timeout')) {
        return response.status(408).json({
          success: false,
          error: 'Tempo esgotado ao processar a verificação',
          code: 'TRANSACTION_TIMEOUT',
          suggestion: 'Tente novamente em alguns instantes'
        });
      }

      // Erro geral do Prisma
      if (error.code?.startsWith('P')) {
        return response.status(500).json({
          success: false,
          error: 'Erro de banco de dados',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString()
        });
      }

      // Erro geral
      return response.status(400).json({
        success: false,
        error: error.message || 'Erro ao verificar token',
        code: 'GENERAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }
  // Método adicional para verificar sessão ativa
  async checkActiveSession(request: Request, response: Response) {
    try {
      const { tableNumber, organizationId } = request.query;

      if (!tableNumber || !organizationId) {
        return response.status(400).json({
          success: false,
          error: 'Parâmetros tableNumber e organizationId são obrigatórios'
        });
      }

      const orderServices = new OrderServices();

      // Buscar mesa
      const mesa = await prismaClient.mesa.findFirst({
        where: {
          number: Number(tableNumber),
          organizationId: String(organizationId)
        }
      });

      if (!mesa) {
        return response.json({
          activeSession: false,
          error: 'Mesa não encontrada'
        });
      }

      // Verificar se existe sessão ativa
      const activeSession = await prismaClient.session.findFirst({
        where: {
          mesaId: mesa.id,
          status: true,
          organizationId: String(organizationId)
        },
        select: {
          id: true,
          codigoAbertura: true,
          clientToken: true,
          abertaEm: true,
          mesa: {
            select: {
              id: true,
              number: true,
              status: true
            }
          }
        }
      });

      return response.json({
        activeSession: !!activeSession,
        session: activeSession,
        clientToken: activeSession?.clientToken || null,
        mesaId: mesa.id,
        mesaNumber: mesa.number,
        mesaStatus: mesa.status
      });

    } catch (error: any) {
      console.error('Erro ao verificar sessão:', error);
      return response.status(500).json({
        success: false,
        error: 'Erro interno ao verificar sessão'
      });
    }
  }


}

export { OrderSendController };