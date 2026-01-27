import prismaClient from "../../prisma";

interface RequestOrder {
  number: number;
  organizationId: string;
  name: string;
}

class OrderServices {
  async execute({ number, name, organizationId }: RequestOrder) {
  // Verificar se a mesa existe
  const mesa = await prismaClient.mesa.findFirst({
    where: {
      organizationId,
      number,
    },
  });

  if (!mesa) {
    throw new Error("Mesa não encontrada.");
  }

  // Verificar se já há uma sessão aberta para esta mesa
  const mesaSessionAberta = await prismaClient.session.findFirst({
    where: {
      mesaId: mesa.id,
      organizationId,
      status: true, // Sessão ativa
    },

    
  });
  
    if (mesaSessionAberta) {
    
    const order = await prismaClient.order.create({
    data: {
      name,
      organizationId,
      sessionId: mesaSessionAberta.id,
    },
    select: {
      id: true,
      status: true,
      draft: true,
      name: true,
      organizationId: true,
      sessionId: true,
    },
    });
      
    await prismaClient.orderSession.create({
    data: {
      orderId:order.id,
      sessionId: mesaSessionAberta.id,
      organizationId,
    },
    select: {
      id: true,
      organizationId: true,
      sessionId: true,
    },
  });
      
      return order;
  }
    else {

  const novaMesaSession = await prismaClient.session.create({
    data: {
      mesaId: mesa.id,
      organizationId,
      status: true,
      codigoAbertura: `${mesa.id}-${Date.now()}`,
    },
  });

  // Criar o pedido e associar à nova sessão
  const order = await prismaClient.order.create({
    data: {
      name,
      organizationId,
      sessionId: novaMesaSession.id,
    },
    select: {
      id: true,
      status: true,
      draft: true,
      name: true,
      organizationId: true,
      sessionId: true,
    },
  });
      
  await prismaClient.orderSession.create({
    data: {
      orderId:order.id,
      sessionId: novaMesaSession.id,
      organizationId,
    },
    select: {
      id: true,
      organizationId: true,
      sessionId: true,
    },
  });
      
      return order;
}
  

  
}
 // Verifica apenas se a mesa existe
 async verifyTable({ number, organizationId }: { number: number; organizationId: string }) {
  const mesa = await prismaClient.mesa.findFirst({
    where: { organizationId, number },
  });

  if (!mesa) throw new Error("Mesa não encontrada.");
  return { mesa };
}
}

export { OrderServices };
