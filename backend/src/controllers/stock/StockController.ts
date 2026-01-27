import { Request, Response } from 'express';
import {StockService}  from '../../services/stock/StockService';
const stockService= new StockService;
class StockController {
  

  async addProductToStock(req: Request, res: Response): Promise<void> {
    
    const {organizationId,purchaseId} = req.body;

    try {
      // Verifica se products e organizationId foram fornecidos
      if (!purchaseId || !organizationId) {
        res.status(400).json({ error: 'Os parâmetros products e organizationId são obrigatórios.' });
        return;
      }

      // Chama o método do serviço para adicionar produtos ao estoque
      const result = await stockService.addProductsToStock(organizationId,purchaseId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao adicionar produtos ao estoque:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao adicionar produtos ao estoque.' });
    }
  }
  async ConfirmPreco(req: Request, res: Response): Promise<void> {
    
    const {productId} = req.body;

    try {
      // Verifica se products e organizationId foram fornecidos
      if (!productId) {
        res.status(400).json({ error: 'Os parâmetros products e organizationId são obrigatórios.' });
        return;
      }

      // Chama o método do serviço para adicionar produtos ao estoque
      const result = await stockService.ConfirmPreco(productId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao adicionar produtos ao estoque:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao adicionar produtos ao estoque.' });
    }
  }

  async updateCustomPrice(req: Request, res: Response): Promise<Response> {
    const { productId, customPrice } = req.body;
  
    try {
      const result = await stockService.ConfirmPreco(productId, customPrice);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
  
      return res.json({ 
        message: result.message,
        data: result.data
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  
  async RemovProductToStock(req: Request, res: Response) {
    try {
      const { productId, quantity, organizationId } = req.body; // Certifique-se de que os dados são passados corretamente no corpo da requisição
  
      const stockService = new StockService();
      const updatedStock = await stockService.removeProductFromStock({
        productId,
        quantity,
        organizationId,
      });
  
      return res.status(200).json({ success: true, message: 'Produto removido do estoque com sucesso.', updatedStock });
    } catch (error) {
      console.error('Erro ao remover produto do estoque:', error);
      return res.status(500).json({ success: false, message: 'Erro ao remover produto do estoque.'});
    }
  }
  async AllSockByOrganization(req: Request, res: Response) {
    try {
      const stockService = new StockService();
      const {organizationId} = req.query;
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'Parâmetros inválidos.' });
      }
      const produts= await stockService.AllStockByOrganization(organizationId as string)
        return res.json(produts);
    } catch (error) {
      console.error('Erro ao adicionar produto ao estoque:', error);
      return res.status(500).json({ success: false, message: 'Erro ao adicionar produto ao estoque.' });
    }
  }
  async AllSockByCategory(req: Request, res: Response) {
    try {
      const stockService = new StockService();
      const {organizationId,categoryId} = req.query;
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'Parâmetros inválidos.' });
      }
      const produts= await stockService.AllStockByCategory(organizationId as string ,categoryId as string )
        return res.json(produts);
    } catch (error) {
      console.error('Erro ao adicionar produto ao estoque:', error);
      return res.status(500).json({ success: false, message: 'Erro ao adicionar produto ao estoque.' });
    }
  }
}

export { StockController };
