import prismaClient from "../../prisma";
import fs from 'fs/promises';
import path from 'path';

interface ProdutsRequest {
  name: string;
  description: string;
  banner: string;
  categoryId: string;
  organizationId: string;
  unit: string;
  isDerived: string;
  isIgredient:string;
  defaultAreaId?:string;
}



class ProdutsCreateServices {
  async execute({ name,description, banner, categoryId, organizationId, unit, isDerived,isIgredient,defaultAreaId  }: ProdutsRequest) {
      
    // CONVERTER STRINGS PARA BOOLEAN
    const isDerivedBoolean = isDerived === 'true';
    const isIgredientBoolean = isIgredient === 'true';

    console.log('📥 Dados recebidos no backend:', {
      name,
      isDerived,
      isIgredient,
      defaultAreaId,
      converted: {
        isDerivedBoolean,
        isIgredientBoolean
      }
    });

    const createdProduct = await prismaClient.product.create({
      data: {
        name,
        description,
        banner,
        categoryId,
        organizationId,
        unit,
       isDerived: isDerivedBoolean, // Usar o boolean convertido
      isIgredient: isIgredientBoolean,
      defaultAreaId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        banner: true,
        categoryId: true,
        organizationId: true,
        unit: true,
        isDerived: true,
        defaultAreaId:true,
      }
    });

    return createdProduct;
  }

  async updateProduct({ name, description, banner, categoryId, organizationId, unit, isDerived, isIgredient, defaultAreaId }: ProdutsRequest, productId: string): Promise<void> {
  
  const isDerivedBoolean = isDerived === 'true';
  const isIgredientBoolean = isIgredient === 'true';
  
  // Valida que o produto existe E pertence à organização
  const existingProduct = await prismaClient.product.findUnique({
    where: { 
      id: productId,
      organizationId: organizationId // Valida ambas as condições
    },
  });

  if (!existingProduct) {
    throw new Error('Produto não encontrado ou não pertence a esta organização');
  }

  await prismaClient.product.update({
    where: { 
      id: productId,
      organizationId: organizationId // Garante que atualiza apenas se pertence à org
    },
    data: {
      name,
      description,
      banner,
      categoryId,
      organizationId,
      unit,
      isDerived: isDerivedBoolean,
      isIgredient: isIgredientBoolean,
      defaultAreaId
    },
  });
}

async deleteProduct(productId: string, organizationId: string): Promise<void> {
  console.log("🔍 Iniciando exclusão do produto:", { productId, organizationId });

  // 1. Primeiro valida que o produto pertence à organização
  const productToDelete = await prismaClient.product.findUnique({
    where: { 
      id: productId,
      organizationId: organizationId
    },
    include: {
      // Inclui relacionamentos para verificar dependências
      Stock: true,
      items: true,
      purchaseProducts: true,
      Lote: true,
      recipeItems: true,
      usedIn: true,
      StockHistory: true,
      PrecoVenda: true,
      economatoes: true,
      itemPedidoAreas: true,
      consumoInternos: true
    }
  });

  console.log("🔍 Produto encontrado:", productToDelete ? "Sim" : "Não");
  console.log("🔍 Dependências do produto:", {
    stock: productToDelete?.Stock?.length || 0,
    items: productToDelete?.items?.length || 0,
    purchaseProducts: productToDelete?.purchaseProducts?.length || 0,
    lotes: productToDelete?.Lote?.length || 0,
    receitasComoPrato: productToDelete?.recipeItems?.length || 0,
    receitasComoIngrediente: productToDelete?.usedIn?.length || 0,
    historicoEstoque: productToDelete?.StockHistory?.length || 0,
    precos: productToDelete?.PrecoVenda?.length || 0,
    economatoes: productToDelete?.economatoes?.length || 0,
    pedidoAreas: productToDelete?.itemPedidoAreas?.length || 0,
    consumoInternos: productToDelete?.consumoInternos?.length || 0
  });

  if (!productToDelete) {
    throw new Error('Produto não encontrado ou não pertence a esta organização');
  }

  // 2. Verifica todas as dependências e dá mensagens específicas

  // Verifica se o produto está em estoque
  if (productToDelete.Stock && productToDelete.Stock.length > 0) {
    throw new Error('O produto não pode ser removido, pois está no estoque. Remova primeiro do estoque.');
  }

  // Verifica se o produto está associado a items (pedidos)
  if (productToDelete.items && productToDelete.items.length > 0) {
    throw new Error('O produto não pode ser removido, pois está associado a pedidos. Remova primeiro dos pedidos.');
  }

  // Verifica se o produto está em compras
  if (productToDelete.purchaseProducts && productToDelete.purchaseProducts.length > 0) {
    throw new Error('O produto não pode ser removido, pois está associado a compras. Remova primeiro das compras.');
  }

  // Verifica se o produto tem lotes
  if (productToDelete.Lote && productToDelete.Lote.length > 0) {
    throw new Error('O produto não pode ser removido, pois está associado a lotes. Remova primeiro os lotes.');
  }

  // Verifica se o produto é usado em receitas (como prato ou ingrediente)
  if (productToDelete.recipeItems && productToDelete.recipeItems.length > 0) {
    throw new Error('O produto não pode ser removido, pois é usado como prato em receitas. Remova primeiro das receitas.');
  }

  if (productToDelete.usedIn && productToDelete.usedIn.length > 0) {
    throw new Error('O produto não pode ser removido, pois é usado como ingrediente em receitas. Remova primeiro das receitas.');
  }

  // Verifica se o produto está em economato
  if (productToDelete.economatoes && productToDelete.economatoes.length > 0) {
    throw new Error('O produto não pode ser removido, pois está associado ao economato. Remova primeiro do economato.');
  }

  // Verifica se o produto está em pedidos de área
  if (productToDelete.itemPedidoAreas && productToDelete.itemPedidoAreas.length > 0) {
    throw new Error('O produto não pode ser removido, pois está associado a pedidos de área. Remova primeiro dos pedidos de área.');
  }

  // Verifica se o produto está em consumo interno
  if (productToDelete.consumoInternos && productToDelete.consumoInternos.length > 0) {
    throw new Error('O produto não pode ser removido, pois está associado a consumo interno. Remova primeiro do consumo interno.');
  }

  // 3. Tenta excluir o produto
  try {
    console.log("🗑️ Tentando excluir produto...");
    
    await prismaClient.product.delete({ 
      where: { 
        id: productId,
        organizationId: organizationId
      } 
    });

    console.log("✅ Produto excluído com sucesso");

    // 4. Remove o arquivo de imagem
    if (productToDelete.banner) {
      const filePath = path.join(__dirname, '../../tmp', productToDelete.banner);
      try {
        await fs.unlink(filePath);
        console.log("🗑️ Arquivo de imagem excluído:", filePath);
      } catch (error: any) {
        console.error(`⚠️ Não foi possível excluir o arquivo de imagem: ${error.message}`);
        // Não lança erro aqui para não reverter a exclusão do produto
      }
    }

  } catch (error: any) {
    console.error("❌ Erro ao excluir produto no Prisma:", error);
    
    // Verifica se é erro de constraint do banco
    if (error.code === 'P2003') {
      throw new Error('O produto possui dependências que não puderam ser verificadas. Entre em contato com o suporte.');
    }
    
    throw error;
  }
}

}

export { ProdutsCreateServices };
