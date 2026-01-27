"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { updateApiKey } from "@/lib/api-keys"
import { toast } from "react-toastify"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface EditApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey?: { id: string; name: string; expire_at?: string; tenant_id?: string }
  onUpdated: () => void
}

interface FormData {
  name: string
  expire_at?: string
}

export function EditApiKeyModal({ isOpen, onClose, apiKey, onUpdated }: EditApiKeyModalProps) {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (apiKey) {
      reset({
        name: apiKey.name,
        expire_at: apiKey.expire_at ? apiKey.expire_at.substring(0, 10) : "",
      })
    }
  }, [apiKey, reset])

  const onSubmit = async (data: FormData) => {
    if (!apiKey) return
    try {
      setLoading(true)
      await updateApiKey(apiKey.id, {
        name: data.name,
        expire_at:"2024-12-21",
        tenant_id:"8a248eda-fef2-4d1f-8980-7e277551761e",
      })
      toast.success("Chave atualizada com sucesso!")
      onUpdated()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar chave")
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Chave de API</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Chave *</Label>
            <Input
              id="name"
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
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
