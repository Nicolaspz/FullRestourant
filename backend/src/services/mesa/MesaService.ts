import prismaClient from "../../prisma";


class MesaService {
  // Método para criar uma nova mesa
 async createMesa(data) {
  try {
    // Verifica se já existe uma mesa com o mesmo número na organização
    const existingMesa = await prismaClient.mesa.findFirst({
      where: {
        number: data.numero,
        organizationId: data.organizationId,
      },
    });

    if (existingMesa) {
      throw new Error(`Já existe uma mesa número ${data.numero} para esta organização.`);
    }

    // Cria a nova mesa
    const newMesa = await prismaClient.mesa.create({
      data: {
        number: data.numero,
        organizationId: data.organizationId,
      },
    });

    return newMesa;
  } catch (error) {
    throw new Error('Erro ao criar mesa: ' + error.message);
  }
}

  // Método para listar todas as mesas
  async getAllMesas() {
    try {
      const mesas = await prismaClient.mesa.findMany();
      return mesas;
    } catch (error) {
      throw new Error('Erro ao buscar mesas: ' + error.message);
    }
  }

  async getAllMesasOpen() {
    try {
      const mesas = await prismaClient.mesa.findMany({
        where: {
          
        }
      });
      return mesas;
    } catch (error) {
      throw new Error('Erro ao buscar mesas: ' + error.message);
    }
  }
  
   async GetmesaOpened(organizationId: string) {
      const mesas = await prismaClient.mesa.findMany({
        where: {
          organizationId,
          sessions: {
            some: {
              status: true // Sessões abertas
            }
          }
        },
        select: {
          number: true,
          sessions: {
            where: { status: true },
            select: {
              abertaEm: true
            }
          }
        }
      });
  
      // Formata para retornar 1 sessão por mesa (caso haja múltiplas, pega a mais recente)
      const result = mesas.map(mesa => ({
        number: mesa.number,
        abertaEm: mesa.sessions?.[0]?.abertaEm ?? null
      }));
  
      return result;
    }

    async getmesas(organizationId: string) {
      const mesas = await prismaClient.mesa.findMany({
        where: {
          organizationId,
        },
        select: {
          number: true,
          id:true,
          status:true,
          reservas:{
            select:{
              status:true,
            }
          }
        }
      });
  
      // Formata para retornar 1 sessão por mesa (caso haja múltiplas, pega a mais recente)
      const result = mesas.map(mesa => ({
        number: mesa.number,
        id:mesa.id,
        status:mesa.status,
        reservas:mesa.reservas,
      }));
  
      return result;
    }
  
  // Método para buscar uma mesa pelo ID
  async getMesaById(id) {
    try {
      const mesa = await prismaClient.mesa.findUnique({
        where: { id },
      });
      if (!mesa) {
        throw new Error('Mesa não encontrada');
      }
      return mesa;
    } catch (error) {
      throw new Error('Erro ao buscar mesa: ' + error.message);
    }
  }

  // Método para atualizar uma mesa
  async updateMesa(id, data) {
    try {
      const updatedMesa = await prismaClient.mesa.update({
        where: { id },
        data: {
          number: data.numero,
          organizationId: data.organizationId
        },
      });
      return updatedMesa;
    } catch (error) {
      throw new Error('Erro ao atualizar mesa: ' + error.message);
    }
  }

  // Método para excluir uma mesa
  async deleteMesa(id) {
    try {
      await prismaClient.mesa.delete({
        where: { id },
      });
      return { message: 'Mesa excluída com sucesso' };
    } catch (error) {
      throw new Error('Erro ao excluir mesa: ' + error.message);
    }
  }

  async getAllMesasByOrganization(organizationId?: string) {
    try {
      const mesas = await prismaClient.mesa.findMany({
        where: organizationId ? { organizationId } : {},
      });
      return mesas;
    } catch (error) {
      throw new Error("Erro ao buscar mesas: " + error.message);
    }
  }

  
  async fecharSessao(id: string) {
    const sessao = await prismaClient.session.findUnique({ where: { id } })

    if (!sessao || !sessao.status) {
      throw new Error("Sessão não encontrada ou já encerrada.")
    }

    const encerrada = await prismaClient.session.update({
      where: { id },
      data: {
        status: false,
        fechadaEm: new Date()
      }
    })

    await prismaClient.mesa.update({
      where: { id: sessao.mesaId },
      data: {
       status:'livre' 
      }
    });

    return encerrada
  }

  // Listar sessões por mesa
  async listarSessoesPorMesa(mesaId: string) {
    return await prismaClient.session.findMany({
      where: { mesaId },
      include: {
        OrderSession: {
          include: {
            Order: {
              include: {
                items: {
                  select: {
                    amount: true,
                    Product: {
                      select: {
                        name: true,
                        
                      }
                    }
                 }
               }
             }
          }
        }
      } }
    })
  }

  

}
export { MesaService };

