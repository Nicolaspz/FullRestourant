"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { createApiKey, updateApiKey } from "@/lib/api-keys"
import { toast } from "react-toastify"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  initialData?: {
    id: string
    name: string
    expire_at?: string
  }
  onSuccess?: () => void
}

interface FormData {
  name: string
  expire_at?: string
}

export function ApiKeyModal({ isOpen, onClose, mode, initialData, onSuccess }: ApiKeyModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>()
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)

  // Se estiver no modo edit, preenche os valores
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setValue("name", initialData.name)
      if (initialData.expire_at) {
        setValue("expire_at", initialData.expire_at)
      }
    } else {
      reset()
    }
  }, [mode, initialData, reset, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      if (mode === "create") {
        await createApiKey({
          name: data.name,
          tenant_id: user?.tenant_id,
        })
        toast.success("Chave criada com sucesso!")
      } else if (mode === "edit" && initialData) {
        await updateApiKey(initialData.id, {
          name: data.name,
          expire_at: "2024-12-21",
          tenant_id: user?.tenant_id,
        })
        toast.success("Chave atualizada com sucesso!")
      }

      onClose()
      reset()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao salvar chave de API")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Nova Chave de API" : "Editar Chave de API"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Chave *</Label>
            <Input
              id="name"
              placeholder="Ex: Integração com ERP"
              {...register("name", { required: true })}
              disabled={loading}
            />
          </div>

          

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? mode === "create" ? "Gerando..." : "Salvando..."
                : mode === "create" ? "Gerar Chave" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
