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
          areaOrigem: true, // Área que solicitou (pode ser null se vier do stock geral)
          areaDestino: true, // Área que vai receber
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

      // Processar cada item - SEMPRE do STOCK para ECONOMATO da ÁREA
      for (const item of pedido.itens) {
        const quantidade = item.quantity; // Float
        
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

        // Verificar se tem estoque suficiente no STOCK
        // Stock usa Int, item usa Float - converter para comparação
        if (stockGeral.totalQuantity < Math.ceil(quantidade)) {
          throw new Error(`Stock insuficiente para ${item.product.name}. Disponível: ${stockGeral.totalQuantity}, Solicitado: ${quantidade}`);
        }

        // 2. Buscar lotes (FIFO) para descontar
        const lotes = await tx.lote.findMany({
          where: {
            productId: item.productId,
            organizationId,
            isActive: true,
            quantity: { gt: 0 },
          },
          orderBy: [
            { data_validade: 'asc' }, // Primeiro os que vencem primeiro
            { data_compra: 'asc' },
          ],
        });

        let quantidadeRestante = quantidade;
        
        // 3. Descontar dos lotes específicos
        for (const lote of lotes) {
          if (quantidadeRestante <= 0) break;
          
          const produtoFracionado = item.product.is_fractional;
          
          // Calcular quanto descontar deste lote
          const quantidadeParaDescontar = produtoFracionado 
            ? Math.min(lote.quantity, quantidadeRestante) // Mantém decimal para fracionados
            : Math.min(lote.quantity, Math.ceil(quantidadeRestante)); // Arredonda para inteiros
          
          if (quantidadeParaDescontar > 0) {
            // Atualizar lote
            const novoQuantityLote = lote.quantity - quantidadeParaDescontar;
            
            await tx.lote.update({
              where: { id: lote.id },
              data: {
                quantity: novoQuantityLote,
                isActive: novoQuantityLote > 0,
              },
            });

            // Registrar histórico do lote
            await tx.stockHistory.create({
              data: {
                type: "saída",
                price: lote.preco_compra || 0,
                quantity: quantidadeParaDescontar,
                created_at: new Date(),
                productId: item.productId,
                organizationId,
                referenceType: "transferencia_area",
                referenceId: pedido.id,
                loteId: lote.id,
              },
            });

            quantidadeRestante -= quantidadeParaDescontar;
          }
        }

        // Verificar se toda quantidade foi alocada dos lotes
        if (quantidadeRestante > 0.001) {
          throw new Error(`Não foi possível alocar toda a quantidade de ${item.product.name} dos lotes disponíveis`);
        }

        // 4. Atualizar stock geral (diminuir)
        await tx.stock.update({
          where: { id: stockGeral.id },
          data: {
            totalQuantity: stockGeral.totalQuantity - Math.ceil(quantidade),
          },
        });

        // 5. Adicionar ao economato da área de DESTINO
        // O pedido sempre vai da organização (stock) para uma área específica
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
              quantity: { increment: quantidade },
            },
          });
        } else {
          await tx.economato.create({
            data: {
              areaId: pedido.areaDestinoId,
              productId: item.productId,
              quantity: quantidade,
              organizationId,
            },
          });
        }

        // 6. Atualizar quantidade enviada no item
        await tx.itemPedidoArea.update({
          where: { id: item.id },
          data: { quantitySent: quantidade },
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

      // 8. Atualizar status do pedido
      const pedidoAtualizado = await tx.pedidoArea.update({
        where: { id: pedido.id },
        data: {
          status: "processado",
          processadoEm: new Date(),
          processadoPor: usuarioId,
          confirmationCode: null, // Limpar código após uso
        },
      });

      return pedidoAtualizado;
    });
  }
}
export { ConfirmarPedidoService };