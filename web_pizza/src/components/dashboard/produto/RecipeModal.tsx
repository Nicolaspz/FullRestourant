'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Edit, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  Calculator,
  DollarSign
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/apiClients";
import { toast } from "react-toastify"; 
import { Product, RecipeItem } from "@/types/product";
import { parseCookies } from "nookies";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  organizationId: string;
}

export function RecipeModal({ isOpen, onClose, product, organizationId }: RecipeModalProps) {
  const { '@servFixe.token': token } = parseCookies();
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [impactaPreco, setImpactaPreco] = useState<boolean>(true);

  const fetchData = async () => {
    if (!product?.id || !token) return;

    try {
      setIsLoading(true);
      
      const ingredientsResponse = await api.get('/produts', {
        params: { organizationId },
        headers: { Authorization: `Bearer ${token}` }
      });

      const ingredients = ingredientsResponse.data.filter(
        (p: Product) => p.isIgredient === true
      );

      const recipeResponse = await api.get(`/recipe/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const itemsWithPrices = recipeResponse.data.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        productId: item.productId,
        impactaPreco: item.impactaPreco,
        ingredient: {
          id: item.ingredient.id,
          name: item.ingredient.name,
          unit: item.ingredient.unit,
          price: item.ingredient.PrecoVenda?.[0]?.preco_venda || 0,
          PrecoVenda: item.ingredient.PrecoVenda || []
        }
      }));

      setAllIngredients(ingredients);
      setRecipeItems(itemsWithPrices);
    } catch (error) {
      console.error("Error fetching recipe data:", error);
      toast.error("Erro ao carregar dados da receita");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchData();
      resetForm();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, product]);

  const resetForm = () => {
    setSelectedIngredient("");
    setQuantity(1);
    setImpactaPreco(true);
  };

  const calculateTotalCost = () => {
    return recipeItems.reduce((total, item) => {
      if (item.impactaPreco) {
        const price = item.ingredient.price || 0;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  const handleAddIngredient = async () => {
    if (!selectedIngredient || !product?.id) return;

    try {
      setIsSubmitting(true);
      await api.post("/recipe", {
        productId: product.id,
        ingredientId: selectedIngredient,
        quantity: quantity,
        impactaPreco: impactaPreco
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Ingrediente adicionado com sucesso!");
      fetchData();
      setShowAddIngredient(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding ingredient:", error);
      toast.error(error.response?.data?.error || "Erro ao adicionar ingrediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIngredient = async (item: RecipeItem) => {
    
    try {
      setIsSubmitting(true);
      
      const payload = {
        productId: product.id,
        ingredientId: item.ingredient.id,
        quantity: Number(item.quantity), // Garantir que é número
        impactaPreco: Boolean(item.impactaPreco)
      };

      //console.log("📤 Payload enviado:", payload);

      const response = await api.put(`/recipe`, payload, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      console.log("✅ Resposta do servidor:", response.data);
      toast.success("Ingrediente atualizado com sucesso!");
      //setIsEditing(false);
      fetchData();
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      console.error("📨 Resposta de erro:", error.response?.data);
      console.error("🔍 Status do erro:", error.response?.status);
      toast.error(error.response?.data?.error || "Erro ao atualizar ingrediente");
    } finally {
      setIsSubmitting(false);
    }
};

  const handleDeleteIngredient = async (id: string) => {
    try {
      setIsSubmitting(true);
      await api.delete(`/recipe/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecipeItems(recipeItems.filter(item => item.id !== id));
      toast.success("Ingrediente removido com sucesso!");
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast.error("Erro ao remover ingrediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleImpactaPreco = (id: string) => {
    setRecipeItems(recipeItems.map(item => 
      item.id === id ? {...item, impactaPreco: !item.impactaPreco} : item
    ));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Receita: {product.name} 
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os ingredientes e custos da receita deste produto
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Card de Resumo do Custo */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Custo da Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {calculateTotalCost().toFixed(2)} Kz
                      </div>
                      <div className="text-sm text-muted-foreground">Custo Total</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {recipeItems.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Ingredientes</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {recipeItems.filter(item => item.impactaPreco).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Impactam Preço</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Ingredientes */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Ingredientes</CardTitle>
                    {!isEditing && recipeItems.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowAddIngredient(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recipeItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Nenhum ingrediente cadastrado.</p>
                      <Button onClick={() => setShowAddIngredient(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Ingrediente
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingrediente</TableHead>
                            <TableHead className="text-right">Preço Unitário</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-center">Impacta Preço</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            {isEditing && <TableHead className="text-right">Ações</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recipeItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.ingredient.name}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {item.ingredient.price.toFixed(2)} Kz
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const updatedItems = recipeItems.map(ri => 
                                          ri.id === item.id ? {...ri, quantity: Number(e.target.value)} : ri
                                        );
                                        setRecipeItems(updatedItems);
                                      }}
                                      className="w-20"
                                      min="0.1"
                                      step="0.1"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {item.ingredient.unit}
                                    </span>
                                  </div>
                                ) : (
                                  <span>
                                    {item.quantity} {item.ingredient.unit}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Switch
                                      checked={item.impactaPreco}
                                      onCheckedChange={() => toggleImpactaPreco(item.id)}
                                    />
                                    <Badge variant={item.impactaPreco ? "default" : "secondary"}>
                                      {item.impactaPreco ? "Sim" : "Não"}
                                    </Badge>
                                  </div>
                                ) : (
                                  <Badge variant={item.impactaPreco ? "default" : "secondary"}>
                                    {item.impactaPreco ? "Sim" : "Não"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-yellow-600 font-medium">
                                {(item.ingredient.price * item.quantity).toFixed(2)} Kz
                              </TableCell>
                              {isEditing && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateIngredient(item)}
                                      disabled={isSubmitting}
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteIngredient(item.id)}
                                      disabled={isSubmitting}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formulário de Adicionar Ingrediente */}
              {showAddIngredient && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Adicionar Ingrediente</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddIngredient(false);
                          resetForm();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ingredient">Ingrediente *</Label>
                        <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ingrediente" />
                          </SelectTrigger>
                          <SelectContent>
                            {allIngredients.map(ingredient => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} - {ingredient.PrecoVenda?.[0]?.preco_venda?.toFixed(2) || '0.00'} Kz
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade *</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min="0.1"
                          step="0.1"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-lg">
                      <Label htmlFor="impactaPreco" className="cursor-pointer">
                        Impacta no preço final?
                      </Label>
                      <Switch
                        checked={impactaPreco}
                        onCheckedChange={setImpactaPreco}
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddIngredient(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddIngredient}
                        disabled={!selectedIngredient || isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Adicionar Ingrediente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="flex justify-end gap-3">
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar Edição
                  </Button>
                )}
                <Button onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}