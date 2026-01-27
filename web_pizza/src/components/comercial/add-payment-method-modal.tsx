// components/add-payment-method-modal.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface PaymentMethodData {
  id?: string;
  rsa_key: string;
  redirect_url: string;
  merchant_id: string;
  merchant_member_id: string;
  sale_product_code: string;
  async_url: string;
  rsa_key_priv: string;
  rsa_key_pub: string;
}

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentMethodData) => void;
  editingMethod?: PaymentMethodData | null;
  mode: 'add' | 'edit';
}

export function AddPaymentMethodModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingMethod,
  mode 
}: AddPaymentMethodModalProps) {
  const [formData, setFormData] = useState<PaymentMethodData>({
    rsa_key: '',
    redirect_url: '',
    merchant_id: '',
    merchant_member_id: '',
    sale_product_code: '',
    async_url: '',
    rsa_key_priv: '',
    rsa_key_pub: ''
  });

  // Preenche o formulário quando estiver editando
  useEffect(() => {
    if (mode === 'edit' && editingMethod) {
      setFormData(editingMethod);
    } else {
      // Reseta o formulário quando estiver adicionando
      setFormData({
        rsa_key: '',
        redirect_url: '',
        merchant_id: '',
        merchant_member_id: '',
        sale_product_code: '',
        async_url: '',
        rsa_key_priv: '',
        rsa_key_pub: ''
      });
    }
  }, [editingMethod, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof PaymentMethodData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const title = mode === 'add' ? 'Adicionar Método de Pagamento' : 'Editar Método de Pagamento';
  const description = mode === 'add' 
    ? 'Adicione um novo método de pagamento à sua conta.' 
    : 'Edite as informações do método de pagamento.';

  const submitButtonText = mode === 'add' ? 'Adicionar Método' : 'Salvar Alterações';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">RSA Key</label>
              <input
                type="text"
                value={formData.rsa_key}
                onChange={(e) => handleChange('rsa_key', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="kjdjkdjddkj"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Redirect URL</label>
              <input
                type="url"
                value={formData.redirect_url}
                onChange={(e) => handleChange('redirect_url', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="https://br.millenium.gg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Merchant ID</label>
              <input
                type="text"
                value={formData.merchant_id}
                onChange={(e) => handleChange('merchant_id', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="reference"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Merchant Member ID</label>
              <input
                type="text"
                value={formData.merchant_member_id}
                onChange={(e) => handleChange('merchant_member_id', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="8237832783"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sale Product Code</label>
              <input
                type="text"
                value={formData.sale_product_code}
                onChange={(e) => handleChange('sale_product_code', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="ndjhewulewii2245"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Async URL</label>
              <input
                type="url"
                value={formData.async_url}
                onChange={(e) => handleChange('async_url', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="https://br.millenium.gg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">RSA Private Key</label>
              <input
                type="text"
                value={formData.rsa_key_priv}
                onChange={(e) => handleChange('rsa_key_priv', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="z.string"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">RSA Public Key</label>
              <input
                type="text"
                value={formData.rsa_key_pub}
                onChange={(e) => handleChange('rsa_key_pub', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="z.string()"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 ">
            <Button className='cursor-pointer'
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit"
            className='cursor-pointer'>
              {submitButtonText}
            </Button>
          </div>
        </form>

        
      </DialogContent>
    </Dialog>
  );
}