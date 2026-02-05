// scripts/add-product-types.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingProductTypes() {
  console.log('🔧 Adicionando tipos de produto faltantes...');
  
  try {
    // Buscar todas as organizações
    const organizations = await prisma.organization.findMany();
    
    for (const org of organizations) {
      console.log(`\nProcessando: ${org.name}`);
      
      // Tipos padrão
      const defaultTypes = ['Alimentar', 'Bebida', 'Limpeza', 'Utensílios', 'Outros'];
      
      for (const typeName of defaultTypes) {
        const exists = await prisma.productType.findFirst({
          where: {
            tipe: typeName,
            organizationId: org.id,
          },
        });
        
        if (!exists) {
          await prisma.productType.create({
            data: {
              tipe: typeName,
              organizationId: org.id,
            },
          });
          console.log(`✅ Tipo criado: ${typeName}`);
        }
      }
      
      // Atualizar produtos existentes com tipos
      const products = await prisma.product.findMany({
        where: { organizationId: org.id },
        include: { Category: true },
      });
      
      for (const product of products) {
        // Determinar tipo baseado na categoria
        let tipoNome = 'Outros';
        
        if (product.Category?.name.toLowerCase().includes('bebida')) {
          tipoNome = 'Bebida';
        } else if (product.Category?.name.toLowerCase().includes('aliment') || 
                   product.Category?.name.toLowerCase().includes('prato') ||
                   product.Category?.name.toLowerCase().includes('entrada') ||
                   product.Category?.name.toLowerCase().includes('sobremesa')) {
          tipoNome = 'Alimentar';
        } else if (product.isIgredient) {
          tipoNome = 'Alimentar';
        }
        
        // Buscar tipo
        const productType = await prisma.productType.findFirst({
          where: {
            tipe: tipoNome,
            organizationId: org.id,
          },
        });
        
        // Atualizar purchase products com este produto
        if (productType) {
          await prisma.purchaseProduct.updateMany({
            where: {
              productId: product.id,
              organizationId: org.id,
            },
            data: {
              productTypeId: productType.id,
            },
          });
          console.log(`📦 Produto ${product.name} associado ao tipo ${tipoNome}`);
        }
      }
    }
    
    console.log('\n🎉 Tipos de produto configurados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingProductTypes();