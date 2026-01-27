'use client';

import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { setupAPIClient } from '@/services/api';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

// Components
import MesaStatusTabs from '@/components/dashboard/mesas/MesaStatusTabs';
import NovaReservaForm from '@/components/dashboard/mesas/NovaReservaForm';

// Types
import { Mesa } from '@/types/product'; 
import { parseCookies } from 'nookies';
import { gerarPDFReciboNaoPago } from '@/components/dashboard/mesas/pdfNpago';

export default function GerenciamentoMesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [activeTab, setActiveTab] = useState('todas');
  const [isLoading, setIsLoading] = useState(true);
  const { '@servFixe.token': token } = parseCookies();
  const [novaReserva, setNovaReserva] = useState({
    mesaId: '',
    clienteNome: '',
    clienteTelefone: '',
    clienteEmail: '',
    dataReserva: '',
    quantidadePessoas: 4
  });
  
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      const response = await apiClient.get('/mesas', {
        params: { 
          organizationId: user?.organizationId 
        },
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      console.log("mesas",response)
      

      setMesas(response.data);
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      toast.error('Erro ao carregar mesas');
    } finally {
      setIsLoading(false);
    }
  };

  const gerarQRCode = async (mesaId: string, mesaNumber: number) => {
    try {
      const qrData = {
        url: `${window.location.origin}/menu/${user?.organizationId}/${mesaNumber}`,
        mesaId,
        mesaNumber
      };

      const response = await apiClient.post('/mesas/gerar-qrcode', qrData);
      
      setMesas(prev => prev.map(mesa => 
        mesa.id === mesaId ? { ...mesa, qrCodeUrl: response.data.qrCodeUrl } : mesa
      ));
      
      toast.success('QR Code gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const criarReserva = async (reservaData: any) => {
    if (!reservaData.mesaId || !reservaData.clienteNome || !reservaData.dataReserva) {
      toast.warning('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apiClient.post('/reservas', {
        ...reservaData,
        organizationId: user?.organizationId
      });
      
      toast.success('Reserva criada com sucesso!');
      fetchMesas(); // Atualizar lista
      setNovaReserva({
        mesaId: '',
        clienteNome: '',
        clienteTelefone: '',
        clienteEmail: '',
        dataReserva: '',
        quantidadePessoas: 4
      });
      setActiveTab('todas');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast.error('Erro ao criar reserva');
    }
  };

  const fecharMesa = async (mesaId: string) => {
    try {
      // Primeiro, buscar a mesa pelo ID para obter o número
      const mesa = mesas.find(m => m.id === mesaId);
      
      if (!mesa) {
        toast.error('Mesa não encontrada');
        return;
      }
      
      // Captura os dados da sessão fechada
      const response = await apiClient.get(`/close_table/${mesa.number}`, {
        params: { 
          organizationId: user?.organizationId 
        },
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      // Dados retornados do fecharSessao
      const dadosSessao = response.data;
      
      toast.success('Mesa fechada com sucesso!');
      fetchMesas();
      
      // Gerar PDF do recibo não pago
      gerarPDFReciboNaoPago(dadosSessao);
      
    } catch (error) {
      console.error('Erro ao fechar mesa:', error);
      toast.error('Erro ao fechar mesa');
    }
  };

  // Filtrar mesas
  const mesasLivres = mesas.filter(m => m.status === 'livre');
  const mesasOcupadas = mesas.filter(m => m.status === 'ocupada');
  const mesasReservadas = mesas.filter(m => m.status === 'reservada');

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando mesas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Header />
      
      {activeTab === 'nova-reserva' ? (
        <NovaReservaForm
          mesasLivres={mesasLivres}
          onSubmit={criarReserva}
          onCancel={() => setActiveTab('todas')}
          initialData={novaReserva}
        />
      ) : (
        <MesaStatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mesas={mesas}
          mesasLivres={mesasLivres}
          mesasOcupadas={mesasOcupadas}
          mesasReservadas={mesasReservadas}
          user={user}
          onGerarQRCode={gerarQRCode}
          onFecharMesa={fecharMesa}
        />
      )}

      <AddMesaButton />
    </div>
  );
}

// Subcomponentes da página
const Header = () => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Mesas</h1>
    <p className="text-gray-600">Gerencie mesas, reservas e QR Codes</p>
  </div>
);

const AddMesaButton = () => (
  <div className="fixed bottom-6 right-6">
    <Button 
      size="lg" 
      className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
    >
      <Plus className="h-6 w-6" />
    </Button>
  </div>
);