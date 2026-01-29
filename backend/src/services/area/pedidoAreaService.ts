import prismaClient from "../../prisma";

// ===== CRIAR PEDIDO ENTRE ÁREAS =====
interface ItemPedidoParams {
  productId: string;
  quantity: number;
}

interface CriarPedidoParams {
  areaOrigemId?: string | null;
  areaDestinoId: string;
  observacoes?: string;
  itens: ItemPedidoParams[];
  organizationId: string;
  usuarioId?: string;
}

class CriarPedidoAreaService {
  async execute({
    areaOrigemId,
    areaDestinoId,
    observacoes,
    itens,
    usuarioId,
    organizationId,
  }: CriarPedidoParams) {
    return prismaClient.$transaction(async (tx) => {
      // Verificar se área de destino existe
      const areaDestino = await tx.area.findFirst({
        where: { id: areaDestinoId, organizationId },
      });

      if (!areaDestino) {
        throw new Error("Área de destino não encontrada");
      }
      
      // Verificar área de origem se fornecida
     /*if (areaOrigemId) {
        const areaOrigem = await tx.area.findFirst({
           where: { id: areaOrigemId, organizationId },
        });
        if (!areaOrigem) throw new Error("Área de origem não encontrada");
      }*/

      // Criar pedido
      const pedido = await tx.pedidoArea.create({
        data: {
          areaOrigemId, // pode ser null
          areaDestinoId,
          observacoes,
          processadoPor: usuarioId, // quem criou/solicitou
          organizationId,
          status: "pendente",
        },
      });

      // Adicionar itens
      for (const item of itens) {
        await tx.itemPedidoArea.create({
          data: {
            pedidoId: pedido.id,
            productId: item.productId,
            quantity: item.quantity,
            organizationId,
          },
        });
      }
      
      // Registrar no Histórico
      await tx.pedidoHistory.create({
         data: {
            pedidoId: pedido.id,
            novoStatus: "pendente",
            alteradoPor: usuarioId,
            organizationId,
            observacoes: "Pedido criado"
         }
      });

      return pedido;
    });
  }
}

// ===== LISTAR PEDIDOS =====
interface ListarPedidosParams {
  organizationId: string;
  status?: string;
  areaOrigemId?: string;
  areaDestinoId?: string;
}

class ListarPedidosAreaService {
  async execute({
    organizationId,
    status,
    areaOrigemId,
    areaDestinoId,
  }: ListarPedidosParams) {
    const where: any = { organizationId };

    if (status) where.status = status;
    if (areaOrigemId) where.areaOrigemId = areaOrigemId;
    if (areaDestinoId) where.areaDestinoId = areaDestinoId;

    const pedidos = await prismaClient.pedidoArea.findMany({
      where,
      include: {
        areaOrigem: true,
        areaDestino: true,
        itens: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return pedidos;
  }
}

// ===== OBTER PEDIDO =====
interface ObterPedidoParams {
  id: string;
  organizationId: string;
}

class ObterPedidoAreaService {
  async execute({ id, organizationId }: ObterPedidoParams) {
    if (!id) {
      throw new Error("ID do pedido é obrigatório");
    }

    const pedido = await prismaClient.pedidoArea.findFirst({
      where: { id, organizationId },
      include: {
        areaOrigem: true,
        areaDestino: true,
        itens: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new Error("Pedido não encontrado");
    }

    return pedido;
  }
}

// ===== PROCESSAR PEDIDO =====
interface ProcessarPedidoParams {
  pedidoId: string;
  status: "aprovado" | "rejeitado" | "processado" | "cancelado";
  observacoes?: string;
  usuarioId: string;
  organizationId: string;
}

class ProcessarPedidoAreaService {
  async execute({
    pedidoId,
    status,
    observacoes,
    usuarioId,
    organizationId,
  }: ProcessarPedidoParams) {
    return prismaClient.$transaction(async (tx) => {
      const pedido = await tx.pedidoArea.findFirst({
        where: {
          id: pedidoId,
          organizationId,
        },
      });

      if (!pedido) {
        throw new Error("Pedido não encontrado");
      }

      if (pedido.status !== "pendente") {
        throw new Error("Pedido já foi processado");
      }

      // Criar histórico
      await tx.pedidoHistory.create({
        data: {
          pedidoId: pedido.id,
          statusAnterior: pedido.status,
          novoStatus: status,
          alteradoPor: usuarioId,
          data: new Date(),
          observacoes: observacoes || `Pedido ${status}`,
          organizationId,
        },
      });

      let confirmationCode = null;
      
      // Se aprovado, gerar código de confirmação
      if (status === "aprovado") {
        confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
      }

      // Atualizar pedido
      const pedidoAtualizado = await tx.pedidoArea.update({
        where: { id: pedidoId },
        data: {
          status,
          processadoPor: usuarioId,
          observacoes,
          confirmationCode,
        },
      });

      return {
        ...pedidoAtualizado,
        confirmationCode, // Retornar código se foi gerado
      };
    });
  }
}

export {
  CriarPedidoAreaService,
  ListarPedidosAreaService,
  ObterPedidoAreaService,
  ProcessarPedidoAreaService,
};