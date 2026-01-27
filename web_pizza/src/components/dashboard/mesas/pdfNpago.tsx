import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ItemPedido {
  produto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: string;
  nomePedido: string;
  criadoEm: Date;
  items: ItemPedido[];
}

interface DadosSessao {
  mesaNumero: number;
  codigoAbertura: string;
  abertaEm: Date;
  fechadaEm: Date;
  pedidos: Pedido[];
  totalGeral: number;
}

export const gerarPDFReciboNaoPago = (dados: DadosSessao) => {
  const doc = new jsPDF();
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const horaAtual = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Função para formatar valores em Kwanzas
  const formatarKz = (valor: number): string => {
    return `${valor.toFixed(2)} Kz`;
  };
  
  // Configurações iniciais
  let yPos = 20;
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO NÃO PAGO', 105, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${dataAtual} ${horaAtual}`, 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Informações da mesa
  doc.setFont('helvetica', 'bold');
  doc.text('Informações da Mesa:', 20, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Mesa: ${dados.mesaNumero}`, 20, yPos);
  yPos += 6;
  
  doc.text(`Código de Abertura: ${dados.codigoAbertura}`, 20, yPos);
  yPos += 6;
  
  doc.text(`Abertura: ${new Date(dados.abertaEm).toLocaleString('pt-BR')}`, 20, yPos);
  yPos += 6;
  
  doc.text(`Fechamento: ${new Date(dados.fechadaEm).toLocaleString('pt-BR')}`, 20, yPos);
  yPos += 15;
  
  // Lista de pedidos
  dados.pedidos.forEach((pedido, index) => {
    // Se não couber na página, adiciona nova página
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Pedido: ${pedido.nomePedido}`, 20, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Criado em: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}`, 20, yPos);
    yPos += 8;
    
    // Tabela de itens do pedido (em Kwanzas)
    const tableData = pedido.items.map(item => [
      item.produto,
      item.quantidade.toString(),
      formatarKz(item.precoUnitario),
      formatarKz(item.subtotal)
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']],
      body: tableData,
      margin: { left: 20, right: 20 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 }
      }
    });
    
    // Atualiza posição Y após a tabela
    yPos = (doc as any).lastAutoTable.finalY + 10;
  });
  
  // Total geral
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GERAL: ${formatarKz(dados.totalGeral)}`, 105, yPos, { align: 'center' });
  yPos += 20;
  
  // Status de pagamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(192, 57, 43); // Vermelho
  doc.text('STATUS: NÃO PAGO', 105, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Preto
  doc.text('Este recibo foi gerado automaticamente após o fechamento da mesa.', 105, yPos, { align: 'center' });
  yPos += 6;
  doc.text('O pagamento deverá ser realizado na caixa.', 105, yPos, { align: 'center' });
  
  // Salvar o PDF
  const nomeArquivo = `recibo_mesa_${dados.mesaNumero}_${dataAtual.replace(/\//g, '-')}.pdf`;
  doc.save(nomeArquivo);
};