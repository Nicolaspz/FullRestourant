'use client';

import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify";
import { AuthContext } from "@/contexts/AuthContext";
import { X } from "lucide-react";

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Supplier {
  id: string;
  name: string;
}

export function CreatePurchaseModal({ isOpen, onClose, onSuccess }: CreatePurchaseModalProps) {
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    qtdCompra: 0,
    supplierId: ''
  });

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da compra é obrigatório');
      return;
    }

    if (!user?.organizationId) {
      toast.error('Organização não identificada');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/compra', {
        ...formData,
        organizationId: user.organizationId
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      toast.success('Compra criada com sucesso!');
      onSuccess();
      setFormData({
        name: '',
        description: '',
        qtdCompra: 0,
        supplierId: ''
      });
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      toast.error('Erro ao criar compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm dark:bg-black/90" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nova Compra</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Adicione uma nova compra ao sistema
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 dark:text-white">Nome da Compra *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Compra de ingredientes para Março"
              required
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 dark:text-white">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ex: Ingredientes para o mês de março"
              rows={3}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierId" className="text-gray-900 dark:text-white">Fornecedor</Label>
            <Select 
              value={formData.supplierId} 
              onValueChange={(value) => setFormData({...formData, supplierId: value})}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {suppliers.map((supplier) => (
                  <SelectItem 
                    key={supplier.id} 
                    value={supplier.id}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                  >
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qtdCompra" className="text-gray-900 dark:text-white">Quantidade Esperada</Label>
            <Input
              id="qtdCompra"
              type="number"
              value={formData.qtdCompra}
              onChange={(e) => setFormData({...formData, qtdCompra: parseInt(e.target.value) || 0})}
              placeholder="0"
              min="0"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

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
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
              {isSubmitting ? "Criando..." : "Criar Compra"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );}