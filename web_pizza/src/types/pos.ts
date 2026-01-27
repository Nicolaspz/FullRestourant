// types/pos.ts
export interface ItemPOS {
    id: string;
    produto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
    categoria: string;
    pedidoNome: string;
    criadoEm: Date;
  }
  
  export interface ResumoCategoria {
    categoria: string;
    total: number;
    quantidadeItens: number;
    percentual: string;
  }
  
  export interface PedidoDetalhado {
    id: string;
    nomePedido: string;
    criadoEm: Date;
    items: Array<{
      produto: string;
      quantidade: number;
      precoUnitario: number;
      subtotal: number;
      categoria: string;
    }>;
    totalPedido: number;
  }
  
  export interface OrganizacaoInfo {
    name: string;
    address?: string;
    nif?: string;
    telefone?: string;
  }
  
  export interface MesaInfo {
    id: string;
    numero: number;
    capacidade: number;
    statusAnterior: string;
  }
  
  export interface EstatisticasSessao {
    totalPedidos: number;
    mediaPorPedido: number;
    horaAbertura: string;
    horaFechamento: string;
    duracaoMinutos: number;
  }
  
  export interface FaturaInfo {
    numeroFatura: string;
    status: string;
    referenciaPagamento: string;
  }
  
  export interface PosData {
    // Informações básicas
    mesaNumero: number;
    codigoAbertura: string;
    abertaEm: Date;
    fechadaEm: Date;
    sessionId: string;
    
    // Informações da mesa
    mesaInfo: MesaInfo;
    
    // Informações da organização
    organizacaoInfo: OrganizacaoInfo;
    
    // Dados de consumo
    pedidos: PedidoDetalhado[];
    itemsAgrupados: ItemPOS[];
    resumoCategorias: ResumoCategoria[];
    
    // Totais
    totalGeral: number;
    totalItens: number;
    ivaIncluido: number;
    subtotal: number;
    
    // Estatísticas
    estatisticas: EstatisticasSessao;
    
    // Para fatura
    faturaInfo: FaturaInfo;
  }