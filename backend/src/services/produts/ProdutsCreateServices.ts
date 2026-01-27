import prismaClient from "../../prisma";
import fs from 'fs/promises';
import path from 'path';

interface ProdutsRequest {
  name: string;
  description: string;
  banner: string;
  categoryId: string;
  organizationId: string;
  unit: string;
  isDerived: string;
  isIgredient:string;
}



class ProdutsCreateServices {
  async execute({ name,description, banner, categoryId, organizationId, unit, isDerived,isIgredient  }: ProdutsRequest) {
      
    // CONVERTER STRINGS PARA BOOLEAN
    const isDerivedBoolean = isDerived === 'true';
    const isIgredientBoolean = isIgredient === 'true';

    console.log('📥 Dados recebidos no backend:', {
      name,
      isDerived,
      isIgredient,
      converted: {
        isDerivedBoolean,
        isIgredientBoolean
      }
    });

    const createdProduct = await prismaClient.product.create({
      data: {
        name,
        description,
        banner,
        categoryId,
        organizationId,
        unit,
       isDerived: isDerivedBoolean, // Usar o boolean convertido
        isIgredient: isIgredientBoolean
      },
      select: {
        id: true,
        name: true,
        description: true,
        banner: true,
        categoryId: true,
        organizationId: true,
        unit: true,
        isDerived: true,
      }
    });

    return createdProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    const productInStock = await prismaClient.stock.findFirst({ where: { productId } });

    if (productInStock) {
      throw new Error('O produto não pode ser removido, pois está no estoque.');
    }

    const productInOrder = await prismaClient.order.findFirst({
      where: {
        items: { some: { productId } },
      },
    });

    if (productInOrder) {
      throw new Error('O produto não pode ser removido, pois está associado a uma mesa.');
    }

    const productToDelete = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (productToDelete) {
      await prismaClient.product.delete({ where: { id: productId } });

      const filePath = path.join(__dirname, '../../tmp', productToDelete.banner);
      try {
        await fs.unlink(filePath);
      } catch (error: any) {
        console.error(`Erro ao excluir o arquivo do produto: ${error.message}`);
      }
    }
  }

  async updateProduct({ name,description, banner, categoryId, organizationId, unit, isDerived,isIgredient }: ProdutsRequest, productId: string): Promise<void> {
    
    const isDerivedBoolean = isDerived === 'true';
    const isIgredientBoolean = isIgredient === 'true';
    const existingProduct = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }

    await prismaClient.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        banner,
        categoryId,
        organizationId,
        unit,
        isDerived:isDerivedBoolean,
        isIgredient:isIgredientBoolean
      },
    });
  }


}

export { ProdutsCreateServices };
