// components/caixa/PagamentoModal.tsx
import React, { useContext, useState } from 'react';
import { setupAPIClient } from '@/services/api'; 
import { AuthContext } from '@/contexts/AuthContext'; 
import { Fatura } from '@/types/product'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-toastify';

interface PagamentoModalProps {
  fatura: Fatura;
  onClose: () => void;
  onSuccess: () => void;
}

interface PagamentoMultiplo {
  metodo: string;
  valor: number;
  referencia: string;
}

const PagamentoModal = ({ fatura, onClose, onSuccess }: PagamentoModalProps) => {
  const [tipoPagamento, setTipoPagamento] = useState<'unico' | 'multiplo'>('unico');
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [valorPago, setValorPago] = useState(fatura?.valorTotal || 0);
  const [trocoPara, setTrocoPara] = useState('');
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const [pagamentosMultiplos, setPagamentosMultiplos] = useState<PagamentoMultiplo[]>([
    { metodo: 'dinheiro', valor: fatura?.valorTotal || 0, referencia: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const metodosPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao', label: 'Cartão Débito' },
    { value: 'multicaixa', label: 'Multicaixa' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'outro', label: 'Outro' }
  ];

  const calcularTroco = () => {
    if (metodoPagamento === 'dinheiro' && trocoPara && valorPago) {
      return parseFloat(valorPago.toString()) - parseFloat(trocoPara);
    }
    return 0;
  };

  const handleAddPagamento = () => {
    setPagamentosMultiplos([
      ...pagamentosMultiplos,
      { metodo: 'dinheiro', valor: 0, referencia: '' }
    ]);
  };

  const handleUpdatePagamento = (index: number, field: keyof PagamentoMultiplo, value: string | number) => {
    const updated = [...pagamentosMultiplos];
    updated[index][field] = value as never;
    setPagamentosMultiplos(updated);
  };

  const handleRemovePagamento = (index: number) => {
    if (pagamentosMultiplos.length > 1) {
      setPagamentosMultiplos(pagamentosMultiplos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = tipoPagamento === 'unico' 
        ? {
            metodoPagamento,
            valorPago: parseFloat(valorPago.toString()),
            ...(metodoPagamento === 'dinheiro' && trocoPara && { trocoPara: parseFloat(trocoPara) })
          }
        : {
            pagamentosMultiplos: pagamentosMultiplos.map(p => ({
              ...p,
              valor: parseFloat(p.valor.toString())
            }))
          };

      await apiClient.post(`/faturas/${fatura.id}/pagamento?organizationId=${user?.organizationId}`, payload);
      toast.success('Pagamento processado com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const totalMultiplos = pagamentosMultiplos.reduce((sum, pag) => sum + (parseFloat(pag.valor.toString()) || 0), 0);
  const diferenca = (fatura?.valorTotal || 0) - totalMultiplos;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Processar Pagamento
          </CardTitle>
          <div className="text-muted-foreground">
            Mesa {fatura?.session.mesa.number} - {formatCurrency(fatura?.valorTotal || 0)}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Tipo de Pagamento */}
          <div className="space-y-3">
            <Label className="text-base">Tipo de Pagamento</Label>
            <RadioGroup value={tipoPagamento} onValueChange={(value: 'unico' | 'multiplo') => setTipoPagamento(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unico" id="unico" />
                <Label htmlFor="unico">Pagamento Único</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiplo" id="multiplo" />
                <Label htmlFor="multiplo">Pagamento Múltiplo</Label>
              </div>
            </RadioGroup>
          </div>

          {tipoPagamento === 'unico' ? (
            /* Pagamento Único */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metodo-pagamento">Método de Pagamento</Label>
                <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPagamento.map(metodo => (
                      <SelectItem key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor-pago">
                  Valor Pago {metodoPagamento === 'dinheiro' && '(em dinheiro)'}
                </Label>
                <Input
                  id="valor-pago"
                  type="number"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
                />
              </div>

              {metodoPagamento === 'dinheiro' && (
                <div className="space-y-2">
                  <Label htmlFor="troco-para">Troco Para</Label>
                  <Input
                    id="troco-para"
                    type="number"
                    step="0.01"
                    value={trocoPara}
                    onChange={(e) => setTrocoPara(e.target.value)}
                    placeholder="Opcional"
                  />
                  {trocoPara && (
                    <div className="text-sm text-muted-foreground">
                      Troco: {formatCurrency(calcularTroco())}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Pagamento Múltiplo */
            <div className="space-y-4">
              {pagamentosMultiplos.map((pagamento, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`metodo-${index}`}>Método</Label>
                      <Select 
                        value={pagamento.metodo} 
                        onValueChange={(value) => handleUpdatePagamento(index, 'metodo', value)}
                      >
                        <SelectTrigger id={`metodo-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {metodosPagamento.map(metodo => (
                            <SelectItem key={metodo.value} value={metodo.value}>
                              {metodo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`valor-${index}`}>Valor</Label>
                      <Input
                        id={`valor-${index}`}
                        type="number"
                        step="0.01"
                        value={pagamento.valor}
                        onChange={(e) => handleUpdatePagamento(index, 'valor', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`referencia-${index}`}>Referência</Label>
                      <Input
                        id={`referencia-${index}`}
                        type="text"
                        value={pagamento.referencia}
                        onChange={(e) => handleUpdatePagamento(index, 'referencia', e.target.value)}
                        placeholder="Opcional"
                      />
                    </div>
                    
                    {pagamentosMultiplos.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemovePagamento(index)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={handleAddPagamento}
                className="w-full"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Outro Pagamento
              </Button>

              {Math.abs(diferenca) > 0.01 && (
                <Alert variant={diferenca > 0 ? "default" : "destructive"}>
                  <AlertDescription>
                    {diferenca > 0 
                      ? `Faltam: ${formatCurrency(diferenca)}`
                      : `Excesso: ${formatCurrency(Math.abs(diferenca))}`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (tipoPagamento === 'multiplo' && Math.abs(diferenca) > 0.01)}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              'Confirmar Pagamento'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PagamentoModal;