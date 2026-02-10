import prismaClient from "../../prisma";

interface ItemParam{
  id_item:string;
  organizationId:string;
 
}
class RemoveItemService{

async execute({id_item,organizationId}:ItemParam){

  const item = await prismaClient.item.delete({
    where:{
      id:id_item,
      organizationId,
      prepared:false
    }
  })
  return item;

}



}
export {RemoveItemService};