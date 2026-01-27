// components/settings/OrganizationSection.tsx
"use client"
import { useState, useRef, ChangeEvent, FormEvent, useContext, useEffect } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from '@/contexts/AuthContext'
import { setupAPIClient } from "@/services/api"
import { API_BASE_URL } from '../../../config' 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, Building2 } from "lucide-react"
import { Organization } from '@/types/product'

interface OrganizationSectionProps {
  organization: Organization
  onUpdateSuccess?: (updatedOrg: Organization) => void
}

export function OrganizationSection({ organization, onUpdateSuccess }: OrganizationSectionProps) {
  const [formData, setFormData] = useState<Organization>(organization)
  const [preview, setPreview] = useState<string | null>(organization.imageLogo || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const apiClient = setupAPIClient()
  const { user } = useContext(AuthContext)

  useEffect(() => {
    setFormData(organization)
    setPreview(organization.imageLogo || null)
  }, [organization])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      
      // Validação do arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem válido')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }

      // Cria preview da nova imagem
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('nif', formData.nif)

      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('imageLogo', fileInputRef.current.files[0])
      }

      const response = await apiClient.put(
        `/organization/${organization.id}`, 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.token}`
          }
        }
      )

      toast.success('Organização atualizada com sucesso!')
      onUpdateSuccess?.(response.data)
      setIsEditing(false)
    } catch (error: any) {
      console.error('Erro completo:', error)
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.message ||
                         'Erro ao atualizar organização'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(organization)
    setPreview(organization.imageLogo || null)
    setIsEditing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Informações da Organização</h2>
        <p className="text-sm text-gray-600">Gerencie os dados da sua empresa</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload de Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-gray-200">
              <AvatarImage 
                src={preview?.startsWith('data:') ? preview : `${API_BASE_URL}/tmp/${formData.imageLogo}`} 
                alt="Logo da organização" 
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                <Building2 className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isEditing && (
            <div className="text-center">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <input
                  id="logo-upload"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-blue-600 hover:text-blue-700">
                  Alterar logo
                </span>
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG até 5MB
              </p>
            </div>
          )}
        </div>

        {/* Campos do formulário */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Organização</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing || isLoading}
              placeholder="Nome da sua empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nif">NIF</Label>
            <Input
              id="nif"
              name="nif"
              value={formData.nif}
              onChange={handleInputChange}
              disabled={!isEditing || isLoading}
              placeholder="Número de identificação fiscal"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing || isLoading}
              placeholder="Endereço completo"
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 pt-4">
          {!isEditing ? (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Editar Informações
            </Button>
          ) : (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  )
}