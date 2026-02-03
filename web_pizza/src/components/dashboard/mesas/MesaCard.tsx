'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, X } from 'lucide-react';
import { Mesa } from "@/types/product";
import QRCodePrinter from "./QRCodePDFGenerator";

interface MesaCardProps {
  mesa: Mesa;
  user: any;
  onReservar: (mesaId: string) => void;
  onFecharMesa: (mesaId: string) => void;
  onEliminarMesa: (mesaId: string) => void;
}

const MesaCard = ({ mesa, user, onReservar, onFecharMesa, onEliminarMesa }: MesaCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const colors = {
      livre: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      ocupada: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      reservada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      manutencao: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const cardapioUrl = `/dashboard/cardapio/${user?.organizationId}/${mesa.number}`;

  const handleConfirmEliminar = () => {
    onEliminarMesa(mesa.id);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card key={mesa.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Users className="h-5 w-5" />
                Mesa {mesa.number}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Capacidade: {mesa.capacidade} pessoas
              </CardDescription>
            </div>
            <Badge className={getStatusBadge(mesa.status)}>
              {mesa.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <QRCodePrinter
            organizationId={user?.organizationId}
            mesaNumber={mesa.number}
          />

          <div className="text-xs p-3 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <p className="font-medium mb-1">URL do Cardápio:</p>
            <p className="break-all">{cardapioUrl}</p>
            <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-300">
              Esta URL será codificada no QR Code
            </p>
          </div>

          {mesa.reservas?.filter((r: any) => r.status === 'confirmada').length > 0 && (
            <ReservasAtivas reservas={mesa.reservas} />
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-3 border-gray-200 dark:border-gray-700">
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

          {mesa.status === 'livre' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Eliminar
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Modal Custom Dark Mode */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Confirmar exclusão</h2>
            <p className="mb-6">Tem certeza que deseja eliminar esta mesa?</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmEliminar}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Subcomponente Reservas Ativas
const ReservasAtivas = ({ reservas }: any) => (
  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
    <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reservas Ativas:</p>
    {reservas.slice(0, 2).map((reserva: any) => (
      <div key={reserva.id} className="text-xs p-2 rounded mb-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
        <p className="font-medium">{reserva.clienteNome}</p>
        <p className="text-gray-500 dark:text-gray-300">
          {new Date(reserva.dataReserva).toLocaleDateString()} • 
          {new Date(reserva.dataReserva).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    ))}
  </div>
);

export default MesaCard;
