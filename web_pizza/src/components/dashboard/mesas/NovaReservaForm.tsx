'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Phone, Mail, Calendar, User } from 'lucide-react';
import { Mesa } from '@/types/product'; 

interface NovaReservaFormProps {
  mesasLivres: Mesa[];
  onSubmit: (reservaData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

const NovaReservaForm = ({ mesasLivres, onSubmit, onCancel, initialData }: NovaReservaFormProps) => {
  const [reservaData, setReservaData] = useState({
    mesaId: initialData?.mesaId || '',
    clienteNome: initialData?.clienteNome || '',
    clienteTelefone: initialData?.clienteTelefone || '',
    clienteEmail: initialData?.clienteEmail || '',
    dataReserva: initialData?.dataReserva || '',
    quantidadePessoas: initialData?.quantidadePessoas || 4
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(reservaData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nova Reserva</CardTitle>
        <CardDescription>Preencha os dados para reservar uma mesa</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nome do Cliente *"
              id="clienteNome"
              value={reservaData.clienteNome}
              onChange={(value) => setReservaData({...reservaData, clienteNome: value})}
              placeholder="Nome completo"
              required
              icon={<User className="h-4 w-4" />}
            />
            
            <FormField
              label="Mesa *"
              id="mesaId"
              type="select"
              value={reservaData.mesaId}
              onChange={(value) => setReservaData({...reservaData, mesaId: value})}
              options={mesasLivres.map(mesa => ({
                value: mesa.id,
                label: `Mesa ${mesa.number} (${mesa.capacidade} pessoas)`
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Data e Hora *"
              id="dataReserva"
              type="datetime-local"
              value={reservaData.dataReserva}
              onChange={(value) => setReservaData({...reservaData, dataReserva: value})}
              required
              icon={<Calendar className="h-4 w-4" />}
            />
            
            <FormField
              label="Quantidade de Pessoas"
              id="quantidadePessoas"
              type="number"
              value={reservaData.quantidadePessoas}
              onChange={(value) => setReservaData({...reservaData, quantidadePessoas: parseInt(value)})}
              min="1"
              max="20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label={
                <>
                  <Phone className="inline h-4 w-4 mr-1" />
                  Telefone
                </>
              }
              id="clienteTelefone"
              value={reservaData.clienteTelefone}
              onChange={(value) => setReservaData({...reservaData, clienteTelefone: value})}
              placeholder="(11) 99999-9999"
            />
            
            <FormField
              label={
                <>
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </>
              }
              id="clienteEmail"
              type="email"
              value={reservaData.clienteEmail}
              onChange={(value) => setReservaData({...reservaData, clienteEmail: value})}
              placeholder="cliente@email.com"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <Check className="h-4 w-4 mr-2" />
            Confirmar Reserva
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// Componente auxiliar para campos do formulário
const FormField = ({ label, id, type = 'text', value, onChange, placeholder, options, required, icon, ...props }: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {type === 'select' ? (
      <select
        id={id}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Selecione uma mesa</option>
        {options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={icon ? "pl-10" : ""}
          {...props}
        />
      </div>
    )}
  </div>
);

export default NovaReservaForm;