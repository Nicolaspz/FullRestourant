import { DeleteOrderService } from "../../services/order/DeleteOrderService";
import { Request, Response } from "express";

class DeleteOrderController{
  async handdle(req:Request, res:Response){
    const id_order=req.query.id_order as string;
    const OrderService= new DeleteOrderService;
    const order= await OrderService.execute({id_order});

    return res.json(order);
  }

}
export {DeleteOrderController};
