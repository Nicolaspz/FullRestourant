import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Hash, Link2 } from "lucide-react"

export function ReferencesSection() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Referências</h2>
        <Button className="cursor-pointer">
          Gerar Nova Referência
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 flex items-center space-x-3">
          <Hash className="text-gray-500" />
          <div>
            <h3 className="font-medium">Código Interno</h3>
            <p className="text-sm text-gray-500">REF-2023-001</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-3">
          <Link2 className="text-gray-500" />
          <div>
            <h3 className="font-medium">Link de Pagamento</h3>
            <p className="text-sm text-gray-500">pay.g-pay.com/ref/123</p>
          </div>
        </Card>
      </div>
    </Card>
  )
}