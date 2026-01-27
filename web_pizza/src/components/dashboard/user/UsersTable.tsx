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
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserPlus,
  Search,
  Filter,
  Loader2,
  Phone,
  Mail
} from "lucide-react";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify"; 
import { UserFormModal } from "./UserFormModal";
import { AuthContext } from "@/contexts/AuthContext";
import { DeleteDialog } from "./userConfirmModal";

export interface User {
  id: string;
  name: string;
  email: string;
  telefone: string;
  role: string;
  user_name: string;
  created_at?: string;
  updated_at?: string;
}

interface UsersTableProps {
  organizationId?: string;
}

export function UsersTable({ organizationId }: UsersTableProps) {
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Estados para modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDeleteDialog = () => {
    if (!isSubmitting) {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users", {
        params: { organizationId: user?.organizationId },
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchUsers();
    }
  }, [user?.token]);

  // Filtrar usuários - MESMA LÓGICA DO SEU COMPONENTE
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.telefone.includes(searchTerm);
    const matchesRole = roleFilter === "all" || userItem.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Criar usuário - MESMO MÉTODO DO SEU COMPONENTE
  const handleCreateUser = async (userData: any) => {
    try {
      setIsSubmitting(true);
      await apiClient.post(
        '/users',
        {
          name: userData.name,
          email: userData.email,
          telefone: userData.telefone,
          user_name: userData.user_name,
          role: userData.role,
          password: userData.password,
          organizationId: user?.organizationId
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      toast.success("Usuário criado com sucesso!");
      fetchUsers();
      setIsFormModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast.error(error.response?.data?.message || "Erro ao criar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar usuário - MESMO MÉTODO DO SEU COMPONENTE
  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await apiClient.put(
        `/user?userId=${selectedUser.id}`,
        {
          name: userData.name,
          email: userData.email,
          telefone: userData.telefone,
          user_name: userData.user_name,
          role: userData.role,
          ...(userData.password && { password: userData.password }) // Só envia senha se preenchida
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      toast.success("Usuário atualizado com sucesso!");
      fetchUsers();
      setIsFormModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Erro ao editar usuário:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Erro ao editar usuário");
    } finally {
      setIsSubmitting(false);
    }
};

  // Excluir usuário - MESMO MÉTODO DO SEU COMPONENTE
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await apiClient.delete(`/user?userId=${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      toast.success('Usuário removido com sucesso!');
      fetchUsers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast.error(error.response?.data?.message || "Erro ao remover usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de criação
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  // Abrir modal de edição
  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  // Abrir diálogo de exclusão
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN": return "destructive";
      case "CLIENT": return "secondary";
      default: return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrador";
      case "CLIENT": return "Usuário";
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros e ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema ({users.length} usuários)
              </CardDescription>
            </div>
            <Button onClick={openCreateModal}>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os perfis</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="CLIENT">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {users.length === 0 ? "Nenhum usuário cadastrado" : "Nenhum usuário encontrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell className="font-medium">{userItem.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="text-sm">{userItem.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span className="text-sm">{userItem.telefone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          @{userItem.user_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(userItem.role)}>
                          {getRoleLabel(userItem.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditModal(userItem)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(userItem)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Formulário (Reutilizável) */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={modalMode === 'create' ? handleCreateUser : handleEditUser}
        isSubmitting={isSubmitting}
        mode={modalMode}
        initialData={selectedUser}
        organizationId={user?.organizationId || organizationId || ''}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteUser}
        user={selectedUser}
        isSubmitting={isSubmitting}
      />
    </div>
   
  );
}