import { Request, Response } from 'express';
import { OrderManagementService } from '../../services/order/OrderManagementService';
import { getIO } from '../../socket_io';

class OrderManagementController {

    // Deletar um item específico do pedido e estornar stock
    async deleteOrderItem(req: Request, res: Response) {
        const { itemId } = req.params;

        const service = new OrderManagementService();

        try {
            const result = await service.deleteOrderItem(itemId);
            // Emitir evento
            try {
                const io = getIO();
                // Se o service retornar organizationId, usamos. Se não, broadcast genérico?
                // Vamos ajustar o service para retornar.
                if (result.organizationId) {
                    io.emit('orders_refresh', { organizationId: result.organizationId });
                }
            } catch (error) {
                console.error("Socket emit error:", error);
            }
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao deletar item"
            });
        }
    }

    // Atualizar quantidade de um item
    async updateItemQuantity(req: Request, res: Response) {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ error: "Quantidade inválida" });
        }

        const service = new OrderManagementService();

        try {
            const result = await service.updateItemQuantity(itemId, Number(quantity));
            try {
                const io = getIO();
                if (result.organizationId) {
                    io.emit('orders_refresh', { organizationId: result.organizationId });
                }
            } catch (error) {
                console.error("Socket emit error:", error);
            }
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao atualizar quantidade"
            });
        }
    }

    // Deletar o pedido inteiro e estornar TUDO
    async deleteCompleteOrder(req: Request, res: Response) {
        const { orderId } = req.params;

        const service = new OrderManagementService();

        try {
            const result = await service.deleteCompleteOrder(orderId);
            try {
                const io = getIO();
                if (result.organizationId) {
                    io.emit('orders_refresh', { organizationId: result.organizationId });
                }
            } catch (error) {
                console.error("Socket emit error:", error);
            }
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao deletar pedido"
            });
        }
    }

    // Restaurar item cancelado (se implementado)
    async restoreCanceledItem(req: Request, res: Response) {
        const { itemId } = req.params;
        const service = new OrderManagementService();

        try {
            const result = await service.restoreCanceledItem(itemId);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao restaurar item"
            });
        }
    }

    // Limpar itens não preparados do pedido
    async cleanUnpreparedItems(req: Request, res: Response) {
        const { orderId } = req.params;
        const service = new OrderManagementService();

        try {
            const result = await service.cleanUnpreparedItems(orderId);
            try {
                const io = getIO();
                if (result.organizationId) {
                    io.emit('orders_refresh', { organizationId: result.organizationId });
                }
            } catch (error) {
                console.error("Socket emit error:", error);
            }
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao limpar itens não preparados"
            });
        }
    }

    // Obter histórico de stock do pedido (auditoria)
    async getOrderStockHistory(req: Request, res: Response) {
        const { orderId } = req.params;
        const service = new OrderManagementService();

        try {
            const history = await service.getOrderStockHistory(orderId);
            return res.json(history);
        } catch (error: any) {
            return res.status(400).json({
                error: error.message || "Erro ao buscar histórico"
            });
        }
    }
}

export { OrderManagementController };
