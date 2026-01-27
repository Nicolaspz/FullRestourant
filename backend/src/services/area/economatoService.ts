import prismaClient from "../../prisma";

// ===== ADICIONAR PRODUTO AO ECONOMATO =====
interface AdicionarProdutoParams {
  areaId: string;
  productId: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  organizationId: string;
}

class AdicionarProdutoAreaService {
  async execute({
    areaId,
    productId,
    quantity,
    minQuantity,
    maxQuantity,
    organizationId,
  }: AdicionarProdutoParams) {
    if (!areaId?.trim()) {
      throw new Error("ID da área é obrigatório");
    }

    if (!productId?.trim()) {
      throw new Error("ID do produto é obrigatório");
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new Error("Quantidade deve ser um número positivo");
    }

    // Verificar se área existe
    const area = await prismaClient.area.findFirst({
      where: { id: areaId, organizationId },
    });

    if (!area) {
      throw new Error("Área não encontrada");
    }

    // Verificar se produto existe
    const product = await prismaClient.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    const resultado = await prismaClient.economato.upsert({
      where: {
        areaId_productId_organizationId: {
          areaId: areaId.trim(),
          productId: productId.trim(),
          organizationId,
        },
      },
      update: {
        quantity: { increment: quantity },
        minQuantity,
        maxQuantity,
      },
      create: {
        areaId: areaId.trim(),
        productId: productId.trim(),
        quantity,
        minQuantity,
        maxQuantity,
        organizationId,
      },
    });

    // Registrar no histórico
    await prismaClient.stockHistory.create({
      data: {
        type: "entrada",
        price: 0,
        quantity,
        created_at: new Date(),
        productId,
        organizationId,
        referenceType: "manual",
      },
    });

    return resultado;
  }
}

// ===== LISTAR STOCK DA ÁREA =====
interface ListarStockAreaParams {
  areaId: string;
  organizationId: string;
}

class ListarStockAreaService {
  async execute({ areaId, organizationId }: ListarStockAreaParams) {
    if (!areaId?.trim()) {
      throw new Error("ID da área é obrigatório");
    }

    const stock = await prismaClient.economato.findMany({
      where: { areaId: areaId.trim(), organizationId },
      include: {
        product: {
          include: {
            Category: true,
          },
        },
        area: true,
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    return stock;
  }
}

// ===== TRANSFERIR ENTRE ÁREAS =====
interface TransferirProdutoParams {
  areaOrigemId: string;
  areaDestinoId: string;
  productId: string;
  quantity: number;
  observacoes?: string;
  usuarioId?: string;
  organizationId: string;
}

class TransferirEntreAreasService {
  async execute({
    areaOrigemId,
    areaDestinoId,
    productId,
    quantity,
    observacoes,
    usuarioId,
    organizationId,
  }: TransferirProdutoParams) {
    return prismaClient.$transaction(async (tx) => {
      // Verificar se áreas são diferentes
      if (areaOrigemId === areaDestinoId) {
        throw new Error("Área de origem e destino não podem ser iguais");
      }

      // 1. Verificar stock na área de origem
      const stockOrigem = await tx.economato.findFirst({
        where: {
          areaId: areaOrigemId,
          productId,
          organizationId,
        },
      });

      if (!stockOrigem || stockOrigem.quantity < quantity) {
        throw new Error("Stock insuficiente na área de origem");
      }

      // 2. Remover da área de origem
      await tx.economato.update({
        where: { id: stockOrigem.id },
        data: { quantity: { decrement: quantity } },
      });

      // 3. Adicionar à área de destino
      await tx.economato.upsert({
        where: {
          areaId_productId_organizationId: {
            areaId: areaDestinoId,
            productId,
            organizationId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          areaId: areaDestinoId,
          productId,
          quantity,
          organizationId,
        },
      });

      // 4. Registrar no histórico (saída da origem)
      await tx.stockHistory.create({
        data: {
          type: "saída",
          price: 0,
          quantity,
          created_at: new Date(),
          productId,
          organizationId,
          referenceType: "transferencia_area",
        },
      });

      // 5. Registrar consumo interno
      await tx.consumoInterno.create({
        data: {
          areaId: areaOrigemId,
          productId,
          quantity,
          motivo: `Transferência para ${areaDestinoId}`,
          observacoes,
          criadoPor: usuarioId,
          organizationId,
        },
      });

      return { success: true, message: "Transferência realizada com sucesso" };
    });
  }
}

// ===== AJUSTAR STOCK =====
interface AjustarStockParams {
  areaId: string;
  productId: string;
  novaQuantidade: number;
  motivo: string;
  observacoes?: string;
  usuarioId?: string;
  organizationId: string;
}

class AjustarStockService {
  async execute({
    areaId,
    productId,
    novaQuantidade,
    motivo,
    observacoes,
    usuarioId,
    organizationId,
  }: AjustarStockParams) {
    return prismaClient.$transaction(async (tx) => {
      const economato = await tx.economato.findFirst({
        where: {
          areaId,
          productId,
          organizationId,
        },
      });

      let quantidadeAjuste = novaQuantidade;
      let tipoAjuste = "entrada";

      if (economato) {
        quantidadeAjuste = novaQuantidade - economato.quantity;
        tipoAjuste = quantidadeAjuste > 0 ? "entrada" : "saída";

        await tx.economato.update({
          where: { id: economato.id },
          data: { quantity: novaQuantidade },
        });
      } else {
        await tx.economato.create({
          data: {
            areaId,
            productId,
            quantity: novaQuantidade,
            organizationId,
          },
        });
      }

      // Registrar no histórico
      await tx.stockHistory.create({
        data: {
          type: tipoAjuste,
          price: 0,
          quantity: Math.abs(quantidadeAjuste),
          created_at: new Date(),
          productId,
          organizationId,
          referenceType: "ajuste",
        },
      });

      // Registrar consumo interno se for saída
      if (tipoAjuste === "saída") {
        await tx.consumoInterno.create({
          data: {
            areaId,
            productId,
            quantity: Math.abs(quantidadeAjuste),
            motivo,
            observacoes,
            criadoPor: usuarioId,
            organizationId,
          },
        });
      }

      return { success: true, message: "Stock ajustado com sucesso" };
    });
  }
}

// ===== OBTER ALERTAS DE STOCK =====
class ObterAlertasStockService {
  async execute(organizationId: string) {
    const economatos = await prismaClient.economato.findMany({
      where: {
        organizationId,
        minQuantity: { not: null },
        quantity: { lte: prismaClient.economato.fields.minQuantity },
      },
      include: {
        product: true,
        area: true,
      },
    });

    return economatos.map((item) => ({
      ...item,
      nivel: "CRITICO",
      diferenca: item.minQuantity! - item.quantity,
    }));
  }
}

// ===== OBTER STOCK POR PRODUTO =====
interface ObterStockProdutoParams {
  productId: string;
  organizationId: string;
}

class ObterStockProdutoService {
  async execute({ productId, organizationId }: ObterStockProdutoParams) {
    if (!productId?.trim()) {
      throw new Error("ID do produto é obrigatório");
    }

    const stockPorArea = await prismaClient.economato.findMany({
      where: { productId: productId.trim(), organizationId },
      include: {
        area: true,
        product: {
          include: {
            Category: true,
          },
        },
      },
      orderBy: {
        area: {
          nome: "asc",
        },
      },
    });

    const total = stockPorArea.reduce((sum, item) => sum + item.quantity, 0);

    return {
      stockPorArea,
      total,
      quantidadeAreas: stockPorArea.length,
    };
  }
}

export {
  AdicionarProdutoAreaService,
  ListarStockAreaService,
  TransferirEntreAreasService,
  AjustarStockService,
  ObterAlertasStockService,
  ObterStockProdutoService,
};