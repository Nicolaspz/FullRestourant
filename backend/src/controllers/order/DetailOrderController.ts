import { DetailOrderService } from "../../services/order/DetailOrderService";
import { Request, Response } from "express";

class DetailOrderController{
  async handdle(req:Request, res:Response){
    const id_order= req.query.id_order as string;
    const Service= new DetailOrderService();
    const detail= await Service.execute({id_order})

    return res.json(detail);
  }
 
  

  
  

}
export {DetailOrderController};