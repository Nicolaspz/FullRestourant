import prismaClient from "../../prisma";

interface RequestParam {
  id_order: string;
}

  class SendOrderService {
    async execute({ id_order }: RequestParam) {
  /*// 1. Verificar se a order existe e ainda está em rascunho
  const order = await prismaClient.order.findUnique({
    where: { id: id_order },
    include: {
      items: {
        include: {
          Product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Pedido não encontrado.");
  }

  if (!order.draft) {
    throw new Error("Este pedido já foi enviado para a cozinha.");
  }

  // 2. Processar o estoque
  for (const item of order.items) {
    const { Product: product, amount, organizationId } = item;

    if (!organizationId) continue;

    // Produto derivado (com receita)
    if (!product.isDerived) {
      const recipeItems = await prismaClient.recipe.findMany({
        where: { productId: product.id },
      });

      if (recipeItems.length > 0) {
        for (const recipeItem of recipeItems) {
          const totalToSubtract = recipeItem.quantity * amount;

          const stock = await prismaClient.stock.findFirst({
            where: {
              productId: recipeItem.ingredientId,
              organizationId,
            },
          });

          if (!stock || stock.quantity < totalToSubtract) {
            throw new Error(`Estoque insuficiente para o ingrediente ${recipeItem.ingredientId}`);
          }

          await prismaClient.stock.update({
            where: { id: stock.id },
            data: {
              quantity: stock.quantity - totalToSubtract,
            },
          });

          await prismaClient.stockHistory.create({
            data: {
              productId: recipeItem.ingredientId,
              type: "Saida",
              quantity: totalToSubtract,
              price: stock.price,
              organizationId,
            },
          });
        }

        continue; // Próximo item
      }
    }

    // Produto simples
    const stock = await prismaClient.stock.findFirst({
      where: {
        productId: product.id,
        organizationId,
      },
    });

    if (!stock || stock.quantity < amount) {
      throw new Error(`Estoque insuficiente para o produto ${product.name ?? product.id}`);
    }

    await prismaClient.stock.update({
      where: { id: stock.id },
      data: {
        quantity: stock.quantity - amount,
      },
    });

    await prismaClient.stockHistory.create({
      data: {
        productId: product.id,
        type: "Saida",
        quantity: amount,
        price: stock.price,
        organizationId,
      },
    });
  }

  // 3. Atualizar status da order depois de tudo
  const updatedOrder = await prismaClient.order.update({
    where: { id: id_order },
    data: { draft: false },
    include: {
      items: {
        include: {
          Product: true,
        },
      },
    },
  });

  return updatedOrder;*/
}

  }

  export { SendOrderService };
