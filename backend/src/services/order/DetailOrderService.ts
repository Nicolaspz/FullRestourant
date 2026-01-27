import prismaClient from "../../prisma";

interface RequestParam{
  id_order:string
}
class DetailOrderService{
  async execute({id_order}:RequestParam){
    const orders= await prismaClient.item.findMany({
      where:{
        orderId:id_order
      },
      include:{
        Product:true,
        Order:true,
        Organization:true,
      }
    })
    return orders;
  }
}
export {DetailOrderService};