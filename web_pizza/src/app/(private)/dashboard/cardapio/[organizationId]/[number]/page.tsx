// app/menu/page.tsx (ou onde estiver seu componente principal)
'use client';

import { useMenu } from '@/components/hooks/useMenu'; 
import { Header } from '@/components/dashboard/cardapio/Header'; 
import { SessionConflictModal } from '@/components/dashboard/cardapio/SessionConflictModal'; 
import { FeaturedProducts } from '@/components/dashboard/cardapio/FeaturedProducts'; 
import { CategorySection } from '@/components/dashboard/cardapio/CategorySection'; 
import { AddToCartModal } from '@/components/dashboard/cardapio/AddToCartModal'; 
import { CartDrawer } from '@/components/dashboard/cardapio/CartDrawer'; 

export default function ProductMenu() {
  const {
    // State
    groupedProducts,
    cart,
    showCart,
    selectedProduct,
    quantity,
    activeCategory,
    activeTab,
    isSubmitting,
    sessionConflict,
    isCheckingSession,
    tableNumber,
    
    // Setters
    setShowCart,
    setSelectedProduct,
    setQuantity,
    setActiveCategory,
    setActiveTab,
    setSessionConflict,
    
    // Functions
    syncWithExistingSession,
    createNewSession,
    addToCart,
    confirmAddToCart,
    updateCartItem,
    submitOrder,
    calculateTotal,
    getFeaturedProductsByTab
  } = useMenu();

  const scrollToCategory = (category: string) => {
    const formattedCategory = category.replace(/\s+/g, '-');
    const element = document.getElementById(formattedCategory);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <Header
        tableNumber={tableNumber}
        cartItemCount={cart.reduce((total, item) => total + item.quantity, 0)}
        activeCategory={activeCategory}
        groupedProducts={groupedProducts}
        onCartClick={() => setShowCart(true)}
        onCategoryClick={scrollToCategory}
        isCheckingSession={isCheckingSession}
        hasSessionConflict={!!sessionConflict?.isConflict}
      />

      {/* Modal de Conflito de Sessão */}
      <SessionConflictModal
        isOpen={!!sessionConflict?.isConflict}
        conflict={sessionConflict}
        tableNumber={tableNumber}
        onClose={() => setSessionConflict(null)}
        onSync={syncWithExistingSession}
        onCreateNew={createNewSession}
      />

      {/* Produtos em Destaque */}
      <FeaturedProducts
        products={getFeaturedProductsByTab()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddToCart={addToCart}
      />

      {/* Menu por Categoria */}
      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <CategorySection
            key={category}
            category={category}
            products={products}
            onAddToCart={addToCart}
          />
        ))}
      </div>

      {/* Modal de Adicionar ao Carrinho */}
      <AddToCartModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        quantity={quantity}
        onClose={() => setSelectedProduct(null)}
        onQuantityChange={setQuantity}
        onConfirm={confirmAddToCart}
      />

      {/* Carrinho */}
      <CartDrawer
        isOpen={showCart}
        tableNumber={tableNumber}
        cart={cart}
        total={calculateTotal()}
        isSubmitting={isSubmitting}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateCartItem}
        onSubmitOrder={submitOrder}
      />
    </div>
  );
}