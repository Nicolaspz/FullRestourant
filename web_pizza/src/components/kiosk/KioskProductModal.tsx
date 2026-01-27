import { motion } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import { API_BASE_URL } from "../../../config";
import { Product, theme } from "../hooks/useKioskMenu";

interface KioskProductModalProps {
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export function KioskProductModal({ product, onClose, onAddToCart }: KioskProductModalProps) {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                layoutId={product.id}
                className="relative bg-[#1E1E1E] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="h-64 md:h-80 relative">
                    {product.banner && (
                        <img
                            src={`${API_BASE_URL}/tmp/${product.banner}`}
                            className="w-full h-full object-cover"
                            alt={product.name}
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-black text-white">{product.name}</h2>
                        <span className="text-2xl font-bold text-orange-500">
                            {(product.PrecoVenda[0]?.preco_venda || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </span>
                    </div>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        {product.description || "Sem descrição disponível."}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onAddToCart(product)}
                            className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black text-xl rounded-xl transition-colors flex items-center justify-center gap-3"
                        >
                            <ShoppingCart className="fill-current" />
                            ADICIONAR AO PEDIDO
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
