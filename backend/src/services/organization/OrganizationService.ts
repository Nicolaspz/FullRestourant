// services/OrganizationService.ts
import prismaClient from "../../prisma";

interface OrganizationRequest {
  name: string;
  address:string;
  imageLogo?:string;
  nif?:string;
  // Outros campos relevantes para a organização
}

class OrganizationService {
  async create({ name,address,imageLogo,nif }: OrganizationRequest) {
    if(!address){
      throw new Error("email incorreto")
    }
     //verificar se o email está cadastrado na plataforma
     const OrganizationAlreadyExists= await prismaClient.organization.findFirst({
      where:{
        address
      }
    })
    if(OrganizationAlreadyExists){
      throw new Error("o email ja existe")
    }
    const organization = await prismaClient.organization.create({
      data: {
        name,
        address,
        imageLogo,
        nif,
        // Outros campos relevantes para a organização
      },
      select:{
        id:true,
        name:true
      }
    });

    return { organization };
  }

  async findById(id: string) {
    const organization = await prismaClient.organization.findUnique({
      where: {
        id,
      },
    });

    return { organization };
  }

  async findByAll() {
    const organization = await prismaClient.organization.findMany(); 

    return { organization };
  }

  async update(id: string, { name, address, nif, imageLogo }: OrganizationRequest) {
    try {
      // Verifique se a organização existe antes de atualizar
      const existingOrg = await prismaClient.organization.findUnique({
        where: { id }
      });

      if (!existingOrg) {
        throw new Error('Organização não encontrada');
      }

      const organization = await prismaClient.organization.update({
        where: { id },
        data: {
          name,
          address,
          nif,
          imageLogo: imageLogo || existingOrg.imageLogo // Mantém a imagem atual se não for fornecida nova
        },
      });
      return { organization };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error(`Falha ao atualizar organização: ${error.message}`);
    }
}

  async delete(id: string) {
    const organization = await prismaClient.organization.delete({
      where: {
        id,
      },
    });

    return { organization };
  }
}

export { OrganizationService };
