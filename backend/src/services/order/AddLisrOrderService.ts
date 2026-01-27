import prismaClient from "../../prisma";
import { Response, Request } from "express";

interface LisAddRequest{
  id_order:string;
  produt_id:string;
  amount:number;
  organizationId:string;
}
class AddLisrOrderService{

  async execute({id_order,produt_id,amount,organizationId}: LisAddRequest){
    const ListAdd= await prismaClient.item.create({
      data:{
        orderId:id_order,
        productId:produt_id,
        amount:amount,
        organizationId:organizationId
      }
    })
    return ListAdd;

  }

}
export {AddLisrOrderService};