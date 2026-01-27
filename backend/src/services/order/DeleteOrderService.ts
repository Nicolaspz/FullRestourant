import prismaClient from "../../prisma";

interface RequestDeleteOrder{
  id_order:string
}
class DeleteOrderService{

  async execute({id_order}:RequestDeleteOrder){
    const Order= await prismaClient.order.delete({
      where:{
        id:id_order
      }
    })
    return Order;
  }

}
export {DeleteOrderService};