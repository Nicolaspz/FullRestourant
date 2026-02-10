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

  async updateCategory(name: string, id: string, id_organization: string) {
  // Verificar se a categoria existe E pertence à organização
  const existingCategory = await prismaClient.category.findUnique({
    where: {
      id: id,
      organizationId: id_organization // Verifica ambas as condições
    },
  });

  if (!existingCategory) {
    throw new Error('Categoria não encontrada ou não pertence a esta organização');
  }

  // Categoria existe, proceder com a atualização
  const category = await prismaClient.category.update({
    where: {
      id: id,
      organizationId: id_organization // Garante que atualiza apenas se pertence à org
    },
    data: {
      name: name,
    },
  });
  return category;
}

async DeleteCategory(id: string, id_organization: string) {
  // Verificar se a categoria existe E pertence à organização
  const existingCategory = await prismaClient.category.findUnique({
    where: {
      id: id,
      organizationId: id_organization // Verifica ambas as condições
    },
  });

  if (!existingCategory) {
    throw new Error('Categoria não encontrada ou não pertence a esta organização');
  }

  // Categoria existe, proceder com a exclusão
  const category = await prismaClient.category.delete({
    where: {
      id: id,
      organizationId: id_organization // Garante que deleta apenas se pertence à org
    }
  });
  return category;
}
  
}
export {CategoryCreateServices};