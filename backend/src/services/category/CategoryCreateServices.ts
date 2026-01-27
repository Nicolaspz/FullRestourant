import prismaClient from "../../prisma"

interface RequestCategory{
  name:string;
  organizationId:string,
 
}
class CategoryCreateServices{
  async execute({name,organizationId}:RequestCategory){

    if(name === ''){
      throw new Error("nome da Categoria Inválido");
    }
    const category = await prismaClient.category.create({
      data:{
        name,
        organizationId,
      },
      select:{
        name:true,
        id:true,
        organizationId:true
      }
    })
    console.log(category);
    return category;

  }

  async updateCategory(name:string, id:string){
    // Verificar se o produto existe antes de tentar atualizá-lo
    const existingProduct = await prismaClient.category.findUnique({
      where: {
        id: id,
      },
    });
  
    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }
  
    // Produto existe, proceder com a atualização
   const category = await prismaClient.category.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        
      },
    });
    return category;
  }

  async DeleteCategory(id:string){
    // Verificar se o produto existe antes de tentar atualizá-lo
    const existingProduct = await prismaClient.category.findUnique({
      where: {
        id: id,
      },
    });
  
    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }
  
    // Produto existe, proceder com a atualização
   const category = await prismaClient.category.delete({
      where: {
        id: id,
      }});
    return category;
  }

  
}
export {CategoryCreateServices};