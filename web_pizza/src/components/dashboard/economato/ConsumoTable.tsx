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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { 
  Loader2,
  Plus
} from "lucide-react";
import { toast } from 'react-toastify';
import { AuthContext } from "@/contexts/AuthContext";
import { economatoService, Area, ConsumoInterno } from "@/services/economato";
import { api } from "@/services/apiClients";

export function ConsumoTable() {
  const { user } = useContext(AuthContext);
  const [consumos, setConsumos] = useState<ConsumoInterno[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [newData, setNewData] = useState({
    areaId: '',
    productId: '',
    quantity: 0,
    motivo: '',
    observacoes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      if (!user?.organizationId) return;
      try {
        const areasData = await economatoService.getAreas(user.organizationId);
        setAreas(areasData);
        
        const prodResponse = await api.get('/produts', {
          params: { organizationId: user.organizationId }
        });
        setProducts(prodResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    loadData();
  }, [user?.organizationId]);

  // Carregar Consumos
  const fetchConsumos = async () => {
    if (!user?.organizationId) return;
    try {
      setIsLoading(true);
      const params: any = {};
      if (areaFilter !== 'all') params.areaId = areaFilter;

      const data = await economatoService.getConsumos(params, user.organizationId);
      setConsumos(data.data || []);
    } catch (error) {
      console.error("Erro ao carregar consumos:", error);
      toast.error("Erro ao carregar consumos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumos();
  }, [areaFilter, user?.organizationId]);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId) return;
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      await economatoService.createConsumo({
        areaId: newData.areaId,
        productId: newData.productId,
        quantity: Number(newData.quantity),
        motivo: newData.motivo,
        observacoes: newData.observacoes
      }, user.organizationId, user.id);

      toast.success("Consumo registrado com sucesso!");
      setIsSheetOpen(false);
      setNewData({
        areaId: '',
        productId: '',
        quantity: 0,
        motivo: '',
        observacoes: ''
      });
      fetchConsumos();
    } catch (error: any) {
      console.error("Erro ao registrar consumo:", error);
      toast.error(error.response?.data?.error || "Erro ao registrar consumo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Histórico de Consumo Interno</CardTitle>
            <CardDescription>Registe quebras, refeições de staff e outros consumos internos</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Áreas</SelectItem>
                {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="destructive">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Quebra/Consumo
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Registrar Quebra / Consumo</SheetTitle>
                  <SheetDescription>Desconta stock de uma área por motivos internos.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label>Área (Baixa de Stock)</Label>
                    <Select 
                      value={newData.areaId} 
                      onValueChange={(val) => setNewData({...newData, areaId: val})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                      <SelectContent>
                        {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Select 
                      value={newData.productId} 
                      onValueChange={(val) => setNewData({...newData, productId: val})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={newData.quantity}
                      onChange={(e) => setNewData({...newData, quantity: Number(e.target.value)})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Select 
                      value={newData.motivo} 
                      onValueChange={(val) => setNewData({...newData, motivo: val})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quebra">Quebra / Avaria</SelectItem>
                        <SelectItem value="Refeição Staff">Refeição Staff</SelectItem>
                        <SelectItem value="Degustação">Degustação</SelectItem>
                        <SelectItem value="Validade">Validade Expirada</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Input 
                      value={newData.observacoes}
                      onChange={(e) => setNewData({...newData, observacoes: e.target.value})}
                    />
                  </div>
                  
                  <SheetFooter>
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                      Registrar Baixa
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="flex justify-center py-8">
             <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
           </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                consumos.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.criadoEm).toLocaleDateString()} {new Date(item.criadoEm).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                    <TableCell>{item.area.nome}</TableCell>
                    <TableCell>{item.product?.name}</TableCell>
                    <TableCell>{item.quantity} {item.product?.unit || 'un'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.motivo}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.observacoes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
