import { useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from '@/services/api';
import { toast } from 'react-toastify';
import { useClientToken } from '@/types/useClientToken';

export type Product = {
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

export type CartItem = {
  product: Product;
  quantity: number;
};

export type SessionConflict = {
  isConflict: boolean;
  message: string;
  existingClientToken?: string;
  sessionId?: string;
  mesaId?: string;
};

// Funções de localStorage
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('restaurant_cart');
    if (!saved) return [];
    
    // Validação básica do JSON
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch (error) {
    console.error('Erro ao ler carrinho do localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('restaurant_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error);
    // Tenta limpar se estiver cheio
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      toast.warning('Carrinho muito grande, limpando dados antigos...');
      localStorage.removeItem('restaurant_cart');
    }
  }
};

const clearCartFromStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('restaurant_cart');
};

export const useMenu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({});
  
  // Carrinho inicializado do localStorage
  const [cart, setCart] = useState<CartItem[]>(() => getCartFromStorage());
  
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('popular');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionConflict, setSessionConflict] = useState<SessionConflict | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [shouldVerifySession, setShouldVerifySession] = useState(false);
  
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const params = useParams();

  const organizationId = user?.organizationId;
  const tableNumber = params.number as string;
  const { clientToken, isLoading: tokenLoading } = useClientToken(tableNumber);

  // Funções de cookie (mantidas para compatibilidade)
  const setCookie = (name: string, value: string, hours: number = 24) => {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setHours(expires.getHours() + hours);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  };

  const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Efeito para sincronizar carrinho com localStorage
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Funções principais
  const fetchProducts = async () => {
    try {
      if (!organizationId) {
        toast.error('Organização não encontrada');
        return;
      }

      const productsResponse = await apiClient.get('/produts', {
        params: { organizationId },
        headers: { Authorization: `Bearer ${user?.token}` }
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

  const checkToken = async () => {
    if (tokenLoading || !clientToken) return;
    if (!clientToken || clientToken === '') return;
    if (!user || !tableNumber || !organizationId) {
      toast.error('Dados incompletos para acessar o cardápio');
      return;
    }

    setIsCheckingSession(true);
    try {
      const response = await apiClient.post('/token/verify', {
        tableNumber: Number(tableNumber),
        organizationId: organizationId,
        clientToken: clientToken
      });

      if (response.data.success) {
        setSessionConflict(null);
        setShouldVerifySession(false);
      }
    } catch (error: any) {
      console.error("Erro ao verificar token:", error);
      if (error.response?.data?.code === 'SESSION_CONFLICT') {
        const { existingClientToken, sessionId, message } = error.response.data;
        setSessionConflict({
          isConflict: true,
          message: message || `A Mesa ${tableNumber} já está ocupada por outro cliente.`,
          existingClientToken,
          sessionId
        });
        toast.warning('Esta mesa já tem um pedido em andamento');
      }
    } finally {
      setIsCheckingSession(false);
    }
  };

  const generateNewToken = () => {
    if (typeof window === 'undefined' || !tableNumber) return;

    const generateNewClientToken = (): string => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 9);
      return `client_${timestamp}_${random}_new`.replace(/[^a-zA-Z0-9_]/g, '');
    };

    if (!tableNumber || tableNumber === 'TAKEAWAY') {
      const newToken = generateNewClientToken();
      setCookie('@servFixe.clientToken_generic', newToken, 24);
      window.location.reload();
    } else {
      const cookieName = `@servFixe.clientToken_mesa_${tableNumber}`;
      const newToken = generateNewClientToken();
      setCookie(cookieName, newToken, 24);
      setShouldVerifySession(true);
    }
  };

  const syncWithExistingSession = () => {
    if (!sessionConflict?.existingClientToken || !tableNumber) {
      toast.error('Não foi possível sincronizar com a sessão');
      return;
    }

    if (tableNumber === 'TAKEAWAY') {
      setCookie('@servFixe.clientToken_generic', sessionConflict.existingClientToken, 24);
    } else {
      const cookieName = `@servFixe.clientToken_mesa_${tableNumber}`;
      setCookie(cookieName, sessionConflict.existingClientToken, 24);
    }

    toast.success('Sincronizado com a sessão existente!', {
      autoClose: 2000,
      onClose: () => window.location.reload()
    });
  };

  const createNewSession = () => {
    if (!tableNumber) return;

    if (tableNumber === 'TAKEAWAY') {
      generateNewToken();
    } else {
      toast.info('Iniciando nova sessão nesta mesa...');
      const cookieName = `@servFixe.clientToken_mesa_${tableNumber}`;
      const newToken = `client_new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCookie(cookieName, newToken, 24);
      setSessionConflict(null);
      setShouldVerifySession(true);
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
      const updatedCart = existingItem 
        ? prevCart.map(item =>
            item.product.id === selectedProduct.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prevCart, { product: selectedProduct, quantity }];
      
      return updatedCart;
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

  // Função para limpar carrinho manualmente
  const clearCart = () => {
    setCart([]);
    clearCartFromStorage();
    toast.success('Carrinho limpo com sucesso!');
  };

  const submitOrder = async () => {
    if (!clientToken) {
      toast.error('Erro de identificação do cliente. Recarregue a página.');
      return;
    }

    if (!user || !tableNumber || !organizationId || cart.length === 0) {
      toast.error('Dados incompletos para fazer o pedido');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        amount: item.quantity
      }));

      const response = await apiClient.post('/orders/with-stock', {
        tableNumber: tableNumber === 'TAKEAWAY' ? 0 : Number(tableNumber),
        organizationId: organizationId,
        items,
        customerName: tableNumber === 'TAKEAWAY' ? 'Pedido Takeaway' : `Pedido Mesa ${tableNumber}`,
        clientToken: clientToken
      });

      if (response.data.success) {
        toast.success('Pedido criado com sucesso!');
        
        // Limpa carrinho e localStorage
        clearCartFromStorage();
        setCart([]);
        setShowCart(false);
      }
    } catch (error: any) {
      console.error("Error submitting order:", error);
      if (error.response?.data?.code === 'SESSION_CONFLICT') {
        const { existingClientToken, sessionId, message } = error.response.data;
        setSessionConflict({
          isConflict: true,
          message: message || `A Mesa ${tableNumber} já está ocupada por outro cliente.`,
          existingClientToken,
          sessionId
        });
        toast.warning('Esta mesa já tem um pedido em andamento');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao enviar pedido');
      }
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

  // Efeitos
  useEffect(() => {
    if (user && organizationId) {
      fetchProducts();
    }
  }, [user, organizationId]);

  useEffect(() => {
    if (!tokenLoading && clientToken && user && organizationId && tableNumber && !shouldVerifySession) {
      checkToken();
    }
  }, [tokenLoading, clientToken, user, organizationId, tableNumber, shouldVerifySession]);

  return {
    // State
    products,
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
    clientToken,
    tokenLoading,
    
    // Setters
    setShowCart,
    setSelectedProduct,
    setQuantity,
    setActiveCategory,
    setActiveTab,
    
    // Functions
    checkToken,
    syncWithExistingSession,
    createNewSession,
    addToCart,
    confirmAddToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    submitOrder,
    calculateTotal,
    getFeaturedProductsByTab,
    setSessionConflict
  };
};