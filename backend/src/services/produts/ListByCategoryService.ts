import prismaClient from "../../prisma";

interface RequestList {
  id_Categoria: string;
  organizationId: string;
}

interface RequestListList {
  organizationId: string;
}

class ListByCategoryService {
  async execute({ id_Categoria, organizationId }: RequestList) {
    const Produ = await prismaClient.product.findMany({
      where: {
        categoryId: id_Categoria,
        organizationId: organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
       banner: true,
        unit: true,
        is_fractional: true,
        categoryId: true,
        isIgredient:true,
        recipeItems: {
          select: {
            ingredientId: true,
            quantity: true,
            ingredient: {
              select: {
                name: true,
              }
            }
           
            },
          },
       },
    });
    return Produ;
  }

  async ListAllProduts({ organizationId }: RequestListList) {
    return await prismaClient.product.findMany({
      where: {
        organizationId: organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        banner: true,
        unit: true,
        is_fractional: true,
        isDerived: true,
        isIgredient: true,
        Category: {
          select: {
            name: true,
            id:true
          },
        },
        PrecoVenda: {  // Adicionando o preço vigente
          where: {
            data_fim: null,  // Somente o preço atual
          },
          select: {
            preco_venda: true,
            precoSugerido: true,
            data_inicio:true,
          },
          take: 1,
        },
        recipeItems: {
          select: {
            ingredientId: true,
            quantity: true,
            ingredient: {
              select: {
                name: true,
                PrecoVenda: {  // Preço dos ingredientes (para produtos derivados)
                  where: {
                    data_fim: null,
                  },
                  select: {
                    preco_venda: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }

  async getProductById({ productId }: { productId: string }) {
    const product = await prismaClient.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        description: true,
       banner: true,
        unit: true,
        is_fractional: true,
        Category: {
          select: {
            name: true,
          },
        },
        recipeItems: {
          select: {
            ingredientId: true,
            quantity: true,
           ingredient: {
              select: {
               name: true,
                
              },
            },
          },
        },
      },
    });

    return product;
  }
}

export { ListByCategoryService };
