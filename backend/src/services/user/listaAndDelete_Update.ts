import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

class UserServices {
 
  async listUsers(organizationId) {
    // Implementação da listagem de usuários de uma organização específica
    return prisma.user.findMany({
      where: { organizationId },
    });
  }

  async UserById(id) {
    // Implementação da listagem de usuários de uma organização específica
    return prisma.user.findFirst({
      where: {id},
      include: {
        Organization: true, // Inclui os dados da organização associada ao usuário
      },
    });
  }

  async listAllUsers() {
    // Implementação da listagem de usuários de uma organização específica
    return prisma.user.findMany();
  }

  async updateUser({ userId, name, email, role, password}) {
    // Verifica se o usuário existe antes de atualizá-lo
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const passwordHas= await hash(password,8)
    return prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        password:passwordHas,
       
      },
    });
  }

  async deleteUser(userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    // Verifica se o usuário está associado a alguma order
    const ordersCount = await prisma.order.count({
      where: {id: userId },
    });

    if (ordersCount > 0) {
      throw new Error("Usuário associado a pedidos. Não pode ser excluído.");
    }

    // Verifica se o usuário está associado a algum item
    const itemsCount = await prisma.item.count({
      where: {id: userId },
    });

    if (itemsCount > 0) {
      throw new Error("Usuário associado a itens. Não pode ser excluído.");
    }

    // Adicione mais verificações conforme necessário para outras tabelas relacionadas

    // Se todas as verificações passarem, exclua o usuário
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}

export { UserServices };