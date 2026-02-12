import { Request, response, Response } from "express";
import { ListOrdersService } from "../../services/order/ListOrdersServices";
import prismaClient from "../../prisma";
import { getIO } from "../../socket_io";


class ListOrdersController {

  async handdle(req: Request, res: Response) {
    const { organizationId } = req.query;
    const listOrderCervice = new ListOrdersService();
    const ListOrders = await listOrderCervice.execute({
      organizationId: String(organizationId)
    })
    return res.json(ListOrders);
  }

  async getFaturaSessionId(req: Request, res: Response) {
    const { organizationId, sessionId } = req.query;
    const listOrderCervice = new ListOrdersService();
    const ListOrders = await listOrderCervice.getFaturaBySessionId({ organizationId: organizationId as string, sessionId: sessionId as string });
    return res.json(ListOrders);
  }

  async ListOrderByData(req: Request, res: Response) {
    const { organizationId, date } = req.query;
    const listOrderCervice = new ListOrdersService();
    const ListOrders = await listOrderCervice.getFaturaByDateOrRange({ organizationId: organizationId as string, date: date as string });
    return res.json(ListOrders);
  }
  async fecharMesa(req: Request, res: Response) {
    const { organizationId } = req.query;
    const { number } = req.params;

    // VALIDAÇÃO E TYPECASTING ADICIONADOS AQUI
    if (!number || isNaN(Number(number))) {
      return res.status(400).json({ error: 'Número da mesa inválido' });
    }

    if (!organizationId || typeof organizationId !== 'string') {
      return res.status(400).json({ error: 'Organization ID é obrigatório e deve ser uma string' });
    }

    const listOrderService = new ListOrdersService();
    try {
      const result = await listOrderService.fecharSessao({
        number: Number(number),
        organizationId: organizationId // Agora é garantidamente uma string
      });
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  async togglePrepared(req: Request, res: Response) {
    const { itemId } = req.params;
    const { prepared } = req.body;
    const organizationId = req.query.organizationId as string;

    try {
      // 1. Verificar se o item existe e se não está cancelado
      const item = await prismaClient.item.findUnique({
        where: { id: itemId }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      if (item.canceled) {
        return res.status(400).json({ error: 'Não é possível alterar status de um item cancelado.' });
      }

      // 2. Atualizar
      const updatedItem = await prismaClient.item.update({
        where: { id: itemId },
        data: { prepared },
      });

      // Emitir evento de atualização
      try {
        const io = getIO();
        io.emit('orders_refresh', { organizationId });
      } catch (error) {
        console.error("Erro ao emitir evento de socket:", error);
      }

      return res.json(updatedItem);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return res.status(500).json({ error: 'Erro ao atualizar item' });
    }
  }


}
export { ListOrdersController };