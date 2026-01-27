import { motion } from "framer-motion";
import { Loader2, Utensils } from "lucide-react";

interface KioskTableModalProps {
    isOpen: boolean;
    tableInput: string;
    isSubmitting: boolean;
    onTableInputChange: (value: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

export function KioskTableModal({ isOpen, tableInput, isSubmitting, onTableInputChange, onCancel, onConfirm }: KioskTableModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1E1E1E] p-8 rounded-3xl max-w-md w-full text-center border border-gray-700"
            >
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Utensils size={32} className="text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Qual é a sua mesa?</h3>
                <p className="text-gray-400 mb-6">Informe o número da mesa para identificarmos seu pedido.</p>

                <input
                    type="text"
                    autoFocus
                    placeholder="Número da Mesa"
                    className="w-full bg-[#2A2A2A] border-2 border-gray-700 focus:border-orange-500 rounded-xl px-4 py-4 text-center text-2xl font-bold mb-6 outline-none transition-colors text-white"
                    value={tableInput}
                    onChange={e => onTableInputChange(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && onConfirm()}
                />

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-[2] bg-orange-500 hover:bg-orange-400 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
