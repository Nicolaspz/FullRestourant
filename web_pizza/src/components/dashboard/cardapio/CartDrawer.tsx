// components/menu/CartDrawer.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  isOpen: boolean;
  tableNumber: string;
  cart: Array<{
    product: {
      id: string;
      name: string;
      PrecoVenda: { preco_venda: number }[];
    };
    quantity: number;
  }>;
  total: number;
  isSubmitting: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onSubmitOrder: () => void;
}

export function CartDrawer({
  isOpen,
  tableNumber,
  cart,
  total,
  isSubmitting,
  onClose,
  onUpdateQuantity,
  onSubmitOrder
}: CartDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30 }}
          className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-50"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Seu Pedido</h2>
                <p className="text-sm text-blue-600">
                  {tableNumber === 'TAKEAWAY' ? 'Takeaway' : `Mesa ${tableNumber}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-4 text-gray-600">Seu carrinho está vazio</p>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-blue-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {(item.product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded border border-gray-300 hover:bg-white transition-colors"
                        >
                          <Minus className="w-3 h-3 text-blue-600" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded border border-gray-300 hover:bg-white transition-colors"
                        >
                          <Plus className="w-3 h-3 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-300 p-6 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">{total.toFixed(2)} Kz</span>
                </div>
                <Button
                  onClick={onSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Finalizar Pedido'
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}