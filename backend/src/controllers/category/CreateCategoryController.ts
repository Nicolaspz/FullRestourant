import { Request, Response } from "express";
import { CategoryCreateServices } from "../../services/category/CategoryCreateServices";
class CreateCategoryController{
  async handdle(req: Request, res: Response){
    const {name,organizationId}=req.body;
    const CateService = new CategoryCreateServices();
    const category= await CateService.execute({name,organizationId});
    return res.json(category);
    
  }
  async updateCategory(req: Request, res: Response) {
    const {name} = req.body;
    const {id}=req.query;
    const CateService = new CategoryCreateServices();
    const updatedCategory = await CateService.updateCategory(name as string,id as string);
    return res.json(updatedCategory);
  }
  async deleteCategory(req: Request, res: Response) {
    const {id}=req.query;
    const CateService = new CategoryCreateServices();
    const updatedCategory = await CateService.DeleteCategory(id as string);
    return res.json("produto eliminado com sucesso");
  }
}
export {CreateCategoryController}