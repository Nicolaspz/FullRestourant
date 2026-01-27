// components/dashboard/menu/CartSidebar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { setupAPIClient } from '@/services/api';
import { toast } from 'react-toastify';
import { useClientToken } from '@/types/useClientToken'; 

interface Product {
  id: string;
  name: string;
  description: string;
  banner?: string;
  unit: string;
  isIgredient: boolean;
  isDerived?: boolean;
  PrecoVenda: { preco_venda: number }[];
  Category: { name: string; id: string };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string;
  onUpdateItem: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  total: number;
  organizationId: string;
  user: any;
}

const CartSidebar = ({
  isOpen,
  onClose,
  cart,
  tableNumber,
  onUpdateItem,
  onRemoveItem,
  total,
  organizationId,
  user
}: CartSidebarProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientToken = useClientToken();
  const apiClient = setupAPIClient();

  const customColors = {
    primary: '#2563eb',
    primaryBg: '#eff6ff',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    borderLight: '#cbd5e1'
  };

  const submitOrder = async () => {
    if (!user || !tableNumber || !organizationId || cart.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        amount: item.quantity
      }));

      const response = await apiClient.post('/orders/with-stock', {
        tableNumber: tableNumber === 'TAKEAWAY' ? 0 : Number(tableNumber),
        organizationId: organizationId,
        items,
        customerName: tableNumber === 'TAKEAWAY' ? 'Pedido Takeaway' : `Pedido Mesa ${tableNumber}`,
        clientToken: clientToken // ← ENVIANDO O CLIENT TOKEN
      });

      if (response.data.success) {
        toast.success('Pedido criado com sucesso!');
        // Limpar carrinho localmente
        cart.forEach(item => onRemoveItem(item.product.id));
        onClose();
      }
    } catch (error: any) {
      console.error("Error submitting order:", error);
      const errorMessage = error.response?.data?.error || 'Erro ao enviar pedido';
      
      if (errorMessage.includes('já está ocupada')) {
        toast.error('Esta mesa já está sendo usada por outro cliente. Por favor, espere ou escolha outra mesa.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30 }}
          className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-50"
          style={{ boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: customColors.borderLight }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: customColors.textPrimary }}>Seu Pedido</h2>
                <p className="text-sm" style={{ color: customColors.primary }}>
                  {tableNumber === 'TAKEAWAY' ? 'Takeaway' : `Mesa ${tableNumber}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: customColors.textSecondary }} />
              </button>
            </div>

            {/* Itens */}
            <div className="flex-1 p-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: customColors.borderLight }} />
                  <p className="text-lg mb-4" style={{ color: customColors.textSecondary }}>Seu carrinho está vazio</p>
                  <button 
                    className="px-6 py-2 rounded-lg border transition-colors font-medium"
                    style={{ 
                      borderColor: customColors.primary,
                      color: customColors.primary,
                      backgroundColor: 'white'
                    }}
                    onClick={onClose}
                  >
                    Continuar Comprando
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div 
                      key={item.product.id} 
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: customColors.primaryBg }}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: customColors.textPrimary }}>
                          {item.product.name}
                        </h3>
                        <p className="text-sm" style={{ color: customColors.textSecondary }}>
                          {(item.product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateItem(item.product.id, item.quantity - 1)}
                          className="p-1 rounded border transition-colors hover:bg-white"
                          style={{ borderColor: customColors.borderLight }}
                        >
                          <Minus className="w-3 h-3" style={{ color: customColors.primary }} />
                        </button>
                        <span className="w-8 text-center font-medium" style={{ color: customColors.textPrimary }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateItem(item.product.id, item.quantity + 1)}
                          className="p-1 rounded border transition-colors hover:bg-white"
                          style={{ borderColor: customColors.borderLight }}
                        >
                          <Plus className="w-3 h-3" style={{ color: customColors.primary }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t p-6 space-y-4" style={{ borderColor: customColors.borderLight }}>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span style={{ color: customColors.textPrimary }}>Total:</span>
                  <span style={{ color: customColors.primary }}>{total.toFixed(2)} Kz</span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg text-white font-semibold text-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: customColors.primary }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Finalizar Pedido'
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;