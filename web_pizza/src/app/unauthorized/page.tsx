// app/unauthorized/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, Home } from "lucide-react"
import { useEffect } from 'react'

export default function UnauthorizedPage() {
  const router = useRouter()

  // Opcional: Redirecionar automaticamente após alguns segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900">
          <Shield className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta página com o seu tipo de usuário.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
        </div>

        
      </div>
    </div>
  )
}