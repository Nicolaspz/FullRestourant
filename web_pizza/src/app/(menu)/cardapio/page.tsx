'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from "@/contexts/AuthContext";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Utensils } from "lucide-react";
import { setupAPIClient } from '@/services/api';
import { toast } from 'react-toastify';

export default function TableSelection() {
  const [tableNumber, setTableNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber.trim() || isNaN(Number(tableNumber))) {
      toast.warning('Por favor, informe um número de mesa válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.get(`/mesa_verify/${tableNumber}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.data.success) {
        router.push(`/cardapio/${user?.organizationId}/${tableNumber}`);
      } else {
        toast.error(response.data.error || 'Mesa não encontrada');
      }
    } catch (error: any) {
      console.error('Erro ao verificar mesa:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao verificar mesa');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cardápio Digital
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Informe o número da mesa para continuar
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tableNumber" className="text-sm font-medium text-gray-700">
                  Número da Mesa
                </Label>
                <Input
                  type="number"
                  id="tableNumber"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ex: 5"
                  required
                  className="h-12 text-lg text-center"
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={!tableNumber.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Acessar Cardápio'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}