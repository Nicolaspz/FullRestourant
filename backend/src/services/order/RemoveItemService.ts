import prismaClient from "../../prisma";

interface ItemParam{
  id_item:string;
 
}
class RemoveItemService{

async execute({id_item}:ItemParam){

  const item = await prismaClient.item.delete({
    where:{
      id:id_item
    }
  })
  return item;

}

}
export {RemoveItemService};