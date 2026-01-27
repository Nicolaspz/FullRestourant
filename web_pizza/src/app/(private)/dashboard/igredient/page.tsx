'use client';
import { API_BASE_URL } from "../../../../../config"; 
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
  Eye
} from "lucide-react";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify"; 
import { AuthContext } from "@/contexts/AuthContext";
import { IngredientFormModal } from "@/components/dashboard/igredient/IngredientFormModal"; 
import { DeleteDialog } from "@/components/dashboard/user/userConfirmModal"; 
import { Category, Ingredient } from "@/types/product"; 
import { IGREDIENT_CATEGORY_ID } from "../../../../../config";

export default function IngredientsPage() {
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Estados para modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar ingredientes e categorias
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ingredientsResponse, categoriesResponse] = await Promise.all([
        apiClient.get("/produts", {
          params: { organizationId: user?.organizationId },
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
        apiClient.get("/category", {
          params: { organizationId: user?.organizationId },
          headers: { Authorization: `Bearer ${user?.token}` },
        })
      ]);
      
      // Filtrar apenas ingredientes
      const ingredientProducts = ingredientsResponse.data.filter(
        (product: Ingredient) => product.isIgredient === true
      );
      
      setIngredients(ingredientProducts);
      setFilteredIngredients(ingredientProducts);
      setCategories(categoriesResponse.data);
    } catch (error) {
      toast.error("Erro ao carregar ingredientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user?.token]);

  // Filtrar ingredientes
  useEffect(() => {
    let filtered = ingredients;

    // Filtro de busca
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ingredient.category && ingredient.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(ingredient =>
        typeFilter === "derived" ? ingredient.isDerived : !ingredient.isDerived
      );
    }

    setFilteredIngredients(filtered);
  }, [searchTerm, typeFilter, ingredients]);

  // Criar ingrediente - GARANTINDO QUE isIgredient SEMPRE SEJA true
  const handleCreateIngredient = async (ingredientData: any) => {
    try {
      setIsSubmitting(true);
      
      const formPayload = new FormData();
      formPayload.append('name', ingredientData.name);
      formPayload.append('description', ingredientData.description);
      formPayload.append('unit', ingredientData.unit);
      formPayload.append('categoryId', IGREDIENT_CATEGORY_ID);
      formPayload.append('organizationId', user?.organizationId || '');      
      formPayload.append('isDerived', JSON.stringify(false));    
      formPayload.append('isIgredient', JSON.stringify(true));    
      
      if (ingredientData.file) {
        formPayload.append('file', ingredientData.file);
      }
     
      // CORREÇÃO: Mostrar os valores reais do FormData
      console.log('📝 Criando ingrediente:');
      const formDataObj: any = {};
      for (let [key, value] of formPayload.entries()) {
        formDataObj[key] = value;
        console.log(`${key}:`, value);
      }
      console.log("dados completos:", formDataObj);

      await apiClient.post('/produts', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      toast.success("Ingrediente criado com sucesso!");
      fetchData();
      setIsFormModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao criar ingrediente:", error);
      toast.error(error.response?.data?.message || "Erro ao criar ingrediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar ingrediente - GARANTINDO QUE isIgredient SEMPRE SEJA true
  const handleEditIngredient = async (ingredientData: any) => {
    if (!selectedIngredient) return;

    try {
      setIsSubmitting(true);
      
      const formPayload = new FormData();
      formPayload.append('name', ingredientData.name);
      formPayload.append('description', ingredientData.description);
      formPayload.append('unit', ingredientData.unit);
      formPayload.append('categoryId', IGREDIENT_CATEGORY_ID);
      formPayload.append('organizationId', user?.organizationId || '');
      formPayload.append('isDerived', JSON.stringify(false));    
      formPayload.append('isIgredient', JSON.stringify(true)); 
      if (ingredientData.file) {
        formPayload.append('file', ingredientData.file);
      }

      console.log('✏️ Editando ingrediente com isIgredient:', 'true'); // Log para debug
      console.log("dados",formPayload);
          
      await apiClient.put(`/produt?id=${selectedIngredient.id}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      toast.success("Ingrediente atualizado com sucesso!");
      fetchData();
      setIsFormModalOpen(false);
      setSelectedIngredient(null);
    } catch (error: any) {
      console.error("Erro ao editar ingrediente:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Erro ao editar ingrediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir ingrediente
  const handleDeleteIngredient = async () => {
    if (!selectedIngredient) return;

    try {
      setIsSubmitting(true);
      await apiClient.delete(`/produt?productId=${selectedIngredient.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      toast.success('Ingrediente removido com sucesso!');
      fetchData();
      setIsDeleteDialogOpen(false);
      setSelectedIngredient(null);
    } catch (error: any) {
      console.error("Erro ao excluir ingrediente:", error);
      toast.error(error.response?.data?.message || "Erro ao remover ingrediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de criação
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedIngredient(null);
    setIsFormModalOpen(true);
  };

  // Abrir modal de edição
  const openEditModal = (ingredient: Ingredient) => {
    setModalMode('edit');
    setSelectedIngredient(ingredient);
    setIsFormModalOpen(true);
  };

  // Abrir diálogo de exclusão
  const openDeleteDialog = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsDeleteDialogOpen(true);
  };

  const getTypeBadgeVariant = (isDerived: boolean) => {
    return isDerived ? "secondary" : "default";
  };

  const getTypeLabel = (isDerived: boolean) => {
    return isDerived ? "Derivado" : "Simples";
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
              <CardTitle>Gestão de Ingredientes</CardTitle>
              <CardDescription>
                Gerencie os ingredientes do sistema ({ingredients.length} ingredientes)
              </CardDescription>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Ingrediente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou categoria..."
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
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {ingredients.length === 0 ? "Nenhum ingrediente cadastrado" : "Nenhum ingrediente encontrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIngredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>
                        {ingredient.banner ? (
                          <img 
                            src={`${API_BASE_URL}/tmp/${ingredient.banner}`}
                            alt={ingredient.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ingredient.name}</div>
                        {ingredient.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {ingredient.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {ingredient.category?.name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ingredient.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(ingredient.isDerived)}>
                          {getTypeLabel(ingredient.isDerived)}
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
                            <DropdownMenuItem onClick={() => openEditModal(ingredient)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(ingredient)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
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
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <IngredientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedIngredient(null);
        }}
        onSubmit={modalMode === 'create' ? handleCreateIngredient : handleEditIngredient}
        isSubmitting={isSubmitting}
        mode={modalMode}
        initialData={selectedIngredient}
        categories={categories}
        organizationId={user?.organizationId || ''}
      />

      {/* Diálogo de Confirmação de Exclusão */}
    <DeleteDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedIngredient(null);
      }}
      onConfirm={handleDeleteIngredient}
      item={selectedIngredient}
      itemType="ingredient"
      isSubmitting={isSubmitting}
   />
    </div>
  );
}