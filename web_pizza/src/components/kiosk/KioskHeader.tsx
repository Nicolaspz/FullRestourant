import { Search, ShoppingCart } from "lucide-react";
import { theme } from "../hooks/useKioskMenu";

interface KioskHeaderProps {
    activeCategory: string;
    searchQuery: string;
    cartItemCount: number;
    onSearchChange: (value: string) => void;
    onOpenCart: () => void;
}

export function KioskHeader({ activeCategory, searchQuery, cartItemCount, onSearchChange, onOpenCart }: KioskHeaderProps) {
    return (
        <header className="p-6 md:p-8 flex items-center justify-between z-10 sticky top-0 bg-gradient-to-b from-[#121212] via-[#121212] to-transparent">
            <div className="flex-1 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: theme.text }}>
                    {activeCategory === 'Destaques' ? '🔥 Recomendações do Chefe' : activeCategory}
                </h2>
                <p className="text-gray-400">Escolha os melhores pratos para o seu momento.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar pratos..."
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="bg-[#2A2A2A] border-none rounded-full py-3 pl-10 pr-6 text-white w-64 focus:ring-2 ring-orange-500 outline-none"
                    />
                </div>
                <button
                    className="relative p-4 rounded-full bg-[#2A2A2A] hover:bg-[#333] transition-colors text-white"
                    onClick={onOpenCart}
                >
                    <ShoppingCart size={24} />
                    {cartItemCount > 0 && (
                        <span className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-[#121212]">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
