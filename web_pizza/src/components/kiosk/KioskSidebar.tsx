import { ChevronRight, Flame } from "lucide-react";
import { theme } from "../hooks/useKioskMenu";

interface KioskSidebarProps {
    categories: string[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

export function KioskSidebar({ categories, activeCategory, onSelectCategory }: KioskSidebarProps) {
    return (
        <nav className="w-24 md:w-64 flex-shrink-0 flex flex-col border-r h-full" style={{ borderColor: theme.surfaceHighlight, backgroundColor: theme.surface }}>
            <div className="p-6 flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                    <Flame size={24} className="text-black" fill="black" />
                </div>
                <h1 className="hidden md:block text-2xl font-black tracking-tighter" style={{ color: theme.text }}>
                    MENU<span style={{ color: theme.primary }}>.DIGITAL</span>
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group text-left ${activeCategory === cat ? 'bg-orange-500/10' : 'hover:bg-white/5'
                            }`}
                    >
                        <div
                            className={`w-2 h-10 rounded-full transition-all ${activeCategory === cat ? 'opacity-100' : 'opacity-0'}`}
                            style={{ backgroundColor: theme.primary }}
                        />
                        <span
                            className={`font-semibold text-lg md:text-xl transition-colors ${activeCategory === cat ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}
                        >
                            {cat}
                        </span>
                        {activeCategory === cat && <ChevronRight className="ml-auto hidden md:block" size={20} color={theme.primary} />}
                    </button>
                ))}
            </div>
        </nav>
    );
}
