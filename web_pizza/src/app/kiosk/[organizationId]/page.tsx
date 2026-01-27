'use client';

import { AnimatePresence } from 'framer-motion';
import { theme, useKioskMenu } from '@/components/hooks/useKioskMenu';

// Components
import { KioskSidebar } from '@/components/kiosk/KioskSidebar';
import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { KioskHighlights } from '@/components/kiosk/KioskHighlights';
import { KioskProductCard } from '@/components/kiosk/KioskProductCard';
import { KioskCartDrawer } from '@/components/kiosk/KioskCartDrawer';
import { KioskProductModal } from '@/components/kiosk/KioskProductModal';
import { KioskTableModal } from '@/components/kiosk/KioskTableModal';

export default function KioskMenu() {
    const {
        cart,
        categories,
        activeCategory,
        searchQuery,
        selectedProduct,
        isSubmitting,
        showTableModal,
        tableInput,
        cartOpen,
        filteredProducts,
        cartTotal,
        setSearchQuery,
        setActiveCategory,
        setCartOpen,
        setSelectedProduct,
        setTableInput,
        setShowTableModal,
        addToCart,
        updateQuantity,
        handleCheckout
    } = useKioskMenu();

    return (
        <div className="flex h-screen overflow-hidden font-sans selection:bg-orange-500 selection:text-white" style={{ backgroundColor: theme.bg, color: theme.text }}>

            <KioskSidebar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <KioskHeader
                    activeCategory={activeCategory}
                    searchQuery={searchQuery}
                    cartItemCount={cart.reduce((a, b) => a + b.quantity, 0)}
                    onSearchChange={setSearchQuery}
                    onOpenCart={() => setCartOpen(true)}
                />

                {activeCategory === 'Destaques' && !searchQuery && (
                    <KioskHighlights />
                )}

                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map(product => (
                                <KioskProductCard
                                    key={product.id}
                                    product={product}
                                    onSelect={setSelectedProduct}
                                    onAdd={addToCart}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl">Nenhum produto encontrado nesta categoria.</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                <KioskCartDrawer
                    isOpen={cartOpen}
                    cart={cart}
                    total={cartTotal}
                    onClose={() => setCartOpen(false)}
                    onUpdateQuantity={updateQuantity}
                    onCheckout={() => setShowTableModal(true)}
                />
            </AnimatePresence>

            <AnimatePresence>
                <KioskProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={addToCart}
                />
            </AnimatePresence>

            <AnimatePresence>
                <KioskTableModal
                    isOpen={showTableModal}
                    tableInput={tableInput}
                    isSubmitting={isSubmitting}
                    onTableInputChange={setTableInput}
                    onCancel={() => setShowTableModal(false)}
                    onConfirm={handleCheckout}
                />
            </AnimatePresence>
        </div>
    );
}
