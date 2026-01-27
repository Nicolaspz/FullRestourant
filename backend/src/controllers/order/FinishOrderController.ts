import { Request, Response } from "express";
import { FinishOrderService } from "../../services/order/FinishOrderServicce";
 
class FinishOrderController{
  async handdle(req:Request, res:Response){
    
    const { order_id } = req.body;
    const FinishService= new FinishOrderService();
    const order= await FinishService.execute({order_id});

    return res.json(order);
  }

}
export {FinishOrderController}