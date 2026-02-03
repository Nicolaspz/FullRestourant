// components/mesa/QRCodePrinter.tsx
'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Printer, Loader2, QrCode } from 'lucide-react';

interface QRCodePrinterProps {
  organizationId: string;
  mesaNumber: number;
}

const QRCodePrinter = ({ 
  organizationId, 
  mesaNumber
}: QRCodePrinterProps) => {
  const [generating, setGenerating] = useState(false);
  
  // Função para gerar e imprimir o PDF
  const generateAndPrintPDF = async () => {
    try {
      setGenerating(true);
      
      // URL completa do cardápio
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const cardapioUrl = `${baseUrl}/menu/${organizationId}/${mesaNumber}`;
      
      // Gerar QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(cardapioUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Título
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QR CODE DA MESA', pageWidth / 2, 25, { align: 'center' });
      
      // Número da mesa
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`MESA ${mesaNumber}`, pageWidth / 2, 35, { align: 'center' });
      
      // QR Code (centrado)
      const qrSize = 70;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = 45;
      
      pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // Instruções
      pdf.setFontSize(14);
      pdf.text('COMO USAR:', 20, 130);
      
      pdf.setFontSize(11);
      const instructions = [
        '1. Cole este QR Code na mesa',
        '2. Cliente escaneia com a câmera do celular',
        '3. Acessa o cardápio automaticamente',
        '4. Não precisa digitar número da mesa'
      ];
      
      instructions.forEach((instruction, index) => {
        pdf.text(instruction, 25, 140 + (index * 7));
      });
      
      // URL para referência
      pdf.setFontSize(10);
      pdf.text('URL:', 20, 175);
      pdf.setFontSize(9);
      
      // Quebrar URL se for muito longa
      const urlLines = pdf.splitTextToSize(cardapioUrl, 170);
      pdf.text(urlLines, 20, 180);
      
      // Data
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      // Nome do arquivo
      const fileName = `qr-code-mesa-${mesaNumber}.pdf`;
      
      // Abrir em nova janela para visualização
      const pdfDataUri = pdf.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>QR Code Mesa ${mesaNumber}</title>
              <style>
                body { margin: 0; padding: 20px; background: #f5f5f5; }
                iframe { width: 100%; height: calc(100vh - 40px); border: none; }
                .actions { 
                  position: fixed; 
                  top: 10px; 
                  right: 10px; 
                  z-index: 1000;
                  background: white;
                  padding: 10px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                button {
                  padding: 8px 16px;
                  background: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-left: 10px;
                }
                button:hover { background: #2563eb; }
              </style>
            </head>
            <body>
              <div class="actions">
                <button onclick="window.print()">🖨️ Imprimir</button>
                <button onclick="window.close()">✕ Fechar</button>
              </div>
              <iframe src="${pdfDataUri}"></iframe>
            </body>
          </html>
        `);
      }
      
      // Também baixa automaticamente
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div>
      <Button 
        onClick={generateAndPrintPDF}
        disabled={generating}
        className="w-full"
        variant="outline"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir QR Code
          </>
        )}
      </Button>
    </div>
  );
};

export default QRCodePrinter;