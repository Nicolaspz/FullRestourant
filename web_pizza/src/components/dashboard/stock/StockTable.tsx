'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Search, X, Package } from "lucide-react";

// Usando as interfaces que você forneceu
interface PrecoVenda {
  preco_venda: number;
  precoSugerido?: number;
  data_inicio?: string;
  data_fim?: string;
  precisaAtualizar?: boolean;
}

interface StockProduct {
  id: string;
  name: string;
  description: string;
  banner?: string;
  unit: string;
  is_fractional: boolean;
  isDerived: boolean;
  isIgredient: boolean;
  PrecoVenda: PrecoVenda[];
  quantity: number; // Quantidade em stock
  currentPrice?: string; // Preço formatado
  category?: {
    name: string;
  };
}

interface StockTableProps {
  products: StockProduct[];
  isLoading: boolean;
}

export function StockTable({ products, isLoading }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.currentPrice && product.currentPrice.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Corrigindo o tipo do variant
  const getQuantityVariant = (quantity: number) => {
    if (quantity === 0) return "destructive" as const;
    if (quantity <= 4) return "secondary" as const;
    return "default" as const;
  };

  const getQuantityText = (quantity: number) => {
    if (quantity === 0) return "Sem stock";
    if (quantity <= 4) return "Stock baixo";
    return "Em stock";
  };

  // Função para obter o preço atual
  const getCurrentPrice = (product: StockProduct) => {
    if (product.currentPrice) return product.currentPrice;
    
    const currentPrice = product.PrecoVenda?.find(price => !price.data_fim);
    return currentPrice ? `${currentPrice.preco_venda} Kz` : "Preço não definido";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">A carregar stock...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestão de Stock</CardTitle>
              <CardDescription>
                Visualize e gerencie o stock dos seus produtos
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto em stock"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm 
                  ? "Tente ajustar os termos da pesquisa"
                  : "Adicione produtos ao stock através das compras"
                }
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Produto</TableHead>
                     
                      <TableHead>Stock</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className={product.quantity <= 4 ? "text-amber-600" : ""}>
                              {product.name}
                            </span>
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={getQuantityVariant(product.quantity)}>
                              {getQuantityText(product.quantity)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {product.quantity} {product.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getCurrentPrice(product)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t px-6 py-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} de{" "}
                    {filteredProducts.length} itens
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      {selectedProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedProduct.name}
        </h3>
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Actual</h4>
            <div className={`inline-flex items-center justify-center w-full px-3 py-1 rounded-full text-sm font-medium ${
              (selectedProduct.quantity || 0) === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              (selectedProduct.quantity || 0) <= 4 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {selectedProduct.quantity || 0} {selectedProduct.unit}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço</h4>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {getCurrentPrice(selectedProduct)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedProduct.category?.name || "Sem categoria"}
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedProduct.description || "Nenhuma descrição disponível"}
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado do Stock</h4>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${
              (selectedProduct.quantity || 0) === 0 ? 'bg-red-500' :
              (selectedProduct.quantity || 0) <= 4 ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-gray-900 dark:text-white">
              {(selectedProduct.quantity || 0) === 0 ? 'Stock esgotado' :
               (selectedProduct.quantity || 0) <= 4 ? 'Stock baixo' : 'Stock normal'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</h4>
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              selectedProduct.isDerived 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {selectedProduct.isDerived ? "Prato" : "Ingrediente"}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              selectedProduct.is_fractional 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {selectedProduct.is_fractional ? "Fracionado" : "Inteiro"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedProduct(null)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}