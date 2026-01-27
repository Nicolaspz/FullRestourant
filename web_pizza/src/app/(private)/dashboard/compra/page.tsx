'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PurchasesTable from '@/components/dashboard/compra/PurchasesTable';

export default function PurchasesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestão de Compras</CardTitle>
              <CardDescription>
                Gerencie as compras e pedidos do seu restaurante
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PurchasesTable refreshKey={refreshKey} />
        </CardContent>
      </Card>
    </div>
  );
}