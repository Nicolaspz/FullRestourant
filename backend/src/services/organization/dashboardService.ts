import prismaClient from "../../prisma";

interface DashboardParams {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getDashboardReport({
  organizationId,
  startDate,
  endDate,
}: DashboardParams) {
  const dateFilter = startDate && endDate ? {
    gte: startDate,
    lte: endDate,
  } : undefined;

  const compras = await prismaClient.purchase.findMany({
    where: {
      organizationId,
      created_at: dateFilter,
    },
    include: {
      products: true,
    },
  });

  const vendas = await prismaClient.order.findMany({
    where: {
      organizationId,
      created_at: dateFilter,
      status: true,
    },
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
  });

  const faturasPendentes = await prismaClient.fatura.findMany({
    where: {
      session: {
        organizationId,
      },
      criadaEm: dateFilter,
      status: "pendente",
    },
  });

  const totalFaturasPendentes = faturasPendentes.reduce((acc, f) => acc + f.valorTotal, 0);

  const produtosVendidos = vendas.flatMap(v => v.items.map(i => i.amount));
  const produtosComprados = compras.flatMap(c => c.products.map(p => p.quantity));

  const totalVendas = vendas.reduce((acc, v) => {
    return acc + v.items.reduce((sum, item) => {
      const precoVenda = item.Product?.PrecoVenda[0]?.preco_venda ?? 0;
      return sum + item.amount * precoVenda;
    }, 0);
  }, 0);

  const totalCompras = compras.reduce((acc, compra) => {
    return acc + compra.products.reduce((sum, p) => sum + (p.purchasePrice ?? 0) * p.quantity, 0);
  }, 0);

  const lucro = totalVendas - totalCompras;
  const margemLucro = totalVendas > 0 ? (lucro / totalVendas) * 100 : 0;

  return {
    totalCompras,
    totalVendas,
    lucro,
    margemLucro,
    qtdProdutosComprados: produtosComprados.reduce((a, b) => a + b, 0),
    qtdProdutosVendidos: produtosVendidos.reduce((a, b) => a + b, 0),
    faturasPendentes: faturasPendentes.length,
    valorFaturasPendentes: totalFaturasPendentes,
  };
}
