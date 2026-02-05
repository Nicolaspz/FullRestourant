
import CompraService from '../../services/compra_produtos/compra_produtService';
import {Request, Response } from 'express';


class CompraProdutoController{

  async handle(req: Request, res: Response) {
  try {
    const {
      quantity,
      purchasePrice,
      salePrice_unitario,
      purchaseId,
      productId,
      productTypeId,
      organizationId // ADICIONADO
    } = req.body;

    // Validações no controller também
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID é obrigatório'
      });
    }

    const compraService = new CompraService();
    const result = await compraService.createPurchase({
      quantity,
      purchasePrice,
      salePrice_unitario,
      purchaseId,
      productId,
      productTypeId,
      organizationId // PASSADO
    });

    return res.json({
      success: true,
      message: 'Produto adicionado à compra com sucesso',
      data: result
    });

  } catch (error: any) {
    console.error('Erro ao criar compra:', error);
    
    return res.status(400).json({
      success: false,
      error: error.message || 'Erro ao processar compra'
    });
  }
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