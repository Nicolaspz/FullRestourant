
import CompraService from "../../services/compra/CompraService";
import {Request, Response } from 'express';


class CompraController{

  async handdle( req:Request, res: Response){
      const {name,description,qtdCompra,organizationId,SupplierId} =req.body;
      const compraservices= new CompraService();
    const listCategory= await compraservices.createPurchase({name,description,qtdCompra,organizationId,SupplierId});
    return res.json(listCategory);
  }

  async Delete( req:Request, res: Response): Promise<void>{
    const compraservices= new CompraService();
    const {purshaseId} = req.query;
    try {
      await compraservices.deletePurchase(purshaseId as string);
      res.status(204).json("Venda Eliminada eliminado");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
}
async GetAll( req:Request, res: Response){
  const compraservices= new CompraService();
  const { organizationId } = req.query;
  
  try {
    const  compra =await compraservices.getAllCompras(organizationId as string);
     return res.json(compra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

}
export {CompraController}