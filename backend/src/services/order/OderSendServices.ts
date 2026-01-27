import prismaClient from "../../prisma";

interface CreateOrderRequest {
  tableNumber: number;
  organizationId: string;
  items: Array<{
    productId: string;
    amount: number;
  }>;
  customerName?: string;
  clientToken: string;
}

interface VerifyTokenRequest {
  tableNumber: number;
  organizationId: string;
  clientToken: string;
}

class OrderServices {
async createCompleteOrderWithStockUpdate({ tableNumber,organizationId,items,customerName,clientToken}: CreateOrderRequest)
 {
      // Validação básica
      if (!tableNumber || isNaN(tableNumber)) {
        throw new Error("Número da mesa inválido");
      }
      
      if (!organizationId) {
        throw new Error("Organization ID é obrigatório");
      }
      
      if (!items || items.length === 0) {
        throw new Error("Nenhum item no pedido");
      }
      
      if (!clientToken) {
        throw new Error("Token do cliente é obrigatório");
      }
    
      return await prismaClient.$transaction(async (prisma) => {
        // 1. Verificar se todos os produtos existem
        const products = await prisma.product.findMany({
          where: {
            id: { in: items.map(item => item.productId) },
            organizationId
          },
          include: {
            recipeItems: {
              include: {
                ingredient: {
                  include: {
                    Stock: true
                  }
                }
              }
            },
            Stock: true
          }
        });
    
        if (products.length !== items.length) {
          const missingIds = items.filter(item => 
            !products.some(p => p.id === item.productId)
          ).map(item => item.productId);
          throw new Error(`Produtos não encontrados: ${missingIds.join(', ')}`);
        }
    
        // 2. Verificar se a mesa existe
        const mesa = await prisma.mesa.findFirst({
          where: { 
            number: tableNumber, 
            organizationId 
          }
        });
    
        if (!mesa) {
          throw new Error(`Mesa ${tableNumber} não encontrada na organização`);
        }
    
        // 3. Verificar estoque disponível
        for (const item of items) {
          const product = products.find(p => p.id === item.productId)!;
          
          // Se é produto derivado (prato), verificar estoque dos ingredientes
          if (product.isDerived && product.recipeItems.length > 0) {
            for (const recipeItem of product.recipeItems) {
              if (recipeItem.impactaPreco) {
                const stockItem = recipeItem.ingredient.Stock?.[0];
                if (!stockItem || stockItem.totalQuantity < (recipeItem.quantity * item.amount)) {
                  throw new Error(
                    `Estoque insuficiente para ${recipeItem.ingredient.name}. ` +
                    `Necessário: ${recipeItem.quantity * item.amount}, ` +
                    `Disponível: ${stockItem?.totalQuantity || 0}`
                  );
                }
              }
            }
          } else {
            // Se é produto direto, verificar estoque do produto
            const stockItem = product.Stock?.[0];
            if (!stockItem || stockItem.totalQuantity < item.amount) {
              throw new Error(
                `Estoque insuficiente para ${product.name}. ` +
                `Necessário: ${item.amount}, ` +
                `Disponível: ${stockItem?.totalQuantity || 0}`
              );
            }
          }
        }
    
        // 4. Verificar ou criar sessão
        let session = await prisma.session.findFirst({
          where: { 
            mesaId: mesa.id, 
            organizationId, 
            status: true 
          }
        });
    
        if (!session) {
          // Criar nova sessão
          session = await prisma.session.create({
            data: {
              mesaId: mesa.id,
              organizationId,
              codigoAbertura: `SESS-${tableNumber}-${Date.now()}`,
              clientToken: clientToken,
              status: true
            }
          });
        } else {
          // Sessão existente - verificar se é o mesmo cliente
          if (session.clientToken !== clientToken) {
            // Em vez de lançar erro genérico, lançar erro específico com o token existente
            throw {
              name: 'SessionConflictError',
              message: `Mesa ${tableNumber} já está ocupada por outro cliente`,
              existingClientToken: session.clientToken,
              sessionId: session.id,
              mesaId: mesa.id,
              code: 'SESSION_CONFLICT'
            };
          }
        }
    
        // 5. Criar pedido principal
        const order = await prisma.order.create({
          data: {
            name: customerName || `Pedido Mesa ${tableNumber}`,
            organizationId,
            sessionId: session.id,
            draft: false,
            status: false // false = pendente de preparação
          }
        });
    
        // 6. Processar cada item do pedido e atualizar estoque
        for (const item of items) {
          const product = products.find(p => p.id === item.productId)!;
          
          // Criar item do pedido
          await prisma.item.create({
            data: {
              amount: item.amount,
              orderId: order.id,
              productId: item.productId,
              organizationId,
              prepared: false
            }
          });
    
          // Atualizar estoque conforme o tipo de produto
          if (product.isDerived && product.recipeItems.length > 0) {
            // Produto derivado (prato) - consumir ingredientes
            for (const recipeItem of product.recipeItems) {
              if (recipeItem.impactaPreco) {
                // Atualizar estoque do ingrediente
                const stockToUpdate = recipeItem.ingredient.Stock?.[0];
                if (stockToUpdate) {
                  const quantityToDeduct = recipeItem.quantity * item.amount;
                  
                  await prisma.stock.update({
                    where: { id: stockToUpdate.id },
                    data: {
                      totalQuantity: {
                        decrement: quantityToDeduct
                      }
                    }
                  });
    
                  // Registrar no histórico de estoque
                  await prisma.stockHistory.create({
                    data: {
                      type: 'saída',
                      price: 0, // Preço será calculado na venda
                      quantity: quantityToDeduct,
                      productId: recipeItem.ingredient.id,
                      organizationId,
                      referenceId: order.id,
                      referenceType: 'sale'
                    }
                  });
                }
              }
            }
          } else {
            // Produto direto - consumir o próprio produto
            const stockToUpdate = product.Stock?.[0];
            if (stockToUpdate) {
              await prisma.stock.update({
                where: { id: stockToUpdate.id },
                data: {
                  totalQuantity: {
                    decrement: item.amount
                  }
                }
              });
    
              // Registrar no histórico de estoque
              await prisma.stockHistory.create({
                data: {
                  type: 'saída',
                  price: 0, // Preço será calculado na venda
                  quantity: item.amount,
                  productId: product.id,
                  organizationId,
                  referenceId: order.id,
                  referenceType: 'sale'
                }
              });
            }
          }
        }
    
        // 7. Criar relação OrderSession
        await prisma.orderSession.create({
          data: {
            orderId: order.id,
            sessionId: session.id,
            organizationId
          }
        });
    
        // 8. Atualizar status da mesa se não estiver já ocupada
        if (mesa.status !== 'ocupada') {
          await prisma.mesa.update({
            where: { id: session.mesaId },
            data: {
              status: 'ocupada' 
            }
          });
        }
    
        return {
          success: true,
          orderId: order.id,
          sessionId: session.id,
          mesaId: mesa.id,
          clientToken: session.clientToken
        };
      }, {
        maxWait: 5000,
        timeout: 10000
      });
    }

    async veryfiToken({
      tableNumber,
      organizationId,
      clientToken
    }: VerifyTokenRequest) {
      // Validação básica
      if (!tableNumber || isNaN(tableNumber)) {
        throw new Error("Número da mesa inválido");
      }
      
      if (!organizationId) {
        throw new Error("Organization ID é obrigatório");
      }
      
      
      
      if (!clientToken) {
        throw new Error("Token do cliente é obrigatório");
      }
    
      return await prismaClient.$transaction(async (prisma) => {
        // 1. Verificar se todos os produtos existem
        
    
        // 2. Verificar se a mesa existe
        const mesa = await prisma.mesa.findFirst({
          where: { 
            number: tableNumber, 
            organizationId 
          }
        });
    
        if (!mesa) {
          throw new Error(`Mesa ${tableNumber} não encontrada na organização`);
        }
    
      // 4. Verificar ou criar sessão
        let session = await prisma.session.findFirst({
          where: { 
            mesaId: mesa.id, 
            organizationId, 
            status: true 
          }
        });
    
        if (!session) {
          // Criar nova sessão
          session = await prisma.session.create({
            data: {
              mesaId: mesa.id,
              organizationId,
              codigoAbertura: `SESS-${tableNumber}-${Date.now()}`,
              clientToken: clientToken,
              status: true
            }
          });
        } else {
          // Sessão existente - verificar se é o mesmo cliente
          if (session.clientToken !== clientToken) {
            // Em vez de lançar erro genérico, lançar erro específico com o token existente
            throw {
              name: 'SessionConflictError',
              message: `Mesa ${tableNumber} já está ocupada por outro cliente`,
              existingClientToken: session.clientToken,
              sessionId: session.id,
              mesaId: mesa.id,
              code: 'SESSION_CONFLICT'
            };
          }
        }
    
        return {
          success: true,
          sessionId: session.id,
          mesaId: mesa.id,
          clientToken: session.clientToken
        };
      }, {
        maxWait: 5000,
        timeout: 10000
      });
    }

  private async checkStockAvailability(
    items: CreateOrderRequest['items'],
    products: any[],
    organizationId: string
  ) {
    const stockErrors: string[] = [];
    
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;
      
      try {
        await this.verifyProductStock(
          product,
          item.amount,
          organizationId
        );
      } catch (error: any) {
        stockErrors.push(error.message);
      }
    }

    if (stockErrors.length > 0) {
      throw new Error(`Problemas de estoque:\n${stockErrors.join('\n')}`);
    }
  }

  private async verifyProductStock(
    product: any,
    requiredAmount: number,
    organizationId: string
  ) {
    // Produto derivado - verificar ingredientes
    if (product.isDerived && product.recipeItems.length > 0) {
      for (const recipeItem of product.recipeItems) {
        const totalRequired = recipeItem.quantity * requiredAmount;
        const stock = await prismaClient.stock.findFirst({
          where: { 
            productId: recipeItem.ingredientId, 
            organizationId 
          }
        });

        if (!stock || stock.totalQuantity < totalRequired) {
          throw new Error(
            `Ingrediente insuficiente: ${recipeItem.ingredient.name} ` +
            `(Necessário: ${totalRequired}, Disponível: ${stock?.totalQuantity || 0})`
          );
        }
      }
    } 
    // Produto simples - verificar estoque direto
    else {
      const stock = await prismaClient.stock.findFirst({
        where: { 
          productId: product.id, 
          organizationId 
        }
      });

      if (!stock || stock.totalQuantity < requiredAmount) {
        throw new Error(
          `${product.name} - Necessário: ${requiredAmount}, Disponível: ${stock?.totalQuantity || 0}`
        );
      }
    }
   
  }

  private async updateStockForProduct(
    prisma: any,
    product: any,
    amount: number,
    organizationId: string,
    orderId: string
  ) {
    // Produto derivado - subtrair ingredientes
    if (product.isDerived && product.recipeItems.length > 0) {
      for (const recipeItem of product.recipeItems) {
        const totalAmount = recipeItem.quantity * amount;
        await this.updateSimpleProductStock(
          prisma,
          recipeItem.ingredientId,
          totalAmount,
          organizationId,
          orderId,
          `${product.name} (${recipeItem.ingredient.name})`
        );
      }
    } 
    // Produto simples - subtrair diretamente
    else {
      await this.updateSimpleProductStock(
        prisma,
        product.id,
        amount,
        organizationId,
        orderId,
        product.name
      );
    }
    // Produto sem controle de estoque - não faz nada
  }

  private async updateSimpleProductStock(
    prisma: any,
    productId: string,
    amount: number,
    organizationId: string,
    orderId: string,
    productName: string
  ) {
    // 1. Encontrar o registro de estoque
    const stock = await prisma.stock.findFirst({
      where: { productId, organizationId }
    });

    if (!stock) {
      throw new Error(`Registro de estoque não encontrado para ${productName}`);
    }

    // 2. Verificar estoque suficiente
    if (stock.totalQuantity < amount) {
      throw new Error(`Estoque insuficiente para ${productName}. Disponível: ${stock.totalQuantity}, Necessário: ${amount}`);
    }

    try {
      // 3. Atualizar estoque total
      await prisma.stock.update({
        where: { id: stock.id },
        data: { totalQuantity: stock.totalQuantity - amount }
      });

      // 4. Processar lotes (FIFO)
      let remaining = amount;
      const activeLotes = await prisma.lote.findMany({
        where: {
          productId,
          organizationId,
          isActive: true,
          quantity: { gt: 0 }
        },
        orderBy: { data_compra: 'asc' }
      });

      for (const lote of activeLotes) {
        if (remaining <= 0) break;

        const subtract = Math.min(remaining, lote.quantity);
        remaining -= subtract;

        await prisma.lote.update({
          where: { id: lote.id },
          data: { 
            quantity: lote.quantity - subtract,
            isActive: (lote.quantity - subtract) > 0
          }
        });

        // Registrar no histórico
        await prisma.stockHistory.create({
          data: {
            type: 'saída',
            quantity: subtract,
            price: lote.preco_compra,
            productId,
            organizationId,
            referenceId: orderId,
            referenceType: 'sale',
            loteId: lote.id
          }
        });
      }

      if (remaining > 0) {
        throw new Error(`Falha ao alocar lotes completos para ${productName}`);
      }

    } catch (error) {
      // Reverter em caso de erro
      if (stock) {
        await prisma.stock.update({
          where: { id: stock.id },
          data: { totalQuantity: stock.totalQuantity }
        });
      }
      throw error;
    }
  }
}

export { OrderServices };