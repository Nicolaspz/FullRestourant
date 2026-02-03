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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from 'react-toastify';
import { AuthContext } from "@/contexts/AuthContext";
import { economatoService, Area } from "@/services/economato";

export function AreasTable() {
  const { user } = useContext(AuthContext);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAreas = async () => {
    if (!user?.organizationId) return;
    try {
      setIsLoading(true);
      const data = await economatoService.getAreas(user.organizationId);
      setAreas(data);
    } catch (error) {
      console.error("Erro ao carregar áreas:", error);
      toast.error("Erro ao carregar áreas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [user?.organizationId]);

  const handleOpenSheet = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({ nome: area.nome, descricao: area.descricao || '' });
    } else {
      setEditingArea(null);
      setFormData({ nome: '', descricao: '' });
    }
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId) return;

    try {
      setIsSubmitting(true);
      if (editingArea) {
        await economatoService.updateArea(editingArea.id, formData, user.organizationId);
        toast.success("Área atualizada com sucesso!");
      } else {
        await economatoService.createArea(formData, user.organizationId);
        toast.success("Área criada com sucesso!");
      }
      setIsSheetOpen(false);
      fetchAreas();
    } catch (error) {
      console.error("Erro ao salvar área:", error);
      toast.error("Erro ao salvar área");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.organizationId) return;
    if (!confirm("Tem certeza que deseja excluir esta área? Isso pode afetar o stock associado.")) return;

    try {
      await economatoService.deleteArea(id, user.organizationId);
      toast.success("Área excluída com sucesso");
      fetchAreas();
    } catch (error) {
      console.error("Erro ao excluir área:", error);
      toast.error("Erro ao excluir área");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Áreas de Stock</CardTitle>
            <CardDescription>Gerencie os locais de armazenamento (Ex: Cozinha, Bar, Armazém).</CardDescription>
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => handleOpenSheet()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Área
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingArea ? 'Editar Área' : 'Nova Área'}</SheetTitle>
                <SheetDescription>
                  Configure os detalhes da área de armazenamento.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label>Nome da Área</Label>
                  <Input 
                    placeholder="Ex: Bar Principal" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (Opcional)</Label>
                  <Input 
                    placeholder="Detalhes sobre a localização ou finalidade" 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {editingArea ? 'Salvar Alterações' : 'Criar Área'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

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
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Itens em Stock</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma área cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.nome}</TableCell>
                    <TableCell>{area.descricao || '-'}</TableCell>
                    <TableCell>
                      {/* @ts-ignore - economato count might assume preloading/aggregation */}
                      {area.economato?.length || 0} itens
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenSheet(area)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(area.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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