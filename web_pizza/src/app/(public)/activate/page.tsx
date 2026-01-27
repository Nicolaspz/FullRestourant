"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/services/apiClients"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ActivatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Token não encontrado")
      return
    }

    const activateUser = async () => {
      try {
        // Usando params do axios em vez de construir manualmente a URL
        const response = await api.get("/activation", {
          params: { token }
        })
    
        if (response.status === 200) {
          setStatus("success")
          setMessage("Conta ativada com sucesso!")
          setTimeout(() => router.push("/login"), 3000)
        } else {
          setStatus("error")
          setMessage("Erro na ativação da conta")
        }
        
      } catch(err: any) {
        setStatus("error")
        
        // Tratamento específico por status code
        if (err.response?.status === 400) {
          setMessage("Token inválido ou expirado")
        } else if (err.response?.status === 404) {
          setMessage("Endpoint de ativação não encontrado")
        } else if (err.code === "NETWORK_ERROR") {
          setMessage("Erro de conexão com o servidor")
        } else {
          setMessage("Erro ao ativar a conta. Tente novamente.")
        }
        
        console.log("Erro ao ativar usuário", err)
      }
    }

    activateUser()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Ativação de Conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
              <p className="mt-2 text-center">Ativando sua conta...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="mt-2 text-center text-green-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500 text-center">Redirecionando para login...</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-10 w-10 text-red-500" />
              <p className="mt-2 text-center text-red-600 font-medium">{message}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => router.push("/signup")} variant="outline">
                  Criar nova conta
                </Button>
                <Button onClick={() => router.push("/login")}>
                  Fazer login
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}