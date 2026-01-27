import { Request,Response } from "express";
import { DetailUserService } from "../../services/user/DetailUserService";



class DetailUserController{
  async handle(req: Request, res: Response) {
    const userId = req.query.userId as string;

    //console.log("[DetailUserController] userId from query:", userId);

    const detailUserService = new DetailUserService();

    // Aqui, você já passa no formato esperado (como objeto, se for o caso)
    const detail = await detailUserService.execute({ userId });

    return res.json(detail);
  }

}
export {DetailUserController}