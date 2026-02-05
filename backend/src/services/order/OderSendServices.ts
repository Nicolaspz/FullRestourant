import prismaClient from "../../prisma";

interface StockSource {
  areaId: string;
  areaName: string;
  quantity: number;
  source: 'area' | 'stock_geral';
  economatoId?: string;
}

interface CreateOrderRequest {
  tableNumber: number;
  organizationId: string;
  items: Array<{
    productId: string;
    amount: number;
    preferredAreaId?: string;
  }>;
  customerName: string;
  clientToken?: string; // Opcional para garçons
  qrToken?: string;     // Opcional para clientes via QR
  tipoSessao?: 'cliente' | 'garcom';
}

interface VerifyTokenRequest {
  tableNumber: number;
  organizationId: string;
  clientToken: string;
}

class OrderServices {
 async createCompleteOrderWithStockUpdate({ 
    tableNumber,
    organizationId,
    items,
    customerName,
    clientToken,     // Para garçons
    qrToken,         // Para clientes QR
    tipoSessao = 'cliente' // Padrão cliente
  }: CreateOrderRequest) {
  
  return await prismaClient.$transaction(async (prisma) => {
    console.log('🔄 Iniciando pedido com verificação de área default...');
    
    // 1. Verificar se todos os produtos existem COM defaultArea
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
                Stock: true,
                defaultArea: true, // Incluir defaultArea do ingrediente
                economatoes: {
                  where: { organizationId },
                  include: { area: true }
                }
              }
            }
          }
        },
        Stock: true,
        defaultArea: true, // INCLUIR defaultArea do produto
        economatoes: {
          where: { organizationId },
          include: { area: true }
        }
      }
    });

    console.log(`📦 Produtos carregados: ${products.length}`);

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

    // 3. VERIFICAÇÃO DE ESTOQUE COM ÁREA DEFAULT
    console.log('🔍 Verificando estoque por área default...');
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;
      const requiredAmount = item.amount;
      
      console.log(`\n📊 Produto: ${product.name}`);
      console.log(`   Quantidade necessária: ${requiredAmount}`);
      console.log(`   Área default: ${product.defaultArea?.nome || 'Nenhuma'}`);
      
      // Se é produto derivado (prato), verificar estoque dos ingredientes
      if (product.isDerived && product.recipeItems.length > 0) {
        console.log(`   ⚙️ Produto derivado - verificando ingredientes...`);
        
        for (const recipeItem of product.recipeItems) {
          if (recipeItem.impactaPreco) {
            const ingredient = recipeItem.ingredient;
            const requiredIngredientAmount = recipeItem.quantity * requiredAmount;
            
            await this.verifyAndAllocateStock(
              prisma,
              ingredient,
              requiredIngredientAmount,
              organizationId,
              `${product.name} (ingrediente: ${ingredient.name})`
            );
          }
        }
      } else {
        // Produto direto - verificar estoque do produto
        console.log(`   📦 Produto direto - verificando estoque...`);
        await this.verifyAndAllocateStock(
          prisma,
          product,
          requiredAmount,
          organizationId,
          product.name
        );
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
      console.log(`✅ Nova sessão criada`);
    } else {
      // Sessão existente - verificar se é o mesmo cliente
      if (session.clientToken !== clientToken) {
        throw {
          name: 'SessionConflictError',
          message: `Mesa ${tableNumber} já está ocupada por outro cliente`,
          existingClientToken: session.clientToken,
          sessionId: session.id,
          mesaId: mesa.id,
          code: 'SESSION_CONFLICT'
        };
      }
      console.log(`✅ Usando sessão existente`);
    }

    // 5. Criar pedido principal
    const order = await prisma.order.create({
      data: {
        name: customerName || `Pedido Mesa ${tableNumber}`,
        organizationId,
        sessionId: session.id,
        draft: false,
        status: false
      }
    });
    console.log(`✅ Pedido criado: ${order.id}`);

    // 6. Processar cada item do pedido e ATUALIZAR ESTOQUE DE VERDADE
    console.log('\n📉 Aplicando deduções de estoque...');
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;
      const requiredAmount = item.amount;
      
      // Criar item do pedido COM área de origem
      const orderItem = await prisma.item.create({
        data: {
          amount: requiredAmount,
          orderId: order.id,
          productId: product.id,
          organizationId,
          prepared: false,
          areaOriginId: product.defaultArea?.id || null
        }
      });
      console.log(`✅ Item criado: ${product.name} x${requiredAmount}`);

      // Atualizar estoque conforme o tipo de produto
      if (product.isDerived && product.recipeItems.length > 0) {
        // Produto derivado (prato) - consumir ingredientes
        for (const recipeItem of product.recipeItems) {
          if (recipeItem.impactaPreco) {
            const ingredient = recipeItem.ingredient;
            const quantityToDeduct = recipeItem.quantity * requiredAmount;
            
            console.log(`   🔪 Descontando ingrediente: ${ingredient.name} (-${quantityToDeduct})`);
            
            // Aplicar dedução real do estoque
            await this.applyStockDeduction(
              prisma,
              ingredient,
              quantityToDeduct,
              organizationId,
              order.id
            );
          }
        }
      } else {
        // Produto direto - consumir o próprio produto
        console.log(`   📦 Descontando produto: ${product.name} (-${requiredAmount})`);
        
        await this.applyStockDeduction(
          prisma,
          product,
          requiredAmount,
          organizationId,
          order.id
        );
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
      console.log(`✅ Mesa ${tableNumber} marcada como ocupada`);
    }

    console.log('\n🎉 Pedido criado com sucesso!');
    
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

// NOVO MÉTODO: Verificar e alocar estoque considerando área default
private async verifyAndAllocateStock(
  prisma: any,
  product: any,
  requiredAmount: number,
  organizationId: string,
  productName: string
) {
  console.log(`   🔍 Verificando ${productName}...`);
  
  // 1. Primeiro verificar se tem stock geral suficiente
  const generalStock = product.Stock?.[0];
  const generalStockQuantity = generalStock?.totalQuantity || 0;
  
  console.log(`     Stock geral: ${generalStockQuantity} unidades`);
  
  if (generalStockQuantity >= requiredAmount) {
    console.log(`     ✅ Stock geral tem quantidade suficiente`);
    return; // Stock geral tem o suficiente
  }
  
  // 2. Se não tem stock geral suficiente, verificar área default
  if (product.defaultArea) {
    console.log(`     Procurando na área default: ${product.defaultArea.nome}`);
    
    const economato = product.economatoes?.find(
      (e: any) => e.areaId === product.defaultArea.id
    );
    
    const areaStockQuantity = economato?.quantity || 0;
    console.log(`     Estoque na área default: ${areaStockQuantity} unidades`);
    
    // Calcular total disponível (área + stock geral)
    const totalAvailable = areaStockQuantity + generalStockQuantity;
    console.log(`     Total disponível: ${totalAvailable} unidades`);
    
    if (totalAvailable < requiredAmount) {
      throw new Error(
        `Estoque insuficiente para ${productName}. ` +
        `Necessário: ${requiredAmount}, ` +
        `Disponível: ${totalAvailable} ` +
        `(Área ${product.defaultArea.nome}: ${areaStockQuantity}, ` +
        `Stock Geral: ${generalStockQuantity})`
      );
    }
    
    console.log(`     ✅ Quantidade suficiente considerando área default + stock geral`);
    return; // Tem quantidade suficiente combinando ambos
  }
  
  // 3. Se não tem área default definida, só verificar stock geral
  console.log(`     ℹ️ Produto não tem área default definida, usando apenas stock geral`);
  
  if (generalStockQuantity < requiredAmount) {
    throw new Error(
      `Estoque insuficiente para ${productName}. ` +
      `Necessário: ${requiredAmount}, ` +
      `Disponível no stock geral: ${generalStockQuantity}`
    );
  }
}

// NOVO MÉTODO: Aplicar dedução de estoque considerando área default
private async applyStockDeduction(
  prisma: any,
  product: any,
  quantityToDeduct: number,
  organizationId: string,
  orderId: string
) {
  let remaining = quantityToDeduct;
  const areaDeductions: { areaId: string; quantity: number }[] = [];
  
  console.log(`     🧮 Aplicando dedução de ${quantityToDeduct} unidades...`);
  
  // 1. Primeiro tentar usar da área default (se existir)
  if (product.defaultArea) {
    const economato = product.economatoes?.find(
      (e: any) => e.areaId === product.defaultArea.id
    );
    
    if (economato && economato.quantity > 0) {
      const deductFromArea = Math.min(economato.quantity, remaining);
      
      if (deductFromArea > 0) {
        // Atualizar economato (estoque da área)
        await prisma.economato.update({
          where: { id: economato.id },
          data: {
            quantity: { decrement: deductFromArea }
          }
        });
        
        areaDeductions.push({
          areaId: product.defaultArea.id,
          quantity: deductFromArea
        });
        
        remaining -= deductFromArea;
        console.log(`       ✅ ${deductFromArea} unidades descontadas da área ${product.defaultArea.nome}`);
      }
    }
  }
  
  // 2. O restante desconta do stock geral
  if (remaining > 0) {
    const generalStock = product.Stock?.[0];
    
    if (generalStock) {
      // Atualizar stock geral
      await prisma.stock.update({
        where: { id: generalStock.id },
        data: {
          totalQuantity: { decrement: remaining }
        }
      });
      
      console.log(`       ✅ ${remaining} unidades descontadas do stock geral`);
    }
  }
  
  // 3. Registrar no histórico de estoque
  const totalDeducted = quantityToDeduct;
  
  await prisma.stockHistory.create({
    data: {
      type: 'saída',
      price: 0,
      quantity: totalDeducted,
      productId: product.id,
      organizationId,
      referenceId: orderId,
      referenceType: 'sale',
      areaId: product.defaultArea?.id || null
    }
  });
  
  // Registrar também deduções por área no histórico
  for (const deduction of areaDeductions) {
    await prisma.stockHistory.create({
      data: {
        type: 'transferencia_area',
        price: 0,
        quantity: deduction.quantity,
        productId: product.id,
        organizationId,
        referenceId: orderId,
        referenceType: 'sale',
        areaId: deduction.areaId
      }
    });
  }
  
  console.log(`       📝 Histórico registrado`);
}

  private async checkAndAllocateIngredientStock(
    ingredient: any,
    requiredQuantity: number,
    preferredAreaId: string | undefined,
    stockSources: Map<string, StockSource[]>,
    areaStockDeductions: Map<string, Map<string, number>>,
    generalStockDeductions: Map<string, number>,
    organizationId: string
  ) {
    let remaining = requiredQuantity;
    const sources: StockSource[] = [];

    console.log(`🔍 Verificando estoque para ${ingredient.name}: ${requiredQuantity} unidades`);

    // Buscar estoque atualizado do ingrediente
    const updatedIngredient = await prismaClient.product.findUnique({
      where: { id: ingredient.id },
      include: {
        Stock: {
          where: { organizationId }
        },
        economatoes: {
          include: {
            area: true
          },
          where: { organizationId }
        }
      }
    });

    if (!updatedIngredient) {
      throw new Error(`Ingrediente ${ingredient.name} não encontrado`);
    }

    // Primeiro tentar na área preferida (se especificada)
    if (preferredAreaId) {
      const economato = updatedIngredient.economatoes?.find(
        e => e.areaId === preferredAreaId
      );
      
      if (economato && economato.quantity > 0) {
        const available = Math.min(economato.quantity, remaining);
        if (available > 0) {
          console.log(`✅ Encontrado ${available} unidades na área ${economato.area.nome}`);
          
          sources.push({
            areaId: preferredAreaId,
            areaName: economato.area.nome,
            quantity: available,
            source: 'area',
            economatoId: economato.id
          });
          
          // Registrar dedução
          if (!areaStockDeductions.has(preferredAreaId)) {
            areaStockDeductions.set(preferredAreaId, new Map());
          }
          const current = areaStockDeductions.get(preferredAreaId)!.get(ingredient.id) || 0;
          areaStockDeductions.get(preferredAreaId)!.set(ingredient.id, current + available);
          
          remaining -= available;
          console.log(`📉 Restante: ${remaining}`);
        }
      }
    }

    // Se ainda precisa, tentar outras áreas onde o ingrediente existe
    if (remaining > 0) {
      const otherAreas = updatedIngredient.economatoes?.filter(
        e => e.areaId !== preferredAreaId
      ).sort((a, b) => b.quantity - a.quantity);
      
      for (const economato of otherAreas || []) {
        if (remaining <= 0) break;
        
        const available = Math.min(economato.quantity, remaining);
        if (available > 0) {
          console.log(`✅ Encontrado ${available} unidades na área ${economato.area.nome}`);
          
          sources.push({
            areaId: economato.areaId,
            areaName: economato.area.nome,
            quantity: available,
            source: 'area',
            economatoId: economato.id
          });
          
          // Registrar dedução
          if (!areaStockDeductions.has(economato.areaId)) {
            areaStockDeductions.set(economato.areaId, new Map());
          }
          const current = areaStockDeductions.get(economato.areaId)!.get(ingredient.id) || 0;
          areaStockDeductions.get(economato.areaId)!.set(ingredient.id, current + available);
          
          remaining -= available;
          console.log(`📉 Restante: ${remaining}`);
        }
      }
    }

    // Se ainda precisa, usar estoque geral
    if (remaining > 0) {
      const generalStock = updatedIngredient.Stock?.[0];
      const availableGeneralStock = generalStock?.totalQuantity || 0;
      
      if (availableGeneralStock < remaining) {
        throw new Error(
          `Estoque insuficiente para ${ingredient.name}. ` +
          `Necessário: ${requiredQuantity}, ` +
          `Disponível nas áreas: ${requiredQuantity - remaining}, ` +
          `Disponível no stock geral: ${availableGeneralStock}`
        );
      }
      
      console.log(`✅ Usando ${remaining} unidades do stock geral`);
      
      sources.push({
        areaId: 'stock_geral',
        areaName: 'Stock Geral',
        quantity: remaining,
        source: 'stock_geral'
      });
      
      // Registrar dedução no estoque geral
      const currentGeneral = generalStockDeductions.get(ingredient.id) || 0;
      generalStockDeductions.set(ingredient.id, currentGeneral + remaining);
    }

    stockSources.set(ingredient.id, sources);
  }

  private async checkAndAllocateProductStock(
    product: any,
    requiredQuantity: number,
    preferredAreaId: string | undefined,
    stockSources: Map<string, StockSource[]>,
    areaStockDeductions: Map<string, Map<string, number>>,
    productStockDeductions: Map<string, number>,
    organizationId: string
  ) {
    let remaining = requiredQuantity;
    const sources: StockSource[] = [];

    console.log(`🔍 Verificando estoque para ${product.name}: ${requiredQuantity} unidades`);

    // Buscar produto atualizado com estoque
    const updatedProduct = await prismaClient.product.findUnique({
      where: { id: product.id },
      include: {
        Stock: {
          where: { organizationId }
        },
        economatoes: {
          include: {
            area: true
          },
          where: { organizationId }
        },
        productAreaMappings: {
          include: {
            area: true
          },
          where: { organizationId }
        }
      }
    });

    if (!updatedProduct) {
      throw new Error(`Produto ${product.name} não encontrado`);
    }

    // Primeiro verificar se é um produto que tem mapeamento por área
    const hasAreaMappings = updatedProduct.productAreaMappings?.length > 0;
    
    if (hasAreaMappings) {
      // Determinar área padrão
      
      const defaultAreaId = preferredAreaId || updatedProduct.defaultAreaId;
      console.log("areaDefault", defaultAreaId)
      // Se temos uma área padrão, tentar usar dela primeiro
      if (defaultAreaId) {
        const economato = updatedProduct.economatoes?.find(
          e => e.areaId === defaultAreaId
        );
        
        if (economato && economato.quantity > 0) {
          const available = Math.min(economato.quantity, remaining);
          if (available > 0) {
            console.log(`✅ Encontrado ${available} unidades na área padrão ${economato.area.nome}`);
            
            sources.push({
              areaId: defaultAreaId,
              areaName: economato.area.nome,
              quantity: available,
              source: 'area',
              economatoId: economato.id
            });
            
            // Registrar dedução
            if (!areaStockDeductions.has(defaultAreaId)) {
              areaStockDeductions.set(defaultAreaId, new Map());
            }
            const current = areaStockDeductions.get(defaultAreaId)!.get(product.id) || 0;
            areaStockDeductions.get(defaultAreaId)!.set(product.id, current + available);
            
            remaining -= available;
            console.log(`📉 Restante: ${remaining}`);
          }
        }
      }

      // Tentar outras áreas com mapeamento
      if (remaining > 0) {
        const mappedAreas = updatedProduct.productAreaMappings
          .map(mapping => mapping.areaId)
          .filter(areaId => areaId !== defaultAreaId);
        
        const otherEconomatoes = updatedProduct.economatoes?.filter(
          e => mappedAreas.includes(e.areaId)
        ).sort((a, b) => b.quantity - a.quantity);
        
        for (const economato of otherEconomatoes || []) {
          if (remaining <= 0) break;
          
          const available = Math.min(economato.quantity, remaining);
          if (available > 0) {
            console.log(`✅ Encontrado ${available} unidades na área ${economato.area.nome}`);
            
            sources.push({
              areaId: economato.areaId,
              areaName: economato.area.nome,
              quantity: available,
              source: 'area',
              economatoId: economato.id
            });
            
            // Registrar dedução
            if (!areaStockDeductions.has(economato.areaId)) {
              areaStockDeductions.set(economato.areaId, new Map());
            }
            const current = areaStockDeductions.get(economato.areaId)!.get(product.id) || 0;
            areaStockDeductions.get(economato.areaId)!.set(product.id, current + available);
            
            remaining -= available;
            console.log(`📉 Restante: ${remaining}`);
          }
        }
      }
    }

    // Se ainda precisa, usar estoque geral
    if (remaining > 0) {
      const generalStock = updatedProduct.Stock?.[0];
      const availableGeneralStock = generalStock?.totalQuantity || 0;
      
      if (availableGeneralStock < remaining) {
        throw new Error(
          `Estoque insuficiente para ${product.name}. ` +
          `Necessário: ${requiredQuantity}, ` +
          `Disponível nas áreas: ${requiredQuantity - remaining}, ` +
          `Disponível no stock geral: ${availableGeneralStock}`
        );
      }
      
      console.log(`✅ Usando ${remaining} unidades do stock geral`);
      
      sources.push({
        areaId: 'stock_geral',
        areaName: 'Stock Geral',
        quantity: remaining,
        source: 'stock_geral'
      });
      
      // Registrar dedução no estoque geral
      productStockDeductions.set(product.id, remaining);
    }

    stockSources.set(product.id, sources);
  }

  private async applyAllStockDeductions(
    areaStockDeductions: Map<string, Map<string, number>>,
    generalStockDeductions: Map<string, number>,
    productStockDeductions: Map<string, number>,
    orderId: string,
    organizationId: string,
    prisma: any
  ) {
    console.log('📊 Aplicando deduções de estoque...');
    
    // 1. Aplicar deduções do estoque geral (ingredientes de produtos derivados)
    for (const [productId, quantity] of generalStockDeductions) {
      console.log(`📦 Deduzindo ${quantity} unidades do stock geral para produto ${productId}`);
      
      await prisma.stock.updateMany({
        where: {
          productId,
          organizationId
        },
        data: {
          totalQuantity: { decrement: quantity }
        }
      });

      // Criar histórico
      await prisma.stockHistory.create({
        data: {
          type: 'saída',
          price: 0,
          quantity: quantity,
          productId: productId,
          organizationId,
          referenceId: orderId,
          referenceType: 'sale',
          areaId: null // Stock geral não tem área específica
        }
      });
    }

    // 2. Aplicar deduções do estoque geral (produtos diretos)
    for (const [productId, quantity] of productStockDeductions) {
      console.log(`📦 Deduzindo ${quantity} unidades do stock geral para produto direto ${productId}`);
      
      await prisma.stock.updateMany({
        where: {
          productId,
          organizationId
        },
        data: {
          totalQuantity: { decrement: quantity }
        }
      });

      // Criar histórico
      await prisma.stockHistory.create({
        data: {
          type: 'saída',
          price: 0,
          quantity: quantity,
          productId: productId,
          organizationId,
          referenceId: orderId,
          referenceType: 'sale',
          areaId: null
        }
      });
    }

    // 3. Aplicar deduções do economato (estoque por área)
    for (const [areaId, productDeductions] of areaStockDeductions) {
      console.log(`🏠 Processando deduções para área ${areaId}`);
      
      for (const [productId, quantity] of productDeductions) {
        console.log(`  📦 Deduzindo ${quantity} unidades do produto ${productId}`);
        
        // Atualizar economato
        await prisma.economato.updateMany({
          where: {
            areaId,
            productId,
            organizationId
          },
          data: {
            quantity: { decrement: quantity }
          }
        });

        // Registrar no histórico
        await prisma.stockHistory.create({
          data: {
            type: 'saída',
            price: 0,
            quantity: quantity,
            productId: productId,
            organizationId,
            referenceId: orderId,
            referenceType: 'transferencia_area',
            areaId: areaId
          }
        });
      }
    }

    console.log('✅ Todas as deduções de estoque aplicadas com sucesso');
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
      // Verificar se a mesa existe
      const mesa = await prisma.mesa.findFirst({
        where: { 
          number: tableNumber, 
          organizationId 
        }
      });

      if (!mesa) {
        throw new Error(`Mesa ${tableNumber} não encontrada na organização`);
      }

      // Verificar ou criar sessão
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