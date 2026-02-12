import { AddLisrOrderService } from "../../services/order/AddLisrOrderService";
import { Request, Response } from "express";
import { getIO } from "../../socket_io";

class AddListOrderController {

  async handdle(req: Request, res: Response) {
    const { id_order, produt_id, amount, organizationId } = req.body;
    const AddService = new AddLisrOrderService();
    const AddProd = await AddService.execute({ id_order, produt_id, amount, organizationId });

    try {
      const io = getIO();
      io.emit('orders_refresh', { organizationId });
    } catch (error) {
      console.error("Erro ao emitir evento de socket:", error);
    }

    return res.json(AddProd);
  }

}
export { AddListOrderController }