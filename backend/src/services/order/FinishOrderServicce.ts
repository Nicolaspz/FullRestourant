import prismaClient from "../../prisma";

interface RequestParam{
  order_id:string
}
class FinishOrderService{
  async execute({ order_id }: RequestParam) {
    // 1. Verificar se ainda existem itens não preparados
    const unpreparedItems = await prismaClient.item.findMany({
      where: {
        orderId: order_id,
        prepared: false,
      },
    });
  
    // 2. Se houver itens não preparados, retorna erro
    if (unpreparedItems.length > 0) {
      throw new Error("Ainda há itens não preparados neste pedido. Conclua todos antes de fechar.");
    }
  
    // 3. Se todos estiverem preparados, fecha o pedido
    const order = await prismaClient.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: true,
      },
    });
  
    return order;
  }
  

}
export {FinishOrderService};