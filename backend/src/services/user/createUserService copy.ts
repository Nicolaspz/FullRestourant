import prismaClient  from "../../prisma";
import { hash, compare  } from "bcryptjs";


interface UserRequest{
  name:string;
  email:string;
  password:string;
  organizationId: string;
  role: string;
  telefone: string;
  user_name: string;
}

class CreateUserService{
  async execute({name,email,password,organizationId,role,telefone,user_name}:UserRequest){
    //verificar se enviou email
    if(!email){
      throw new Error("email incorreto")
    }
    //verificar se o email está cadastrado na plataforma
    const userAlreadyExists= await prismaClient.user.findFirst({
      where:{
        telefone:telefone
      }
    })
    if(userAlreadyExists){
      throw new Error("o email ja existe")
    }

    const userAlreadyExistsUsername= await prismaClient.user.findFirst({
      where:{
        user_name: user_name,
        
      }
    })
    if(userAlreadyExistsUsername){
      throw new Error("o user_name ja existe")
    }
    //criar o user
    const passwordHas= await hash(password,8)
    const user = await prismaClient.user.create({
      data:{
         name:name,
         email:email,
         password:passwordHas,
        role: role,
        telefone,
         user_name,
         Organization: {
          connect: { id: organizationId },
        },
         
      },
      //dentro do create podemos adicionar o select para ver oque podemos retornar 
      select:{
        id:true,
        name:true,
        email:true,
        organizationId:true,
        role: true,
        password: true,
        telefone:true,
      },
      
    })
    return {user}
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    
    if (!userId || !oldPassword || !newPassword) {
      throw new Error("ID do usuário, senha atual e nova senha são obrigatórios.");
    }

    // Busca o usuário no banco de dados
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Verifica se a senha antiga está correta
    const passwordMatch = await compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new Error("Senha atual incorreta.");
    }

    // Hash da nova senha
    const passwordHashed = await hash(newPassword, 8);

    // Atualiza a senha no banco de dados
    await prismaClient.user.update({
      where: { id: userId },
      data: { password: passwordHashed },
    });

    return { message: "Senha atualizada com sucesso." };
  }
}
export {CreateUserService}
