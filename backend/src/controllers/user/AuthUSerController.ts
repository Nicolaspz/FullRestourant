import { AuthUserService } from "../../services/user/AuthUserServices";
import { Response,Request } from "express";

class AuthUserController{
  async handle(req: Request, res: Response) {
    const { credential, password } = req.body; // Altera para 'credential'
    const authService = new AuthUserService();

    try {
      const auth = await authService.execute({ credential, password });
      return res.json(auth);
    } catch (error) {
      return res.status(400).json({ error: error.message }); // Retorna erro com status 400
    }
  }
  
  
}
export {AuthUserController};