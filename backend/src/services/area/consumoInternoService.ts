import prismaClient from "../../prisma";

// ===== REGISTRAR CONSUMO INTERNO =====
interface RegistrarConsumoParams {
  areaId: string;
  productId: string;
  quantity: number;
  motivo: string;
  observacoes?: string;
  usuarioId?: string;
  loteId?: string;
  organizationId: string;
}

class RegistrarConsumoInternoService {
  async execute({
    areaId,
    productId,
    quantity,
    motivo,
    observacoes,
    usuarioId,
    loteId,
    organizationId,
  }: RegistrarConsumoParams) {
    return prismaClient.$transaction(async (tx) => {
      // 1. Verificar stock na área
      const economato = await tx.economato.findFirst({
        where: {
          areaId,
          productId,
          organizationId,
        },
      });

      if (!economato || economato.quantity < quantity) {
        throw new Error("Stock insuficiente na área");
      }

      // 2. Descontar do economato
      await tx.economato.update({
        where: { id: economato.id },
        data: { quantity: { decrement: quantity } },
      });

      // 3. Registrar consumo
      const consumo = await tx.consumoInterno.create({
        data: {
          areaId,
          productId,
          quantity,
          motivo,
          observacoes,
          criadoPor: usuarioId,
          loteId,
          organizationId,
        },
      });

      // 4. Registrar no histórico
      await tx.stockHistory.create({
        data: {
          type: "saída",
          price: 0,
          quantity,
          created_at: new Date(),
          productId,
          organizationId,
          referenceType: "consumo_interno",
        },
      });

      return consumo;
    });
  }
}

// ===== LISTAR CONSUMOS =====
interface ListarConsumosParams {
  organizationId: string;
  areaId?: string;
  productId?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

class ListarConsumosInternoService {
  async execute({
    organizationId,
    areaId,
    productId,
    dataInicio,
    dataFim,
  }: ListarConsumosParams) {
    const where: any = { organizationId };

    if (areaId) where.areaId = areaId;
    if (productId) where.productId = productId;
    if (dataInicio || dataFim) {
      where.criadoEm = {};
      if (dataInicio) where.criadoEm.gte = dataInicio;
      if (dataFim) where.criadoEm.lte = dataFim;
    }

    const consumos = await prismaClient.consumoInterno.findMany({
      where,
      include: {
        area: true,
        product: true,
        lote: true,
      },
      orderBy: { criadoEm: "desc" },
    });

    return consumos;
  }
}

// ===== RELATÓRIO DE CONSUMO POR ÁREA =====
interface RelatorioConsumoParams {
  organizationId: string;
  dataInicio: Date;
  dataFim: Date;
}

class RelatorioConsumoPorAreaService {
  async execute({
    organizationId,
    dataInicio,
    dataFim,
  }: RelatorioConsumoParams) {
    const consumos = await prismaClient.consumoInterno.groupBy({
      by: ["areaId", "productId", "motivo"],
      where: {
        organizationId,
        criadoEm: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    // Buscar detalhes
    const resultados = [];
    for (const consumo of consumos) {
      const area = await prismaClient.area.findFirst({
        where: { id: consumo.areaId },
      });

      const product = await prismaClient.product.findFirst({
        where: { id: consumo.productId },
        select: {
          id: true,
          name: true,
          unit: true,
          Category: true,
        },
      });

      resultados.push({
        areaId: consumo.areaId,
        areaNome: area?.nome,
        productId: consumo.productId,
        productNome: product?.name,
        produtoUnidade: product?.unit,
        categoria: product?.Category?.name,
        motivo: consumo.motivo,
        quantidadeTotal: consumo._sum.quantity || 0,
        totalOcorrencias: consumo._count.id,
      });
    }

    return resultados;
  }
}

// ===== OBTER CONSUMO POR ID =====
interface ObterConsumoParams {
  id: string;
  organizationId: string;
}

class ObterConsumoInternoService {
  async execute({ id, organizationId }: ObterConsumoParams) {
    if (!id) {
      throw new Error("ID do consumo é obrigatório");
    }

    const consumo = await prismaClient.consumoInterno.findFirst({
      where: { id, organizationId },
      include: {
        area: true,
        product: {
          include: {
            Category: true,
          },
        },
        lote: true,
      },
    });

    if (!consumo) {
      throw new Error("Consumo não encontrado");
    }

    return consumo;
  }
}

export {
  RegistrarConsumoInternoService,
  ListarConsumosInternoService,
  RelatorioConsumoPorAreaService,
  ObterConsumoInternoService,
};