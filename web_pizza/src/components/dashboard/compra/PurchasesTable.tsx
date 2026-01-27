'use client';

import { useState, useEffect, useContext } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Search,
  Eye,
  CheckCircle
} from "lucide-react";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify"; 
import { AuthContext } from "@/contexts/AuthContext";
import { CreatePurchaseModal } from "./CreatePurchaseModal";
import { PurchaseProductsModal } from "./PurchaseProductsModal";
import { AddToStockButton } from "./AddToStockButton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Purchase {
  id: string;
  name: string;
  description: string;
  qtdCompra: number;
  organizationId: string;
  supplierId: string;
  status: boolean;
  created_at: string;
  supplier?: {
    id: string;
    name: string;
  };
}

interface PurchasesTableProps {
  refreshKey: number;
}

export default function PurchasesTable({ refreshKey }: PurchasesTableProps) {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  
  const itemsPerPage = 10;
  const apiClient = setupAPIClient();

  // Contadores para cada tab
  const counts = {
    all: purchases.length,
    completed: purchases.filter(p => p.status).length,
    pending: purchases.filter(p => !p.status).length
  };

  const fetchPurchases = async () => {
    try {
      const response = await apiClient.get('/compra', {
        params: { organizationId: user?.organizationId },
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setPurchases(response.data);
      filterPurchases(response.data, searchTerm, activeTab);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      toast.error('Erro ao carregar compras');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPurchases = (purchases: Purchase[], term: string, tab: typeof activeTab) => {
    let filtered = purchases;
    
    // Aplica filtro por termo de busca
    if (term.trim() !== '') {
      filtered = filtered.filter(purchase =>
        purchase.name.toLowerCase().includes(term.toLowerCase()) ||
        purchase.description.toLowerCase().includes(term.toLowerCase()) ||
        purchase.supplier?.name.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Aplica filtro por status
    if (tab === 'completed') {
      filtered = filtered.filter(purchase => purchase.status);
    } else if (tab === 'pending') {
      filtered = filtered.filter(purchase => !purchase.status);
    }
    
    setFilteredPurchases(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user?.token) {
      fetchPurchases();
    }
  }, [refreshKey, user?.token]);

  useEffect(() => {
    filterPurchases(purchases, searchTerm, activeTab);
  }, [searchTerm, activeTab, purchases]);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const handleOpenProductsModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowProductsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com busca e ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar compras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={activeTab} onValueChange={(value: 'all' | 'completed' | 'pending') => setActiveTab(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({counts.all})</SelectItem>
              <SelectItem value="pending">Pendentes ({counts.pending})</SelectItem>
              <SelectItem value="completed">Concluídas ({counts.completed})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)} className="sm:w-auto w-full">
          <Plus className="w-4 h-4 mr-2" />
          Nova Compra
        </Button>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchTerm 
                    ? "Nenhuma compra encontrada com esse termo" 
                    : activeTab === 'all'
                      ? "Nenhuma compra cadastrada ainda"
                      : activeTab === 'pending'
                        ? "Nenhuma compra pendente"
                        : "Nenhuma compra concluída"}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.name}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {purchase.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {purchase.supplier?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={purchase.status ? "default" : "secondary"}>
                      {purchase.status ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluída
                        </>
                      ) : (
                        "Pendente"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProductsModal(purchase)}
                        className={purchase.status ? "" : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"}
                      >
                        {purchase.status ? (
                          <Eye className="w-4 h-4 mr-1" />
                        ) : (
                          <Plus className="w-4 h-4 mr-1" />
                        )}
                        {purchase.status ? 'Ver Itens' : 'Adicionar Itens'}
                      </Button>
                      
                      <AddToStockButton
                        purchaseId={purchase.id}
                        onSuccess={fetchPurchases}
                        status={purchase.status}
                        organizationId={user?.organizationId || ''}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(number)}
                className="w-8 h-8 p-0"
              >
                {number}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreatePurchaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchPurchases();
          setShowCreateModal(false);
        }}
      />

      {showProductsModal && selectedPurchase && (
        <PurchaseProductsModal
          purchase={selectedPurchase}
          onClose={() => setShowProductsModal(false)}
          onSuccess={fetchPurchases}
        />
      )}
    </div>
  );
}