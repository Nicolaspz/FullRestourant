import { motion } from "framer-motion";
import { Plus, Star, Utensils } from "lucide-react";
import { API_BASE_URL } from "../../../config";
import { Product, theme } from "../hooks/useKioskMenu";

interface KioskProductCardProps {
    product: Product;
    onSelect: (product: Product) => void;
    onAdd: (product: Product) => void;
}

export function KioskProductCard({ product, onSelect, onAdd }: KioskProductCardProps) {
    return (
        <motion.div
            layoutId={product.id}
            className="group relative overflow-hidden rounded-2xl cursor-pointer"
            style={{ backgroundColor: theme.surfaceHighlight }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onSelect(product)}
        >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800 relative">
                {product.banner ? (
                    <img
                        src={`${API_BASE_URL}/tmp/${product.banner}`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Utensils size={48} />
                    </div>
                )}
                {product.isNew && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> NOVO
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2" style={{ color: theme.text }}>
                        {product.name}
                    </h3>
                    <span className="font-bold text-lg whitespace-nowrap ml-2" style={{ color: theme.primary }}>
                        {(product.PrecoVenda[0]?.preco_venda || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </span>
                </div>
                <p className="text-sm line-clamp-2 mb-4" style={{ color: theme.textSecondary }}>
                    {product.description}
                </p>

                <button
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.primary, color: '#000' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd(product);
                    }}
                >
                    <Plus size={18} strokeWidth={3} />
                    Adicionar
                </button>
            </div>
        </motion.div>
    );
}
