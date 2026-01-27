import prismaClient from "../../prisma";

interface ProcessarPedidoParams {
  pedidoId: string;
  status: 'aprovado' | 'rejeitado' | 'processado' | 'cancelado';
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
        include: {
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

      if (pedido.status !== "pendente") {
        throw new Error(`Pedido já está ${pedido.status}`);
      }

      // Se for aprovado, verificar stock e gerar código
      let confirmationCode = null;
      if (status === "aprovado") {
        // Verificar stock para cada item
        for (const item of pedido.itens) {
          const stock = await tx.stock.findFirst({
            where: {
              productId: item.productId,
              organizationId,
            },
          });

          if (!stock || stock.totalQuantity < Math.ceil(item.quantity)) {
            throw new Error(`Stock insuficiente para ${item.product.name}. Disponível: ${stock?.totalQuantity || 0}, Solicitado: ${Math.ceil(item.quantity)}`);
          }
        }

        // Gerar código de confirmação (6 dígitos)
        confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
      }

      // Atualizar pedido
      const pedidoAtualizado = await tx.pedidoArea.update({
        where: { id: pedidoId },
        data: {
          status,
          observacoes: observacoes || pedido.observacoes,
          confirmationCode,
        },
      });

      // Registrar histórico
      await tx.pedidoHistory.create({
        data: {
          pedidoId: pedido.id,
          statusAnterior: pedido.status,
          novoStatus: status,
          alteradoPor: usuarioId,
          data: new Date(),
          observacoes: status === "aprovado" 
            ? `Código de confirmação: ${confirmationCode}` 
            : observacoes,
          organizationId,
        },
      });

      return {
        ...pedidoAtualizado,
        // Retornar código apenas se for aprovado
        confirmationCode: status === "aprovado" ? confirmationCode : null,
      };
    });
  }
}
