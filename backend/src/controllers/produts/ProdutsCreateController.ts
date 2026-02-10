import { Request, Response } from "express";
import { ProdutsCreateServices } from "../../services/produts/ProdutsCreateServices";
import prismaClient from "../../prisma";

const service = new ProdutsCreateServices();

class ProdutsCreateController {
  // Criar produto
async handle(req: Request, res: Response): Promise<Response> {
  try {
    const {
      name,
      description,
      categoryId,
      organizationId,
      unit,
      isDerived,
      isIgredient,
      defaultAreaId,
    } = req.body;

    // Validação do organizationId
    if (!organizationId || organizationId.trim() === '') {
      return res.status(400).json({ error: "ID da organização não fornecido." });
    }

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
      isIgredient,
      defaultAreaId,
    });

    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async updateProduct(req: Request, res: Response): Promise<Response> {
  try {
    const { id, organizationId } = req.query; // Agora também recebe organizationId da query
    const {
      name,
      description,
      categoryId,
      unit,
      isDerived,
      isIgredient,
      defaultAreaId,
      existingBanner
    } = req.body;

    // Validações
    if (!id) {
      return res.status(400).json({ error: "ID do produto não fornecido." });
    }

    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não fornecido." });
    }

    // Buscar o produto atual com validação de organização
    const currentProduct = await prismaClient.product.findUnique({
      where: { 
        id: id as string,
        organizationId: organizationId as string // Valida que o produto pertence à organização
      },
      select: { banner: true }
    });

    if (!currentProduct) {
      return res.status(404).json({ 
        error: "Produto não encontrado ou não pertence a esta organização." 
      });
    }

    let banner: string = "";

    // Lógica para determinar o banner
    if (req.file) {
      // 1. Se houver NOVO arquivo, usa ele
      banner = req.file.filename;
      console.log("🔄 Usando novo banner:", banner);
    } else if (existingBanner && existingBanner.trim() !== '') {
      // 2. Se não há novo arquivo MAS veio existingBanner
      banner = existingBanner;
      console.log("💾 Mantendo banner existente do frontend:", banner);
    } else {
      // 3. Se não há nenhum dos dois, mantém o atual
      banner = currentProduct.banner || "";
      console.log("💾 Mantendo banner atual do banco:", banner);
    }

    await service.updateProduct(
      {
        name,
        description,
        banner: banner,
        categoryId,
        organizationId: organizationId as string, // Passa o organizationId validado
        unit,
        isDerived,
        isIgredient,
        defaultAreaId
      },
      id as string
    );

    return res.json({ message: "Produto atualizado com sucesso." });
  } catch (error: any) {
    console.error("❌ Erro ao atualizar produto:", error);
    
    // Tratamento de erros específicos
    if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(400).json({ error: error.message });
  }
}

async deleteProduct(req: Request, res: Response): Promise<Response> {
  try {
    console.log("🔍 DELETE Product chamado");
    console.log("📋 Query params:", req.query);

    const { productId, organizationId } = req.query;

    // Converter para string e remover espaços em branco
    const productIdStr = Array.isArray(productId) ? productId[0] : productId;
    const organizationIdStr = Array.isArray(organizationId) ? organizationId[0] : organizationId;

    console.log("📋 IDs convertidos:", { 
      productId: productIdStr, 
      organizationId: organizationIdStr 
    });

    if (!productIdStr || typeof productIdStr !== 'string' || productIdStr.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "ID do produto não fornecido.",
        message: "É necessário fornecer o ID do produto para exclusão."
      });
    }

    if (!organizationIdStr || typeof organizationIdStr !== 'string' || organizationIdStr.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "ID da organização não fornecido.",
        message: "É necessário fornecer o ID da organização."
      });
    }

    // Garantir que são strings válidas
    const cleanProductId = productIdStr.trim();
    const cleanOrganizationId = organizationIdStr.trim();

    console.log("✅ IDs limpos:", { 
      productId: cleanProductId, 
      organizationId: cleanOrganizationId 
    });

    await service.deleteProduct(cleanProductId, cleanOrganizationId);
    
    return res.status(200).json({ 
      success: true,
      message: "Produto eliminado com sucesso.",
      data: { productId: cleanProductId }
    });
    
  } catch (error: any) {
    console.error("❌ Erro ao excluir produto:", error);
    console.error("❌ Stack trace:", error.stack);
    
    // Mapeamento de erros para mensagens amigáveis
    let statusCode = 400;
    let userMessage = error.message;
    
    if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
      statusCode = 404;
      userMessage = "Produto não encontrado ou não pertence a esta organização.";
    } 
    else if (error.message.includes('estoque')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está em estoque.";
    }
    else if (error.message.includes('pedidos')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está associado a pedidos.";
    }
    else if (error.message.includes('compras')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está associado a compras.";
    }
    else if (error.message.includes('lotes')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está associado a lotes.";
    }
    else if (error.message.includes('receitas')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto é usado em receitas.";
    }
    else if (error.message.includes('economato')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está no economato.";
    }
    else if (error.message.includes('pedidos de área')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está em pedidos de área.";
    }
    else if (error.message.includes('consumo interno')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto está em consumo interno.";
    }
    else if (error.message.includes('dependências')) {
      statusCode = 409;
      userMessage = "Não é possível excluir: o produto possui dependências no sistema.";
    }
    
    return res.status(statusCode).json({ 
      success: false,
      error: error.message,
      message: userMessage
    });
  }
}
  
}

export { ProdutsCreateController };
