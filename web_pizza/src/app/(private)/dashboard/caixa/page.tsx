'use client'
import React, { useState, useEffect, useContext } from 'react';
import CaixaHeader from '@/components/dashboard/caixa/CaixaHeader'; 
import FaturaList from '@/components/dashboard/caixa/FaturaList'; 
import Estatisticas from '@/components/dashboard/caixa/Estatisticas'; 
import { AuthContext } from '@/contexts/AuthContext'; 
import { setupAPIClient } from '@/services/api'; 

// Definir interface para os parâmetros
interface FaturaParams {
  organizationId: string;
  dataInicio: string;
  dataFim: string;
  status?: string;
}

const Caixa = () => {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('pendentes');
  const [estatisticas, setEstatisticas] = useState(null);
  
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();

  // Função para formatar data
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchFaturas = async (date: Date, status: string | undefined) => {
    if (!user?.organizationId) {
      console.error('❌ OrganizationId não encontrado');
      return;
    }

    setLoading(true);
    try {
      const dataInicio = formatDate(date);
      const dataFim = formatDate(date);
      
      const url = `/faturas?organizationId=${user.organizationId}&dataInicio=${dataInicio}&dataFim%3A=${dataFim}${status && status !== 'todas' ? `&status=${status}` : ''}`;
      
      console.log('🌐 URL correta:', url);
      
      const response = await apiClient.get(url);
      console.log()
      console.log("✅ Response status:", response.status);
      console.log("✅ Faturas recebidas:", response.data);
      
      setFaturas(response.data || []);
    } catch (error: any) {
      console.error('❌ Erro:', error.response?.data);
      setFaturas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async (date: Date) => {
    if (!user?.organizationId) return;

    try {
      const dataInicio = formatDate(date);
      const dataFim = formatDate(date);
      
      const response = await apiClient.get('/estatisticas/vendas', {
        params: {
          organizationId: user.organizationId,
          inicio: dataInicio,
          fim: dataFim
        }
      });
      setEstatisticas(response.data);
      console.log("📊 Estatistica venda:", response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      setEstatisticas(null);
    }
  };

  useEffect(() => {
    if (user?.organizationId) {
      const statusMap = {
        'pendentes': 'pendente',
        'pagas': 'paga', 
        'canceladas': 'cancelada',
        'todas': undefined
      } as const;
      
      fetchFaturas(selectedDate, statusMap[activeTab as keyof typeof statusMap]);
      fetchEstatisticas(selectedDate);
    }
  }, [selectedDate, activeTab, user?.organizationId]);

  const handlePagamentoSuccess = () => {
    const statusMap = {
      'pendentes': 'pendente',
      'pagas': 'paga',
      'canceladas': 'cancelada', 
      'todas': undefined
    };
    fetchFaturas(selectedDate, statusMap[activeTab as keyof typeof statusMap]);
    fetchEstatisticas(selectedDate);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 p-4">
      <div className="max-w-[90vw] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Caixa do Restaurante</h1>
            <p className="text-muted-foreground">
              Gerencie faturas e pagamentos do seu estabelecimento
            </p>
          </div>
        </div>
      
        {!user?.organizationId && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive dark:text-destructive-foreground px-4 py-3 rounded-lg">
            ❌ OrganizationId não encontrado. Verifique se está logado.
          </div>
        )}
        
        <CaixaHeader 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <FaturaList 
              faturas={faturas}
              loading={loading}
              onPagamentoSuccess={handlePagamentoSuccess}
            />
          </div>
          
          <div className="lg:col-span-1">
            <Estatisticas data={estatisticas} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caixa;