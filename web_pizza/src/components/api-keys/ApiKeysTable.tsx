'use client'

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, Edit2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { toast } from "react-toastify"
import { deleteApiKey } from "@/lib/api-keys"
import { useContext, useMemo, useState } from "react"
import { ApiKeyModal } from "./AddApiKeyModal"
import { DeleteAlert } from "../deteleteconfirm"
import { AuthContext } from "@/contexts/AuthContext"

interface ApiKey {
  id: string
  name: string
  key: string
  status: "active" | "inactive" | "expired"
  createdAt: string
  expiresAt?: string
}

interface ApiKeysTableProps {
  data: ApiKey[]
  onRefresh: () => void
}

export function ApiKeysTable({ data, onRefresh }: ApiKeysTableProps) {
  const [editing, setEditing] = useState<ApiKey | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof ApiKey; direction: "asc" | "desc" } | null>(null)
  const {user}=useContext(AuthContext)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Chave copiada para a área de transferência!")
  }

  const handleDelete = async (id: string) => {
   
    try {
      
     if (!user?.tenant_id) {
        return
      } 

      await deleteApiKey(id,user.tenant_id)
      toast.success("Chave deletada com sucesso!")
      onRefresh()
    } catch (error) {
      console.log(error)
      toast.error("Erro ao deletar chave")
    }
    
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>
      case "inactive":
        return <Badge variant="secondary">Inativa</Badge>
      case "expired":
        return <Badge variant="destructive">Expirada</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const requestSort = (key: keyof ApiKey) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") direction = "desc"
    setSortConfig({ key, direction })
  }

  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal == null || bVal == null) return 0

      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(aVal as string).getTime() - new Date(bVal as string).getTime()
          : new Date(bVal as string).getTime() - new Date(aVal as string).getTime()
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [data, sortConfig])

  const getSortIcon = (key: keyof ApiKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-60" />
    }
    return sortConfig.direction === "asc"
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const SortableHead = ({ label, column }: { label: string; column: keyof ApiKey }) => (
    <TableHead
      onClick={() => requestSort(column)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          requestSort(column)
        }
      }}
      role="button"
      tabIndex={0}
      aria-sort={
        sortConfig?.key === column ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"
      }
      title="Clique para ordenar"
      className="cursor-pointer select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {getSortIcon(column)}
      </div>
    </TableHead>
  )

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Nome ordenável (ícone sempre visível) */}
            <SortableHead label="Nome" column="name" />
            <TableHead>Chave</TableHead>
            <TableHead>Status</TableHead>
            {/* Data ordenável (ícone sempre visível) */}
            <SortableHead label="Criada em" column="createdAt" />
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((apiKey) => (
            <TableRow key={apiKey.id}>
              <TableCell className="font-medium">{apiKey.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {apiKey.key.substring(0, 8)}...
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(apiKey.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
              <TableCell>
                {new Date(apiKey.createdAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(apiKey)} className="cursor-pointer">
                    <Edit2 className="h-4 w-4 text-blue-600" />
                  </Button>
                  <DeleteAlert onConfirm={() => handleDelete(apiKey.id)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editing && (
        <ApiKeyModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          mode="edit"
          initialData={{ id: editing.id, name: editing.name, expire_at: editing.expiresAt }}
          onSuccess={onRefresh}
        />
      )}
    </Card>
  )
}
