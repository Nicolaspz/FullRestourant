'use client';
import { API_BASE_URL } from '../../../../config';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Utensils, Image, X, Warehouse } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Product, Category, ProductFormData } from "@/types/product";
import { api } from "@/services/apiClients";
import { toast } from 'react-toastify';
import { DERIVED_CATEGORY_ID } from '../../../../config'
import { Area, economatoService } from '@/services/economato';
import { AuthContext } from '@/contexts/AuthContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  initialData?: Product | null;
  categories: Category[];
  organizationId: string;
  userToken: string;
}

export function ProductFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  mode, 
  initialData,
  categories,
  organizationId,
  userToken
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    unit: 'un',
    isDerived: false,
    isIgredient: false,
    categoryId: '',
    file: null,
    previewImage: '',
    price: 0,
    existingBanner: '',
    defaultAreaId: '',
  });
  
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  const fetchAreas = async () => {
    if (!user?.organizationId) return;
    try {
      setIsLoadingAreas(true);
      const data = await economatoService.getAreas(user.organizationId);
      setAreas(data);
      console.log("✅ Áreas carregadas:", {
        quantidade: data.length,
        áreas: data.map(a => ({ id: a.id, nome: a.nome }))
      });
    } catch (error) {
      console.error("❌ Erro ao carregar áreas:", error);
      toast.error("Erro ao carregar áreas");
    } finally {
      setIsLoadingAreas(false);
    }
  };

  useEffect(() => {
    const initializeForm = async () => {
      if (!isOpen) return;
      
      console.log("🔄 Inicializando modal...");
      console.log("   Mode:", mode);
      console.log("   InitialData:", initialData);
      
      setIsDataReady(false);
      await fetchAreas();
      
      if (mode === 'edit' && initialData) {
        console.log("🎯 SETANDO FORM PARA EDIÇÃO");
        console.log("   Dados do initialData:", {
          name: initialData.name,
          defaultAreaId: initialData.defaultAreaId,
          defaultArea: initialData.defaultArea,
          unit: initialData.unit,
          categoryId: initialData.categoryId,
          banner: initialData.banner
        });
        
        // IMPORTANTE: Use initialData.defaultAreaId diretamente
        // Se não tiver, tente pegar de defaultArea.id
        const areaId = initialData.defaultAreaId || initialData.defaultArea?.id || '';
        
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          unit: initialData.unit || 'un',
          isDerived: initialData.isDerived || false,
          isIgredient: initialData.isIgredient || false,
          categoryId: initialData.categoryId || initialData.Category?.id || '',
          file: null,
          previewImage: initialData.banner ? `${API_BASE_URL}/tmp/${initialData.banner}` : '',
          price: initialData.PrecoVenda?.[0]?.preco_venda || 0,
          existingBanner: initialData.banner || '',
          defaultAreaId: areaId // ← Usando o valor correto
        });
        
        console.log("✅ FormData setado:", {
          defaultAreaId: areaId,
          name: initialData.name
        });
      } else {
        // Reset para create
        console.log("🎯 SETANDO FORM PARA CRIAÇÃO");
        setFormData({
          name: '',
          description: '',
          unit: 'un',
          isDerived: false,
          isIgredient: false,
          categoryId: '',
          file: null,
          previewImage: '',
          price: 0,
          existingBanner: '',
          defaultAreaId: '',
        });
      }
      
      setIsDataReady(true);
    };

    initializeForm();
  }, [isOpen, initialData, mode]);

  // Log para debug quando áreas são carregadas
  useEffect(() => {
    if (areas.length > 0) {
      console.log("🔍 VERIFICANDO ÁREAS E FORM DATA:");
      console.log("   Áreas disponíveis:", areas.length);
      console.log("   defaultAreaId no form:", formData.defaultAreaId);
      console.log("   Área correspondente:", areas.find(a => a.id === formData.defaultAreaId));
      
      if (formData.defaultAreaId) {
        const areaExists = areas.find(area => area.id === formData.defaultAreaId);
        if (areaExists) {
          console.log("✅ Área encontrada:", areaExists.nome);
        } else {
          console.warn("⚠️ Área não encontrada! ID:", formData.defaultAreaId);
          console.log("   IDs disponíveis:", areas.map(a => a.id));
        }
      }
    }
  }, [areas, formData.defaultAreaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userToken) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error("Preço de venda deve ser maior que zero");
      return;
    }

    if (!formData.categoryId && !formData.isDerived) {
      toast.error("Categoria é obrigatória para produtos não derivados");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formPayload = new FormData();
      
      // Dados básicos do produto
      formPayload.append('name', formData.name);
      formPayload.append('price', formData.price.toString());
      formPayload.append('description', formData.description || '');
      formPayload.append('unit', formData.unit);
      formPayload.append('isDerived', formData.isDerived.toString());
      formPayload.append('isIgredient', formData.isIgredient.toString());
      
      // Só envia categoryId se não for produto derivado
      if (!formData.isDerived && formData.categoryId) {
        formPayload.append('categoryId', formData.categoryId);
      } else {
        formPayload.append('categoryId', DERIVED_CATEGORY_ID);
      }

      // IMPORTANTE: SEMPRE envia defaultAreaId (mesmo que vazio) para produtos não derivados
      if (!formData.isDerived) {
        console.log("📤 Enviando defaultAreaId:", formData.defaultAreaId || "(vazio)");
        // Envia como string vazia se não tiver valor
        formPayload.append('defaultAreaId', formData.defaultAreaId || '');
      } else {
        console.log("📤 Produto derivado - não enviando defaultAreaId");
        // Para produtos derivados, pode enviar vazio ou omitir
        formPayload.append('defaultAreaId', '');
      }
      
      formPayload.append('organizationId', organizationId);
      
      // DEBUG: Mostra todos os dados sendo enviados
      console.log("📦 PAYLOAD COMPLETO:");
      for (let [key, value] of formPayload.entries()) {
        console.log(`  ${key}:`, value);
      }

      // Apenas anexa o arquivo se um novo foi selecionado
      if (formData.file) {
        formPayload.append('file', formData.file);
        console.log("Novo arquivo anexado:", formData.file.name);
      } else if (mode === 'edit' && formData.existingBanner) {
        // Para edição, se não há novo arquivo, precisa enviar o banner existente
        console.log("Mantendo banner existente:", formData.existingBanner);
        // Se o backend precisa saber que não há nova imagem
        formPayload.append('existingBanner', formData.existingBanner);
      }

      if (mode === 'edit' && initialData) {
        // Editar produto existente
        console.log("✏️ Editando produto ID:", initialData.id);
        
        await api.put(`/produt?id=${initialData.id}`, formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userToken}`
          }
        });
        toast.success('Produto atualizado com sucesso!');
      } else {
        console.log("🆕 Criando novo produto");
        if (!formData.file) {
          toast.error("Imagem do produto é obrigatória para novo produto");
          setIsSubmitting(false);
          return;
        }
        await api.post('/produts', formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userToken}`
          }
        });
        toast.success('Produto cadastrado com sucesso!');
      }

      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error("Error saving product:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar produto';
      
      // Mensagens de erro mais específicas
      if (errorMessage.includes('file') || errorMessage.includes('imagem')) {
        toast.error('Erro ao processar a imagem. Tente novamente com outra imagem.');
      } else if (errorMessage.includes('defaultAreaId')) {
        toast.error('Erro ao processar a área padrão. Verifique se a área selecionada é válida.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    console.log(`✏️ Alterando ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validação básica do arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem válido');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      file: null,
      previewImage: '',
      existingBanner: ''
    }));
    
    // Reset do input file
    const fileInput = document.getElementById('banner') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Log de debug antes do render
  console.log("🎯 RENDER FINAL - Estado:", {
    defaultAreaId: formData.defaultAreaId,
    hasDefaultAreaId: !!formData.defaultAreaId,
    areasLoaded: areas.length,
    areaFound: areas.find(a => a.id === formData.defaultAreaId),
    isDataReady
  });

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Adicionar Produto' : 'Editar Produto'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {mode === 'create' 
                ? 'Preencha os dados do novo produto.' 
                : 'Faça as alterações necessárias no produto.'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-white">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome do produto"
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-900 dark:text-white">Preço de Venda *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 dark:text-white">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição do produto"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-gray-900 dark:text-white">Unidade *</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleInputChange('unit', value)}
                disabled={!isDataReady || isSubmitting}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Selecione a unidade">
                    {formData.unit === 'un' && 'Unidade'}
                    {formData.unit === 'kg' && 'Quilograma'}
                    {formData.unit === 'g' && 'Grama'}
                    {formData.unit === 'l' && 'Litro'}
                    {formData.unit === 'ml' && 'Mililitro'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="kg">Quilograma</SelectItem>
                  <SelectItem value="g">Grama</SelectItem>
                  <SelectItem value="l">Litro</SelectItem>
                  <SelectItem value="ml">Mililitro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-gray-900 dark:text-white">
                Categoria {!formData.isDerived && '*'}
              </Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => handleInputChange('categoryId', value)}
                disabled={formData.isDerived || !isDataReady || isSubmitting}
                required={!formData.isDerived}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Selecione uma categoria">
                    {formData.categoryId && categories.find(cat => cat.id === formData.categoryId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  {categories.map(category => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Área Padrão - Apenas para produtos não derivados */}
          {!formData.isDerived && (
            <div className="space-y-2">
              <Label htmlFor="defaultAreaId" className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Warehouse className="w-4 h-4" />
                Área Padrão
              </Label>
              
              {isLoadingAreas ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Carregando áreas...</span>
                </div>
              ) : (
                <>
                  <Select 
                    value={formData.defaultAreaId} 
                    onValueChange={(value) => {
                      console.log("🔄 Área selecionada no select:", value);
                      handleInputChange('defaultAreaId', value);
                    }}
                    disabled={!isDataReady || isSubmitting}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Selecione uma área padrão">
                        {formData.defaultAreaId ? (
                          areas.find(area => area.id === formData.defaultAreaId)?.nome || 
                          `ID: ${formData.defaultAreaId.substring(0, 8)}...`
                        ) : (
                          "Selecione uma área padrão"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        {/* REMOVA ou ALTERE esta linha: */}
                        {/* <SelectItem value="">Nenhuma área</SelectItem> */}
                        
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
                  
                  {/* Info de debug (pode remover depois) */}
                  {formData.defaultAreaId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded mt-2">
                      <p>
                        Área selecionada:{" "}
                        <span className="font-medium">
                          {areas.find(a => a.id === formData.defaultAreaId)?.nome || "Não encontrada"}
                        </span>
                      </p>
                      <p className="text-xs opacity-75">
                        ID: {formData.defaultAreaId}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Defina a área padrão onde este produto será armazenado
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDerived"
              checked={formData.isDerived}
              onCheckedChange={(checked) => {
                const isDerived = !!checked;
                console.log("✅ Produto derivado:", isDerived);
                handleInputChange('isDerived', isDerived);
                // Se marcar como derivado, limpa a categoria e área
                if (isDerived) {
                  handleInputChange('categoryId', '');
                  handleInputChange('defaultAreaId', '');
                }
              }}
              className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-700"
            />
            <Label htmlFor="isDerived" className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Utensils className="w-4 h-4" />
              Produto Derivado (Contém Ingredientes/Receita)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner" className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Image className="w-4 h-4" />
              Imagem do Produto
              {mode === 'create' && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="banner"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white file:text-gray-900 dark:file:text-white file:bg-gray-100 dark:file:bg-gray-700"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'create' 
                ? 'Imagem obrigatória para novo produto' 
                : 'Selecione uma nova imagem apenas se deseja alterar'
              }
            </p>
            
            {(formData.previewImage || formData.existingBanner) && (
              <div className="mt-2 relative inline-block">
                <img 
                  src={formData.previewImage || (formData.existingBanner ? `${API_BASE_URL}/tmp/${formData.existingBanner}` : '')} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', formData.existingBanner);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
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
              {mode === 'create' ? 'Criar Produto' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}