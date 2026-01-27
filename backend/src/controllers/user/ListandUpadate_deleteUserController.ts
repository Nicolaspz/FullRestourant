import { Request, Response } from "express";
import { UserServices } from "../../services/user/listaAndDelete_Update";

class UserController {
  

  async listUsers(req: Request, res: Response) {
    const {organizationId} =req.query;
    const userService = new UserServices();
    const users = await userService.listUsers(organizationId as string);
    return res.json(users);
  }
  async listAllUsers(req: Request, res: Response) {
    const userService = new UserServices();
    const users = await userService.listAllUsers();
    return res.json(users);
  }

  async UserById(req: Request, res: Response) {
    const {id} =req.query;
    const userService = new UserServices();
    const users = await userService.UserById(id);
    return res.json(users);
  }

  async updateUser(req: Request, res: Response) {
    const {name, email, role, password } = req.body;
    const {userId} = req.query;
    const userService = new UserServices();
    const updatedUser = await userService.updateUser({
      userId,
      name,
      email,
      role,
      password,
    });
    return res.json(updatedUser);
  }

  async deleteUser(req: Request, res: Response) {
    const { userId } = req.query;
    const userService = new UserServices();
    await userService.deleteUser(userId);
    return res.json({ message: "User deleted successfully" });
  }
}

export { UserController };
