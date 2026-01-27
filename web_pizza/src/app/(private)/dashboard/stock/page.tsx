'use client';

import { useState, useEffect, useContext } from "react";
import { setupAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import { StockTable } from "@/components/dashboard/stock/StockTable"; 
import { PageContainer } from "@/components/dashboard/stock/PageContainer"; 
import { PageHeader } from "@/components/dashboard/stock/PageHeader"; 

// Interface baseada nas que você forneceu
interface StockProduct {
  id: string;
  name: string;
  description: string;
  banner?: string;
  unit: string;
  is_fractional: boolean;
  isDerived: boolean;
  isIgredient: boolean;
  PrecoVenda: Array<{
    preco_venda: number;
    precoSugerido?: number;
    data_inicio?: string;
    data_fim?: string;
    precisaAtualizar?: boolean;
  }>;
  quantity: number;
  currentPrice?: string;
  category?: {
    name: string;
  };
}

export default function StockPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();

  useEffect(() => {
    if (!user?.organizationId) return;

    async function fetchStock() {
      try {
        const response = await apiClient.get('/stock', {
          params: { organizationId: user?.organizationId },
          headers: { Authorization: `Bearer ${user?.token}` }
        });
    
        console.log("dados", response);
    
        const transformedProducts = response.data.map((item: any) => {
          const product = item.product;
        
          const precoVendaAtual = product.PrecoVenda?.length
            ? product.PrecoVenda[product.PrecoVenda.length - 1].preco_venda
            : product.price;
        
          return {
            id: item.id,
            name: product.name,
            description: product.description,
            unit: product.unit || "",         // ✅ tabela usa product.unit
            quantity: item.quantity || 0,
            currentPrice: `${precoVendaAtual} Kz`,  // ✅ tabela usa este campo!
            PrecoVenda: product.PrecoVenda || [],   // ✅ tabela usa este campo!
            isDerived: product.isDerived,
            is_fractional: product.is_fractional,
            category: product.category || null
          };
        });
    
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Erro ao buscar stock:", error);
      } finally {
        setIsLoading(false);
      }
    }
    

    fetchStock();
  }, [user]);

  return (
    <PageContainer>
      <PageHeader
        title="Stock"
        description="Gerencie o stock dos seus produtos"
      />
      
      <StockTable products={products} isLoading={isLoading} />
    </PageContainer>
  );
}