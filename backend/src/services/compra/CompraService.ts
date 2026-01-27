import prismaClient from "../../prisma";

interface PurchaseProductInput {
    productId: string;
    quantity: number;
    purchasePrice?: number;
    salePrice_unitario: number;
    unit: "L" | "KG";
    productTypeId?: string;
}

interface RequestCompra {
  name?: string;
  description?: string;
  qtdCompra: number;
  organizationId: string;
  SupplierId?: string;
}

class CompraService {
  
  async getPurchaseById(purchaseId: string) {
    return prismaClient.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getAllCompras(organizationId: string) {
    return prismaClient.purchase.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        qtdCompra: true,
        created_at:true,
      },
    });
  }

  async createPurchase({
    name,
    description,
    qtdCompra,
    organizationId,
    SupplierId,
  }: RequestCompra) {
    const purchase = await prismaClient.purchase.create({
      data: {
        name,
        description,
        qtdCompra,
        organizationId,
        SupplierId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return purchase;
  }

  async addProductToPurchase(
    purchaseId: string,
    product: PurchaseProductInput
  ) {
    return prismaClient.purchaseProduct.create({
      data: {
      purchaseId,
      productId: product.productId,
      quantity: product.quantity,
      purchasePrice: product.purchasePrice,
      productTypeId: product.productTypeId,
      },
    });
  }

  async removeProductFromPurchase(purchaseId: string, productId: string) {
  // 1. Verifica se existe o produto na compra
  const item = await prismaClient.purchaseProduct.findFirst({
    where: {
      purchaseId,
      productId,
    },
  });

  if (!item) {
    throw new Error("Produto não encontrado na compra.");
  }

  // 2. Remove o produto da compra
  await prismaClient.purchaseProduct.delete({
    where: { id: item.id },
  });

  return { message: "Produto removido da compra com sucesso." };
}


  async listProductsOfPurchase(purchaseId: string) {
    return prismaClient.purchaseProduct.findMany({
      where: {
        purchaseId,
      },
      include: {
        product: true,
      },
    });
  }

  async updatePurchase(id: string, data: RequestCompra) {
    const existingPurchase = await prismaClient.purchase.findUnique({
      where: { id },
    });

    if (!existingPurchase) {
      throw new Error("Compra não encontrada.");
    }

    const updated = await prismaClient.purchase.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        qtdCompra: data.qtdCompra,
        organizationId: data.organizationId,
        SupplierId: data.SupplierId,
      },
    });

    return updated;
  }

  async deletePurchase(id: string) {
  // Verifica se a compra existe
  const purchase = await prismaClient.purchase.findUnique({
    where: { id },
    include: {
      products: true, // busca os produtos associados à compra
    },
  });

  if (!purchase) {
    throw new Error("Compra não encontrada.");
  }

  if (purchase.status) {
    throw new Error("Não é possível remover uma compra já confirmada.");
  }

  if (purchase.products.length > 0) {
    // Remove todos os produtos associados à compra
    await prismaClient.purchaseProduct.deleteMany({
      where: { purchaseId: id },
    });
  }

  // Remove a compra após os produtos terem sido eliminados
  await prismaClient.purchase.delete({
    where: { id },
  });

  return { message: "Compra removida com sucesso." };
}

}

export default CompraService;
