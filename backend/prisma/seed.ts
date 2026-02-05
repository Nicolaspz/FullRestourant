import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const simpleSeed = async () => {
  console.log('🌱 Seed simples iniciado...');
  console.log('📝 Conectando ao banco de dados...');

  try {
    // 1. Verificar conexão com banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // 2. Criar organização básica
    console.log('🏢 Criando organização...');
    const org = await prisma.organization.create({
      data: {
        name: 'Meu Restaurante Novo', // Mudei o nome para evitar conflito
        address: 'Endereço exemplo',
        activeLicense: true,
      },
    });
    console.log(`✅ Organização criada: ${org.name} (ID: ${org.id})`);

    // 3. Criar usuário admin
    console.log('👤 Criando usuário admin...');
    const hashedPass = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Administrador Sistema',
        user_name: 'admin',
        telefone: '900000001',
        email: 'admin@email.com',
        role: 'Admin',
        password: hashedPass,
        organizationId: org.id,
      },
    });
    console.log(`✅ Usuário criado: ${user.name} (Telefone: ${user.telefone})`);

    // 4. Criar áreas mínimas
    console.log('📍 Criando áreas...');
    const areas = ['Cozinha', 'Bar', 'Armazém'];
    const createdAreas = [];
    
    for (const areaName of areas) {
      const area = await prisma.area.create({
        data: {
          nome: areaName,
          organizationId: org.id,
          descricao: `Área ${areaName}`,
        },
      });
      createdAreas.push(area);
      console.log(`✅ Área criada: ${area.nome} (ID: ${area.id})`);
    }

    // 5. Criar categoria básica
    console.log('📁 Criando categoria...');
    const category = await prisma.category.create({
      data: {
        name: 'Bebidas',
        organizationId: org.id,
      },
    });
    console.log(`✅ Categoria criada: ${category.name}`);

    // 6. Criar produto básico
    console.log('📦 Criando produto...');
    const product = await prisma.product.create({
      data: {
        name: 'Coca-Cola',
        description: 'Refrigerante Coca-Cola',
        banner: 'coca.jpg',
        unit: 'unidade',
        categoryId: category.id,
        organizationId: org.id,
        isDerived: false,
        isIgredient: false,
        defaultAreaId: createdAreas.find(a => a.nome === 'Bar')?.id,
      },
    });
    console.log(`✅ Produto criado: ${product.name}`);

    // 7. Criar preço do produto
    console.log('💰 Definindo preço...');
    await prisma.precoVenda.create({
      data: {
        productId: product.id,
        preco_venda: 500,
        data_inicio: new Date(),
      },
    });
    console.log('✅ Preço definido: 500 Kz');

    // 8. Criar 5 mesas
    console.log('🪑 Criando mesas...');
    for (let i = 1; i <= 5; i++) {
      const mesa = await prisma.mesa.create({
        data: {
          number: i,
          organizationId: org.id,
          capacidade: i <= 3 ? 4 : 6,
          status: 'livre',
        },
      });
      console.log(`✅ Mesa criada: ${mesa.number} (Capacidade: ${mesa.capacidade})`);
    }

    // 9. Criar fornecedor
    console.log('🏭 Criando fornecedor...');
    await prisma.supplier.create({
      data: {
        name: 'Fornecedor Principal',
        contact: '923456789',
        organizationId: org.id,
      },
    });
    console.log('✅ Fornecedor criado');

    console.log('\n🎉🎉🎉 SEED COMPLETADO COM SUCESSO! 🎉🎉🎉');
    console.log('\n📋 RESUMO:');
    console.log(`   🏢 Organização: ${org.name}`);
    console.log(`   👤 Usuário Admin: ${user.name}`);
    console.log(`   📞 Telefone para login: ${user.telefone}`);
    console.log(`   🔑 Senha: admin123`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   📍 Áreas criadas: ${areas.length}`);
    console.log(`   🍺 Produto exemplo: ${product.name} - 500 Kz`);
    console.log(`   🪑 Mesas: 5 mesas`);
    console.log('\n🚀 Sistema pronto para uso!');

  } catch (error: any) {
    console.error('\n❌❌❌ ERRO DURANTE O SEED:', error);
    console.error('Mensagem:', error.message);
    console.error('Código:', error.code);
    console.error('Stack:', error.stack);
    
    // Verificar se é erro de constraint única
    if (error.code === 'P2002') {
      console.error('\n⚠️  Erro de duplicidade. Talvez os dados já existam.');
      console.error('Tente mudar o nome da organização ou telefone do usuário.');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado do banco de dados');
  }
};

// Executar com tratamento de erros
simpleSeed()
  .then(() => {
    console.log('\n✨ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 ERRO FATAL!');
    process.exit(1);
  });