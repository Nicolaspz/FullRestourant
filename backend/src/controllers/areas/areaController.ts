import { Request, Response } from "express";
import {
  CriarAreaService,
  ListarAreasService,
  ObterAreaService,
  AtualizarAreaService,
  DeletarAreaService,
  InicializarAreasPadraoService,
} from "../../services/area/areaService";

// ===== CRIAR ÁREA =====
class CriarAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { nome, descricao } = req.body;
      const organizationId = req.query.organizationId as string;


      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const criarAreaService = new CriarAreaService();
      const area = await criarAreaService.execute({
        nome,
        descricao,
        organizationId,
      });

      return res.status(201).json({
        success: true,
        message: "Área criada com sucesso",
        data: area,
      });
    } catch (error: any) {
      console.error("Erro ao criar área:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao criar área",
      });
    }
  }
}

// ===== LISTAR ÁREAS =====
class ListarAreasController {
  async handle(req: Request, res: Response) {
    try {
        const organizationId = req.query.organizationId as string;


      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const listarAreasService = new ListarAreasService();
      const areas = await listarAreasService.execute(organizationId);

      return res.json({
        success: true,
        data: areas,
        count: areas.length,
      });
    } catch (error: any) {
      console.error("Erro ao listar áreas:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao listar áreas",
      });
    }
  }
}

// ===== OBTER ÁREA =====
class ObterAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.query.organizationId as string;


      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const obterAreaService = new ObterAreaService();
      const area = await obterAreaService.execute(id, organizationId);

      return res.json({
        success: true,
        data: area,
      });
    } catch (error: any) {
      console.error("Erro ao obter área:", error);
      if (error.message === "Área não encontrada") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao obter área",
      });
    }
  }
}

// ===== ATUALIZAR ÁREA =====
class AtualizarAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, descricao } = req.body;
      const organizationId = req.query.organizationId as string;


      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const atualizarAreaService = new AtualizarAreaService();
      const area = await atualizarAreaService.execute({
        id,
        nome,
        descricao,
        organizationId,
      });

      return res.json({
        success: true,
        message: "Área atualizada com sucesso",
        data: area,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar área:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao atualizar área",
      });
    }
  }
}

// ===== DELETAR ÁREA =====
class DeletarAreaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.query.organizationId as string;

      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const deletarAreaService = new DeletarAreaService();
      const result = await deletarAreaService.execute({ id, organizationId });

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Erro ao deletar área:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erro ao deletar área",
      });
    }
  }
}

// ===== INICIALIZAR ÁREAS PADRÃO =====
class InicializarAreasPadraoController {
  async handle(req: Request, res: Response) {
    try {
      const organizationId = req.query.organizationId as string;
      

      if (!organizationId) {
        return res.status(400).json({ error: "Organization ID não encontrado" });
      }

      const inicializarService = new InicializarAreasPadraoService();
      const areas = await inicializarService.execute(organizationId);

      return res.json({
        success: true,
        message: "Áreas padrão inicializadas com sucesso",
        data: areas,
        count: areas.length,
      });
    } catch (error: any) {
      console.error("Erro ao inicializar áreas padrão:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao inicializar áreas padrão",
      });
    }
  }
}

export {
  CriarAreaController,
  ListarAreasController,
  ObterAreaController,
  AtualizarAreaController,
  DeletarAreaController,
  InicializarAreasPadraoController,
};