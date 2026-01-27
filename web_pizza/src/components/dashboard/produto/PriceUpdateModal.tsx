// components/products/PriceUpdateModal.tsx
'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, DollarSign } from "lucide-react";
import { Product } from "@/types/product";
import { api } from "@/services/apiClients";
import { toast } from "react-toastify";

interface PriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
  userToken: string;
}

export function PriceUpdateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  product, 
  userToken 
}: PriceUpdateModalProps) {
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSuggested, setUseSuggested] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      // Preencher com preço atual ou sugerido
      const suggestedPrice = product.PrecoVenda?.[0]?.precoSugerido;
      const currentPrice = product.PrecoVenda?.[0]?.preco_venda;
      
      if (suggestedPrice) {
        setCustomPrice(suggestedPrice.toString());
        setUseSuggested(true);
      } else {
        setCustomPrice(currentPrice?.toString() || '');
      }
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !customPrice || parseFloat(customPrice) <= 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Usar a mesma rota de aceitar preço, mas enviando o preço customizado
      await api.put('/price/custom', {
        productId: product.id,
        customPrice: parseFloat(customPrice)
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      toast.success('Preço atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error('Erro ao atualizar preço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSuggested = () => {
    const suggestedPrice = product?.PrecoVenda?.[0]?.precoSugerido;
    if (suggestedPrice) {
      setCustomPrice(suggestedPrice.toString());
      setUseSuggested(true);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const suggestedPrice = product.PrecoVenda?.[0]?.precoSugerido;
  const currentPrice = product.PrecoVenda?.[0]?.preco_venda;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Atualizar Preço
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-gray-900 dark:text-white">
              Produto
            </Label>
            <Input
              id="productName"
              value={product.name}
              disabled
              className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPrice" className="text-gray-900 dark:text-white">
              Preço Atual
            </Label>
            <Input
              id="currentPrice"
              value={currentPrice?.toFixed(2) || '0.00'}
              disabled
              className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {suggestedPrice && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="suggestedPrice" className="text-gray-900 dark:text-white">
                  Preço Sugerido
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseSuggested}
                  disabled={useSuggested}
                >
                  Usar Sugerido
                </Button>
              </div>
              <Input
                id="suggestedPrice"
                value={suggestedPrice.toFixed(2)}
                disabled
                className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customPrice" className="text-gray-900 dark:text-white">
              Novo Preço *
            </Label>
            <Input
              id="customPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={customPrice}
              onChange={(e) => {
                setCustomPrice(e.target.value);
                setUseSuggested(false);
              }}
              placeholder="0.00"
              required
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !customPrice || parseFloat(customPrice) <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Atualizar Preço
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}