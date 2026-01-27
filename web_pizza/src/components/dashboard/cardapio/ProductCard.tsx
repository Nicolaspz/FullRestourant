// components/menu/ProductCard.tsx
import { motion } from 'framer-motion';
import { Utensils, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../../../config'; 

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    banner?: string;
    PrecoVenda: { preco_venda: number }[];
  };
  onAddToCart: () => void;
  variant?: 'grid' | 'featured';
}

export function ProductCard({ product, onAddToCart, variant = 'grid' }: ProductCardProps) {
  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className="cursor-pointer h-full rounded-lg border-2 border-transparent hover:shadow-md transition-all duration-200 bg-white overflow-hidden"
          onClick={onAddToCart}
        >
          <div className="p-3 pb-0">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-blue-50">
              {product.banner ? (
                <img
                  src={`${API_BASE_URL}/tmp/${product.banner}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Utensils className="w-8 h-8 text-blue-400" />
                </div>
              )}
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-900">
              {product.name}
            </h3>
            <p className="font-bold text-sm text-blue-600">
              {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <div
        className="cursor-pointer h-full rounded-lg overflow-hidden group border border-gray-300 hover:shadow-lg transition-all duration-300 bg-white"
        onClick={onAddToCart}
      >
        <div className="relative aspect-video overflow-hidden">
          {product.banner ? (
            <img
              src={`${API_BASE_URL}/tmp/${product.banner}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              <Utensils className="w-12 h-12 text-blue-400" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <p className="text-white text-sm text-center line-clamp-4">
              {product.description || "Delicioso prato preparado com ingredientes frescos."}
            </p>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1 mb-1 text-gray-900">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm line-clamp-2 mb-2 text-gray-600">
              {product.description}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-600">
              {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
            </span>
            <button className="p-2 rounded-full border border-gray-300 hover:bg-blue-50 transition-colors">
              <Plus className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}