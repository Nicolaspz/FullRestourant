// components/mesa/MesaCard.tsx - VERSÃO SIMPLIFICADA
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Calendar, X, Printer } from 'lucide-react';
import { Mesa } from "@/types/product";
import QRCodePrinter from "./QRCodePDFGenerator";

interface MesaCardProps {
  mesa: Mesa;
  user: any;
  onReservar: (mesaId: string) => void;
  onFecharMesa: (mesaId: string) => void;
}

const MesaCard = ({ mesa, user, onReservar, onFecharMesa }: MesaCardProps) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      livre: 'bg-green-100 text-green-800 hover:bg-green-100',
      ocupada: 'bg-red-100 text-red-800 hover:bg-red-100',
      reservada: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      manutencao: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // URL do cardápio para esta mesa
  const cardapioUrl = `/dashboard/cardapio/${user?.organizationId}/${mesa.number}`;
  
  return (
    <Card key={mesa.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mesa {mesa.number}
            </CardTitle>
            <CardDescription>
              Capacidade: {mesa.capacidade} pessoas
            </CardDescription>
          </div>
          <Badge className={getStatusBadge(mesa.status)}>
            {mesa.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Botão para imprimir QR Code */}
        <QRCodePrinter
          organizationId={user?.organizationId}
          mesaNumber={mesa.number}
        />
        
        {/* Informação da URL */}
        <div className="text-xs p-3 bg-gray-50 rounded-md">
          <p className="font-medium text-gray-700 mb-1">URL do Cardápio:</p>
          <p className="text-gray-600 break-all">{cardapioUrl}</p>
          <p className="text-gray-500 mt-1 text-[10px]">
            Esta URL será codificada no QR Code
          </p>
        </div>
        
        {/* Active Reservations */}
        {mesa.reservas?.filter((r: any) => r.status === 'confirmada').length > 0 && (
          <ReservasAtivas reservas={mesa.reservas} />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-3">
        {mesa.status === 'ocupada' && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onFecharMesa(mesa.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Fechar Mesa
          </Button>
        )}
        
      </CardFooter>
    </Card>
  );
};

// Subcomponente Reservas Ativas
const ReservasAtivas = ({ reservas }: any) => (
  <div className="pt-3 border-t">
    <p className="text-sm font-medium mb-1">Reservas Ativas:</p>
    {reservas.slice(0, 2).map((reserva: any) => (
      <div key={reserva.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-1">
        <p className="font-medium">{reserva.clienteNome}</p>
        <p className="text-gray-500">
          {new Date(reserva.dataReserva).toLocaleDateString()} • 
          {new Date(reserva.dataReserva).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    ))}
  </div>
);

export default MesaCard;