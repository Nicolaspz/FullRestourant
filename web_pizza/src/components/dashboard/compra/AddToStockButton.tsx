'use client';

import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify";
import { AuthContext } from "@/contexts/AuthContext";

interface AddToStockButtonProps {
  purchaseId: string;
  onSuccess: () => void;
  status: boolean;
  organizationId: string;
}

export function AddToStockButton({ 
  purchaseId, 
  onSuccess, 
  status, 
  organizationId 
}: AddToStockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();

  const handleAddToStock = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(
        '/stock',
        {
          organizationId: organizationId,
          purchaseId: purchaseId
        },
        {
          headers: { 
            Authorization: `Bearer ${user?.token}` 
          }
        }
      );

      // Verificar se foi sucesso baseado no status
      if (response.data.status) {
        toast.success(response.data.message);
        onSuccess();
        setShowConfirm(false);
      } else {
        // Se não foi sucesso, mostrar erro
        toast.error(response.data.message);
      }
      
    } catch (error: any) {
      // Caso o erro venha do catch do axios
      const errorMessage = error.response?.data?.message || 'Não existem produtos nesta compra para adicionar ao stock';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirm = () => {
    setShowConfirm(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
  };

  const handleViewStock = () => {
    toast.info('Compra já concluída - Visualizando estoque');
  };

  if (status) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewStock}
        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Concluída
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={handleOpenConfirm}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
      >
        <Package className="w-4 h-4 mr-1" />
        Concluir Compra
      </Button>

      {/* Modal de Confirmação com shadcn/ui */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle className="text-amber-600 dark:text-amber-400">
                Confirmar Conclusão
              </DialogTitle>
            </div>
            <DialogDescription className="text-left pt-2">
              Ao concluir, estarás a enviar os produtos comprados ao stock. 
              <span className="font-semibold text-amber-600 dark:text-amber-400 block mt-1">
                Esta ação não pode ser desfeita.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Todos os produtos desta compra serão adicionados ao stock e os preços de venda serão atualizados automaticamente.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseConfirm}
              disabled={isLoading}
              className="flex-1 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddToStock}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}