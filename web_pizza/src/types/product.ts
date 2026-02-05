export interface Category {
    id: string;
    name: string;
    organizationId: string;
  }
  
  export interface PrecoVenda {
    preco_venda: number;
    precoSugerido?: number;
    data_inicio?: string;
    data_fim?: string;
    precisaAtualizar?: boolean;
  }
  
  export interface RecipeItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    impactaPreco: boolean;
    ingredient: {
      id: string;
      name: string;
      unit: string;
      price: number;
      PrecoVenda?: PrecoVenda[];
    };
  }
  
  export interface Product {
  id: string;
  name: string;
  description: string;
  banner?: string;
  unit: string;
  is_fractional: boolean;
  isDerived: boolean;
  isIgredient: boolean;
  PrecoVenda: PrecoVenda[];
  recipeItems: RecipeItem[];
  categoryId: string;
  organizationId: string;
  defaultAreaId?: string; // ← Já tem
  defaultArea?: { // ← Adicione esta propriedade
    id: string;
    nome: string;
    descricao?: string;
  };
  Category?: {
    name: string;
    id: string;
  };
  productAreaMappings?: Array<{ // ← Opcional
    area: {
      id: string;
      nome: string;
    };
    isDefault: boolean;
  }>;
  created_at?: string;
  updated_at?: string;
}
  
  // Em @/types/product.ts
export interface ProductFormData {
  name: string;
  description: string;
  unit: string;
  isDerived: boolean;
  isIgredient:boolean;
  categoryId: string;
  file: File | null;
  previewImage: string;
  price: number;
  existingBanner?: string;
  defaultAreaId: string;
}
export interface Ingredient {
  id: string;
  name: string;
  description: string;
  banner?: string;
  unit: string;
  is_fractional: boolean;
  isDerived: boolean;
  isIgredient: boolean;
  categoryId: string;
  organizationId: string;
  category?: Category; // Adicione esta linha
  created_at?: string;
  updated_at?: string;
  defaultAreaId?:string;
}
  
  export interface CartItem {
    product: Product;
    quantity: number;
  }

  // types/fatura.ts
export interface FaturaItem {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

export interface Fatura {
  id: string;
  numero: string;
  mesa: string;
  cliente: string;
  valorTotal: number;
  status: 'pendente' | 'paga' | 'cancelada';
  itens: FaturaItem[];
  criadaEm: string;
  pagaEm:string;
  metodoPagamento:string;
  session:{
    mesa:{
      number:number;
    }
    Order:{}
  }
}

export interface Organization {
  id: string
  name: string
  address: string
  nif: string
  imageLogo?: string | null
}

// types/mesa.ts
export interface Mesa {
  id: string;
  number: number;
  capacidade: number;
  status: 'livre' | 'ocupada' | 'reservada' | 'manutencao';
  qrCodeUrl?: string;
  reservas: Reserva[];
  sessions: Session[];
}

export interface Reserva {
  id: string;
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  dataReserva: string;
  quantidadePessoas: number;
  status: string;
}

export interface Session {
  id: string;
  status: boolean;
  abertaEm: string;
  Order?: Order[];
}

export interface Order {
  id: string;
  items: Item[];
}

export interface Item {
  id: string;
  amount: number;
}