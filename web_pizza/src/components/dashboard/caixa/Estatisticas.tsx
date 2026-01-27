// components/caixa/Estatisticas.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EstatisticasData {
  totalVendas?: number;
  quantidadeFaturas?: number;
  vendasPorMetodo?: Record<string, number>;
}

interface EstatisticasProps {
  data: EstatisticasData | null;
}

const Estatisticas = ({ data }: EstatisticasProps) => {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalVendas = 0, quantidadeFaturas = 0, vendasPorMetodo = {} } = data;

  const getMetodoPagamentoIcon = (metodo: string) => {
    const icons: Record<string, string> = {
      dinheiro: '💵',
      multicaixa: '💳',
      transferencia: '📱',
      visa: '💳',
      mastercard: '💳'
    };
    return icons[metodo.toLowerCase()] || '💰';
  };

  const formatMetodoPagamento = (metodo: string) => {
    const format: Record<string, string> = {
      dinheiro: 'Dinheiro',
      multicaixa: 'Multicaixa',
      transferencia: 'Transferência',
      visa: 'Cartão Visa',
      mastercard: 'Cartão Mastercard'
    };
    return format[metodo.toLowerCase()] || metodo;
  };

  return (
    <Card className="sticky top-6">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Estatísticas do Dia
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Total em Vendas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total em Vendas</span>
            <Badge variant="secondary" className="text-xs">
              HOJE
            </Badge>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {totalVendas.toFixed(2)} Kz
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Total líquido do dia
          </div>
        </div>

        {/* Faturas Processadas */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Faturas Processadas</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {quantidadeFaturas}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            Total de faturas do dia
          </div>
        </div>

        {/* Métodos de Pagamento */}
        {vendasPorMetodo && Object.keys(vendasPorMetodo).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Por Método de Pagamento
            </div>
            <div className="space-y-2">
              {Object.entries(vendasPorMetodo).map(([metodo, valor]) => (
                <div key={metodo} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getMetodoPagamentoIcon(metodo)}</span>
                    <span className="text-sm font-medium capitalize">
                      {formatMetodoPagamento(metodo)}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">
                    {(valor as number).toFixed(2)} Kz
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Estatisticas;