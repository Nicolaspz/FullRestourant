// components/dashboard/menu/ProductGrid.tsx
'use client';

import { motion } from 'framer-motion';
import { Utensils, Plus } from 'lucide-react';
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

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  const customColors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryBg: '#eff6ff',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    borderLight: '#cbd5e1'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <motion.div
          key={product.id}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div 
            className="cursor-pointer h-full rounded-lg overflow-hidden group border hover:shadow-lg transition-all duration-300 bg-white"
            style={{ 
              borderColor: customColors.borderLight,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => onProductClick(product)}
          >
            <div className="relative aspect-video overflow-hidden">
              {product.banner ? (
                <img
                  src={`${API_BASE_URL}/tmp/${product.banner}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: customColors.primaryBg }}>
                  <Utensils className="w-12 h-12" style={{ color: customColors.primaryLight }} />
                </div>
              )}
              
              {/* Overlay com descrição */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                <p className="text-white text-sm text-center line-clamp-4">
                  {product.description || "Delicioso prato preparado com ingredientes frescos."}
                </p>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold line-clamp-1 mb-1" style={{ color: customColors.textPrimary }}>
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm line-clamp-2 mb-2" style={{ color: customColors.textSecondary }}>
                  {product.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg" style={{ color: customColors.primary }}>
                  {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
                </span>
                <button 
                  className="p-2 rounded-full border transition-colors hover:bg-blue-50"
                  style={{ borderColor: customColors.borderLight }}
                >
                  <Plus className="w-4 h-4" style={{ color: customColors.primary }} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;