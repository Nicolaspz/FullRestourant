import prismaClient from "../../prisma";

interface IngredientInput {
  productId: string;
  ingredientId: string;
  quantity: number;
  impactaPreco: boolean;
}

class RecipeService {
  async execute({ productId, ingredientId, quantity, impactaPreco }: IngredientInput) {
    // Validações iniciais
    const [product, ingredient] = await Promise.all([
      prismaClient.product.findUnique({
        where: { id: productId, isDerived: true },
        include: { Organization: true }
      }),
      prismaClient.product.findUnique({
        where: { id: ingredientId, isIgredient: true }
      })
    ]);

    if (!product) {
      throw new Error("Produto não encontrado ou não é um prato derivado!");
    }

    if (!ingredient) {
      throw new Error("Ingrediente não encontrado ou não é válido!");
    }

    // Verifica se ingrediente já existe na receita
    const existing = await prismaClient.recipe.findFirst({
      where: { productId, ingredientId }
    });

    if (existing) {
      throw new Error("Este ingrediente já foi adicionado à receita.");
    }

    // Cria a relação na receita
    await prismaClient.recipe.create({
      data: { 
        productId, 
        ingredientId, 
        quantity, 
        impactaPreco,
        organizationId: product.organizationId 
      }
    });

    // Atualiza o preço sugerido do produto
    await this.updateSuggestedPriceAdd(productId);

    return { success: true };
  }

  private async getCurrentCost(productId: string) {
    // Busca o lote ativo mais recente do produto
    const latestLote = await prismaClient.lote.findFirst({
      where: { 
        productId,
        isActive: true
      },
      orderBy: { data_compra: 'desc' }
    });

    if (!latestLote) {
      throw new Error(`Nenhum lote ativo encontrado para o produto ${productId}`);
    }

    return latestLote.preco_compra;
  }

  private async updateSuggestedPrice(productId: string) {
    // Busca o produto e sua organização para pegar a margem
    const product = await prismaClient.product.findUnique({
        where: { id: productId },
        include: { Organization: true }
    });

    if (!product) {
        throw new Error("Produto não encontrado");
    }

    // Busca todos os ingredientes que impactam o preço
    const recipeItems = await prismaClient.recipe.findMany({
        where: { 
            productId,
            impactaPreco: true 
        },
        include: {
            ingredient: true
        }
    });

    let custoTotal = 0;

    // Calcula o custo total baseado nos lotes ativos
    for (const item of recipeItems) {
        try {
            const currentCost = await this.getCurrentCost(item.ingredientId);
            custoTotal += currentCost * item.quantity;
        } catch (error) {
            console.error(`Erro ao calcular custo para ${item.ingredient.name}:`, error.message);
            throw new Error(`Falha ao calcular custo para ${item.ingredient.name}`);
        }
    }

    // Aplica a margem
    const margem = product.Organization?.margin_dish ? 
                   (1 + product.Organization.margin_dish / 100) : 1.3;
    
    const precoCalculado = custoTotal * margem;

    // Verifica se já existe um preço ativo (data_fim = null)
    const existingActivePrice = await prismaClient.precoVenda.findFirst({
        where: { 
            productId,
            data_fim: null
        }
    });
    console.log('DEBUG - existingActivePrice:', {
      exists: !!existingActivePrice,
      value: existingActivePrice,
      type: typeof existingActivePrice,
      productIdChecked: productId
  });
    if (existingActivePrice) {
        // ATUALIZA apenas o preço sugerido do registro existente
        await prismaClient.precoVenda.update({
            where: { id: existingActivePrice.id },
            data: { 
                precoSugerido: precoCalculado,
                precisaAtualizar: true
            }
        });
    } else {
        // CRIA novo registro com preço de venda = preço calculado
        await prismaClient.precoVenda.create({
            data: {
                productId,
                preco_venda: precoCalculado, // Preço aprovado
                precoSugerido: null,          // Sem sugestão
                precisaAtualizar: false,      // Não precisa aprovação
                data_inicio: new Date(),
                data_fim: null                // Registro ativo
            }
        });
    }
}
  private async updateSuggestedPriceAdd(productId: string) {
    // Busca o produto e sua organização para pegar a margem
    const product = await prismaClient.product.findUnique({
      where: { id: productId },
      include: { Organization: true }
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // Busca todos os ingredientes que impactam o preço
    const recipeItems = await prismaClient.recipe.findMany({
      where: { 
        productId,
        impactaPreco: true 
      },
      include: {
        ingredient: true
      }
    });
    
    let custoTotal = 0;

    // Calcula o custo total baseado nos lotes ativos
    for (const item of recipeItems) {
      try {
        const currentCost = await this.getCurrentCost(item.ingredientId);
        custoTotal += currentCost * item.quantity;
      } catch (error) {
        console.error(`Erro ao calcular custo para ${item.ingredient.name}:`, error.message);
        throw new Error(`Falha ao calcular custo para ${item.ingredient.name}`);
      }
    }

    // Aplica a margem (usando a padrão da organização ou 30% se não definida)
    const margem = product.Organization?.margin_dish ? 
                   (1 + product.Organization.margin_dish / 100) : 1.3;
    
    const precoSugerido = custoTotal * margem;
    console.log("preço sugerido",precoSugerido)
    // Atualiza ou cria o registro de preço
    const existingActivePrice = await prismaClient.precoVenda.findFirst({
      where: { 
        productId,
        data_fim: null
      }
    });
    
    if (existingActivePrice) {
      // Atualiza apenas o preço sugerido
      await prismaClient.precoVenda.update({
        where: { id: existingActivePrice.id },
        data: {
          preco_venda: precoSugerido,
          precoSugerido,
          precisaAtualizar: false,
          data_inicio: new Date(),
          data_fim:null,
        }
      });
    } else {
      // Cria novo registro
      await prismaClient.precoVenda.create({
        data: {
          productId,
          preco_venda: precoSugerido, // Na primeira vez, pode ser igual ao sugerido
          precoSugerido,
          data_inicio: new Date(),
          precisaAtualizar: false,
          data_fim:null,
        }
      });
    }
  }
  

  async upsertRecipeItem(productId: string, ingredientId: string, quantity: number, impactaPreco: boolean) {
    const [product, ingredient] = await Promise.all([
      prismaClient.product.findUnique({
        where: { id: productId, isDerived: true },
        include: { Organization: true }
      }),
      prismaClient.product.findUnique({
        where: { id: ingredientId, isIgredient: true }
      })
    ]);

    if (!product) {
      throw new Error("Produto não encontrado ou não é um prato derivado!");
    }

    if (!ingredient) {
      throw new Error("Ingrediente não encontrado ou não é válido!");
    }

    // Verifica se já existe
    const existing = await prismaClient.recipe.findFirst({
      where: { productId, ingredientId }
    });

    if (existing) {
      // Atualiza
      await prismaClient.recipe.update({
        where: { id: existing.id },
        data: { quantity, impactaPreco }
      });
    } else {
      // Cria novo
      await prismaClient.recipe.create({
        data: { 
          productId, 
          ingredientId, 
          quantity, 
          impactaPreco,
          organizationId: product.organizationId
        }
      });
    }

    // Atualiza o preço sugerido
    await this.updateSuggestedPrice(productId);

    return { message: "Receita atualizada com sucesso." };
  }

  async removeRecipeItem(recipeId: string) {
    const item = await prismaClient.recipe.findUnique({
      where: { id: recipeId },
      include: {
        product: {
          select: { id: true, isDerived: true }
        }
      }
    });

    if (!item) {
      throw new Error("Item da receita não encontrado.");
    }

    if (!item.product.isDerived) {
      throw new Error("Só é possível remover ingredientes de pratos derivados.");
    }

    await prismaClient.recipe.delete({
      where: { id: recipeId }
    });

    // Atualiza o preço sugerido
    await this.updateSuggestedPrice(item.product.id);

    return { message: "Ingrediente removido com sucesso." };
  }

  // Métodos para aprovação de preços
  async getPendingPriceUpdates(organizationId: string) {
    return prismaClient.precoVenda.findMany({
      where: { 
        product: { organizationId },
        precisaAtualizar: true,
        data_fim: null
      },
      include: {
        product: true
      }
    });
  }

  async approvePriceUpdate(productId: string, userId: string) {
    const priceRecord = await prismaClient.precoVenda.findFirst({
      where: { 
        productId,
        precisaAtualizar: true,
        data_fim: null
      }
    });

    if (!priceRecord) {
      throw new Error("Não há atualização pendente para este produto");
    }

    // Encerra o preço atual
    await prismaClient.precoVenda.update({
      where: { id: priceRecord.id },
      data: { data_fim: new Date() }
    });

    // Cria novo registro com o preço sugerido
    await prismaClient.precoVenda.create({
      data: {
        productId,
        preco_venda: priceRecord.precoSugerido || priceRecord.preco_venda,
        precoSugerido: null,
        precisaAtualizar: false,
        data_inicio: new Date()
      }
    });

    return { message: "Preço atualizado com sucesso." };
  }

  async rejectPriceUpdate(productId: string) {
    await prismaClient.precoVenda.updateMany({
      where: { 
        productId,
        precisaAtualizar: true,
        data_fim: null
      },
      data: { 
        precoSugerido: null,
        precisaAtualizar: false
      }
    });

    return { message: "Atualização de preço rejeitada." };
  }
  async listRecipe(productId: string) {
    const recipe = await prismaClient.recipe.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
        quantity: true,
        productId: true,
        impactaPreco: true,
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
            PrecoVenda: {  // Adicionado para trazer o preço
              where: {
                data_fim: null,  // Pega apenas o preço vigente
              },
              select: {
                preco_venda: true,
              },
              take: 1,
            },
          },
        },
      },
    });
    return recipe;
  }
  
}

export { RecipeService };