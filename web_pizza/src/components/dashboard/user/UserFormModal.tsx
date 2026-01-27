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
import { Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  telefone: string;
  role: string;
  user_name: string;
  created_at?: string;
  updated_at?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  initialData?: User | null;
  organizationId: string;
}

export function UserFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  mode, 
  initialData,
  organizationId
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefone: '',
    user_name: '',
    role: 'CLIENT',
    password: '',
    confirmPassword: ''
  });

  // Preencher form quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        telefone: initialData.telefone,
        user_name: initialData.user_name,
        role: initialData.role,
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        telefone: '',
        user_name: '',
        role: 'CLIENT',
        password: '',
        confirmPassword: ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de senha para criação
    if (mode === 'create' && formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    // Validação de senha para edição (se preenchida)
    if (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    // Preparar dados para envio
    const submitData = {
      name: formData.name,
      email: formData.email,
      telefone: formData.telefone,
      user_name: formData.user_name,
      role: formData.role,
      password: formData.password,
      organizationId: organizationId
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {mode === 'create' ? 'Criar Novo Usuário' : 'Editar Usuário'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {mode === 'create' 
                ? 'Preencha os dados do novo usuário do sistema.' 
                : 'Faça as alterações necessárias nos dados do usuário.'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome completo"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Digite o email"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-gray-300">
              Telefone *
            </Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="Digite o telefone"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_name" className="text-gray-300">
              Nome de Usuário *
            </Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => handleInputChange('user_name', e.target.value)}
              placeholder="Digite o nome de usuário"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-300">
              Perfil *
            </Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: string) => handleInputChange('role', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="Admin" className="focus:bg-gray-700">Administrador</SelectItem>
                <SelectItem value="Super Admin" className="focus:bg-gray-700">Super Admin</SelectItem>
                <SelectItem value="Caixa" className="focus:bg-gray-700">Caixa</SelectItem>
                <SelectItem value="Garçon" className="focus:bg-gray-700">Garçon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              {mode === 'create' ? 'Senha *' : 'Nova Senha (deixe em branco para manter atual)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={mode === 'create' ? "Digite a senha" : "Deixe em branco para manter atual"}
              required={mode === 'create'}
              minLength={8}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500"
              disabled={isSubmitting}
            />
          </div>

          {(mode === 'create' || formData.password) && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                {mode === 'create' ? 'Confirmar Senha *' : 'Confirmar Nova Senha'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirme a senha"
                required={mode === 'create' || !!formData.password}
                minLength={8}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500"
                disabled={isSubmitting}
              />
            </div>
          )}
          
          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors min-w-24"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Criando...' : 'Salvando...'}
                </>
              ) : (
                mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}