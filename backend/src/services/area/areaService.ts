import prismaClient from "../../prisma";

// ===== CRIAR ÁREA =====
interface CriarAreaParams {
  nome: string;
  descricao?: string;
  organizationId: string;
}

class CriarAreaService {
  async execute({ nome, descricao, organizationId }: CriarAreaParams) {
    if (!nome.trim()) {
      throw new Error("Nome da área é obrigatório");
    }

    // Verificar se já existe área com mesmo nome
    const areaExistente = await prismaClient.area.findFirst({
      where: {
        nome: nome.trim(),
        organizationId,
      },
    });

    if (areaExistente) {
      throw new Error("Já existe uma área com este nome");
    }

    const area = await prismaClient.area.create({
      data: {
        nome: nome.trim(),
        descricao,
        organizationId,
      },
    });

    return area;
  }
}

// ===== LISTAR ÁREAS =====
class ListarAreasService {
  async execute(organizationId: string) {
    const areas = await prismaClient.area.findMany({
      where: { organizationId },
      orderBy: { nome: "asc" },
      include: {
        economato: {
          include: {
            product: true,
          },
        },
        _count: {
          select: {
            economato: true,
          },
        },
      },
    });

    return areas;
  }
}

// ===== OBTER ÁREA =====
class ObterAreaService {
  async execute(id: string, organizationId: string) {
    if (!id) {
      throw new Error("ID da área é obrigatório");
    }

    const area = await prismaClient.area.findFirst({
      where: { id, organizationId },
      include: {
        economato: {
          include: {
            product: {
              include: {
                Category: true,
              },
            },
          },
        },
        _count: {
          select: {
            economato: true,
          },
        },
      },
    });

    if (!area) {
      throw new Error("Área não encontrada");
    }

    return area;
  }
}

// ===== ATUALIZAR ÁREA =====
interface AtualizarAreaParams {
  id: string;
  nome?: string;
  descricao?: string;
  organizationId: string;
}

class AtualizarAreaService {
  async execute({ id, nome, descricao, organizationId }: AtualizarAreaParams) {
    if (!id) {
      throw new Error("ID da área é obrigatório");
    }

    const updateData: any = {};
    if (nome !== undefined) {
      if (!nome.trim()) {
        throw new Error("Nome não pode ser vazio");
      }
      updateData.nome = nome.trim();
    }
    if (descricao !== undefined) updateData.descricao = descricao;

    const area = await prismaClient.area.update({
      where: { id },
      data: updateData,
    });

    return area;
  }
}

// ===== DELETAR ÁREA =====
interface DeletarAreaParams {
  id: string;
  organizationId: string;
}

class DeletarAreaService {
  async execute({ id, organizationId }: DeletarAreaParams) {
    if (!id) {
      throw new Error("ID da área é obrigatório");
    }

    // Verificar se área existe
    const area = await prismaClient.area.findFirst({
      where: { id, organizationId },
    });

    if (!area) {
      throw new Error("Área não encontrada");
    }

    // Verificar se área tem dependências
    const temEconomato = await prismaClient.economato.findFirst({
      where: { areaId: id },
    });

    if (temEconomato) {
      throw new Error("Não é possível deletar área com stock associado");
    }

    await prismaClient.area.delete({
      where: { id },
    });

    return { message: "Área deletada com sucesso" };
  }
}

// ===== INICIALIZAR ÁREAS PADRÃO =====
class InicializarAreasPadraoService {
  async execute(organizationId: string) {
    const areasPadrao = [
      { nome: "Armazém", descricao: "Stock principal da organização" },
      { nome: "Cozinha", descricao: "Área de preparação de alimentos" },
      { nome: "Bar", descricao: "Área de bebidas e cocktails" },
      { nome: "Sala", descricao: "Área de atendimento ao cliente" },
      { nome: "Takeaway", descricao: "Área de entregas e takeaway" },
    ];

    const areasCriadas = [];

    for (const area of areasPadrao) {
      const areaExistente = await prismaClient.area.findFirst({
        where: {
          nome: area.nome,
          organizationId,
        },
      });

      if (!areaExistente) {
        const novaArea = await prismaClient.area.create({
          data: {
            nome: area.nome,
            descricao: area.descricao,
            organizationId,
          },
        });
        areasCriadas.push(novaArea);
      }
    }

    return areasCriadas;
  }
}

export {
  CriarAreaService,
  ListarAreasService,
  ObterAreaService,
  AtualizarAreaService,
  DeletarAreaService,
  InicializarAreasPadraoService,
};