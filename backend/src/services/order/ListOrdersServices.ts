import prismaClient from "../../prisma";
interface orderParams{
  organizationId: string;
  numeroMesa: Number;
}
interface codeParams{
  codigoAbertura: string;
  organizationId:string;
}

interface numerParams{
  sessionId: string;
  organizationId:string;
}
interface OrderWithItems {
  id: string;
  name: string | null;
  created_at: Date;
  status: boolean;
  items: {
    id: string;
    amount: number;
    prepared: boolean;
    Product: {
      id: string;
      name: string;
      Category: {
        id: string;
        name: string;
      };
    };
  }[];
  Session: {
    mesa: {
      number: number;
    };
  } | null;
}

interface FiltroFaturaParams {
  organizationId: string;
  date?: string;          // Exemplo: "2024-05-21"
  startDate?: string;     // Exemplo: "2024-05-20"
  endDate?: string;       // Exemplo: "2024-05-21"
}
class ListOrdersService {
  async execute({ organizationId }) {
    try {
      const ListOrder = await prismaClient.order.findMany({
        where: {
          organizationId,
          draft: false,
          status: false,
        },
        include: {
          items: {
            include: {
              Product: {
                include: {
                  Category:true,
                }
              }
            },
          },
          Session: {
            include: {
              mesa: true, // para pegar o número da mesa
            },
          },
          

        },
        orderBy: {
          created_at: 'desc',
        },
      });
  
      return ListOrder;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }
  
  async getFaturaBySessionId({ sessionId, organizationId }: numerParams) {
  const session = await prismaClient.session.findUnique({
  where: {
      id: sessionId,
      organizationId,
  },
  include: {
    mesa: true,
    OrderSession: {
      include: {
        Order: {
          include: {
            items: {
              include: {
                Product: {
                  include: {
                    PrecoVenda: {
                      orderBy: { data_inicio: "desc" },
                      take: 1,
                    },
                  }
                }
              },
              
            },
          },
        },
      },
    },
  },
});

if (!session) {
  throw new Error("Sessão não encontrada ou não pertence à mesa informada");
}

let totalGeral = 0;

const pedidos = session.OrderSession.map((os) => {
  const order = os.Order;
  const items = order.items.map((item) => {
    const preco = item.Product?.PrecoVenda[0]?.preco_venda ?? 0;
    const subtotal = preco * item.amount;
    totalGeral += subtotal;

    return {
      produto: item.Product.name,
      quantidade: item.amount,
      precoUnitario: preco,
      subtotal,
    };
  });

  return {
    id: order.id,
    nomePedido: order.name,
    criadoEm: order.created_at,
    items,
  };
});

return {
  mesaNumero: session.mesa.number,
  codigoAbertura: session.codigoAbertura,
  abertaEm: session.abertaEm,
  status: session.status,
  pedidos,
  totalGeral,
};

  }

  async getFaturaByDateOrRange({ organizationId, date, startDate, endDate }: FiltroFaturaParams) {
    let dataFiltro: any = {};

    if (date) {
      const dia = new Date(date);
      const inicio = new Date(dia.setHours(0, 0, 0, 0));
      const fim = new Date(dia.setHours(23, 59, 59, 999));
      dataFiltro = {
        gte: inicio,
        lte: fim,
      };
    } else if (startDate && endDate) {
      const inicio = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      const fim = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      dataFiltro = {
        gte: inicio,
        lte: fim,
      };
    }

    const sessions = await prismaClient.session.findMany({
      where: {
        organizationId,
        abertaEm: dataFiltro,
        status:false,
      },
      include: {
        mesa: true,
        OrderSession: {
          include: {
            Order: {
              include: {
                items: {
                  include: {
                    Product: {
                      include: {
                        PrecoVenda: {
                          orderBy: { data_inicio: "desc" },
                          take: 1,
                        },
                      }
                    }
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalGeral = 0;

    const faturas = sessions.map(session => {
      const pedidos = session.OrderSession.map(os => {
        const order = os.Order;
        const items = order.items.map(item => {
          const preco =item.Product?.PrecoVenda[0]?.preco_venda  ?? 0;
          const subtotal = preco * item.amount;
          totalGeral += subtotal;

          return {
            produto: item.Product.name,
            quantidade: item.amount,
            precoUnitario: preco,
            subtotal,
          };
        });

        return {
          id: order.id,
          nomePedido: order.name,
          criadoEm: order.created_at,
          items,
        };
      });

      return {
        mesaNumero: session.mesa.number,
        codigoAbertura: session.codigoAbertura,
        abertaEm: session.abertaEm,
        status: session.status,
        pedidos,
      };
    });

    return {
      periodo: date ? `Dia: ${date}` : `De: ${startDate} até ${endDate}`,
      organizacao: organizationId,
      faturas,
      totalGeral,
    };
  }

  async fecharSessao({ number,organizationId }:{number: number; organizationId: string }) {
    // 1. Verifica se a mesa existe na organização
    const mesa = await prismaClient.mesa.findFirst({
      where: {number,organizationId},
    });
  
    if (!mesa) {
      throw new Error("Mesa não encontrada para esta organização.");
    }
  
    // 2. Verifica se há uma sessão ativa nesta mesa
    const sessaoAtiva = await prismaClient.session.findFirst({
      where: {
        mesaId: mesa.id,
        status: true,
      },
      include: {
        mesa: true,
        OrderSession: {
          include: {
            Order: {
              include: {
                items: {
                  include: {
                    Product: {
                      include: {
                        PrecoVenda: {
                          orderBy: { data_inicio: "desc" },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  
    if (!sessaoAtiva) {
      throw new Error("Nenhuma sessão ativa encontrada para essa mesa.");
    }
  
    // 3. Verifica se há pedidos abertos
    const pedidosAbertos = sessaoAtiva.OrderSession.some(
      (os) => os.Order.draft === true || os.Order.status === false
    );
  
    if (pedidosAbertos) {
      throw new Error("Existem pedidos em aberto. Finalize antes de fechar a sessão.");
    }
  
    // 4. Calcular total da fatura
    let totalGeral = 0;
    const pedidos = sessaoAtiva.OrderSession.map((os) => {
      const order = os.Order;
      const items = order.items.map((item) => {
        const preco = item.Product?.PrecoVenda[0]?.preco_venda ?? 0;
        const subtotal = preco * item.amount;
        totalGeral += subtotal;
  
        return {
          produto: item.Product.name,
          quantidade: item.amount,
          precoUnitario: preco,
          subtotal,
        };
      });
  
      return {
        id: order.id,
        nomePedido: order.name,
        criadoEm: order.created_at,
        items,
      };
    });
  
    // 5. Fechar sessão
    await prismaClient.session.update({
      where: { id: sessaoAtiva.id },
      data: {
        status: false,
        fechadaEm: new Date(),
      },
    });

    await prismaClient.mesa.update({
      where: { id: sessaoAtiva.mesaId },
      data: {
       status:'livre' 
      }
    });
  
    // 6. Criar fatura (se não existir)
    const faturaExistente = await prismaClient.fatura.findUnique({
      where: { sessionId: sessaoAtiva.id },
    });
  
    if (!faturaExistente) {
      await prismaClient.fatura.create({
        data: {
          sessionId: sessaoAtiva.id,
          valorTotal: totalGeral,
          status: "pendente",
        },
      });
    }
  
    return {
      mesaNumero: number,
      codigoAbertura: sessaoAtiva.codigoAbertura,
      abertaEm: sessaoAtiva.abertaEm,
      fechadaEm: new Date(),
      pedidos,
      totalGeral,
    };
  }
  
  

}

export { ListOrdersService };
