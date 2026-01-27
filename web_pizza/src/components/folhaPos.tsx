// components/dashboard/mesas/SimplePosReceipt.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download, X, CheckCircle, Clock, CreditCard, DollarSign } from 'lucide-react';
import { PosData } from '@/types/pos';

interface SimplePosReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  data: PosData;
  onConfirmPayment: (paymentMethod: string) => Promise<void>;
}

export default function PosReceipt({ isOpen, onClose, data, onConfirmPayment }: SimplePosReceiptProps) {
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [cashAmount, setCashAmount] = useState('');
  const [change, setChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateChange = (paid: string) => {
    const paidAmount = parseFloat(paid) || 0;
    return paidAmount - data.totalGeral;
  };

  const handleCashInput = (value: string) => {
    setCashAmount(value);
    const changeAmount = calculateChange(value);
    setChange(changeAmount > 0 ? changeAmount : 0);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      alert('Selecione um método de pagamento');
      return;
    }

    if (selectedPayment === 'dinheiro' && (!cashAmount || parseFloat(cashAmount) < data.totalGeral)) {
      alert('Valor em dinheiro insuficiente');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirmPayment(selectedPayment);
      onClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">COMPROVATIVO DE CONSUMO</h2>
              <p className="text-gray-300">
                Mesa #{data.mesaNumero} • {formatDate(data.abertaEm)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Organização */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold">{data.organizacaoInfo.name}</h3>
            {data.organizacaoInfo.address && (
              <p className="text-gray-600">{data.organizacaoInfo.address}</p>
            )}
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded border">
              <p className="text-sm text-blue-600">Total</p>
              <p className="text-lg font-bold">{formatCurrency(data.totalGeral)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded border">
              <p className="text-sm text-green-600">Itens</p>
              <p className="text-lg font-bold">{data.totalItens}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded border">
              <p className="text-sm text-yellow-600">Pedidos</p>
              <p className="text-lg font-bold">{data.estatisticas.totalPedidos}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded border">
              <p className="text-sm text-purple-600">Duração</p>
              <p className="text-lg font-bold">{data.estatisticas.duracaoMinutos} min</p>
            </div>
          </div>

          {/* Itens */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">CONSUMO</h4>
            <div className="space-y-2">
              {data.itemsAgrupados.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.produto}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Categoria: {item.categoria}</span>
                      <span>Pedido: {item.pedidoNome}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.quantidade} × {formatCurrency(item.precoUnitario)}</p>
                    <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo por Categoria */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">RESUMO POR CATEGORIA</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {data.resumoCategorias.map((cat) => (
                <div key={cat.categoria} className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm text-gray-600">{cat.categoria}</p>
                  <p className="font-bold">{formatCurrency(cat.total)}</p>
                  <p className="text-xs text-gray-500">
                    {cat.quantidadeItens} itens • {cat.percentual}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">PAGAMENTO</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {['dinheiro', 'multicaixa', 'cartao', 'transferencia'].map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedPayment(method)}
                  className={`p-3 rounded border ${
                    selectedPayment === method 
                      ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-200' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize font-medium">{method}</span>
                </button>
              ))}
            </div>

            {selectedPayment === 'dinheiro' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Valor entregue
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => handleCashInput(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="0.00"
                    step="0.01"
                    min={data.totalGeral}
                  />
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm">Troco</p>
                    <p className="font-bold text-green-600">{formatCurrency(change)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Total:</span>
                <span className="text-2xl font-bold">{formatCurrency(data.totalGeral)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing || !selectedPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-500">
          <p>Ref: {data.faturaInfo.referenciaPagamento}</p>
        </div>
      </div>
    </div>
  );
}