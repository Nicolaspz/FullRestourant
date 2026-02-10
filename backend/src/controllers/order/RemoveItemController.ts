import { RemoveItemService } from "../../services/order/RemoveItemService";
import { Request, Response } from "express";

class RemoveItemController{
  async handdle(req:Request, res:Response){
    const id_item= req.query.id_item as string;
    const organizationId= req.query.id_item as string;
    const RemoveService= new RemoveItemService();
    const item= await RemoveService.execute({id_item,organizationId})

    return res.json(item);
  }

}
export {RemoveItemController}