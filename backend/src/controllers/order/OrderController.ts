import { Request, Response } from "express";
import { OrderServices } from "../../services/order/OrderServices";


class OrderController{
  async handdle(req:Request, res:Response){
    const {number,name,organizationId} = req.body;
    const ServiceOrder= new OrderServices();
    const Order= await ServiceOrder.execute({number,name,organizationId});
    return res.json(Order);
  }

 
  async verify(request: Request, response: Response) {
    const ServiceOrder= new OrderServices();
    try {
     const {number} = request.params;
      const {organizationId} = request.body; // Assumindo autenticação JWT

      // Validação básica
      if (!number || isNaN(Number(number))) {
        return response.status(400).json({ error: 'Número da mesa inválido' });
      }

      // Chamar o serviço
      const tableInfo = await ServiceOrder.verifyTable({
        number: Number(number),
        organizationId
      });

      return response.json({
        success: true,
        mesa: tableInfo.mesa,
        message: 'Mesa verificada com sucesso'
      });

    } catch (error) {
      console.error('Error verifying table:', error);
      
      if (error.message === 'Mesa não encontrada.') {
        return response.status(404).json({ 
          success: false,
          error: error.message 
        });
      }

      return response.status(500).json({ 
        success: false,
        error: 'Erro interno no servidor' 
      });
    }
  }


}
export {OrderController}