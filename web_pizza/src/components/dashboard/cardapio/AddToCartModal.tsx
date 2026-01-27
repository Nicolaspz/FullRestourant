// components/menu/AddToCartModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '../../../../config'; 

interface AddToCartModalProps {
  isOpen: boolean;
  product: {
    name: string;
    banner?: string;
    PrecoVenda: { preco_venda: number }[];
  } | null;
  quantity: number;
  onClose: () => void;
  onQuantityChange: (quantity: number) => void;
  onConfirm: () => void;
}

export function AddToCartModal({
  isOpen,
  product,
  quantity,
  onClose,
  onQuantityChange,
  onConfirm
}: AddToCartModalProps) {
  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl p-6 w-full max-w-md"
        >
          <div className="flex items-center space-x-4 mb-4">
            {product.banner && (
              <img
                src={`${API_BASE_URL}/tmp/${product.banner}`}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {product.name}
              </h3>
              <p className="font-bold text-lg text-blue-600">
                {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-blue-50">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="p-2 rounded-full border border-gray-300 hover:bg-white transition-colors"
            >
              <Minus className="w-4 h-4 text-blue-600" />
            </button>
            <span className="text-2xl font-bold text-gray-900">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="p-2 rounded-full border border-gray-300 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-600" />
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Adicionar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}