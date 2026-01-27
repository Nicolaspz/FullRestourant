"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/services/apiClients"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmNewPassword) {
      setMessage("As senhas não coincidem")
      setStatus("error")
      return
    }

    if (!token) {
      setMessage("Token inválido ou não encontrado")
      setStatus("error")
      return
    }

    try {
      setStatus("loading")

      const response = await api.post(`/auth/reset-password?token=${token}`, {
        newPassword,
        confirmNewPassword
      })

      if (response.status === 200) {
        setStatus("success")
        setMessage("Senha redefinida com sucesso!")
        setTimeout(() => router.push("/login"), 3000)
      }
    } catch (err: any) {
      setStatus("error")

      if (err.response?.status === 400) {
        setMessage("Token inválido ou expirado")
      } else {
        setMessage("Erro ao redefinir senha, tente novamente")
      }
      console.error("Erro reset password", err)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Redefinir Senha</CardTitle>
         
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "form" && (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmar Senha</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Redefinir Senha
              </Button>
            </form>
          )}

          {status === "loading" && (
            <>
              <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
              <p className="mt-2 text-center">Processando...</p>
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
              <Button onClick={() => setStatus("form")} className="mt-4">
                Tentar novamente
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
