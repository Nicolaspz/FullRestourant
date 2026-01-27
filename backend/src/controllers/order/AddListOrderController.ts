import { AddLisrOrderService } from "../../services/order/AddLisrOrderService";
import { Request,Response } from "express";

class AddListOrderController{

  async handdle(req:Request,res:Response ){
    const {id_order,produt_id,amount,organizationId}= req.body;
    const AddService= new AddLisrOrderService();
    const AddProd= await AddService.execute({id_order,produt_id,amount,organizationId});
    return res.json(AddProd);
  }

}
export {AddListOrderController}