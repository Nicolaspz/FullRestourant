import {ShoppingCart, ChefHat } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  tableNumber: string;
  cartItemCount: number;
  activeCategory: string | null;
  groupedProducts: Record<string, any[]>;
  onCartClick: () => void;
  onCategoryClick: (category: string) => void;
  isCheckingSession?: boolean;
  hasSessionConflict?: boolean;
}

export function Header({ 
  tableNumber, 
  cartItemCount, 
  activeCategory, 
  groupedProducts,
  onCartClick,
  onCategoryClick,
  isCheckingSession,
  hasSessionConflict
}: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cardápio Digital</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-blue-600">
                  {tableNumber === 'TAKEAWAY' ? '🍱 Takeaway' : `🪑 Mesa ${tableNumber}`}
                </p>
                {isCheckingSession && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Verificando...
                  </span>
                )}
                {hasSessionConflict && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    Sessão em conflito
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
  onClick={onCartClick}
  variant="outline"
  className="relative border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
>
  <ShoppingCart className="w-5 h-5 mr-2" />
  Carrinho
  {cartItemCount > 0 && (
    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
      {cartItemCount}
    </span>
  )}
</Button>
        </div>

        <ScrollArea className="w-full">
          <div className="flex space-x-2 py-3">
            {Object.keys(groupedProducts).map(category => (
              <button
                key={category}
                onClick={() => onCategoryClick(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'border border-gray-300 text-gray-600 hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </header>
  );
}