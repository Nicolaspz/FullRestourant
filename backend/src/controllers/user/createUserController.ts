import { Request,Response, response } from "express";
import { CreateUserService } from "../../services/user/createUserService";

class CreateUserController{
  async hadle(req :Request, res: Response){
    //console.log(req.body);
    const {name, email, password,organizationId,role,telefone,user_name}= req.body;
     const createUserService =new CreateUserService();
    const user= await createUserService.execute({
      name,email,password,organizationId,role,telefone,user_name
    });
    return res.json(user);
  }
}
export {CreateUserController}