import prismaClient from "../../prisma";

interface ConfirmarPedidoParams {
  pedidoId: string;
  code: string;
  usuarioId: string;
  organizationId: string;
}

// services/pedidos-area/ConfirmarPedidoService.ts
class ConfirmarPedidoService {
  async execute({
    pedidoId,
    code,
    usuarioId,
    organizationId,
  }: ConfirmarPedidoParams) {
    return prismaClient.$transaction(async (tx) => {
      // Buscar pedido
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
          areaDestino: true,
        },
      });

      if (!pedido) {
        throw new Error("Pedido não encontrado");
      }

      if (pedido.status !== "aprovado") {
        throw new Error("Pedido precisa estar 'aprovado' para confirmar recebimento");
      }

      if (pedido.confirmationCode !== code) {
        throw new Error("Código de confirmação inválido");
      }

      // Processar cada item
      for (const item of pedido.itens) {
        const quantidade = Math.ceil(item.quantity);

        // 1. Buscar stock geral
        const stockGeral = await tx.stock.findFirst({
          where: {
            productId: item.productId,
            organizationId,
          },
        });

        if (!stockGeral) {
          throw new Error(`Produto ${item.product.name} não possui stock registrado`);
        }

        if (stockGeral.totalQuantity < quantidade) {
          throw new Error(`Stock insuficiente para ${item.product.name}. Disponível: ${stockGeral.totalQuantity}`);
        }

        // 2. Buscar lotes (FIFO)
        const lotes = await tx.lote.findMany({
          where: {
            productId: item.productId,
            organizationId,
            isActive: true,
            quantity: { gt: 0 },
          },
          orderBy: [
            { data_validade: 'asc' },
            { data_compra: 'asc' },
          ],
        });

        let quantidadeRestante = quantidade;
        
        // 3. Descontar dos lotes
        for (const lote of lotes) {
          if (quantidadeRestante <= 0) break;
          
          const quantidadeDoLote = Math.min(lote.quantity, quantidadeRestante);
          
          if (quantidadeDoLote > 0) {
            // Atualizar lote
            await tx.lote.update({
              where: { id: lote.id },
              data: {
                quantity: lote.quantity - quantidadeDoLote,
                isActive: (lote.quantity - quantidadeDoLote) > 0,
              },
            });

            // Registrar histórico do lote
            await tx.stockHistory.create({
              data: {
                type: "saída",
                price: lote.preco_compra || 0,
                quantity: quantidadeDoLote,
                created_at: new Date(),
                productId: item.productId,
                organizationId,
                referenceType: "transferencia_area",
                referenceId: pedido.id,
                loteId: lote.id,
              },
            });

            quantidadeRestante -= quantidadeDoLote;
          }
        }

        // 4. Atualizar stock geral
        await tx.stock.update({
          where: { id: stockGeral.id },
          data: {
            totalQuantity: stockGeral.totalQuantity - quantidade,
          },
        });

        // 5. Atualizar/Inserir no economato da área de destino
        const economatoExistente = await tx.economato.findFirst({
          where: {
            areaId: pedido.areaDestinoId,
            productId: item.productId,
            organizationId,
          },
        });

        if (economatoExistente) {
          await tx.economato.update({
            where: { id: economatoExistente.id },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        } else {
          await tx.economato.create({
            data: {
              areaId: pedido.areaDestinoId,
              productId: item.productId,
              quantity: item.quantity,
              organizationId,
            },
          });
        }

        // 6. Atualizar quantidade enviada
        await tx.itemPedidoArea.update({
          where: { id: item.id },
          data: { quantitySent: item.quantity },
        });
      }

      // 7. Criar histórico do pedido
      await tx.pedidoHistory.create({
        data: {
          pedidoId: pedido.id,
          statusAnterior: pedido.status,
          novoStatus: "processado",
          alteradoPor: usuarioId,
          data: new Date(),
          observacoes: "Recebimento confirmado e stock transferido",
          organizationId,
        },
      });

      // 8. Atualizar pedido
      const pedidoAtualizado = await tx.pedidoArea.update({
        where: { id: pedido.id },
        data: {
          status: "processado",
          processadoEm: new Date(),
          processadoPor: usuarioId,
          confirmationCode: null, // Limpar código
        },
      });

      return pedidoAtualizado;
    });
  }
}
export { ConfirmarPedidoService };