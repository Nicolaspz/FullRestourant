import { Request, Response } from "express";
import { FinishOrderService } from "../../services/order/FinishOrderServicce";
import { getIO } from "../../socket_io";

class FinishOrderController {
  async handdle(req: Request, res: Response) {

    const { order_id, organizationId } = req.body;
    const FinishService = new FinishOrderService();
    const order = await FinishService.execute({ order_id, organizationId });

    try {
      const io = getIO();
      io.emit('orders_refresh', { organizationId });
    } catch (error) {
      console.error("Erro ao emitir evento de socket:", error);
    }

    return res.json(order);
  }


}
export { FinishOrderController }