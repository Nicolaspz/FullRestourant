import { Request, Response } from "express";
import { ListByCategoryService } from "../../services/produts/ListByCategoryService";


class ListByCategoryController{

  async handdle(req:Request, res: Response){
    const {id_Categoria,organizationId}= req.query;
    const ListService = new ListByCategoryService();
    const listProdut= await ListService.execute({
      id_Categoria: id_Categoria as string,
      organizationId: organizationId as string,
    });

    return res.json(listProdut);

  }

  async getProdById(req:Request, res: Response){
    const {productId}= req.query;
    const ListService = new ListByCategoryService();
    const listProdut= await ListService.getProductById({
      productId: productId as string
      
    });

    return res.json(listProdut);

  }
  
}
export {ListByCategoryController};