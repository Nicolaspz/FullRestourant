import { setupAPIClient } from "./api";

// Definição de Tipos
export type Area = {
  id: string;
  nome: string;
  descricao?: string;
  organizationId: string;
  _count?: {
    economato: number;
  };
};

export type EconomatoItem = {
  id: string;
  areaId: string;
  productId: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  product: {
    name: string;
    unit: string;
    isIgredient: boolean;
    Category?: {
      name: string;
    };
  };
  area: {
    nome: string;
  };
  nivel?: string; // CRITICO, MODERADO, etc.
};


export type PedidoArea = {
  id: string;
  areaOrigemId: string;
  areaDestinoId: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado' | 'cancelado';
  observacoes?: string;
  confirmationCode?: string;
  criadoEm: string;
  areaOrigem: { nome: string };
  areaDestino: { nome: string };
  itens: {
    id: string;
    productId: string;
    quantity: number;
    product: { name: string; unit: string };
  }[];
};

export type ConsumoInterno = {
  id: string;
  areaId: string;
  productId: string;
  quantity: number;
  motivo: string;
  observacoes?: string;
  criadoEm: string;
  area: { nome: string };
  product: { name: string; unit: string };
};

// Serviço API
export const economatoService = {
  // Áreas
  getAreas: async (organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.get('/areas', {
      params: { organizationId }
    });
    return response.data.data as Area[];
  },

  createArea: async (data: { nome: string; descricao?: string }, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.post('/areas', data, {
      params: { organizationId }
    });
    return response.data;
  },

  updateArea: async (id: string, data: { nome?: string; descricao?: string }, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.put(`/areas/${id}`, data, {
      params: { organizationId }
    });
    return response.data;
  },

  deleteArea: async (id: string, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.delete(`/areas/${id}`, {
      params: { organizationId }
    });
    return response.data;
  },

  // Stock / Economato
  getStockByArea: async (areaId: string, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.get(`/economato/area/${areaId}`, {
      params: { organizationId }
    });
    return response.data; // Retorna { data: [], count: 0, totalQuantidade: 0 }
  },

  addStock: async (data: { areaId: string; productId: string; quantity: number }, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.post('/economato/add', data, {
      params: { organizationId }
    });
    return response.data;
  },

  adjustStock: async (data: any, organizationId: string, userId: string) => {
    const api = setupAPIClient();
    const response = await api.put('/economato/ajuste', data, {
      params: { organizationId, id: userId }
    });
    return response.data;
  },

  transferStock: async (data: any, organizationId: string, userId: string) => {
    const api = setupAPIClient();
    const response = await api.post('/economato/transferir', data, {
      params: { organizationId, id: userId }
    });
    return response.data;
  },
  
  // Pedidos
  getPedidos: async (params: any, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.get('/pedidos-area', {
      params: { ...params, organizationId }
    });
    return response.data.data as PedidoArea[];
  },

  createPedido: async (data: any, organizationId: string, userId: string) => {
    const api = setupAPIClient();
    const response = await api.post('/pedidos-area', data, {
      params: { organizationId, id: userId }
    });
    return response.data;
  },

  processPedido: async (pedidoId: string, status: string, organizationId: string, userId: string) => {
   try {
      const api = setupAPIClient();
      console.log('Enviando processar:', {
        pedidoId,
        status,
        organizationId,
        userId
      });
      
      const response = await api.put(`/pedidos-area/${pedidoId}/processar`, 
        { status },
        {
          params: { 
            organizationId, 
            // Não envie userId aqui, ele vem do token
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      throw error;
    }
  },

  confirmPedido: async (pedidoId: string, code: string, organizationId: string, userId: string) => {
   try {
      const api = setupAPIClient();
      console.log('Enviando confirmar:', {
        pedidoId,
        code,
        organizationId,
        userId
      });
      
      const response = await api.post(`/pedidos-area/${pedidoId}/confirmar`, 
        { code },
        {
          params: { organizationId},
          
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      throw error;
    }
  },
  

  // Consumo
  getConsumos: async (params: any, organizationId: string) => {
    const api = setupAPIClient();
    const response = await api.get('/consumo-interno', {
      params: { ...params, organizationId }
    });
    return response.data;
  },

  createConsumo: async (data: any, organizationId: string, userId: string) => {
    const api = setupAPIClient();
    const response = await api.post('/consumo-interno', data, {
      params: { organizationId, id: userId }
    });
    return response.data;
  }
};
