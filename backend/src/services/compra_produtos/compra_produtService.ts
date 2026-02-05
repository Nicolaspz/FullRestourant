// services/PurchaseProductService.ts
import prismaClient from "../../prisma";


interface RequestCompra {
  quantity: number;
  purchasePrice: number;
  salePrice_unitario?: number; // Este campo não existe no modelo
  purchaseId: string;
  productId: string;
  productTypeId?: string; // Tornado opcional
  organizationId: string; // ADICIONADO - obrigatório
}
class CompraService {
  async getPurchaseById(purchaseProductId: string) {
    return prismaClient.purchaseProduct.findUnique({
      where: {
        id: purchaseProductId,
      },
    });
  }

  async createPurchase({ 
    quantity, 
    purchasePrice, 
    salePrice_unitario, // Se quiser usar isso, precisa criar campo no modelo
    purchaseId, 
    productId, 
    productTypeId,
    organizationId // ADICIONADO
  }: RequestCompra) {
    
    // Validações básicas
    if (!organizationId) {
      throw new Error('Organization ID é obrigatório');
    }

    if (quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    // Verificar se a compra existe
    const purchaseExists = await prismaClient.purchase.findUnique({
      where: { id: purchaseId, organizationId }
    });

    if (!purchaseExists) {
      throw new Error('Compra não encontrada');
    }

    // Verificar se o produto existe
    const productExists = await prismaClient.product.findUnique({
      where: { id: productId, organizationId }
    });

    if (!productExists) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se o productType existe (se fornecido)
    if (productTypeId) {
      const productTypeExists = await prismaClient.productType.findUnique({
        where: { id: productTypeId, organizationId }
      });

      if (!productTypeExists) {
        throw new Error('Tipo de produto não encontrado');
      }
    }

    // Verificar se produto já está na compra
    const prod = await prismaClient.purchaseProduct.findFirst({
      where: {
        productId,
        purchaseId,
        organizationId // Adicionar organização na verificação
      },
    });

    if (prod) {
      throw new Error('Produto já existe nesta compra');
    } else {
      // Se productTypeId não for fornecido, buscar ou criar padrão
      let finalProductTypeId = productTypeId;
      
      if (!finalProductTypeId) {
        // Buscar tipo padrão baseado na categoria do produto
        const productWithCategory = await prismaClient.product.findUnique({
          where: { id: productId },
          include: { Category: true }
        });

        let defaultTypeName = 'Outros';
        if (productWithCategory?.Category?.name.toLowerCase().includes('bebida')) {
          defaultTypeName = 'Bebida';
        } else if (productWithCategory?.Category?.name.toLowerCase().includes('aliment')) {
          defaultTypeName = 'Alimentar';
        }

        const defaultProductType = await prismaClient.productType.findFirst({
          where: {
            tipe: defaultTypeName,
            organizationId
          }
        });

        if (defaultProductType) {
          finalProductTypeId = defaultProductType.id;
        } else {
          // Criar tipo padrão se não existir
          const newProductType = await prismaClient.productType.create({
            data: {
              tipe: defaultTypeName,
              organizationId
            }
          });
          finalProductTypeId = newProductType.id;
        }
      }

      // Criar o purchase product
      const purchaseProduct = await prismaClient.purchaseProduct.create({
        data: {
          quantity,
          purchasePrice,
          purchaseId,
          productId,
          productTypeId: finalProductTypeId,
          organizationId // ADICIONADO
        },
        include: {
          product: {
            select: {
              name: true,
              unit: true
            }
          },
          productType: {
            select: {
              tipe: true
            }
          },
          Purchase: {
            select: {
              name: true,
              created_at: true
            }
          }
        }
      });

      // ATUALIZAR ESTOQUE (se necessário)
      /*await this.updateStockAfterPurchase({
        productId,
        quantity,
        purchasePrice,
        organizationId,
        purchaseId
      });

      // Se você quer usar salePrice_unitario, precisa criar um PrecoVenda
      if (salePrice_unitario && salePrice_unitario > 0) {
        await this.createOrUpdateSalePrice({
          productId,
          salePrice: salePrice_unitario,
          organizationId
        });
      }*/

      return purchaseProduct;
    }
  }

  private async updateStockAfterPurchase({
    productId,
    quantity,
    purchasePrice,
    organizationId,
    purchaseId
  }: {
    productId: string;
    quantity: number;
    purchasePrice: number;
    organizationId: string;
    purchaseId: string;
  }) {
    // Atualizar ou criar stock
    const existingStock = await prismaClient.stock.findFirst({
      where: {
        productId,
        organizationId
      }
    });

    if (existingStock) {
      await prismaClient.stock.update({
        where: { id: existingStock.id },
        data: {
          totalQuantity: {
            increment: quantity
          }
        }
      });
    } else {
      await prismaClient.stock.create({
        data: {
          productId,
          totalQuantity: quantity,
          organizationId
        }
      });
    }

    // Criar lote
    await prismaClient.lote.create({
      data: {
        productId,
        quantity,
        preco_compra: purchasePrice,
        purchaseId,
        organizationId,
        data_compra: new Date(),
        isActive: true
      }
    });

    // Registrar no histórico
    await prismaClient.stockHistory.create({
      data: {
        type: 'entrada',
        price: purchasePrice,
        quantity,
        productId,
        organizationId,
        referenceId: purchaseId,
        referenceType: 'purchase'
      }
    });
  }

  private async createOrUpdateSalePrice({
    productId,
    salePrice,
    organizationId
  }: {
    productId: string;
    salePrice: number;
    organizationId: string;
  }) {
    // Encerrar preço atual se existir
    await prismaClient.precoVenda.updateMany({
      where: {
        productId,
        data_fim: null
      },
      data: {
        data_fim: new Date()
      }
    });

    // Criar novo preço
    await prismaClient.precoVenda.create({
      data: {
        productId,
        preco_venda: salePrice,
        data_inicio: new Date()
      }
    });

    // Registrar no histórico de preços
    await prismaClient.salePriceHistory.create({
      data: {
        productId,
        newPrice: salePrice,
        oldPrice: 0, // Ou buscar o preço anterior
        purchaseId: '', // Você precisa ter o purchaseId aqui
        organizationId
      }
    });
  }

async DeletePurchase( id :string) {
  const purchase = await prismaClient.purchaseProduct.findFirst({ 
    where:{
      id
    }
  })
  if(purchase){
    await prismaClient.purchaseProduct.delete({
      where:{
        id
      }
    })
  }
 else{
  throw new Error('Erro ao eliminar a Compra_do_Produto');
 }
}
async RemoverProdutoCompra(productId: string, purchaseId: string) {
  // Verificar se a compra existe
  const purchaseExists = await prismaClient.purchase.findUnique({
    where: { id: purchaseId }
  });

  if (!purchaseExists) {
    throw new Error('Compra não encontrada');
  }

  // Verificar se o produto existe na compra
  const purchaseProduct = await prismaClient.purchaseProduct.findFirst({
    where: {
      productId,
      purchaseId
    }
  });

  if (!purchaseProduct) {
    throw new Error('Produto não encontrado nesta compra');
  }

  // Remover o produto da compra
  try {
    const removedProduct = await prismaClient.purchaseProduct.delete({
      where: {
        id: purchaseProduct.id
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    // Atualizar a quantidade total da compra
    /*await prismaClient.purchase.update({
      where: { id: purchaseId },
      data: {
        qtdCompra: {
          decrement: purchaseProduct.quantity
        }
      }
    });*/

    return {
      message: `Produto ${removedProduct.product.name} removido da compra`,
      removedProduct
    };
    
  } catch (error) {
    console.error('Erro ao remover produto da compra:', error);
    throw new Error('Falha ao remover produto da compra');
  }
}
async ListarProduBYCompra(purchaseId:string) {
  const compraProduto = await prismaClient.purchaseProduct.findMany({
    where: {
      purchaseId
    },
    select: {
      id:true,
     quantity:true,
      productId: true,
      purchasePrice:true,
      product:{
        select: {
          id:true,
          name:true,
        }
      },
      purchaseId:true,
      Purchase:{
        select:{
          name:true,
          description:true,
        }
      }
    },
  });
   
   return compraProduto;
  
}
  
}
export default CompraService;
