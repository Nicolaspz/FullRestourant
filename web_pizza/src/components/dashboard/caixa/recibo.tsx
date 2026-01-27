// components/dashboard/mesas/ReciboCliente.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, X, CheckCircle } from 'lucide-react';

interface ReciboClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  data: {
    mesaNumero: number;
    codigoSessao: string;
    horaAbertura: Date;
    items: Array<{
      produto: string;
      quantidade: number;
      precoUnitario: number;
      subtotal: number;
    }>;
    totalGeral: number;
    totalItens: number;
    organizacao: {
      name: string;
      address?: string;
      nif?: string;
    };
    referencia: string;
    temPedidosAbertos: boolean;
  };
}

export default function ReciboCliente({ isOpen, onClose, onConfirm, data }: ReciboClienteProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    setIsPrinting(true);
    const printContent = document.getElementById('recibo-print');
    
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Recibo Mesa ${data.mesaNumero}</title>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
                .header { text-align: center; margin-bottom: 15px; }
                .empresa { font-weight: bold; font-size: 14px; }
                .info { margin: 5px 0; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 3px 0; border-bottom: 1px dashed #000; }
                td { padding: 3px 0; }
                .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                @media print { 
                  body { margin: 0; padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="empresa">${data.organizacao.name}</div>
                ${data.organizacao.address ? `<div>${data.organizacao.address}</div>` : ''}
                ${data.organizacao.nif ? `<div>NIF: ${data.organizacao.nif}</div>` : ''}
              </div>
              
              <div class="divider"></div>
              
              <div class="info">
                <div>Mesa: ${data.mesaNumero}</div>
                <div>Código: ${data.codigoSessao.slice(0, 8)}</div>
                <div>Hora: ${formatTime(data.horaAbertura)}</div>
                <div>Ref: ${data.referencia}</div>
              </div>
              
              <div class="divider"></div>
              
              <table>
                <thead>
                  <tr>
                    <th>Qtd</th>
                    <th>Produto</th>
                    <th style="text-align: right;">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map(item => `
                    <tr>
                      <td>${item.quantidade}</td>
                      <td>${item.produto}</td>
                      <td style="text-align: right;">${formatCurrency(item.subtotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="divider"></div>
              
              <div style="text-align: right;">
                <div>Total Itens: ${data.totalItens}</div>
                <div class="total">TOTAL: ${formatCurrency(data.totalGeral)}</div>
              </div>
              
              <div class="footer">
                <div>********************************</div>
                <div>Leve este recibo ao caixa</div>
                <div>para efetuar o pagamento</div>
                <div>${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT')}</div>
              </div>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsPrinting(false);
        }, 250);
      }
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      handlePrint(); // Imprime automaticamente após confirmar
    } catch (error) {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Fechar Mesa #{data.mesaNumero}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-gray-800"
              disabled={isConfirming}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {data.temPedidosAbertos ? (
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.928-.833-2.698 0L4.406 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pedidos em Aberto!</h3>
              <p className="text-gray-600 mb-4">
                Existem pedidos não finalizados nesta mesa. 
                Finalize todos os pedidos antes de fechar a mesa.
              </p>
              <Button onClick={onClose} className="w-full">
                Voltar
              </Button>
            </div>
          ) : (
            <>
              {/* Pré-visualização do recibo */}
              <div id="recibo-print" className="bg-gray-50 p-4 rounded border mb-6 font-mono text-sm">
                <div className="text-center mb-3">
                  <div className="font-bold">{data.organizacao.name}</div>
                  {data.organizacao.address && (
                    <div className="text-xs">{data.organizacao.address}</div>
                  )}
                </div>
                
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                
                <div className="mb-2">
                  <div>Mesa: {data.mesaNumero}</div>
                  <div>Ref: {data.referencia}</div>
                  <div>Hora: {formatTime(data.horaAbertura)}</div>
                </div>
                
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                
                <div className="mb-3">
                  {data.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantidade}x {item.produto}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  {data.items.length > 3 && (
                    <div className="text-center text-gray-500">
                      ... mais {data.items.length - 3} itens
                    </div>
                  )}
                </div>
                
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                
                <div className="text-right">
                  <div className="font-bold">TOTAL: {formatCurrency(data.totalGeral)}</div>
                </div>
                
                <div className="text-center text-xs text-gray-500 mt-3">
                  Leve este recibo ao caixa
                </div>
              </div>

              {/* Informações */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-600">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(data.totalGeral)}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600">Itens</p>
                    <p className="text-lg font-bold">{data.totalItens}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-1">• Será impresso um recibo para o cliente</p>
                  <p className="mb-1">• O cliente deve levar o recibo ao caixa para pagar</p>
                  <p>• A mesa será liberada após confirmação</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex-1"
                  disabled={isConfirming || isPrinting}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isPrinting ? 'Imprimindo...' : 'Pré-visualizar'}
                </Button>
                
                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar e Imprimir
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}