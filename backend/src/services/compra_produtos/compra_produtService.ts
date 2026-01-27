// services/PurchaseProductService.ts
import prismaClient from "../../prisma";


interface RequestCompra{
  quantity: number;
  purchasePrice:  number;
  salePrice_unitario: number;
  purchaseId: string;
  productId: string;
  productTypeId :string;
}
class CompraService {
  async getPurchaseById(purchaseProductId: string) {
    return prismaClient.purchaseProduct.findUnique({
      where: {
        id: purchaseProductId,
      },
    });
  }

  async createPurchase({quantity,purchasePrice,salePrice_unitario,purchaseId,productId, productTypeId  }:RequestCompra) {
    
    const prod = await prismaClient.purchaseProduct.findFirst({
      where: {
        productId,
        purchaseId
      },
    })
    if(prod){
      throw new Error('Produto ja existe no stock');
    }
    else {
      const purchase = await prismaClient.purchaseProduct.create({
        data:{
          quantity,purchasePrice,purchaseId,productId, productTypeId 
        },
        select:{
          productId:true,
          purchaseId:true,
        }
      })
      return purchase;
    }
    
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
