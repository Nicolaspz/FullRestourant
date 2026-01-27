import { motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { API_BASE_URL } from "../../../config";
import { CartItem, theme } from "../hooks/useKioskMenu";

interface KioskCartDrawerProps {
    isOpen: boolean;
    cart: CartItem[];
    total: number;
    onClose: () => void;
    onUpdateQuantity: (productId: string, delta: number) => void;
    onCheckout: () => void;
}

export function KioskCartDrawer({ isOpen, cart, total, onClose, onUpdateQuantity, onCheckout }: KioskCartDrawerProps) {
    if (!isOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 shadow-2xl flex flex-col"
                style={{ backgroundColor: theme.surface, borderLeft: `1px solid ${theme.surfaceHighlight}` }}
            >
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                        <ShoppingCart className="text-orange-500" /> Seu Pedido
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                            <ShoppingCart size={64} className="opacity-20" />
                            <p>Seu carrinho está vazio.</p>
                            <button
                                onClick={onClose}
                                className="text-orange-500 font-bold hover:underline"
                            >
                                Explorar Cardápio
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="p-4 rounded-xl bg-[#252525] flex gap-4">
                                <img
                                    src={item.product.banner ? `${API_BASE_URL}/tmp/${item.product.banner}` : ''}
                                    className="w-20 h-20 rounded-lg object-cover bg-gray-800"
                                    alt={item.product.name}
                                />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold line-clamp-1 text-white">{item.product.name}</h4>
                                        <p className="text-sm text-gray-400">
                                            {(item.product.PrecoVenda[0]?.preco_venda * item.quantity).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-[#333] self-start rounded-lg p-1 text-white">
                                        <button
                                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 bg-[#151515]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400">Total a pagar</span>
                        <span className="text-3xl font-black text-orange-500">
                            {total.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </span>
                    </div>

                    <button
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-4 rounded-xl font-bold text-black text-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: theme.primary }}
                    >
                        Finalizar Pedido <ArrowRight strokeWidth={3} />
                    </button>
                </div>
            </motion.div>
        </>
    );
}
