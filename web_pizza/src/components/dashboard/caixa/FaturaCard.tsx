// components/caixa/FaturaCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fatura } from '@/types/product'; 

interface FaturaCardProps {
  fatura: Fatura;
  onPagamento: () => void;
}

const FaturaCard = ({ fatura, onPagamento }: FaturaCardProps) => {
  const getStatusVariant = (status: string) => {
    const variants = {
      pendente: "destructive",
      paga: "default",
      cancelada: "secondary"
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getStatusText = (status: string) => {
    const texts = {
      pendente: 'Pendente',
      paga: 'Paga',
      cancelada: 'Cancelada'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-2 m-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {fatura.session.mesa.number}
            </span>
            <span className="font-semibold">Mesa {fatura.session.mesa.number}</span>
          </CardTitle>
          <Badge variant={getStatusVariant(fatura.status)} className="text-xs">
            {getStatusText(fatura.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 ">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate">Abertura: {new Date(fatura.criadaEm).toLocaleTimeString('pt-BR')}</span>
          </div>
          
          {fatura.pagaEm && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="truncate">Pagamento: {new Date(fatura.pagaEm).toLocaleTimeString('pt-BR')}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>{fatura.session.Order.length} pedido(s)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xl font-bold text-primary">
            {formatCurrency(fatura.valorTotal)}
          </div>
          
          {fatura.status === 'pendente' && (
            <Button onClick={onPagamento} className="gap-2" size="sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Pagar
            </Button>
          )}
          
          {fatura.status === 'paga' && fatura.metodoPagamento && (
            <div className="text-sm text-muted-foreground capitalize bg-muted px-2 py-1 rounded">
              {fatura.metodoPagamento.replace('_', ' ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FaturaCard;