import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { setupAPIClient } from '@/services/api';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../config';

export type Product = {
    id: string;
    name: string;
    description: string;
    banner?: string;
    unit: string;
    isIgredient: boolean;
    PrecoVenda: { preco_venda: number }[];
    Category: { name: string; id: string };
    orderCount?: number;
    createdAt?: string;
    isNew?: boolean;
};

export type CartItem = {
    product: Product;
    quantity: number;
};

export const theme = {
    bg: '#121212',
    surface: '#1E1E1E',
    surfaceHighlight: '#2A2A2A',
    primary: '#FF9F1C',
    primaryDark: '#E08605',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    success: '#2EC4B6',
    danger: '#EF476F'
};

export function useKioskMenu() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [tableInput, setTableInput] = useState('');
    const [cartOpen, setCartOpen] = useState(false);

    const params = useParams();
    const organizationId = params.organizationId as string;
    const apiClient = setupAPIClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/produts', {
                    params: { organizationId }
                });

                const processed = response.data
                    .filter((p: Product) => !p.isIgredient)
                    .map((p: Product) => ({
                        ...p,
                        PrecoVenda: p.PrecoVenda || [{ preco_venda: 0 }],
                        isNew: Math.random() > 0.8
                    }));

                setProducts(processed);
                if (processed.length > 0) {
                    const cats = Array.from(new Set(processed.map((p: any) => p.Category?.name))).filter(Boolean);
                    if (cats.length > 0) setActiveCategory(cats[0] as string);
                }
            } catch (error) {
                console.error("Error fetching menu:", error);
                toast.error('Erro ao carregar cardápio');
            }
        };
        if (organizationId) fetchData();
    }, [organizationId]);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.Category?.name || 'Outros'))).sort();
        return ['Destaques', ...cats];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (activeCategory === 'Destaques') {
            return products.filter(p => p.isNew || Math.random() > 0.5);
        } else if (activeCategory !== 'all') {
            filtered = products.filter(p => (p.Category?.name || 'Outros') === activeCategory);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [products, activeCategory, searchQuery]);

    const cartTotal = useMemo(() => {
        return cart.reduce((acc, item) => {
            return acc + (item.product.PrecoVenda[0]?.preco_venda || 0) * item.quantity;
        }, 0);
    }, [cart]);

    const addToCart = (product: Product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
        setCartOpen(true);
        setSelectedProduct(null);
        toast.success('Adicionado ao pedido!', { position: 'bottom-center', theme: 'dark' });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQ = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQ };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCheckout = async () => {
        if (!tableInput) {
            setShowTableModal(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                amount: item.quantity
            }));

            await apiClient.post('/orders/with-stock', {
                tableNumber: tableInput === 'TAKEAWAY' ? 0 : Number(tableInput),
                organizationId,
                items,
                customerName: tableInput === 'TAKEAWAY' ? 'Kiosk Takeaway' : `Mesa ${tableInput}`
            });

            toast.success('Pedido enviado com sucesso! Aguarde...', {
                position: 'top-center',
                autoClose: 5000,
                theme: 'dark'
            });
            setCart([]);
            setCartOpen(false);
            setShowTableModal(false);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar pedido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        products,
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
        organizationId,
        setSearchQuery,
        setActiveCategory,
        setCartOpen,
        setSelectedProduct,
        setTableInput,
        setShowTableModal,
        addToCart,
        updateQuantity,
        handleCheckout
    };
}
