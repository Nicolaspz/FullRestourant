import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

export function KioskHighlights() {
    return (
        <div className="px-8 pb-8">
            <div className="w-full h-64 rounded-3xl overflow-hidden relative bg-gradient-to-r from-orange-600 to-red-600 flex items-center p-8 md:p-12 shadow-2xl">
                <div className="z-10 max-w-xl">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 px-3 py-1">OFERTA ESPECIAL</Badge>
                    <h3 className="text-4xl md:text-5xl font-black text-white mb-4 leading-none">
                        COMBO FAMÍLIA <br />SUPREMO
                    </h3>
                    <p className="text-white/90 text-lg mb-6">Leve 2 Pizzas Gigantes + Refrigerante com 20% de desconto!</p>
                    <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg">
                        Peça Agora
                    </button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center opacity-30 md:opacity-100">
                    <Utensils size={200} className="text-white/20 rotate-12" />
                </div>
            </div>
        </div>
    );
}
