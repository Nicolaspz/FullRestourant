'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Components chadcn/ui
import { 
  Utensils,
  ChefHat,
  MapPin,
  Phone,
  Clock,
  Share2
} from "lucide-react";

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

interface ProductMenuPublicProps {
  organizationId: string;
}

export default function ProductMenuPublic({ organizationId }: ProductMenuPublicProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<any>(null);
  
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Cores personalizadas
  const customColors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    primaryBg: '#eff6ff',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    borderLight: '#cbd5e1',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar produtos da organização
        const productsResponse = await fetch(`/api/products?organizationId=${organizationId}`);
        const productsData = await productsResponse.json();
        
        const processedProducts = productsData
          .filter((product: Product) => product.isIgredient === false)
          .map((product: Product) => ({
            ...product,
            PrecoVenda: product.PrecoVenda || [{ preco_venda: 0 }],
          }));

        setProducts(processedProducts);
        groupProductsByCategory(processedProducts);

        // Buscar informações da organização
        const orgResponse = await fetch(`/api/organizations/${organizationId}`);
        const orgData = await orgResponse.json();
        setOrganizationInfo(orgData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Erro ao carregar cardápio');
      }
    };

    fetchData();
  }, [organizationId]);

  useEffect(() => {
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

    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [groupedProducts]);

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

  const shareMenu = () => {
    if (navigator.share) {
      navigator.share({
        title: `Cardápio - ${organizationInfo?.name || 'Estabelecimento'}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      {/* Header com informações do estabelecimento */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-40 shadow-sm" style={{ borderColor: customColors.borderLight }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: customColors.primary }}>
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: customColors.textPrimary }}>
                  {organizationInfo?.name || 'Cardápio Digital'}
                </h1>
                <p className="text-sm" style={{ color: customColors.textSecondary }}>
                  {organizationInfo?.description || 'Bem-vindo ao nosso cardápio'}
                </p>
              </div>
            </div>
            
            <button
              onClick={shareMenu}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-md"
              style={{ 
                borderColor: customColors.borderLight,
                color: customColors.primary,
                backgroundColor: 'white'
              }}
            >
              <Share2 className="w-5 h-5" />
              <span>Compartilhar</span>
            </button>
          </div>

          {/* Informações de contato */}
          {organizationInfo && (
            <div className="flex flex-wrap gap-4 py-3 text-sm" style={{ color: customColors.textSecondary }}>
              {organizationInfo.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{organizationInfo.address}</span>
                </div>
              )}
              {organizationInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{organizationInfo.phone}</span>
                </div>
              )}
              {organizationInfo.openingHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{organizationInfo.openingHours}</span>
                </div>
              )}
            </div>
          )}

          {/* Categorias */}
          <div className="w-full">
            <div className="flex space-x-2 py-3 overflow-x-auto">
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
          </div>
        </div>
      </header>

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
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {product.banner ? (
                          <img
                            src={`/api/images/${product.banner}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: customColors.primaryBg }}>
                            <Utensils className="w-12 h-12" style={{ color: customColors.primaryLight }} />
                          </div>
                        )}
                        
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

      {/* Footer */}
      <footer className="bg-white border-t py-8" style={{ borderColor: customColors.borderLight }}>
        <div className="container mx-auto px-4 text-center">
          <p style={{ color: customColors.textSecondary }}>
            {organizationInfo?.name || 'Estabelecimento'} &copy; {new Date().getFullYear()}
          </p>
          <p className="text-sm mt-2" style={{ color: customColors.textSecondary }}>
            Cardápio digital - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}