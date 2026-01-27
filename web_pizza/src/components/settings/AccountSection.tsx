import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AccountSection() {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Informações da Conta</h2>
        <p className="text-sm text-gray-600">Atualize seus dados básicos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" defaultValue="João Silva" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" defaultValue="joao@empresa.com" disabled />
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="cursor-pointer">Salvar Alterações</Button>
      </div>
    </Card>
  )
}