'use client';
import { API_BASE_URL } from '../../../../config';
import { DeleteConfirmationModal } from './DeleteConfirmationModalProps'; 
import { useState, useEffect, useContext } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Loader2,
  Utensils,
  Image,
  DollarSign,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { api } from "@/services/apiClients";
import { toast } from 'react-toastify';
import { ProductFormModal } from "./ProductFormModal";
import { RecipeModal } from "./RecipeModal";
import { AuthContext } from "@/contexts/AuthContext";
import { Product, Category } from "@/types/product";
import { parseCookies } from "nookies";
import { PriceUpdateModal } from './PriceUpdateModal';


interface ProductsTableProps {
  organizationId?: string;
}

export function ProductsTable({ organizationId }: ProductsTableProps) {
  const { user } = useContext(AuthContext);
  const { '@servFixe.token': token } = parseCookies();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

// Funções para o modal de preço
const openPriceModal = (product: Product) => {
  setSelectedProduct(product);
  setIsPriceModalOpen(true);
};

const closePriceModal = () => {
  setIsPriceModalOpen(false);
  setSelectedProduct(null);
};

  // Buscar produtos e categorias
  const fetchData = async () => {
    if (!user?.organizationId || !token) return;

    try {
      setIsLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/produts', {
          params: { organizationId: user.organizationId },
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/category', {
          params: { organizationId: user.organizationId },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Filtrar apenas produtos não-ingredientes
      const filteredProducts = productsResponse.data.filter(
        (product: Product) => product.isIgredient === false
      );

      setProducts(filteredProducts);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.organizationId && token) {
      fetchData();
    }
  }, [user?.organizationId, token]);

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || 
                       (typeFilter === "derived" && product.isDerived) ||
                       (typeFilter === "simple" && !product.isDerived);
    
    return matchesSearch && matchesType;
  });

  // Lógica de paginação
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  // Resetar para página 1 quando filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // Funções de paginação
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Excluir produto
  const handleDeleteProduct = async () => {
  if (!selectedProduct) return;

  try {
    setIsSubmitting(true);
    console.log("id organization", user?.organizationId)
    // IMPORTANTE: Agora precisa passar organizationId também
    await api.delete('/produt', {
      params: { 
        productId: selectedProduct.id,
        organizationId: user?.organizationId // Adiciona o organizationId do usuário
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    // Atualizar a lista localmente
    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
    toast.success("Produto excluído com sucesso!");
    
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error);
    toast.error(error.response?.data?.message || "Erro ao excluir produto");
  } finally {
    // SEMPRE resetar o estado, mesmo em caso de erro
    setIsSubmitting(false);
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  }
};

  // Aceitar preço sugerido
  const handleAcceptSuggestedPrice = async (productId: string) => {
    try {
      await api.put('/price', {
        productId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Preço atualizado com sucesso!');
      fetchData();
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error('Erro ao atualizar preço');
    }
  };

  // Abrir modais - FUNÇÕES SIMPLES SEM LÓGICA COMPLEXA
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const openRecipeModal = (product: Product) => {
    setSelectedProduct(product);
    setIsRecipeModalOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Fechar modais - FUNÇÕES PARA GARANTIR LIMPEZA COMPLETA
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
    setIsSubmitting(false); // Resetar submitting ao fechar
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setSelectedProduct(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
    setIsSubmitting(false); // Resetar submitting ao cancelar
  };

  const getTypeBadgeVariant = (isDerived: boolean) => {
    return isDerived ? "default" : "secondary";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros e ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestão de Produtos</CardTitle>
              <CardDescription>
                Gerencie os produtos do sistema ({products.length} produtos)
              </CardDescription>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="simple">Simples</SelectItem>
                  <SelectItem value="derived">Derivados</SelectItem>
                </SelectContent>
              </Select>

              {/* Itens por página */}
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.banner ? (
                          <img 
                            src={`${API_BASE_URL}/tmp/${product.banner}`}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Image className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.description && (
                            <span className="text-sm text-muted-foreground">
                              {product.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
  <div className="flex items-center gap-2">
    <DollarSign className="w-4 h-4 text-green-600" />
    <span>
      {product.PrecoVenda?.[0]?.preco_venda?.toFixed(2) || '0.00'} Kz
    </span>
    {(product.PrecoVenda?.[0]?.precoSugerido || true) && (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openPriceModal(product)}
          className="h-6 w-6 p-0"
          title="Atualizar preço"
        >
          <Edit className="w-3 h-3 text-blue-600" />
        </Button>
        {product.PrecoVenda?.[0]?.precoSugerido && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAcceptSuggestedPrice(product.id)}
              className="h-6 w-6 p-0"
              title="Aceitar preço sugerido"
            >
              <Check className="w-3 h-3 text-green-600" />
            </Button>
            <span className="text-xs text-yellow-600">
              Sug: {product.PrecoVenda[0].precoSugerido.toFixed(2)} Kz
            </span>
          </>
        )}
      </div>
    )}
  </div>
</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(product.isDerived)}>
                          {product.isDerived ? 'Derivado' : 'Simples'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {product.isDerived && (
                              <DropdownMenuItem onClick={() => openRecipeModal(product)}>
                                <Utensils className="w-4 h-4 mr-2" />
                                Ver Receita
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEditModal(product)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPriceModal(product)}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Atualizar Preço
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} produtos
              </div>
              <div className="flex items-center space-x-2">
                {/* Botão Primeira Página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Botão Página Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Indicador de Página */}
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Página</span>
                  <span className="font-medium">{currentPage}</span>
                  <span className="text-muted-foreground">de</span>
                  <span className="font-medium">{totalPages}</span>
                </div>

                {/* Botão Próxima Página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Botão Última Página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSuccess={fetchData}
        mode={modalMode}
        initialData={selectedProduct}
        categories={categories}
        organizationId={user?.organizationId || ''}
        userToken={token}
      />

      {/* Modal de Receita */}
      {selectedProduct && (
        <RecipeModal
          isOpen={isRecipeModalOpen}
          onClose={closeRecipeModal}
          product={selectedProduct}
          organizationId={user?.organizationId || ''}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteProduct}
        product={selectedProduct}
        isSubmitting={isSubmitting}
      />

      <PriceUpdateModal
        isOpen={isPriceModalOpen}
        onClose={closePriceModal}
        onSuccess={fetchData}
        product={selectedProduct}
        userToken={token}
      />
    </div>
  );
}