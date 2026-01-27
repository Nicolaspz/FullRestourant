import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Smartphone } from "lucide-react"

export function SecuritySection() {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Segurança</h2>
        <p className="text-sm text-gray-600">Proteja seu acesso ao sistema</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Key className="text-gray-500" />
            <div>
              <h3 className="font-medium">Senha de Acesso</h3>
              <p className="text-sm text-gray-600">Última alteração: 15/05/2023</p>
            </div>
          </div>
          <Button variant="outline">Alterar Senha</Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="text-gray-500" />
            <div>
              <h3 className="font-medium">Autenticação em Dois Fatores</h3>
              <p className="text-sm text-gray-600">Proteção adicional para sua conta</p>
            </div>
          </div>
          <Badge variant="outline">Desativado</Badge>
        </div>
      </div>
    </Card>
  )
}