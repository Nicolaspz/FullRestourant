// services/order/OrderManagementService.ts
import { PrismaClient, StockReferenceType } from '@prisma/client';

const prisma = new PrismaClient();

interface DeleteItemParams {
  itemId: string;
  organizationId: string;
  userId: string;
  reason?: string;
}

interface UpdateItemQuantityParams {
  itemId: string;
  newQuantity: number;
  organizationId: string;
  userId: string;
  reason?: string;
}

interface DeleteOrderParams {
  orderId: string;
  organizationId: string;
  userId: string;
  reason?: string;
}

export class OrderManagementService {
  // Método para deletar um item específico de um pedido
  async deleteOrderItem({
    itemId,
    organizationId,
    userId,
    reason = "Item removido pelo usuário"
  }: DeleteItemParams) {
    return prisma.$transaction(async (tx) => {
      console.log(`🗑️ Iniciando remoção do item ${itemId}...`);

      // 1. Buscar o item com todas as informações necessárias
      const item = await tx.item.findUnique({
        where: { 
          id: itemId,
          organizationId 
        },
        include: {
          Order: {
            include: {
              Session: true
            }
          },
          Product: {
            include: {
              recipeItems: {
                include: {
                  ingredient: {
                    include: {
                      Stock: {
                        where: { organizationId }
                      },
                      defaultArea: true,
                      economatoes: {
                        where: { organizationId },
                        include: { area: true }
                      }
                    }
                  }
                }
              },
              Stock: {
                where: { organizationId }
              },
              defaultArea: true,
              economatoes: {
                where: { organizationId },
                include: { area: true }
              }
            }
          },
          areaOrigin: true
        }
      });

      if (!item) {
        throw new Error(`Item não encontrado ou não pertence à organização`);
      }

      // 2. Verificar se o item já foi preparado
      if (item.prepared) {
        throw new Error("Não é possível remover um item que já foi preparado");
      }

      // 3. Verificar se o item está cancelado
      if (item.canceled) {
        throw new Error("Este item já está cancelado");
      }

      // 4. Marcar o item como cancelado (soft delete)
      console.log(`🚫 Marcando item ${itemId} como cancelado...`);
      const canceledItem = await tx.item.update({
        where: { id: itemId },
        data: {
          canceled: true,
          canceledAt: new Date(),
          canceledReason: reason,
          status: 'cancelado'
        }
      });

      // 5. Devolver o estoque (se não for draft)
      if (!item.Order.draft) {
        console.log(`🔄 Devolvendo estoque do item: ${item.Product.name} x${item.amount}`);
        await this.returnStockToInventory(tx, item, organizationId, item.Order.id);
      }

      // 6. Verificar se o pedido ainda tem itens ativos (não cancelados)
      const remainingItems = await tx.item.count({
        where: { 
          orderId: item.Order.id,
          canceled: false
        }
      });

      // 7. Se não houver mais itens ativos, fechar o pedido?
      if (remainingItems === 0) {
        console.log(`📦 Pedido ${item.Order.id} está sem itens ativos`);
        // Você pode decidir se quer fechar o pedido:
        // await tx.order.update({
        //   where: { id: item.order.id },
        //   data: { status: true } // marcando como concluído
        // });
      }

      // 8. Registrar no histórico de estoque
      await tx.stockHistory.create({
        data: {
          type: 'entrada-Devolução por cancelamento', // Devolução é uma entrada de estoque
          price: 0,
          quantity: item.amount,
          productId: item.productId,
          organizationId,
          referenceId: item.Order.id,
          referenceType: StockReferenceType.sale, // Usando o enum correto
          areaId: item.areaOriginId,
         // observacoes: `Devolução por cancelamento: ${reason}`
        }
      });

      console.log(`✅ Item cancelado e estoque devolvido com sucesso`);
      return {
        canceledItem,
        orderId: item.Order.id,
        remainingItems,
        stockReturned: !item.Order.draft
      };

    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  // Método para atualizar a quantidade de um item
  async updateItemQuantity({
    itemId,
    newQuantity,
    organizationId,
    userId,
    reason = "Quantidade ajustada pelo usuário"
  }: UpdateItemQuantityParams) {
    if (newQuantity <= 0) {
      throw new Error("A quantidade deve ser maior que zero");
    }

    return prisma.$transaction(async (tx) => {
      console.log(`🔄 Atualizando quantidade do item ${itemId} para ${newQuantity}...`);

      // 1. Buscar o item atual
      const currentItem = await tx.item.findUnique({
        where: { 
          id: itemId,
          organizationId 
        },
        include: {
          Order: {
            include: {
              Session: true
            }
          },
          Product: {
            include: {
              recipeItems: {
                include: {
                  ingredient: {
                    include: {
                      Stock: {
                        where: { organizationId }
                      },
                      defaultArea: true,
                      economatoes: {
                        where: { organizationId },
                        include: { area: true }
                      }
                    }
                  }
                }
              },
              Stock: {
                where: { organizationId }
              },
              defaultArea: true,
              economatoes: {
                where: { organizationId },
                include: { area: true }
              }
            }
          },
          areaOrigin: true
        }
      });

      if (!currentItem) {
        throw new Error(`Item não encontrado ou não pertence à organização`);
      }

      // 2. Verificar se pode ser editado
      if (currentItem.prepared) {
        throw new Error("Não é possível editar um item que já foi preparado");
      }

      if (currentItem.canceled) {
        throw new Error("Não é possível editar um item cancelado");
      }

      // 3. Calcular diferença
      const difference = newQuantity - currentItem.amount;
      console.log(`📊 Diferença de quantidade: ${difference}`);

      if (difference === 0) {
        throw new Error("A nova quantidade é igual à quantidade atual");
      }

      // 4. Se diferença negativa (redução), devolver estoque
      if (difference < 0) {
        const amountToReturn = Math.abs(difference);
        console.log(`📤 Devolvendo ${amountToReturn} unidades ao estoque...`);
        
        // Criar um item temporário com a quantidade a devolver
        const tempItem = {
          ...currentItem,
          amount: amountToReturn
        };
        
        await this.returnStockToInventory(tx, tempItem, organizationId, currentItem.Order.id);
      }

      // 5. Se diferença positiva (aumento), verificar estoque disponível
      if (difference > 0) {
        console.log(`📥 Verificando estoque para ${difference} unidades adicionais...`);
        await this.checkAndReserveAdditionalStock(tx, currentItem.Product, difference, organizationId, currentItem.Order.id);
      }

      // 6. Atualizar a quantidade do item
      console.log(`✏️ Atualizando quantidade no banco de dados...`);
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: { 
          amount: newQuantity,
          updated_at: new Date()
        }
      });

      // 7. Registrar no histórico de estoque
      await tx.stockHistory.create({
        data: {
          type:  `Ajuste de quantidade: ${reason} (Antigo: ${currentItem.amount}, Novo: ${newQuantity})`,
          price: 0,
          quantity: Math.abs(difference),
          productId: currentItem.productId,
          organizationId,
          referenceId: currentItem.Order.id,
          referenceType: difference > 0 ? StockReferenceType.sale : StockReferenceType.ajuste,
          areaId: currentItem.areaOriginId,
          //observacoes:
        }
      });

      console.log(`✅ Quantidade atualizada com sucesso`);
      return {
        updatedItem,
        previousQuantity: currentItem.amount,
        newQuantity,
        difference,
        orderId: currentItem.orderId
      };

    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  // Método para deletar/cancelar um pedido completo
  async deleteCompleteOrder({
    orderId,
    organizationId,
    userId,
    reason = "Pedido cancelado pelo usuário"
  }: DeleteOrderParams) {
    return prisma.$transaction(async (tx) => {
      console.log(`🗑️ Iniciando cancelamento do pedido ${orderId}...`);

      // 1. Buscar o pedido com todos os itens ativos
      const order = await tx.order.findUnique({
        where: { 
          id: orderId,
          organizationId 
        },
        include: {
          items: {
            where: {
              canceled: false
            },
            include: {
              Product: {
                include: {
                  recipeItems: {
                    include: {
                      ingredient: {
                        include: {
                          Stock: {
                            where: { organizationId }
                          },
                          defaultArea: true,
                          economatoes: {
                            where: { organizationId },
                            include: { area: true }
                          }
                        }
                      }
                    }
                  },
                  Stock: {
                    where: { organizationId }
                  },
                  defaultArea: true,
                  economatoes: {
                    where: { organizationId },
                    include: { area: true }
                  }
                }
              },
              areaOrigin: true
            }
          },
          Session: true
        }
      });

      if (!order) {
        throw new Error(`Pedido não encontrado ou não pertence à organização`);
      }

      // 2. Verificar se pode ser cancelado
      const preparedItems = order.items.filter(item => item.prepared);
      if (preparedItems.length > 0) {
        throw new Error(
          `Não é possível cancelar o pedido. ${preparedItems.length} item(s) já estão em preparação.`
        );
      }

      // 3. Cancelar todos os itens ativos
      //console.log(`🚫 Cancelando ${order.items.length} itens...`);
      const canceledItems = await tx.item.updateMany({
        where: { 
          orderId: orderId,
          canceled: false
        },
        data: {
          canceled: true,
          canceledAt: new Date(),
          canceledReason: reason,
          status: 'cancelado'
        }
      });

      // 4. Devolver estoque de todos os itens (se não for draft)
      if (!order.draft) {
        //console.log(`🔄 Devolvendo estoque de ${order.items.length} itens...`);
        for (const item of order.items) {
          await this.returnStockToInventory(tx, item, organizationId, orderId);
        }
      }

      // 5. Marcar pedido como concluído/cancelado
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: true, // Marcando como concluído
          updated_at: new Date()
        }
      });

      // 6. Registrar no histórico para cada item
      if (!order.draft) {
        for (const item of order.items) {
          await tx.stockHistory.create({
            data: {
              type: 'entrada por Cancelamento de pedido',
              price: 0,
              quantity: item.amount,
              productId: item.productId,
              organizationId,
              referenceId: orderId,
              referenceType: StockReferenceType.sale,
              areaId: item.areaOriginId,
              //observacoes: `Cancelamento de pedido: ${reason}`
            }
          });
        }
      }

      console.log(`✅ Pedido cancelado com sucesso`);
      return {
        canceledOrder: updatedOrder,
        itemsCanceled: canceledItems.count,
        itemsReturned: order.draft ? 0 : order.items.length,
        sessionId: order.sessionId,
        orderStatus: 'cancelado'
      };

    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  // Método auxiliar para devolver estoque ao inventário
  private async returnStockToInventory(
    tx: any,
    item: any,
    organizationId: string,
    referenceOrderId: string
  ) {
    const product = item.product;
    const amount = item.amount;
    const areaOriginId = item.areaOriginId;

    console.log(`📦 Devolvendo ${amount} unidades de ${product.name}`);

    if (product.isDerived && product.recipeItems.length > 0) {
      // Produto derivado - devolver ingredientes
      for (const recipeItem of product.recipeItems) {
        if (recipeItem.impactaPreco) {
          const quantityToReturn = recipeItem.quantity * amount;
          await this.addStockToInventory(
            tx,
            recipeItem.ingredient,
            quantityToReturn,
            organizationId,
            referenceOrderId,
            areaOriginId,
            `${product.name} -> ${recipeItem.ingredient.name}`
          );
        }
      }
    } else {
      // Produto direto - devolver o próprio produto
      await this.addStockToInventory(
        tx,
        product,
        amount,
        organizationId,
        referenceOrderId,
        areaOriginId,
        product.name
      );
    }
  }

  // Método auxiliar para adicionar estoque ao inventário
  private async addStockToInventory(
    tx: any,
    product: any,
    quantity: number,
    organizationId: string,
    referenceOrderId: string,
    areaOriginId: string | null,
    productName: string
  ) {
    console.log(`➕ Adicionando ${quantity} unidades de ${productName} ao estoque`);

    // 1. Primeiro tentar devolver para a área de origem (se existir)
    if (areaOriginId) {
      const economato = product.economatoes?.find(
        (e: any) => e.areaId === areaOriginId
      );

      if (economato) {
        console.log(`   🏠 Devolvendo ${quantity} unidades para área ${economato.area?.nome}`);
        
        // Atualizar economato
        await tx.economato.update({
          where: { id: economato.id },
          data: {
            quantity: { increment: quantity }
          }
        });

        // Registrar no histórico
        await tx.stockHistory.create({
          data: {
            type: 'entrada',
            price: 0,
            quantity: quantity,
            productId: product.id,
            organizationId,
            referenceId: referenceOrderId,
            referenceType: StockReferenceType.transferencia_area,
            areaId: areaOriginId,
            observacoes: `Devolução de estoque para área ${economato.area?.nome}`
          }
        });

        return; // Estoque devolvido à área
      }
    }

    // 2. Se não tem área específica ou não encontrou, adicionar ao stock geral
    console.log(`   📦 Devolvendo ${quantity} unidades para stock geral`);
    
    const stock = product.Stock?.[0];
    
    if (stock) {
      // Atualizar stock geral
      await tx.stock.update({
        where: { id: stock.id },
        data: {
          totalQuantity: { increment: quantity }
        }
      });

      // Registrar no histórico
      await tx.stockHistory.create({
        data: {
          type: 'entrada',
          price: 0,
          quantity: quantity,
          productId: product.id,
          organizationId,
          referenceId: referenceOrderId,
          referenceType: StockReferenceType.sale,
          areaId: null,
          observacoes: `Devolução de estoque para stock geral`
        }
      });
    } else {
      // Criar novo registro de stock se não existir
      console.log(`   ⚠️ Criando novo registro de stock para ${productName}`);
      
      const newStock = await tx.stock.create({
        data: {
          productId: product.id,
          totalQuantity: quantity,
          organizationId
        }
      });

      // Registrar no histórico
      await tx.stockHistory.create({
        data: {
          type: 'entrada',
          price: 0,
          quantity: quantity,
          productId: product.id,
          organizationId,
          referenceId: referenceOrderId,
          referenceType: StockReferenceType.manual,
          areaId: null,
          observacoes: `Criação de stock por devolução`
        }
      });
    }
  }

  // Método auxiliar para verificar e reservar estoque adicional
  private async checkAndReserveAdditionalStock(
    tx: any,
    product: any,
    additionalQuantity: number,
    organizationId: string,
    orderId: string
  ) {
    console.log(`🔍 Verificando estoque para ${additionalQuantity} unidades adicionais de ${product.name}`);

    if (product.isDerived && product.recipeItems.length > 0) {
      // Produto derivado - verificar ingredientes
      for (const recipeItem of product.recipeItems) {
        if (recipeItem.impactaPreco) {
          const requiredAmount = recipeItem.quantity * additionalQuantity;
          const ingredient = recipeItem.ingredient;
          
          // Verificar disponibilidade
          await this.verifyStockAvailability(tx, ingredient, requiredAmount, organizationId, product.name);
        }
      }
    } else {
      // Produto direto - verificar disponibilidade
      await this.verifyStockAvailability(tx, product, additionalQuantity, organizationId, product.name);
    }

    console.log(`✅ Estoque disponível para aumento de quantidade`);
  }

  // Método auxiliar para verificar disponibilidade de estoque
  private async verifyStockAvailability(
    tx: any,
    product: any,
    requiredQuantity: number,
    organizationId: string,
    productName: string
  ) {
    // Buscar estoque atualizado
    const updatedProduct = await tx.product.findUnique({
      where: { id: product.id },
      include: {
        Stock: {
          where: { organizationId }
        },
        economatoes: {
          where: { organizationId },
          include: { area: true }
        },
        defaultArea: true
      }
    });

    if (!updatedProduct) {
      throw new Error(`Produto ${productName} não encontrado`);
    }

    const generalStock = updatedProduct.Stock?.[0];
    const generalStockQuantity = generalStock?.totalQuantity || 0;

    if (updatedProduct.defaultArea) {
      // Verificar área default primeiro
      const economato = updatedProduct.economatoes?.find(
        (e: any) => e.areaId === updatedProduct.defaultArea?.id
      );
      
      const areaStockQuantity = economato?.quantity || 0;
      const totalAvailable = areaStockQuantity + generalStockQuantity;
      
      if (totalAvailable < requiredQuantity) {
        throw new Error(
          `Estoque insuficiente para ${productName}. ` +
          `Necessário: ${requiredQuantity}, ` +
          `Disponível: ${totalAvailable} ` +
          `(Área ${updatedProduct.defaultArea.nome}: ${areaStockQuantity}, ` +
          `Stock Geral: ${generalStockQuantity})`
        );
      }
    } else if (generalStockQuantity < requiredQuantity) {
      throw new Error(
        `Estoque insuficiente no stock geral para ${productName}. ` +
        `Necessário: ${requiredQuantity}, Disponível: ${generalStockQuantity}`
      );
    }
  }

  // Método para restaurar um item cancelado
  async restoreCanceledItem({
    itemId,
    organizationId,
    userId,
    reason = "Item restaurado pelo usuário"
  }: DeleteItemParams) {
    return prisma.$transaction(async (tx) => {
      console.log(`🔄 Restaurando item cancelado ${itemId}...`);

      // 1. Buscar o item cancelado
      const item = await tx.item.findUnique({
        where: { 
          id: itemId,
          organizationId 
        },
        include: {
          Order: true,
          Product: {
            include: {
              recipeItems: {
                include: {
                  ingredient: {
                    include: {
                      Stock: {
                        where: { organizationId }
                      },
                      defaultArea: true,
                      economatoes: {
                        where: { organizationId },
                        include: { area: true }
                      }
                    }
                  }
                }
              },
              Stock: {
                where: { organizationId }
              },
              defaultArea: true,
              economatoes: {
                where: { organizationId },
                include: { area: true }
              }
            }
          }
        }
      });

      if (!item) {
        throw new Error(`Item não encontrado`);
      }

      /*if (!item.canceled) {
        throw new Error(`Este item não está cancelado`);
      }*/

      // 2. Verificar estoque disponível para restaurar
      await this.verifyStockAvailability(tx, item.Product, item.amount, organizationId, item.Product.name);

      // 3. Remover estoque novamente (se não for draft)
      if (!item.Order.draft) {
        console.log(`📥 Retirando ${item.amount} unidades do estoque...`);
        await this.removeStockFromInventory(tx, item.Product, item.amount, organizationId, item.Order.id, item.areaOriginId);
      }

      // 4. Restaurar o item
      const restoredItem = await tx.item.update({
        where: { id: itemId },
        data: {
          canceled: false,
          canceledAt: null,
          canceledReason: null,
          status: 'pendente',
          updated_at: new Date()
        }
      });

      // 5. Registrar no histórico
      await tx.stockHistory.create({
        data: {
          type: 'saída- Restauração de item: ${reason}',
          price: 0,
          quantity: item.amount,
          productId: item.productId,
          organizationId,
          referenceId: item.Order.id,
          referenceType: StockReferenceType.sale,
          areaId: item.areaOriginId,
          //observacoes: `Restauração de item: ${reason}`
        }
      });

      console.log(`✅ Item restaurado com sucesso`);
      return {
        restoredItem,
        orderId: item.Order.id
      };

    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  // Método auxiliar para remover estoque (para restauração)
  private async removeStockFromInventory(
    tx: any,
    product: any,
    quantity: number,
    organizationId: string,
    orderId: string,
    areaOriginId: string | null
  ) {
    console.log(`📤 Retirando ${quantity} unidades de ${product.name} do estoque`);

    // Primeiro tentar da área default
    if (product.defaultArea) {
      const economato = product.economatoes?.find(
        (e: any) => e.areaId === product.defaultArea?.id
      );

      if (economato && economato.quantity >= quantity) {
        // Tem suficiente na área default
        await tx.economato.update({
          where: { id: economato.id },
          data: {
            quantity: { decrement: quantity }
          }
        });
        return;
      }
    }

    // Se não tem na área default ou não é suficiente, usar stock geral
    const stock = product.Stock?.[0];
    if (stock && stock.totalQuantity >= quantity) {
      await tx.stock.update({
        where: { id: stock.id },
        data: {
          totalQuantity: { decrement: quantity }
        }
      });
    } else {
      throw new Error(`Estoque insuficiente para restaurar item`);
    }
  }
}