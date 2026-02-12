
import { PrismaClient, StockReferenceType } from '@prisma/client'

const prisma = new PrismaClient()

export class OrderManagementService {

  /* ======================================================
      RESTAURAR STOCK (INVERSO DO applyStockDeduction)
  ====================================================== */
  private async applyStockRestoration(
    tx: any, // Usando any para aceitar tx do prisma.$transaction
    productId: string,
    quantity: number,
    organizationId: string,
    referenceId: string
  ) {
    let remainingToRestore = quantity;

    console.log(`🔄 Iniciando restauração de ${quantity} unidades do produto ${productId} para pedido ${referenceId}`);

    // 1. Buscar movimentos de SAÍDA deste pedido para este produto, ordenados do mais recente
    // Isso ajuda a desfazer exatamente as últimas ações
    const movements = await tx.stockHistory.findMany({
      where: {
        productId,
        organizationId,
        referenceId,
        referenceType: 'sale',
        type: { in: ['saída', 'transferencia_area'] }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`   📄 Encontrados ${movements.length} movimentos de saída no histórico`);

    for (const movement of movements) {
      if (remainingToRestore <= 0) break;

      // Quanto podemos restaurar deste movimento específico?
      // O movimento tem uma quantidade X. Não podemos restaurar mais que X deste movimento.
      // Também não precisamos restaurar mais que o 'remainingToRestore'.
      const restoreFromThisMovement = Math.min(remainingToRestore, movement.quantity);

      console.log(`   🔙 Restaurando ${restoreFromThisMovement} (de ${movement.quantity}) do movimento ${movement.id}`);

      // Onde restaurar? Depende de onde saiu (areaId, loteId ou stock geral)

      // A. Restaurar para LOTE (se saiu de um lote específico)
      if (movement.loteId) {
        await tx.lote.update({
          where: { id: movement.loteId },
          data: {
            quantity: { increment: restoreFromThisMovement },
            isActive: true // Reativar lote se estava zerado
          }
        });
        console.log(`     ✅ Devolvido ao lote ${movement.loteId}`);
      }

      // B. Restaurar para ÁREA (Economato) (se saiu de uma área específica)
      else if (movement.areaId) {
        // Verificar se já existe registro no economato para esta área/produto
        const economato = await tx.economato.findFirst({
          where: {
            areaId: movement.areaId,
            productId: productId,
            organizationId
          }
        });

        if (economato) {
          await tx.economato.update({
            where: { id: economato.id },
            data: { quantity: { increment: restoreFromThisMovement } }
          });
        } else {
          // Se não existir (estranho, mas possível se foi deletado), recriar
          await tx.economato.create({
            data: {
              areaId: movement.areaId,
              productId: productId,
              quantity: restoreFromThisMovement,
              organizationId
            }
          });
        }
        console.log(`     ✅ Devolvido à área ${movement.areaId}`);
      }

      // C. Restaurar para STOCK GERAL (se não tinha área nem lote, ou sempre junto com área dependendo da lógica)
      // Nota: A lógica de stock pode ser: Stock Geral é a SOMA de tudo OU um depósito central.
      // No seu sistema parece que Stock Geral trackea o TOTAL. Então SEMPRE incrementamos o Stock Geral?
      // Analisando o OderSendService:
      // se saiu de Stock Geral -> decrementou Stock Geral
      // se saiu de Área -> decrementou Economato (E NÃO Stock Geral no código analisado, mas logicamente deveria? 
      // O código analisado decrementava Stock Geral SE 'remaining > 0' no passo 2.
      // Se saiu de Área, decrementou APENAS Economato? Não, o código do OderSendService não decrementava Stock Geral
      // quando tirava da área? Vamos verificar...
      // O seu código original decrementava Stock Geral no passo 2 APENAS se não tivesse área ou sobrasse.
      // E TAMBÉM decrementava Stock Geral?
      // Re-lendo OderSendService:
      // "2. O restante desconta do stock geral" -> só desconta do geral o que não saiu da área.
      //
      // PORTANTO: Se o movimento tem areaId, ele saiu da área. Se não tem areaId (null), saiu do stock geral.
      // DEVE-SE devolver para onde saiu.

      if (!movement.areaId) {
        // Saiu do Stock Geral
        await tx.stock.updateMany({
          where: { productId, organizationId },
          data: { totalQuantity: { increment: restoreFromThisMovement } }
        });
        console.log(`     ✅ Devolvido ao stock geral`);
      } else {
        // Se saiu da área, é possível que precisemos atualizar o TOTAL também?
        // Depende da sua regra de negócio. Se Stock Total = Soma das Áreas + Depósito, então sim.
        // Se Stock Total = Só Depósito Central, então não.
        // Pelo schema: Stock.totalQuantity parece ser global.
        // Vou assumir que devemos devolver ao Stock Geral TAMBÉM se o sistema considera Stock Geral como "Soma de Tudo"
        // MAS, para ser seguro e reverter EXATAMENTE o que foi feito:
        // Se o movimento de saída não tocou no stock geral (type transferencia_area ou areaId presente),
        // então a reversão não deve tocar no stock geral se ele for independente.
        //
        // Porém, normalmente Stock Total reflete tudo. 
        // Vamos olhar o OderSendServices novamente... não, ele não decrementava Stock Total quando tirava da área.
        // Ele fazia update no Economato.
        // Então está correto: Só devolve ao Stock Geral se areaId for null.
      }

      // 2. Registrar histórico de ENTRADA (Estorno)
      await tx.stockHistory.create({
        data: {
          type: 'entrada', // Estorno
          price: movement.price,
          quantity: restoreFromThisMovement,
          productId,
          organizationId,
          referenceId, // Mantém o ID do pedido para rastreabilidade
          referenceType: 'sale', // Marcamos como venda para saber que é referente a isso, ou poderíamos criar um tipo 'estorno'
          loteId: movement.loteId,
          areaId: movement.areaId
        }
      });

      remainingToRestore -= restoreFromThisMovement;
    }

    // Se ainda sobrou quantidade para restaurar mas acabaram os movimentos (inconsistência?),
    // devolvemos para o Stock Geral por segurança?? Ou ignoramos?
    // Melhor logar o aviso e devolver para Stock Geral para não perder mercadoria.
    if (remainingToRestore > 0) {
      console.warn(`⚠️ SOBRA DE ESTORNO: ${remainingToRestore} unidades não encontradas no histórico de saída.`);

      await tx.stock.updateMany({
        where: { productId, organizationId },
        data: { totalQuantity: { increment: remainingToRestore } }
      });
      console.log(`     ⚠️ Devolvido sobra ao stock geral`);
    }
  }

  /* ======================================================
      CANCELAR ITEM (SOFT DELETE)
      Regra: Só pode cancelar se NÃO estiver preparado.
      Ação: Marca como cancelado e estorna stock.
  ====================================================== */
  async deleteOrderItem(itemId: string) {
    return prisma.$transaction(async (tx) => {
      console.log(`🚫 Tentando cancelar item ${itemId}...`);

      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: {
          Product: {
            include: {
              recipeItems: {
                include: { ingredient: true }
              }
            }
          }
        }
      });

      if (!item) throw new Error("Item não encontrado");
      if (item.canceled) throw new Error("Item já está cancelado");

      // 1. Verificar se está preparado
      if (item.prepared || item.status === 'pronto' || item.status === 'em_preparacao') {
        throw new Error("Item já preparado ou em preparação. Não pode ser cancelado via gestão simples.");
      }

      const quantity = item.amount;

      // 2. Restaurar Stock
      if (item.Product.isDerived && item.Product.recipeItems.length > 0) {
        console.log(`   🍽️ É um prato derivado. Restaurando ingredientes...`);
        for (const recipe of item.Product.recipeItems) {
          if (recipe.impactaPreco) {
            const ingredientQty = recipe.quantity * quantity;
            await this.applyStockRestoration(
              tx,
              recipe.ingredientId,
              ingredientQty,
              item.organizationId,
              item.orderId
            );
          }
        }
      } else {
        console.log(`   📦 É um produto direto. Restaurando...`);
        await this.applyStockRestoration(
          tx,
          item.productId,
          quantity,
          item.organizationId,
          item.orderId
        );
      }

      // 3. Marcar como cancelado (Soft Delete)
      await tx.item.update({
        where: { id: itemId },
        data: {
          canceled: true,
          status: "cancelado",
          canceledAt: new Date()
        }
      });

      console.log(`✅ Item cancelado com sucesso.`);
      return { success: true, organizationId: item.organizationId };
    });
  }

  /* ======================================================
      ATUALIZAR QUANTIDADE (UPDATE)
  ====================================================== */
  async updateItemQuantity(itemId: string, newQuantity: number) {
    return prisma.$transaction(async (tx) => {
      console.log(`✏️ Atualizando quantidade do item ${itemId} para ${newQuantity}...`);

      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: {
          Product: {
            include: {
              recipeItems: {
                include: { ingredient: true }
              }
            }
          }
        }
      });

      if (!item) throw new Error("Item não encontrado");
      if (item.canceled) throw new Error("Item cancelado não pode ser alterado");

      // Verificar se item já foi preparado antes de alterar quantidade?
      // Se aumentar quantidade, precisaria de stock check. Bloqueamos aumento.
      // Se diminuir quantidade, estornamos. Se já foi preparado, estornamos o que "sobrou"?
      // O usuário disse "mesmo sendo ja preparado... ja se gastou o stok".
      // Se diminuirmos a quantidade de um item preparado, teoricamente estamos dizendo que "não gastou tudo isso".
      // Mas se já foi feito, gastou.
      // Por segurança, vou BLOQUEAR alteração de quantidade se estiver preparado, igual ao cancelamento.
      if (item.prepared || item.status === 'pronto' || item.status === 'em_preparacao') {
        throw new Error("Item já preparado. Quantidade não pode ser alterada.");
      }

      const currentQuantity = item.amount;
      const diff = newQuantity - currentQuantity;

      if (diff === 0) return { success: true, message: "Quantidade inalterada", organizationId: item.organizationId };

      if (diff > 0) {
        throw new Error("Para aumentar a quantidade, adicione o item novamente ao pedido.");
      }

      else if (diff < 0) {
        const restoreQty = Math.abs(diff);
        console.log(`   📉 Diminuindo quantidade em ${restoreQty}. Restaurando stock...`);

        if (item.Product.isDerived && item.Product.recipeItems.length > 0) {
          for (const recipe of item.Product.recipeItems) {
            if (recipe.impactaPreco) {
              const ingredientQty = recipe.quantity * restoreQty;
              await this.applyStockRestoration(
                tx,
                recipe.ingredientId,
                ingredientQty,
                item.organizationId,
                item.orderId
              );
            }
          }
        } else {
          await this.applyStockRestoration(
            tx,
            item.productId,
            restoreQty,
            item.organizationId,
            item.orderId
          );
        }
      }

      // Atualizar item
      await tx.item.update({
        where: { id: itemId },
        data: { amount: newQuantity }
      });

      console.log(`✅ Quantidade atualizada.`);
      return { success: true, organizationId: item.organizationId };
    });
  }

  /* ======================================================
      CANCELAR PEDIDO COMPLETO (SOFT DELETE)
      Regra: Só pode cancelar se NENHUM item estiver preparado.
      Ação: Cancela todos os itens e estorna.
  ====================================================== */
  async deleteCompleteOrder(orderId: string) {
    return prisma.$transaction(async (tx) => {
      console.log(`💥 Tentando cancelar pedido completo ${orderId}...`);

      const items = await tx.item.findMany({
        where: { orderId },
        include: {
          Product: {
            include: {
              recipeItems: {
                include: { ingredient: true }
              }
            }
          }
        }
      });

      // Se não tiver itens, pegar OrganizationId de algum lugar?
      // Buscar pedido
      const order = await tx.order.findUnique({ where: { id: orderId } });
      const organizationId = order?.organizationId || items[0]?.organizationId;

      const preparedItems = items.filter(item => item.prepared === true || item.status === 'pronto' || item.status === 'em_preparacao');

      if (preparedItems.length > 0) {
        throw new Error(`Não é possível cancelar o pedido pois contém ${preparedItems.length} itens já preparados ou em preparação. Use a opção de 'Limpar não preparados' ou cancele os itens individualmente.`);
      }

      console.log(`   ✅ Nenhum item preparado. Prosseguindo com cancelamento completo.`);

      for (const item of items) {
        if (item.canceled) continue;

        const quantity = item.amount;

        if (item.Product.isDerived && item.Product.recipeItems.length > 0) {
          for (const recipe of item.Product.recipeItems) {
            if (recipe.impactaPreco) {
              await this.applyStockRestoration(
                tx,
                recipe.ingredientId,
                recipe.quantity * quantity,
                item.organizationId,
                item.orderId
              );
            }
          }
        } else {
          await this.applyStockRestoration(
            tx,
            item.productId,
            quantity,
            item.organizationId,
            item.orderId
          );
        }
      }

      // Soft Delete: Cancelar todos os itens
      await tx.item.updateMany({
        where: { orderId },
        data: {
          canceled: true,
          status: "cancelado",
          canceledAt: new Date()
        }
      });

      await tx.orderSession.deleteMany({ where: { orderId } });
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: false,
          draft: true,
          name: `CANCELADO - ${new Date().toISOString()}`
        }
      });

      console.log(`✅ Pedido ${orderId} cancelado com sucesso.`);
      return { success: true, message: "Pedido cancelado com sucesso.", organizationId };
    });
  }

  /* ======================================================
      LIMPAR ITENS NÃO PREPARADOS (SOFT DELETE)
  ====================================================== */
  async cleanUnpreparedItems(orderId: string) {
    return prisma.$transaction(async (tx) => {
      console.log(`🧹 Cancelando itens não preparados do pedido ${orderId}...`);

      const items = await tx.item.findMany({
        where: { orderId },
        include: {
          Product: {
            include: {
              recipeItems: {
                include: { ingredient: true }
              }
            }
          }
        }
      });

      // Se tiver itens, pegar do primeiro. Se não, buscar order. 
      let organizationId = items[0]?.organizationId;
      if (!organizationId) {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        organizationId = order?.organizationId;
      }

      const itemsToCancel = items.filter(item => !item.prepared && item.status !== 'pronto' && item.status !== 'em_preparacao' && !item.canceled);

      if (itemsToCancel.length === 0) {
        return { success: true, message: "Nenhum item não-preparado para cancelar.", count: 0, organizationId };
      }

      console.log(`   Items a cancelar: ${itemsToCancel.length}`);

      for (const item of itemsToCancel) {
        const quantity = item.amount;

        if (item.Product.isDerived && item.Product.recipeItems.length > 0) {
          for (const recipe of item.Product.recipeItems) {
            if (recipe.impactaPreco) {
              await this.applyStockRestoration(
                tx,
                recipe.ingredientId,
                recipe.quantity * quantity,
                item.organizationId,
                item.orderId
              );
            }
          }
        } else {
          await this.applyStockRestoration(
            tx,
            item.productId,
            quantity,
            item.organizationId,
            item.orderId
          );
        }
      }

      // Soft Delete: Marcar como cancelado
      await tx.item.updateMany({
        where: {
          orderId,
          id: { in: itemsToCancel.map(i => i.id) }
        },
        data: {
          canceled: true,
          status: "cancelado",
          canceledAt: new Date()
        }
      });

      console.log(`✅ ${itemsToCancel.length} itens cancelados e estornados.`);

      return {
        success: true,
        message: `${itemsToCancel.length} itens não preparados foram cancelados.`,
        count: itemsToCancel.length,
        organizationId
      };
    });
  }

  // Método auxiliar para consultar histórico
  async getOrderStockHistory(orderId: string) {
    const history = await prisma.stockHistory.findMany({
      where: { referenceId: orderId },
      include: {
        product: true,
        area: true,
        Lote: true
      },
      orderBy: { created_at: 'desc' }
    });
    return history;
  }

  // Método para restaurar item cancelado (Opcional)
  async restoreCanceledItem(itemId: string) {
    throw new Error("Funcionalidade de restaurar item cancelado não implementada.");
  }
}
