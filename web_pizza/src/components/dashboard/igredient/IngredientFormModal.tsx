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
import { Image, Loader2, Warehouse, X } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Category, Ingredient } from "@/types/product";
import { API_BASE_URL } from "../../../../config";
import { Area, economatoService } from "@/services/economato";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

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
    defaultAreaId:'',
    existingBanner: '',
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
          existingBanner: initialData.banner || '',
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
          defaultAreaId: '',
          existingBanner: '',
        });
      }
      
      setIsDataReady(true);
    };

    initializeForm();
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    
    e.preventDefault();
     if (!formData.defaultAreaId) {
        toast.error("Área de Consumo é obrigatório!");
        return;
      }
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
    //console.log("dados",submitData)
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
        <Label htmlFor="name" className="text-gray-900 dark:text-white">
          Nome *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Digite o nome do ingrediente"
          required
          disabled={isSubmitting}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-900 dark:text-white">
          Descrição
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Digite a descrição do ingrediente"
          rows={4}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md p-2 w-full resize-y"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="defaultAreaId" className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Warehouse className="w-4 h-4" />
          Área Padrão de Consumo *
        </Label>
        
        
          <Select 
  value={formData.defaultAreaId} 
  onValueChange={(value) => {
    handleInputChange('defaultAreaId', value);
  }}
  disabled={!isDataReady || isSubmitting}
  required
>
  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
    <SelectValue placeholder="Selecione uma área padrão *">
      {formData.defaultAreaId ? (
        areas.find(area => area.id === formData.defaultAreaId)?.nome || 
        `ID: ${formData.defaultAreaId.substring(0, 8)}...`
      ) : (
        "Selecione uma área padrão *"
      )}
    </SelectValue>
  </SelectTrigger>
  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
    {/* NÃO há opção para valor vazio/vazio */}
    {areas.map(area => (
      <SelectItem 
        key={area.id} 
        value={area.id}
        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {area.nome}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
        
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Defina a área padrão onde este ingrediente será consumido
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit" className="text-gray-900 dark:text-white">
          Unidade *
        </Label>
        <Select 
          value={formData.unit} 
          onValueChange={(value: string) => handleInputChange('unit', value)}
          disabled={!isDataReady || isSubmitting}
          required
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
            <SelectValue placeholder="Selecione a unidade">
              {formData.unit === 'un' && 'Unidade'}
              {formData.unit === 'kg' && 'Kilograma'}
              {formData.unit === 'g' && 'Grama'}
              {formData.unit === 'l' && 'Litro'}
              {formData.unit === 'ml' && 'Mililitro'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectItem value="un" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              Unidade
            </SelectItem>
            <SelectItem value="kg" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              Quilograma
            </SelectItem>
            <SelectItem value="g" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              Grama
            </SelectItem>
            <SelectItem value="l" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              Litro
            </SelectItem>
            <SelectItem value="ml" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              Mililitro
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image" className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Image className="w-4 h-4" />
          Imagem do Ingrediente
          {mode === 'create' && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white file:bg-gray-100 dark:file:bg-gray-700 w-full"
            disabled={isSubmitting}
          />
          
          {(formData.previewImage || formData.existingBanner) && (
            <div className="relative">
              <img 
                src={formData.previewImage || (formData.existingBanner ? `${API_BASE_URL}/tmp/${formData.existingBanner}` : '')} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', formData.existingBanner);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleInputChange('previewImage', '')}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                disabled={isSubmitting}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'create' 
            ? 'Imagem obrigatória para novo ingrediente' 
            : 'Selecione uma nova imagem apenas se deseja alterar'
          }
        </p>
      </div>
    </div>
  </div>
  
  {/* Footer */}
  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
    <Button 
      type="button" 
      variant="outline" 
      onClick={onClose}
      disabled={isSubmitting}
      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      Cancelar
    </Button>
    <Button 
      type="submit" 
      disabled={isSubmitting}
      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
    >
      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {mode === 'create' ? 'Criar Ingrediente' : 'Salvar Alterações'}
    </Button>
  </div>
</form>
      </div>
    </div>
  );
}