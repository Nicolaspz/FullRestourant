import { Request, Response } from "express";
import { SendOrderService } from "../../services/order/SendOrderService";

class SendOrderController{

async handdle(req:Request, res:Response){
  const {id_order}= req.body;
  const Serviceorder= new SendOrderService();
  const order= await Serviceorder.execute({id_order})

  return res.json(order);

}

}
export {SendOrderController}