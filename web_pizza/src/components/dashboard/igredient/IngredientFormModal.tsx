'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Warehouse, X } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Category, Ingredient } from "@/types/product";
import { API_BASE_URL } from "../../../../config";
import { Area, economatoService } from "@/services/economato";
import { AuthContext } from "@/contexts/AuthContext";

interface IngredientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  initialData?: Ingredient | null;
  categories: Category[];
  organizationId: string;
}

export function IngredientFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  mode, 
  initialData,
  categories,
  organizationId
}: IngredientFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'un',
    isDerived: false,
    isIgredient:true,
    categoryId: '',
    file: null as File | null,
    previewImage: '',
    defaultAreaId:''
  });
const [areas, setAreas] = useState<Area[]>([]);
 const { user } = useContext(AuthContext);
  const [isDataReady, setIsDataReady] = useState(false);

 const fetchAreas = async () => {
      if (!user?.organizationId) return;
      try {
        //setIsLoading(true);
        const data = await economatoService.getAreas(user.organizationId);
        setAreas(data);
        console.log("áreas modal",data)
      } catch (error) {
        console.error("Erro ao carregar áreas:", error);
        //toast.error("Erro ao carregar áreas");
      } finally {
        //setIsLoading(false);
      }
    };
  // Preencher form quando initialData mudar
 useEffect(() => {
    const initializeForm = async () => {
      if (!isOpen) return;
      
      setIsDataReady(false);
      
      // 1. Carrega áreas primeiro
      await fetchAreas();
      
      // 2. Depois preenche o formulário
      if (initialData) {
         console.log("🎯 INICIALIZANDO FORMULÁRIO COM initialData:", initialData);
        setFormData({
          name: initialData.name,
          description: initialData.description || '',
          unit: initialData.unit,
          isDerived: initialData.isDerived,
          categoryId: initialData.categoryId || '',
          isIgredient: true,
          file: null,
          defaultAreaId: initialData.defaultAreaId || '',
          previewImage: initialData.banner ? `${API_BASE_URL}/tmp/${initialData.banner}` : ''
        });
      } else {
        setFormData({
          name: '',
          description: '',
          unit: 'un',
          isDerived: false,
          isIgredient: true,
          categoryId: '',
          file: null,
          previewImage: '',
          defaultAreaId: ''
        });
      }
      
      setIsDataReady(true);
    };

    initializeForm();
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados para envio
    const submitData = {
      name: formData.name,
      description: formData.description,
      unit: formData.unit,
      isDerived: false,
      isIgredient: true,
      categoryId: formData.categoryId,
      organizationId: organizationId,
      file: formData.file,
      defaultAreaId:formData.defaultAreaId
    };
    console.log("dados",submitData)
    onSubmit(submitData);

  };

  const handleInputChange = (field: string, value: string | boolean | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {mode === 'create' ? 'Criar Novo Ingrediente' : 'Editar Ingrediente'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'create' 
                ? 'Preencha os dados do novo ingrediente.' 
                : 'Faça as alterações necessárias nos dados do ingrediente.'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome do ingrediente"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrição
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Digite a descrição do ingrediente"
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[80px]"
                  disabled={isSubmitting}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="defaultAreaId" className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4" />
                  Área Padrão
                </Label>
               
                <Select 
                  value={formData.defaultAreaId} 
                  onValueChange={(value) => handleInputChange('defaultAreaId', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área padrão">
                      {formData.defaultAreaId && areas.find(area => area.id === formData.defaultAreaId)?.nome}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                
                <Select 
                  value={formData.unit} 
                  onValueChange={(value: string) => handleInputChange('unit', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade">
                      {formData.unit === 'un' && 'Unidade'}
                      {formData.unit === 'kg' && 'Quilograma'}
                      {formData.unit === 'g' && 'Grama'}
                      {formData.unit === 'l' && 'Litro'}
                      {formData.unit === 'ml' && 'Mililitro'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade</SelectItem>
                    <SelectItem value="kg">Quilograma</SelectItem>
                    <SelectItem value="g">Grama</SelectItem>
                    <SelectItem value="l">Litro</SelectItem>
                    <SelectItem value="ml">Mililitro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">
                  Imagem
                </Label>
                <div className="flex items-center gap-4">
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors">
                      Selecionar arquivo
                    </div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </Label>
                  {formData.previewImage && (
                    <div className="relative">
                      <img 
                        src={formData.previewImage} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInputChange('previewImage', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Criando...' : 'Salvando...'}
                </>
              ) : (
                mode === 'create' ? 'Criar Ingrediente' : 'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}