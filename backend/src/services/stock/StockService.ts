import prismaClient from "../../prisma";

interface StockUpdateRequest {
  productId: string;
  quantity: number;
  organizationId: string;
  
}
class StockService {
  
  async addProductsToStock(organizationId: string, purchaseId: string) {
    const purchase = await prismaClient.purchase.findUnique({
      where: { id: purchaseId, organizationId },
      include: { products: { include: { product: true } },organization:true },
    });

    const margem = purchase.organization.margin_dish 
    ? (1 + purchase.organization.margin_dish / 100) 
    : 1.3;
  
    if (!purchase) throw new Error("Compra não encontrada");
    if (purchase.status) return { message: "Compra já processada", status: false };
  
    for (const item of purchase.products) {
      // 1. Cria um NOVO LOTE para cada item da compra
      const precoVenda = (item.purchasePrice || 0) * margem;
      const newLote = await prismaClient.lote.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          preco_compra: item.purchasePrice || 0, // Preço de compra unitário
          preco_venda:precoVenda,   // Preço de venda unitário
          purchaseId: purchaseId,
          organizationId: organizationId,
        },
      });
  
      // 2. Atualiza o Stock (quantidade total do produto)
      const existingStock = await prismaClient.stock.findFirst({
        where: { productId: item.productId, organizationId },
      });
  
      if (existingStock) {
        await prismaClient.stock.update({
          where: { id: existingStock.id },
          data: { totalQuantity: existingStock.totalQuantity + item.quantity },
        });
      } else {
        await prismaClient.stock.create({
          data: {
            productId: item.productId,
            totalQuantity: item.quantity,
            organizationId,
          },
        });
      }
  
      // 3. Registra no Histórico
      await prismaClient.stockHistory.create({
        data: {
          productId: item.productId,
          type: "entrada",
          quantity: item.quantity,
          price: precoVenda,
          organizationId,
          referenceId: purchaseId,
          referenceType: "purchase",
        },
      });

      
      const lastPrice = await prismaClient.precoVenda.findFirst({
        where: { 
          productId:item.productId,
          data_fim: null
        }
      });
  
      
        // Encerra o preço anterior (se existir)
        if (lastPrice) {
          await prismaClient.precoVenda.update({
            where: { id: lastPrice.id },
            data:{ 
              precoSugerido:precoVenda,
              precisaAtualizar: true,
              data_inicio: new Date()
            },
          });
        } else {
          await prismaClient.precoVenda.create({
            data: {
              productId: item.productId,
              preco_venda: precoVenda,
              data_inicio: new Date(),
              data_fim: null
            },
          });
        }
   }
  
    // Finaliza a compra
    await prismaClient.purchase.update({
      where: { id: purchaseId },
      data: { status: true },
    });
  
    return { message: "Estoque atualizado com lotes", status: true };
  }

  async removeProductFromStock({ productId, quantity, organizationId }: StockUpdateRequest) {
    try {
      // 1. Busca lotes ativos do produto (ordem FIFO)
      const activeLotes = await prismaClient.lote.findMany({
        where: {
          productId,
          organizationId,
          isActive: true,
          quantity: { gt: 0 }
        },
        orderBy: { data_compra: 'asc' } // Consome o mais antigo primeiro
      });
  
      if (activeLotes.length === 0) {
        throw new Error('Produto não encontrado no estoque.');
      }
  
      // 2. Calcula quantidade total disponível
      const totalAvailable = activeLotes.reduce((sum, lote) => sum + lote.quantity, 0);
      if (totalAvailable < quantity) {
        throw new Error('Quantidade insuficiente no estoque.');
      }
  
      // 3. Consome dos lotes (FIFO)
      let remainingQty = quantity;
      for (const lote of activeLotes) {
        if (remainingQty <= 0) break;
  
        const consumedQty = Math.min(remainingQty, lote.quantity);
        
        // Atualiza lote
        await prismaClient.lote.update({
          where: { id: lote.id },
          data: { quantity: lote.quantity - consumedQty }
        });
  
        remainingQty -= consumedQty;
  
        // 4. Registra saída no histórico (por lote)
        await prismaClient.stockHistory.create({
          data: {
            productId,
            type: "saída-venda",
            quantity: consumedQty,
            price: lote.preco_venda, // Preço do lote (ou pode usar o preço vigente)
            organizationId,
            referenceId: lote.id, // Associa ao lote consumido
            referenceType: 'sale'
          }
        });
      }
  
      // 5. Atualiza Stock (quantidade total)
      const stock = await prismaClient.stock.findFirst({
        where: { productId, organizationId }
      });
  
      if (stock) {
        await prismaClient.stock.update({
          where: { id: stock.id },
          data: { totalQuantity: stock.totalQuantity - quantity }
        });
      }
  
      return { success: true };
  
    } catch (error) {
      console.error('Erro ao remover produto do estoque:', error);
      throw error;
    }
  }
  async AllStockByOrganization(organizationId: string) {
    try {
      const stock = await prismaClient.stock.findMany({
        where: { organizationId },
        include: {
          product: {
            include: {
              Category: { select: { id: true, name: true } },
              PrecoVenda: { // Inclui o preço vigente
                where: { data_fim: null },
                take: 1
              }
            }
          }
        }
      });
  
      // Formata resposta
      return stock.map(item => ({
        id: item.id,
        quantity: item.totalQuantity, // Usa totalQuantity (soma dos lotes)
        product: {
          id: item.product.id,
          name: item.product.name,
          isDerived: item.product.isDerived,
          isIgredient: item.product.isIgredient,
          description: item.product.description,
          Category: item.product.Category,
          price: item.product.PrecoVenda[0]?.preco_venda || 0 // Preço vigente
        },
       
      }));
  
    } catch (error) {
      console.error('Erro ao listar estoque:', error);
      throw error;
    }
  }
  async AllStockByCategory(organizationId: string, categoryId: string) {
    try {
      const stock = await prismaClient.stock.findMany({
        where: {
          organizationId,
          product: { categoryId }
        },
        include: {
          product: {
            include: {
              Category: { select: { id: true, name: true } },
              PrecoVenda: { 
                where: { data_fim: null },
                take: 1
              }
            }
          }
        }
      });
  
      return stock.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          Category: item.product.Category,
          price: item.product.PrecoVenda[0]?.preco_venda || 0 // Preço vigente
        },
        quantity: item.totalQuantity // Quantidade total
      }));
  
    } catch (error) {
      console.error('Erro ao listar estoque por categoria:', error);
      throw error;
    }
  }
  async ConfirmPreco(productId: string, customPrice?: number) {
    try {
      // 1. Busca o preço ativo atual (se existir)
      const lastPrice = await prismaClient.precoVenda.findFirst({
        where: { 
          productId,
          data_fim: null
        }
      });
  
      // 2. Determina qual preço usar
      let novoPrecoVenda: number;
      let usarPrecoSugerido = false;
  
      if (customPrice !== undefined && customPrice !== null) {
        // Se veio preço customizado, usa ele
        novoPrecoVenda = customPrice;
      } else if (lastPrice?.precoSugerido) {
        // Se não veio customizado mas tem sugerido, usa o sugerido
        novoPrecoVenda = lastPrice.precoSugerido;
        usarPrecoSugerido = true;
      } else {
        throw new Error("Nenhum preço fornecido e não há preço sugerido disponível");
      }
  
      // 3. Valida o preço
      if (novoPrecoVenda <= 0) {
        throw new Error("O preço deve ser maior que zero");
      }
  
      // 4. Se existe preço anterior, encerra ele
      if (lastPrice) {
        await prismaClient.precoVenda.update({
          where: { id: lastPrice.id },
          data: { 
            precisaAtualizar: false,
            data_fim: new Date()
          }
        });
      }
  
      // 5. Cria novo registro com o novo preço
      const newPrice = await prismaClient.precoVenda.create({
        data: {
          productId,
          preco_venda: novoPrecoVenda,
          precoSugerido: null, // Limpa a sugestão independente do caso
          precisaAtualizar: false,
          data_inicio: new Date(),
          data_fim: null
        }
      });
  
      return {
        success: true,
        message: usarPrecoSugerido 
          ? "Preço sugerido aceito com sucesso" 
          : lastPrice 
            ? "Preço atualizado com sucesso"
            : "Preço definido com sucesso",
        data: {
          oldPriceId: lastPrice?.id,
          newPriceId: newPrice.id,
          newPrice: newPrice.preco_venda,
          usedSuggestedPrice: usarPrecoSugerido,
          isNewPrice: !lastPrice
        }
      };
  
    } catch (error) {
      console.error("Erro ao atualizar preço:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido ao atualizar preço",
        data: null
      };
    }
  }
  
  }




export { StockService };
