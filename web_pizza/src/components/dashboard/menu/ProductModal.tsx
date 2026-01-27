// components/dashboard/cardapio/ProductModal.tsx
'use client';

import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../../config'; 

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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
}

const ProductModal = ({ product, isOpen, onClose, onConfirm }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const customColors = {
    primary: '#2563eb',
    primaryBg: '#eff6ff',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    borderLight: '#cbd5e1'
  };

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    onConfirm(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
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
            <h3 className="text-lg font-bold" style={{ color: customColors.textPrimary }}>
              {product.name}
            </h3>
            <p className="font-bold text-lg" style={{ color: customColors.primary }}>
              {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg" style={{ backgroundColor: customColors.primaryBg }}>
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-2 rounded-full border transition-colors hover:bg-white"
            style={{ borderColor: customColors.borderLight }}
          >
            <Minus className="w-4 h-4" style={{ color: customColors.primary }} />
          </button>
          <span className="text-2xl font-bold" style={{ color: customColors.textPrimary }}>{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="p-2 rounded-full border transition-colors hover:bg-white"
            style={{ borderColor: customColors.borderLight }}
          >
            <Plus className="w-4 h-4" style={{ color: customColors.primary }} />
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border transition-colors font-medium"
            style={{ 
              borderColor: customColors.borderLight,
              color: customColors.textSecondary,
              backgroundColor: 'white'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: customColors.primary }}
          >
            Adicionar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductModal;