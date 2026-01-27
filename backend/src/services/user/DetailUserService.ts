import prismaClient from "../../prisma";

interface RequestMy {
  userId: string;
}

class DetailUserService{
  async execute({userId}:RequestMy) {
   //console.log("usuarioIdService",userId)
    const user = await prismaClient.user.findFirst({
      where:{
        id:userId
      },
      select:{
        id:true,
        name:true,
        email:true,
        role:true,
        organizationId: true,
        user_name: true,
        Organization: {
          select: {
            id: true,
            address: true,
            imageLogo: true,
            nif: true,
            activeLicense: true,
            name:true,
          }
        }
        
      }

    })
    return user;
  }
}
export {DetailUserService}