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
  try {
    const { name } = req.body;
    const { id, id_organization } = req.query;
    
    // Validações
    if (!id) {
      return res.status(400).json({ error: "ID da categoria não fornecido" });
    }
    
    if (!id_organization) {
      return res.status(400).json({ error: "ID da organização não fornecido" });
    }
    
    const CateService = new CategoryCreateServices();
    const updatedCategory = await CateService.updateCategory(
      name as string, 
      id as string, 
      id_organization as string
    );
    
    return res.json(updatedCategory);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

async deleteCategory(req: Request, res: Response) {
  try {
    const { id, id_organization } = req.query;
    
    // Validações
    if (!id) {
      return res.status(400).json({ error: "ID da categoria não fornecido" });
    }
    
    if (!id_organization) {
      return res.status(400).json({ error: "ID da organização não fornecido" });
    }
    
    const CateService = new CategoryCreateServices();
    await CateService.DeleteCategory(id as string, id_organization as string);
    
    return res.json({ message: "Categoria eliminada com sucesso" });
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}
}
export {CreateCategoryController}