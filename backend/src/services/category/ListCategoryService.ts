import prismaClient from "../../prisma";
interface CategotyParams{
  organizationId:string;
}
class CategoryListService{
  async execute({organizationId}:CategotyParams){
  const List =  await prismaClient.category.findMany({
    where:{
      organizationId:organizationId
    },
    select:{
      id:true,
      name:true,
      organizationId:true,
    }
  })
  return List;
  }
  

}

export {CategoryListService}