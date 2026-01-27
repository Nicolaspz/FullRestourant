import { PrismaClient, FaturaStatus, MetodoPagamento } from '@prisma/client';

const prisma = new PrismaClient();

export class FaturaService {
  
  // Buscar todas as faturas com filtros
  async getFaturas(filters: {
    organizationId: string;
    status?: FaturaStatus;
    dataInicio?: Date;
    dataFim?: Date;
    mesaId?: string;
  }) {
    const where: any = {
      session: {
        organizationId: filters.organizationId
      }
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dataInicio || filters.dataFim) {
      where.criadaEm = {};
      if (filters.dataInicio) where.criadaEm.gte = filters.dataInicio;
      if (filters.dataFim) where.criadaEm.lte = filters.dataFim;
    }

    if (filters.mesaId) {
      where.session = {
        ...where.session,
        mesaId: filters.mesaId
      };
    }

    return await prisma.fatura.findMany({
      where,
      include: {
        session: {
          include: {
            mesa: true,
            Order: {
              include: {
                items: {
                  include: {
                    Product: true
                  }
                }
              }
            }
          }
        },
        pagamentos: true
      },
      orderBy: {
        criadaEm: 'desc'
      }
    });
  }

  // Buscar fatura por ID
  async getFaturaById(id: string, organizationId: string) {
    return await prisma.fatura.findFirst({
      where: {
        id,
        session: {
          organizationId
        }
      },
      include: {
        session: {
          include: {
            mesa: true,
            Order: {
              include: {
                items: {
                  include: {
                    Product: true
                  }
                }
              }
            }
          }
        },
        pagamentos: true
      }
    });
  }

  // Processar pagamento de fatura
  async processarPagamento(faturaId: string, organizationId: string, pagamentoData: {
    metodoPagamento: MetodoPagamento;
    valorPago: number;
    trocoPara?: number;
    observacoes?: string;
    pagamentosMultiplos?: Array<{
      metodo: MetodoPagamento;
      valor: number;
      referencia?: string;
    }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Verificar se fatura existe e pertence à organização
      const fatura = await tx.fatura.findFirst({
        where: {
          id: faturaId,
          session: {
            organizationId
          }
        },
        include: {
          pagamentos: true
        }
      });

      if (!fatura) {
        throw new Error('Fatura não encontrada');
      }

      if (fatura.status === 'paga') {
        throw new Error('Fatura já está paga');
      }

      // Se há pagamentos múltiplos
      if (pagamentoData.pagamentosMultiplos && pagamentoData.pagamentosMultiplos.length > 0) {
        const totalPagamentos = pagamentoData.pagamentosMultiplos.reduce((sum, pag) => sum + pag.valor, 0);
        
        if (Math.abs(totalPagamentos - fatura.valorTotal) > 0.01) {
          throw new Error('Valor total dos pagamentos não corresponde ao valor da fatura');
        }

        // Criar múltiplos pagamentos
        for (const pagamento of pagamentoData.pagamentosMultiplos) {
          await tx.pagamento.create({
            data: {
              faturaId,
              metodo: pagamento.metodo,
              valor: pagamento.valor,
              referencia: pagamento.referencia
            }
          });
        }

        // Atualizar fatura
        await tx.fatura.update({
          where: { id: faturaId },
          data: {
            status: 'paga',
            metodoPagamento: pagamentoData.pagamentosMultiplos[0].metodo, // Método principal
            pagaEm: new Date(),
            valorPago: totalPagamentos
          }
        });

      } else {
        // ✅ CORREÇÃO: Verificar valor no pagamento único
        if (Math.abs(pagamentoData.valorPago - fatura.valorTotal) > 0.01) {
          throw new Error('Valor pago não corresponde ao valor da fatura');
        }

        // Pagamento único
        if (pagamentoData.metodoPagamento === 'dinheiro' && pagamentoData.trocoPara) {
          if (pagamentoData.valorPago < pagamentoData.trocoPara) {
            throw new Error('Valor pago deve ser maior que o troco solicitado');
          }
        }

        // Criar pagamento único
        await tx.pagamento.create({
          data: {
            faturaId,
            metodo: pagamentoData.metodoPagamento,
            valor: pagamentoData.valorPago,
            observacoes: pagamentoData.observacoes
          }
        });

        // Atualizar fatura
        await tx.fatura.update({
          where: { id: faturaId },
          data: {
            status: 'paga',
            metodoPagamento: pagamentoData.metodoPagamento,
            pagaEm: new Date(),
            valorPago: pagamentoData.valorPago,
            trocoPara: pagamentoData.trocoPara,
            observacoes: pagamentoData.observacoes
          }
        });
      }

      // Fechar a sessão associada
      await tx.session.update({
        where: { id: fatura.sessionId },
        data: {
          status: false,
          fechadaEm: new Date()
        }
      });

      return await tx.fatura.findUnique({
        where: { id: faturaId },
        include: {
          pagamentos: true,
          session: {
            include: {
              mesa: true
            }
          }
        }
      });
    });
  }

  // Cancelar fatura
  async cancelarFatura(faturaId: string, organizationId: string, motivo: string) {
    return await prisma.fatura.update({
      where: {
        id: faturaId,
        session: {
          organizationId
        }
      },
      data: {
        status: 'cancelada',
        observacoes: motivo
      }
    });
  }

  // Estatísticas de vendas
  async getEstatisticasVendas(organizationId: string, periodo: { inicio: Date; fim: Date }) {
  // 🔥 GARANTIR que só busca do dia atual (ignorar filtros de data do frontend)
  const hoje = new Date();
  const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

  console.log('📅 Estatísticas RESTRITAS ao dia:', inicioDia, 'até', fimDia);

  const faturas = await prisma.fatura.findMany({
    where: {
      session: {
        organizationId
      },
      // 🔥 SEMPRE usar data atual, ignorando o período recebido
      pagaEm: {
        gte: inicioDia,
        lte: fimDia
      },
      status: 'paga'
    },
    include: {
      pagamentos: true,
      session: {
        include: {
          mesa: true
        }
      }
    }
  });

  const totalVendas = faturas.reduce((sum, fatura) => sum + fatura.valorTotal, 0);
  
  const vendasPorMetodo = faturas.reduce((acc, fatura) => {
    fatura.pagamentos.forEach(pagamento => {
      acc[pagamento.metodo] = (acc[pagamento.metodo] || 0) + pagamento.valor;
    });
    return acc;
  }, {} as Record<MetodoPagamento, number>);

  return {
    totalVendas,
    quantidadeFaturas: faturas.length,
    vendasPorMetodo,
    periodo: { // 🔥 Retornar o período REAL usado
        inicio: inicioDia,
        fim: fimDia
    },
    observacao: 'Estatísticas restritas ao dia atual'
  };
}
}