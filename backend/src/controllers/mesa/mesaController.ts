import { Request, Response } from 'express';
import { MesaService } from '../../services/mesa/MesaService';

const mesaService = new MesaService();

class MesaController {
  // Criar uma nova mesa
  async Create(req: Request, res: Response) {
    const { numero, organizationId } = req.body;
    try {
      const newMesa = await mesaService.createMesa({ numero, organizationId });
      return res.status(201).json(newMesa);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Listar todas as mesas
  async getAll(req: Request, res: Response) {
    try {
      const mesas = await mesaService.getAllMesas();
      return res.status(200).json(mesas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Buscar uma mesa pelo ID
  async getById(req: Request, res: Response) {
    const { id,idcampanha } = req.params;
    try {
      const mesa = await mesaService.getMesaById(id);
      return res.status(200).json(mesa);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  // Atualizar uma mesa
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { numero, organizationId } = req.body;
    try {
      const updatedMesa = await mesaService.updateMesa(id, { numero, organizationId });
      return res.status(200).json(updatedMesa);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Excluir uma mesa
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await mesaService.deleteMesa(id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

    async getAllBYOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params; 
    const mesas = await mesaService.getAllMesasByOrganization(organizationId);
      return res.status(200).json(mesas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  
  async getMesaOpened(req: Request, res: Response) {
    try {
      const { organizationId } = req.params; 
    const mesas = await mesaService.GetmesaOpened(organizationId);
      return res.status(200).json(mesas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getMesas(req: Request, res: Response) {
    try {
      const { organizationId } = req.params; 
    const mesas = await mesaService.getmesas(organizationId);
      return res.status(200).json(mesas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
 async fecharSessao(req: Request, res: Response) {
    const { id } = req.params

    try {
      const sessao = await mesaService.fecharSessao(id)
      res.status(200).json(sessao)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  async listarSessoesPorMesa(req: Request, res: Response) {
    const { mesaId } = req.params

    try {
      const sessoes = await mesaService.listarSessoesPorMesa(mesaId)
      res.status(200).json(sessoes)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }


}

export { MesaController };
