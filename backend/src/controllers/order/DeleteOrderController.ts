import { DeleteOrderService } from "../../services/order/DeleteOrderService";
import { Request, Response } from "express";
import { getIO } from "../../socket_io";

class DeleteOrderController {
  async handdle(req: Request, res: Response) {
    const id_order = req.query.id_order as string;
    const OrderService = new DeleteOrderService;
    const order = await OrderService.execute({ id_order });

    try {
      if (order?.organizationId) {
        const io = getIO();
        io.emit('orders_refresh', { organizationId: order.organizationId });
      }
    } catch (error) {
      console.error("Erro ao emitir evento de socket:", error);
    }

    return res.json(order);
  }

}
export { DeleteOrderController };
