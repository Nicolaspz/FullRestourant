'use client';

import { useState, useEffect, useContext } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2, Trash2 } from "lucide-react";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify";
import { AuthContext } from "@/contexts/AuthContext";

interface PurchaseProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  purchasePrice: number | null;
}

interface PurchaseProductsListProps {
  purchaseId: string;
  onUpdate: () => void;
  status: boolean;
}

export function PurchaseProductsList({ purchaseId, onUpdate, status }: PurchaseProductsListProps) {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState<PurchaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiClient = setupAPIClient();

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`/produts_list_compra`,{
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        params: {
          purchaseId
        }
      });
      
      // ✅ Garantir que purchasePrice não seja null
      const productsWithDefaultPrice = (response.data || []).map((product: PurchaseProduct) => ({
        ...product,
        purchasePrice: product.purchasePrice || 0 // Define 0 se for null
      }));
      
      setProducts(productsWithDefaultPrice);
    } catch (error) {
      console.error('Erro ao buscar produtos da compra:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (status) {
      toast.info('Não é possível remover produtos de uma compra concluída');
      return;
    }

    const confirmDelete = window.confirm('Tem certeza que deseja remover este item?');
    if (!confirmDelete) return;

    try {
      await apiClient.delete('/remuvProdcompra', {
        params: {
          productId: productId.trim(),
          purchaseId: purchaseId.trim()
        },
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Produto removido da compra');
      fetchProducts();
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro ao remover produto');
    }
  };

  const formatPrice = (price: number | null) => {
    const safePrice = price || 0;
    return safePrice.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    });
  };

  const calculateTotal = (quantity: number, price: number | null) => {
    const safePrice = price || 0;
    return quantity * safePrice;
  };

  useEffect(() => {
    if (user?.token) {
      fetchProducts();
    }
  }, [purchaseId, user?.token]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum produto adicionado a esta compra</p>
        <p className="text-sm">Vá para a aba "Adicionar Produtos" para incluir itens</p>
      </div>
    );
  }

  const totalValue = products.reduce((total, product) => {
    return total + calculateTotal(product.quantity, product.purchasePrice);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Preço Unitário</TableHead>
              <TableHead>Total</TableHead>
              {!status && <TableHead className="w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((purchaseProduct) => (
              <TableRow key={purchaseProduct.id}>
                <TableCell>
                  <div className="font-medium">{purchaseProduct.product.name}</div>
                  <Badge variant="outline" className="text-xs">
                    {purchaseProduct.product.unit}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  {purchaseProduct.quantity}
                </TableCell>
                
                <TableCell>
                  {formatPrice(purchaseProduct.purchasePrice)}
                </TableCell>
                
                <TableCell className="font-medium">
                  {formatPrice(calculateTotal(purchaseProduct.quantity, purchaseProduct.purchasePrice))}
                </TableCell>
                
                {!status && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(purchaseProduct.productId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Resumo do valor total */}
      <div className="flex justify-end">
        <div className="bg-muted p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Valor Total da Compra:</div>
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(totalValue)}
          </div>
        </div>
      </div>
    </div>
  );
}