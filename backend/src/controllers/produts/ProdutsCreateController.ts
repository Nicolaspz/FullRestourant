import { Request, Response } from "express";
import { ProdutsCreateServices } from "../../services/produts/ProdutsCreateServices";

const service = new ProdutsCreateServices();

class ProdutsCreateController {
  // Criar produto
  async handle(req: Request, res: Response): Promise<Response> {
    const {
      name,
      description,
      categoryId,
      organizationId,
      unit,
      isDerived,
      isIgredient
    } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ error: "Imagem (banner) não enviada." });
      }

      const { filename: banner } = req.file;

      const product = await service.execute({
        name,
       banner,
        description,
        categoryId,
        organizationId,
        unit,
        isDerived,
        isIgredient 
      });

      return res.status(201).json(product);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Deletar produto
  async deleteProduct(req: Request, res: Response): Promise<Response> {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: "ID do produto não fornecido." });
    }

    try {
      await service.deleteProduct(productId as string);
      return res.status(204).json({ message: "Produto eliminado com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Atualizar produto
  async updateProduct(req: Request, res: Response): Promise<Response> {
    const { id } = req.query;
    const {
      name,
      description,
      categoryId,
      organizationId,
      unit,
      isDerived,
      isIgredient
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID do produto não fornecido." });
    }

    try {
      let banner: string | undefined;

      if (req.file) {
        banner = req.file.filename;
      }

      await service.updateProduct(
        {
          name,
         description,
          banner: banner ?? "",
          categoryId,
          organizationId,
          unit,
          isDerived,
          isIgredient
        },
        id as string
      );

      return res.json({ message: "Produto atualizado com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ProdutsCreateController };
