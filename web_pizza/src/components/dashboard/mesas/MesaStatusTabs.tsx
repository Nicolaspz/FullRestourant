// components/mesa/MesaStatusTabs.tsx - ATUALIZADO
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, QrCode } from 'lucide-react';
import { Mesa } from "@/types/product"; 
import MesaCard from "./MesaCard";
import QRCodePrinter from "./QRCodePDFGenerator";
import { Button } from "@/components/ui/button";

interface MesaStatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mesas: Mesa[];
  mesasLivres: Mesa[];
  mesasOcupadas: Mesa[];
  mesasReservadas: Mesa[];
  user: any;
  onFecharMesa: (mesaId: string) => void;
  onEliminarMesa: (mesaId: string) => void;
   onGerarQRCode?: (mesaId: string, mesaNumber: number) => Promise<void>;
}

const MesaStatusTabs = ({
  activeTab,
  onTabChange,
  mesas,
  mesasLivres,
  mesasOcupadas,
  mesasReservadas,
  user,
  onFecharMesa,
   onEliminarMesa,
  onGerarQRCode
}: MesaStatusTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-5 w-full max-w-2xl">
        <TabsTrigger value="todas">
          Todas ({mesas.length})
        </TabsTrigger>
        <TabsTrigger value="livres">
          Livres ({mesasLivres.length})
        </TabsTrigger>
        <TabsTrigger value="ocupadas">
          Ocupadas ({mesasOcupadas.length})
        </TabsTrigger>
        <TabsTrigger value="reservadas">
          Reservadas ({mesasReservadas.length})
        </TabsTrigger>
        <TabsTrigger value="qr-massivo">
          QR em Massa
        </TabsTrigger>
      </TabsList>

      <TabsContent value="todas" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesas.map(mesa => (
            <MesaCard
              key={`mesa-${mesa.id}`}
              mesa={mesa}
              user={user}
              onReservar={() => {}}
              onFecharMesa={onFecharMesa}
              onEliminarMesa={onEliminarMesa}
            />
            
          ))}
        </div>
      </TabsContent>

      <TabsContent value="livres">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesasLivres.map(mesa => (
            <Card key={`livre-${mesa.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Mesa {mesa.number}
              </CardTitle>
              <CardDescription>
                Livre para {mesa.capacidade} pessoas
              </CardDescription>
            </CardHeader>

          <CardContent>
            <QRCodePrinter
              organizationId={user?.organizationId}
              mesaNumber={mesa.number}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              URL: /dashboard/cardapio/{user?.organizationId}/{mesa.number}
            </p>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Badge variant="secondary">LIVRE</Badge>

            
          </CardFooter>
          </Card>

          ))}
        </div>
      </TabsContent>

      <TabsContent value="ocupadas">
        <div className="space-y-4">
          {mesasOcupadas.map(mesa => {
            const sessionAtiva = mesa.sessions?.find((s: any) => s.status === true);
            return (
              <Card key={`ocupada-${mesa.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Mesa {mesa.number}</CardTitle>
                    <Badge variant="destructive">OCUPADA</Badge>
                  </div>
                  {sessionAtiva && (
                    <CardDescription>
                      Aberta às: {new Date(sessionAtiva.abertaEm).toLocaleTimeString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Pedidos Ativos:</p>
                      <p className="text-2xl font-bold">{sessionAtiva?.Order?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tempo:</p>
                      <p className="text-2xl font-bold">
                        {sessionAtiva ? 
                          `${Math.floor((Date.now() - new Date(sessionAtiva.abertaEm).getTime()) / 60000)}min` : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <QRCodePrinter
                    organizationId={user?.organizationId}
                    mesaNumber={mesa.number}
                  />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onFecharMesa(mesa.id)}
                  >
                    Fechar Mesa
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      {/* Nova aba para gerar QR Codes em massa */}
      <TabsContent value="qr-massivo">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Gerar QR Codes em Massa
            </CardTitle>
            <CardDescription>
              Imprima QR Codes para várias mesas de uma vez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mesasLivres.slice(0, 8).map(mesa => (
                <div key={`massivo-${mesa.id}`} className="border rounded-lg p-4 text-center">
                  <p className="font-bold text-lg">Mesa {mesa.number}</p>
                  <div className="mt-2">
                    <QRCodePrinter
                      organizationId={user?.organizationId}
                      mesaNumber={mesa.number}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Dica: Para imprimir QR Codes para todas as mesas livres, 
                clique em cada botão "Imprimir QR Code" na aba "Livres"
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MesaStatusTabs;