"use client";
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { AddPaymentMethodModal, PaymentMethodData } from './add-payment-method-modal';


const initialPaymentMethods = [
  { 
    id: "1", 
    name: "paypay", 
    icon: <CreditCard className="w-5 h-5" />,
    data: {
      id: "1",
      rsa_key: "kjdjkdjddkj",
      redirect_url: "https://br.millenium.gg",
      merchant_id: "reference",
      merchant_member_id: "8237832783",
      sale_product_code: "ndjhewulewii2245",
      async_url: "https://br.millenium.gg",
      rsa_key_priv: "z.string",
      rsa_key_pub: "z.string()"
    }
  },
];

export function PaymentMethodsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingMethod, setEditingMethod] = useState<PaymentMethodData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);

  const handleAddMethod = () => {
    setModalMode('add');
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditMethod = (method: PaymentMethodData) => {
    setModalMode('edit');
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: PaymentMethodData) => {
    if (modalMode === 'add') {
      // Simular criação de novo método
      const newMethod = {
        id: Date.now().toString(),
        name: 'paypay',
        icon: <CreditCard className="w-5 h-5" />,
        data: {
          ...data,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      setPaymentMethods(prev => [...prev, newMethod]);
      console.log('Adicionando novo método:', data);
    } else {
      // Simular atualização do método
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === editingMethod?.id 
            ? { ...method, data: { ...data, id: method.id, updated_at: new Date().toISOString() } }
            : method
        )
      );
      console.log('Editando método:', data);
    }
    
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Métodos de Pagamento</h2>
          <Button 
            onClick={handleAddMethod}
            className='cursor-pointer'
          >
            <Plus className="mr-2"  /> Adicionar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className="p-4 flex items-center space-x-3 cursor-pointer transition-all duration-200
                         hover:bg-gray-100 hover:shadow-md hover:-translate-y-1
                         dark:hover:bg-gray-800 dark:hover:shadow-gray-700/30"
              onClick={() => handleEditMethod(method.data)}
            >
              {method.icon}
              <span className="font-medium">{method.name}</span>
            </Card>
          ))}
        </div>
      </Card>

      <AddPaymentMethodModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingMethod={editingMethod}
        mode={modalMode}
      />
    </>
  );
}