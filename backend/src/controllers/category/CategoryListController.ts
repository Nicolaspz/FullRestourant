import { CategoryListService } from "../../services/category/ListCategoryService";
import {Request, Response } from 'express';
import { OrganizationController } from "../organization/OrganizationController";

class CategoryListController{

  async handdle( req:Request, res: Response){
      const {organizationId} =req.query;
    const serviceList= new CategoryListService();
    const listCategory= await serviceList.execute({organizationId:organizationId as string});
    return res.json(listCategory);
  }


}
export {CategoryListController}