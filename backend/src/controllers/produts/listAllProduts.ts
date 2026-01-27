import { Request, Response } from "express";
import { ListByCategoryService } from "../../services/produts/ListByCategoryService";


class ListAllprodutsController{

  async handdle(req:Request, res: Response){
    const {organizationId}= req.query;
    const ListService = new ListByCategoryService();
    const listProdut= await ListService.ListAllProduts({
      organizationId: organizationId as string,
    });

    return res.json(listProdut);

  }
}
export {ListAllprodutsController};