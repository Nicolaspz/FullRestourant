// controllers/OrganizationController.ts
import { Request, Response } from "express";
import { OrganizationService } from "../../services/organization/OrganizationService"; 

class OrganizationController {
  

  

  async create(req: Request, res: Response) {
    const organizationService = new OrganizationService();
    try {
      const { name,address, imageLogo,nif } = req.body;
      const result = await organizationService.create( {name,address, imageLogo,nif} );
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar a organizaçoes." + error });
    }
  }

  async findById(req: Request, res: Response) {
    const organizationService = new OrganizationService();
    try {
      const { id } = req.params;
      const result = await organizationService.findById(id);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar a organização." });
    }
  }
  async findByAll(req: Request, res: Response) {
    const organizationService = new OrganizationService();
    try {
      const result = await organizationService.findByAll();
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar a organização." });
    }
  }

  async update(req: Request, res: Response) {
    const organizationService = new OrganizationService();
    try {
      const { id } = req.params;
      const { name, address, nif } = req.body;
      
      let imageLogo: string | undefined;

      if (req.file) {
        imageLogo = req.file.filename;
      }

      // Adicione logs para debug
      console.log('Dados recebidos:', { id, name, address, nif, imageLogo });

      const result = await organizationService.update(id, { 
        name, 
        address,
        nif,
        imageLogo
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Erro detalhado:', error);
      return res.status(500).json({ 
        error: "Erro ao atualizar a organização.",
        details: error.message 
      });
    }
}
  async delete(req: Request, res: Response) {
    const organizationService = new OrganizationService();
    try {
      const { id } = req.params;
      const result = await organizationService.delete(id);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar a organização." });
    }
  }
}

export { OrganizationController };
