'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from '@/services/api';
import { toast } from 'react-toastify';

// Components chadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Loader2, 
  Utensils,
  Star,
  TrendingUp,
  Clock,
  ChefHat,
  Table
} from "lucide-react";
import { API_BASE_URL } from '../../../../../config'; 

type Product = {
  id: string;
  name: string;
  description: string;
  banner?: string;
  unit: string;
  isIgredient: boolean;
  isDerived?: boolean;
  PrecoVenda: { preco_venda: number }[];
  Category: { name: string; id: string };
  orderCount?: number;
  createdAt?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function ProductMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('popular');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableInput, setTableInput] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const params = useParams();
  
  
  const organizationId = params.organizationId as string;
  const tableNumberFromUrl = params.tableNumber as string;

  // Verificar se temos tableNumber na URL
  const hasTableNumberInUrl = !!tableNumberFromUrl;

  // Cores personalizadas em estilo CSS
  const customColors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    primaryBg: '#eff6ff',
    primaryBgLight: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    borderLight: '#cbd5e1',
    borderMedium: '#94a3b8',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await apiClient.get('/produts', {
          params: { organizationId }
        });
        
        const processedProducts = productsResponse.data
          .filter((product: Product) => product.isIgredient === false)
          .map((product: Product, index: number) => ({
            ...product,
            PrecoVenda: product.PrecoVenda || [{ preco_venda: 0 }],
            orderCount: Math.floor(Math.random() * 100),
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
          }));
          
        setProducts(processedProducts);
        groupProductsByCategory(processedProducts);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Erro ao carregar produtos');
      }
    };

    fetchData();
  }, [organizationId]);

  // Se tem tableNumber na URL, usar ele
  useEffect(() => {
    if (hasTableNumberInUrl) {
      setTableInput(tableNumberFromUrl);
    }
  }, [hasTableNumberInUrl, tableNumberFromUrl]);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    },
    { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' }
  );

  useEffect(() => {
    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [groupedProducts]);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const groupProductsByCategory = (products: Product[]) => {
    const grouped: Record<string, Product[]> = {};
    products.forEach(product => {
      const categoryName = product.Category?.name || 'Sem Categoria';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(product);
    });
    setGroupedProducts(grouped);
    
    const firstCategory = Object.keys(grouped)[0];
    setActiveCategory(firstCategory);
  };

  const scrollToCategory = (category: string) => {
    const formattedCategory = category.replace(/\s+/g, '-');
    const element = categoryRefs.current[formattedCategory];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const addToCart = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === selectedProduct.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product: selectedProduct, quantity }];
      }
    });

    toast.success(`${quantity}x ${selectedProduct.name} adicionado ao carrinho!`);
    setSelectedProduct(null);
  };

  const updateCartItem = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const handleSubmitOrder = () => {
    if (hasTableNumberInUrl) {
      // Se já tem tableNumber na URL, enviar direto
      submitOrder();
    } else {
      // Se não tem, mostrar modal para pedir número da mesa
      setShowTableModal(true);
    }
  };

  const confirmTableNumber = () => {
    if (!tableInput.trim()) {
      toast.error('Por favor, informe o número da mesa');
      return;
    }

    // Fechar o modal e executar o submitOrder
    setShowTableModal(false);
    submitOrder();
  };

  const submitOrder = async () => {
    // Usar tableNumber da URL ou do input
    const finalTableNumber = hasTableNumberInUrl ? tableNumberFromUrl : tableInput;
    
    if (!finalTableNumber || !organizationId || cart.length === 0) {
      toast.error('Dados incompletos para enviar o pedido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        amount: item.quantity
      }));

      const response = await apiClient.post('/orders/with-stock', {
        tableNumber: finalTableNumber === 'TAKEAWAY' ? 0 : Number(finalTableNumber),
        organizationId: organizationId,
        items,
        customerName: finalTableNumber === 'TAKEAWAY' ? 'Pedido Takeaway' : `Pedido Mesa ${finalTableNumber}`
      });

      if (response.data.success) {
        toast.success('Pedido criado com sucesso!');
        setCart([]);
        setShowCart(false);
        setShowTableModal(false);
      }
    } catch (error: any) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.error || 'Erro ao enviar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.PrecoVenda[0]?.preco_venda || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getFeaturedProductsByTab = () => {
    switch (activeTab) {
      case 'popular':
        return [...products].sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0)).slice(0, 8);
      case 'recent':
        return [...products].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 8);
      case 'price':
        return [...products].sort((a, b) => (a.PrecoVenda[0]?.preco_venda || 0) - (b.PrecoVenda[0]?.preco_venda || 0)).slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-40 shadow-sm" style={{ borderColor: customColors.borderLight }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: customColors.primary }}>
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: customColors.textPrimary }}>Cardápio Digital</h1>
                <p className="text-sm font-medium" style={{ color: customColors.primary }}>
                  {hasTableNumberInUrl 
                    ? (tableNumberFromUrl === 'TAKEAWAY' ? '🍱 Takeaway' : `🪑 Mesa ${tableNumberFromUrl}`)
                    : '🔢 Informe sua mesa'
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-md"
              style={{ 
                borderColor: customColors.borderLight,
                color: customColors.primary,
                backgroundColor: 'white'
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrinho</span>
              {cart.length > 0 && (
                <span 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: customColors.primary }}
                >
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Categorias */}
          <ScrollArea className="w-full">
            <div className="flex space-x-2 py-3">
              {Object.keys(groupedProducts).map(category => (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category 
                      ? 'text-white shadow-md' 
                      : 'border hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: activeCategory === category ? customColors.primary : 'white',
                    borderColor: activeCategory === category ? customColors.primary : customColors.borderLight,
                    color: activeCategory === category ? 'white' : customColors.textSecondary
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </header>

      {/* Resto do seu código permanece igual... */}
      {/* Produtos em Destaque */}
      <section className="border-b bg-white/90" style={{ borderColor: customColors.borderLight }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: customColors.textPrimary }}>
              Destaques do Cardápio
            </h2>
            <p className="text-lg" style={{ color: customColors.primary }}>
              Os favoritos dos nossos clientes
            </p>
          </div>
          
          <div className="w-full">
            <div className="flex gap-1 p-1 rounded-lg mb-6" style={{ backgroundColor: customColors.primaryBg }}>
              {[
                { value: 'popular', label: 'Populares', icon: Star },
                { value: 'recent', label: 'Novidades', icon: Clock },
                { value: 'price', label: 'Melhor Preço', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md flex-1 transition-all ${
                      activeTab === tab.value 
                        ? 'text-white shadow-sm' 
                        : 'text-blue-600 hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === tab.value ? customColors.primary : 'transparent'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {getFeaturedProductsByTab().map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    className="cursor-pointer h-full rounded-lg border-2 border-transparent hover:shadow-md transition-all duration-200 bg-white overflow-hidden"
                    style={{ 
                      borderColor: customColors.primary,
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={() => addToCart(product)}
                  >
                    <div className="p-3 pb-0">
                      <div className="aspect-square relative rounded-lg overflow-hidden" style={{ backgroundColor: customColors.primaryBg }}>
                        {product.banner ? (
                          <img
                            src={`${API_BASE_URL}/tmp/${product.banner}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils className="w-8 h-8" style={{ color: customColors.primaryLight }} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ color: customColors.textPrimary }}>
                        {product.name}
                      </h3>
                      <p className="font-bold text-sm" style={{ color: customColors.primary }}>
                        {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu por Categoria */}
      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
          const categoryId = category.replace(/\s+/g, '-');
          return (
            <section 
              key={category}
              id={categoryId}
              ref={el => categoryRefs.current[categoryId] = el as HTMLDivElement}
              className="mb-12 scroll-mt-28"
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: customColors.textPrimary }}>
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map(product => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div 
                      className="cursor-pointer h-full rounded-lg overflow-hidden group border hover:shadow-lg transition-all duration-300 bg-white"
                      style={{ 
                        borderColor: customColors.borderLight,
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => addToCart(product)}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {product.banner ? (
                          <img
                            src={`${API_BASE_URL}/tmp/${product.banner}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: customColors.primaryBg }}>
                            <Utensils className="w-12 h-12" style={{ color: customColors.primaryLight }} />
                          </div>
                        )}
                        
                        {/* Overlay com descrição */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                          <p className="text-white text-sm text-center line-clamp-4">
                            {product.description || "Delicioso prato preparado com ingredientes frescos."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold line-clamp-1 mb-1" style={{ color: customColors.textPrimary }}>
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm line-clamp-2 mb-2" style={{ color: customColors.textSecondary }}>
                            {product.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg" style={{ color: customColors.primary }}>
                            {(product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
                          </span>
                          <button 
                            className="p-2 rounded-full border transition-colors hover:bg-blue-50"
                            style={{ borderColor: customColors.borderLight }}
                          >
                            <Plus className="w-4 h-4" style={{ color: customColors.primary }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Modal de Adicionar ao Carrinho */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div className="flex items-center space-x-4 mb-4">
                {selectedProduct.banner && (
                  <img 
                    src={`${API_BASE_URL}/tmp/${selectedProduct.banner}`}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold" style={{ color: customColors.textPrimary }}>
                    {selectedProduct.name}
                  </h3>
                  <p className="font-bold text-lg" style={{ color: customColors.primary }}>
                    {(selectedProduct.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6 p-4 rounded-lg" style={{ backgroundColor: customColors.primaryBg }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 rounded-full border transition-colors hover:bg-white"
                  style={{ borderColor: customColors.borderLight }}
                >
                  <Minus className="w-4 h-4" style={{ color: customColors.primary }} />
                </button>
                <span className="text-2xl font-bold" style={{ color: customColors.textPrimary }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-2 rounded-full border transition-colors hover:bg-white"
                  style={{ borderColor: customColors.borderLight }}
                >
                  <Plus className="w-4 h-4" style={{ color: customColors.primary }} />
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-lg border transition-colors font-medium"
                  style={{ 
                    borderColor: customColors.borderLight,
                    color: customColors.textSecondary,
                    backgroundColor: 'white'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAddToCart}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Número da Mesa */}
      <AnimatePresence>
        {showTableModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: customColors.primary }}>
                  <Table className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: customColors.textPrimary }}>
                    Informe sua Mesa
                  </h3>
                  <p className="text-sm" style={{ color: customColors.textSecondary }}>
                    Digite o número da sua mesa para finalizar o pedido
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <Input
                  type="text"
                  placeholder="Número da mesa (ex: 1, 2, 3) ou TAKEAWAY"
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  style={{ borderColor: customColors.borderLight }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      confirmTableNumber();
                    }
                  }}
                />
                <p className="text-xs mt-2" style={{ color: customColors.textSecondary }}>
                  Digite "TAKEAWAY" para pedidos de viagem
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 py-3 rounded-lg border transition-colors font-medium"
                  style={{ 
                    borderColor: customColors.borderLight,
                    color: customColors.textSecondary,
                    backgroundColor: 'white'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmTableNumber}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                  style={{ backgroundColor: customColors.primary }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Carrinho */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-50"
            style={{ boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: customColors.borderLight }}>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: customColors.textPrimary }}>Seu Pedido</h2>
                  <p className="text-sm" style={{ color: customColors.primary }}>
                    {hasTableNumberInUrl 
                      ? (tableNumberFromUrl === 'TAKEAWAY' ? 'Takeaway' : `Mesa ${tableNumberFromUrl}`)
                      : 'Mesa não informada'
                    }
                  </p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: customColors.textSecondary }} />
                </button>
              </div>

              {/* Itens */}
              <div className="flex-1 p-6 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: customColors.borderMedium }} />
                    <p className="text-lg mb-4" style={{ color: customColors.textSecondary }}>Seu carrinho está vazio</p>
                    <button 
                      className="px-6 py-2 rounded-lg border transition-colors font-medium"
                      style={{ 
                        borderColor: customColors.primary,
                        color: customColors.primary,
                        backgroundColor: 'white'
                      }}
                      onClick={() => setShowCart(false)}
                    >
                      Continuar Comprando
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div 
                        key={item.product.id} 
                        className="flex items-center justify-between p-4 rounded-lg"
                        style={{ backgroundColor: customColors.primaryBg }}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium" style={{ color: customColors.textPrimary }}>
                            {item.product.name}
                          </h3>
                          <p className="text-sm" style={{ color: customColors.textSecondary }}>
                            {(item.product.PrecoVenda[0]?.preco_venda || 0).toFixed(2)} Kz × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                            className="p-1 rounded border transition-colors hover:bg-white"
                            style={{ borderColor: customColors.borderLight }}
                          >
                            <Minus className="w-3 h-3" style={{ color: customColors.primary }} />
                          </button>
                          <span className="w-8 text-center font-medium" style={{ color: customColors.textPrimary }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                            className="p-1 rounded border transition-colors hover:bg-white"
                            style={{ borderColor: customColors.borderLight }}
                          >
                            <Plus className="w-3 h-3" style={{ color: customColors.primary }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t p-6 space-y-4" style={{ borderColor: customColors.borderLight }}>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span style={{ color: customColors.textPrimary }}>Total:</span>
                    <span style={{ color: customColors.primary }}>{calculateTotal().toFixed(2)} Kz</span>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg text-white font-semibold text-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: customColors.primary }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Finalizar Pedido'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}