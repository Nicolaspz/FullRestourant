
import CompraService from '../../services/compra_produtos/compra_produtService';
import {Request, Response } from 'express';


class CompraProdutoController{

  async handdle( req:Request, res: Response){
      const {quantity,purchasePrice,salePrice_unitario,purchaseId,productId,productTypeId }=req.body;
      const compraservices= new CompraService();
      const listCategory= await compraservices.createPurchase({quantity,purchasePrice,salePrice_unitario,purchaseId,productId,productTypeId })
      return res.json(listCategory);
  }

  async Delete( req:Request, res: Response): Promise<void>{
    const compraservices= new CompraService();
    const {productId} = req.query;
    try {
      await compraservices.DeletePurchase(productId as string);
      res.status(204).json("Venda Eliminada eliminado");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
}
async RemuvProdu( req:Request, res: Response): Promise<void>{
  const compraservices= new CompraService();
  const {productId, purchaseId} = req.query;
  try {
    await compraservices.RemoverProdutoCompra(productId as string,purchaseId as string);
    res.status(204).json("produto removido");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
async ListaByCompra( req:Request, res: Response){
  const compraservices= new CompraService();
  const {purchaseId} = req.query;
  try {
  const produts = await compraservices.ListarProduBYCompra(purchaseId as string);
   return res.json(produts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

}
export {CompraProdutoController}